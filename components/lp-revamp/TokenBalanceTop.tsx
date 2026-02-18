"use client";
import { getInitials } from "@/lib/utils";
import { fetchBalance } from "@/service/blockchain.service";
import { useLiquidityPoolStore } from "@/store/liquidity-pool.store";
import { getBalance } from "@wagmi/core";
import { Copy, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Address } from "viem";
import { useAccount, useConfig } from "wagmi";
import { Abi, Hex } from "viem";
import { readContract } from "@wagmi/core";
import { Token } from "@uniswap/sdk-core";
import { Pool, priceToClosestTick, TickMath } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";

const TokenBalanceTop = () => {
  const {
    currencyA,
    setLpCalTop,
    setLpCalBottom,
    setCurrencyATokenInputAmount,
    currencyATokenBalance,
    setCurrencyATokenBalance,
    currencyATokenInputAmount,
    setDisableTopInput,
    // for computing single-sided deposit state
    poolAddress,
    token0,
    token1,
    poolFee,
    isInverted,
    canonicalTickLower,
    canonicalTickUpper,
    priceWhenPoolNotInitialized,
  } = useLiquidityPoolStore();
  const { address, chainId } = useAccount();
  const config = useConfig();
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeValue, setActiveValue] = useState<number | null>(null);

  const fetchFromTokenBalance = async () => {
    setIsBalanceLoading(true);
    try {
      if (currencyA?.address === "native") {
        const balance = await getBalance(config, {
          address: address as Address,
          chainId: chainId,
          unit: "ether",
        });

        setCurrencyATokenBalance(balance.formatted);
      } else {
        const balance = await fetchBalance(
          config,
          chainId,
          address as Address,
          currencyA
        );

        setCurrencyATokenBalance(balance == "0" ? "0.00" : balance);
      }
    } catch (error) {
      console.error(`Error while fetching ${currencyA?.symbol} balance`, error);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (currencyA && address) {
      fetchFromTokenBalance();
    }
  }, [currencyA, address]);

  // Build token instances for determining UI mapping and pool computations
  const tokens = useMemo(() => {
    try {
      if (!token0 || !token1) return null;
      const tokenA = new Token(
        chainId as number,
        token0.address as Address,
        (token0.decimals as number) ?? 18,
        token0.symbol,
        token0.name
      );
      const tokenB = new Token(
        chainId as number,
        token1.address as Address,
        (token1.decimals as number) ?? 18,
        token1.symbol,
        token1.name
      );
      return { tokenA, tokenB };
    } catch (error) {
      console.error("Error creating Token instances (top):", error);
      return null;
    }
  }, [token0, token1, chainId]);

  const uiTopToken = isInverted ? tokens?.tokenB : tokens?.tokenA;

  // Lightweight pool cache for determining current tick
  const [pool, setPool] = useState<Pool | null>(null);
  const requestCounterRef = useRef(0);

  const readSlot = async (): Promise<any> => {
    const result = await readContract(config, {
      address: poolAddress as Hex,
      abi: IUniswapV3PoolABI.abi as Abi,
      functionName: "slot0",
    });
    return result;
  };

  const readPoolLiquidity = async (): Promise<any> => {
    const result = await readContract(config, {
      address: poolAddress as Hex,
      abi: IUniswapV3PoolABI.abi as Abi,
      functionName: "liquidity",
    });
    return result;
  };

  useEffect(() => {
    let mounted = true;
    const buildPool = async () => {
      if (!tokens) return;
      const reqId = ++requestCounterRef.current;
      if (poolAddress) {
        try {
          const [slot0, lp] = await Promise.all([
            readSlot(),
            readPoolLiquidity(),
          ]);
          if (!mounted || reqId !== requestCounterRef.current) return;
          const sqrtRatioX96 = JSBI.BigInt(slot0[0].toString());
          const tickCurrent = Number(slot0[1]);
          const liquidityPool = JSBI.BigInt(lp.toString());
          const p = new Pool(
            tokens.tokenA,
            tokens.tokenB,
            poolFee,
            sqrtRatioX96,
            liquidityPool,
            tickCurrent
          );
          setPool(p);
        } catch (error) {
          console.error("Error creating Pool instance (top):", error);
          setPool(null);
        }
      } else if (priceWhenPoolNotInitialized) {
        try {
          const currentTick = priceToClosestTick(
            priceWhenPoolNotInitialized as unknown as any
          );
          const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick);
          const p = new Pool(
            tokens.tokenA,
            tokens.tokenB,
            poolFee,
            JSBI.BigInt(currentSqrt.toString()),
            JSBI.BigInt("0"),
            currentTick
          );
          setPool(p);
        } catch (e) {
          console.error("Mock pool build failed (top):", e);
          setPool(null);
        }
      }
    };
    buildPool();
    return () => {
      mounted = false;
    };
  }, [poolAddress, tokens, poolFee, priceWhenPoolNotInitialized, config]);

  // Single-sided logic for top input
  const disableTopInput = useMemo(() => {
    if (!pool || canonicalTickLower == null || canonicalTickUpper == null) {
      return false;
    }
    const tick = pool.tickCurrent;
    const belowRange = tick <= canonicalTickLower; // only token0
    const aboveRange = tick >= canonicalTickUpper; // only token1

    if (!uiTopToken) return false;

    if (belowRange) {
      // Only token0 relevant -> disable input for token1
      return (
        uiTopToken.address.toLowerCase() === pool.token1.address.toLowerCase()
      );
    }

    if (aboveRange) {
      // Only token1 relevant -> disable input for token0
      return (
        uiTopToken.address.toLowerCase() === pool.token0.address.toLowerCase()
      );
    }

    return false; // in-range
  }, [pool, canonicalTickLower, canonicalTickUpper, uiTopToken]);

  useEffect(() => {
    setDisableTopInput(disableTopInput);
    return () => setDisableTopInput(false);
  }, [disableTopInput, setDisableTopInput]);

  const getTrimmedResult = (raw: string) => {
    const [intPart, decimalPart] = raw.split(".");
    if (decimalPart === undefined) return raw;

    // Just return if the input is like "0.", "0.0", or "0.00"
    if (raw.endsWith(".") || /^0+(\.0*)?$/.test(raw)) return raw;

    if (intPart === "0") {
      const firstNonZeroIndex = decimalPart.search(/[1-9]/);
      if (firstNonZeroIndex === -1) return "0";

      const sliceEnd = Math.min(firstNonZeroIndex + 3, 18);
      const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");

      return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
    }

    // For non-zero intPart, return int with trimmed decimals
    const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
    return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLpCalTop(true);
    setLpCalBottom(false);
    let input = e.target.value;

    // Only allow digits and one decimal point
    input = input.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = input.split(".");
    if (parts.length > 2) {
      input = parts[0] + "." + parts.slice(1).join("");
    }

    setActiveValue(null);
    setCurrencyATokenInputAmount(input);
  };

  const inputAmountHandler = (value: number) => {
    setLpCalTop(true);
    setLpCalBottom(false);
    let inputValue = value * parseFloat(currencyATokenBalance);
    setActiveValue(value);
    setCurrencyATokenInputAmount(inputValue.toFixed(18).replace(/\.?0+$/, ""));
  };

  const handleCopy = async () => {
    if (currencyA?.address) {
      // console.log("copy");

      let copyToken =
        currencyA?.address.toLowerCase() === "native"
          ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          : currencyA?.address;
      try {
        await navigator.clipboard.writeText(copyToken);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between items-center py-2">
        <div>
          <div className="flex flex-row space-x-2 items-center justify-center">
            {currencyA ? (
              <>
                {currencyA?.logoURI ? (
                  <Image
                    src={currencyA?.logoURI as string}
                    alt={currencyA?.name as string}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-[25px] h-[25px] rounded-full border"
                  />
                ) : (
                  <div className="rounded-full w-[30px] h-[30px] border-[2px] flex items-center justify-center dark:bg-gray-200 dark:text-black text-sm font-bold">
                    {getInitials(currencyA?.name ?? "NA")}
                  </div>
                )}
                <div className="text-xs sm:text-[13px] font-normal dark:text-white">
                  {currencyA?.symbol ?? ""}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center text-xs">
                Select a token
              </div>
            )}
            {currencyA && (
              <Copy
                size={12}
                className="hover:text-primary hover:cursor-pointer"
                onClick={handleCopy}
              />
            )}
            {isCopied && (
              <span className="text-green-500 text-xs">Copied!</span>
            )}
          </div>
        </div>
        <div className="text-sm font-normal dark:text-[#ffffff99] flex flex-row justify-center items-center">
          Balance:
          <div className="dark:text-[#FFFFFF] ml-0.5">
            {isBalanceLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              `${currencyATokenBalance === "0.0"
                ? currencyATokenBalance
                : currencyATokenBalance.split(".")[1]?.length > 4
                  ? parseFloat(currencyATokenBalance).toFixed(4)
                  : currencyATokenBalance
              }`
            )}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3 w-full">
        <div className="flex flex-row justify-between items-center">
          <div className="py-2 text-start">
            <input
              value={getTrimmedResult(currencyATokenInputAmount)}
              onChange={handleChange}
              placeholder="0.0"
              type="text"
              disabled={disableTopInput}
              readOnly={disableTopInput}
              className={`focus:outline-none bg-transparent text-primary text-[16px] sm:text-[19px] font-medium text-start w-[9.313rem] md:w-full ${disableTopInput ? "opacity-60 cursor-not-allowed" : ""
                }`}
            />
          </div>
          <div className="py-2">
            <div className="flex space-x-2 justify-end">
              {[0.25, 0.5, 0.75, 1].map((value, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (!disableTopInput) inputAmountHandler(value);
                  }}
                  className={`button-range items-center !font-lato !font-bold !text-[10px] px-3 py-1 hover:cursor-pointer 
            ${activeValue === value
                      ? "!bg-primary !text-white dark:!text-black"
                      : ""
                    } ${disableTopInput
                      ? "opacity-60 cursor-not-allowed pointer-events-none"
                      : ""
                    }`}
                >
                  {value === 1 ? "MAX" : `${value * 100}%`}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenBalanceTop;
