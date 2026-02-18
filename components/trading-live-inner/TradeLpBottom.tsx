"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useLPStore } from "@/store/useDexStore";
import { useAccount, useConfig } from "wagmi";
import { getBalance, readContract } from "@wagmi/core";
import { Abi, Address, formatUnits, Hex, parseUnits } from "viem";
import { fetchBalance, tradeFetchBalance } from "@/service/blockchain.service";
import { Copy, Loader2 } from "lucide-react";
import { decimalStringToJSBI, getInitials } from "@/lib/utils";
import { useTradingLivePoolStore } from "@/store/trading-live-pool-store";
import { Pool, Position, priceToClosestTick } from "@uniswap/v3-sdk";
import { Currency, CurrencyAmount, Token } from "@uniswap/sdk-core";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import JSBI from "jsbi";

// Utility function to convert number to string without scientific notation
const toFixedWithoutScientific = (num: number, decimals: number = 18): string => {
  return num.toLocaleString('fullwide', { 
    useGrouping: false, 
    maximumFractionDigits: decimals 
  });
};

interface TokenProps {
  tradeChainId: number;
  disabled?: boolean;
  poolAddress: Hex | null;
  poolFee: number;
}

const TradeLpBottom = ({
  tradeChainId,
  disabled = false,
  poolAddress,
  poolFee,
}: TokenProps) => {
  const {
    currencyA,
    currencyB,
    setLpCalTop,
    setCurrencyATokenInputAmount,
    currencyATokenInputAmount,
    setCurrencyBTokenInputAmount,
    currencyBBalance,
    currencyBTokenInputAmount,
    setCurrencyBTokenBalance,
    lpCalTop,
    lpCalBottom,
    setLpCalBottom,
    canonicalTickLower,
    canonicalTickUpper,
  } = useTradingLivePoolStore();
  const { address, chainId } = useAccount();
  const config = useConfig();
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeValue, setActiveValue] = useState<number | null>(null);

  const [pool, setPool] = useState<Pool | null>(null);
  const requestCounterRef = useRef(0);

  useEffect(() => {
    console.log("currencyA in TradeLpBottom:", currencyA);
    console.log("currencyB in TradeLpBottom:", currencyB);
  }, [currencyA, currencyB]);

  const readSlot = async (): Promise<any> => {
    const result = await readContract(config, {
      address: poolAddress as Hex,
      abi: IUniswapV3PoolABI.abi as Abi,
      functionName: "slot0",
      chainId: tradeChainId,
    });
    return result;
  };

  const readPoolLiquidity = async (): Promise<any> => {
    const result = await readContract(config, {
      address: poolAddress as Hex,
      abi: IUniswapV3PoolABI.abi as Abi,
      functionName: "liquidity",
      chainId: tradeChainId,
    });
    return result;
  };

  const fetchFromTokenBalance = async () => {
    setIsBalanceLoading(true);
    try {
      if (currencyB?.address === "native") {
        const balance = await getBalance(config, {
          address: address as Address,
          chainId: tradeChainId,
          unit: "ether",
        });

        setCurrencyBTokenBalance(balance.formatted);
      } else {
        const balance = await tradeFetchBalance(
          config,
          tradeChainId,
          address as Address,
          {
            address: currencyB?.address,
            decimal: currencyB?.decimals!,
            symbol: currencyB?.symbol!,
            name: currencyB?.name!,
            logoURI: currencyB?.logoURI!,
          }
        );

        console.log("balance bot", balance);
        setCurrencyBTokenBalance(balance == "0" ? "0.00" : balance);
      }
    } catch (error) {
      console.log(`Error while fetching ${currencyB?.symbol} balance`, error);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (currencyB && address) {
      fetchFromTokenBalance();
    }
  }, [currencyB, tradeChainId, chainId, address]);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setLpCalBottom(true);
  //   let input = e.target.value;
  //   input = input.replace(/[^0-9.%]/g, "");
  //   setActiveValue(null);
  //   setToLPTokenInputAmount(input);
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLpCalBottom(true);
    setLpCalTop(false);
    let input = e.target.value;

    // Prevent scientific notation input
    if (input.toLowerCase().includes('e')) {
      return;
    }

    // Only allow digits and one decimal point
    input = input.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = input.split(".");
    if (parts.length > 2) {
      input = parts[0] + "." + parts.slice(1).join("");
    }

    setActiveValue(null);
    setCurrencyBTokenInputAmount(input);
  };

  const inputAmountHandler = (value: number) => {
    setLpCalTop(false);
    setLpCalBottom(true);
    let inputValue = value * parseFloat(currencyBBalance || "0");
    setActiveValue(value);

    // Convert to string without scientific notation
    const inputValueStr = inputValue.toLocaleString('fullwide', { 
      useGrouping: false, 
      maximumFractionDigits: 18 
    });
    
    // Remove trailing zeros after decimal point
    setCurrencyBTokenInputAmount(inputValueStr.replace(/\.?0+$/, ""));
  };

  // Memoize token instances so they are not recreated on each render/keystroke
  const tokens = useMemo(() => {
    console.log("currencyA, currencyB,", currencyA, currencyB, tradeChainId);
    try {
      if (!currencyA || !currencyB) return null;
      const tokenA = new Token(
        tradeChainId as number,
        currencyA.address as Address,
        currencyA.decimals,
        currencyA.symbol,
        currencyA.name
      );
      const tokenB = new Token(
        tradeChainId as number,
        currencyB.address as Address,
        currencyB.decimals,
        currencyB.symbol,
        currencyB.name
      );
      return { tokenA, tokenB };
    } catch (error) {
      console.log("Error creating Token instances:", error);
      return null;
    }
  }, [currencyA, currencyB, tradeChainId]);

  // Build and cache the Pool once when dependencies change
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
          console.log("Error creating Pool instance:", error);
          setPool(null);
        }
      }
    };
    buildPool();
    return () => {
      mounted = false;
    };
  }, [poolAddress, poolFee, tokens, tradeChainId]);

  const isValidNumberStr = (s: string) => /^\d+(\.\d+)?$/.test(s);

  const buildPositionFromSingleSide = (
    pool: Pool,
    singleSideAmount: CurrencyAmount<Currency>,
    tickLower: number,
    tickUpper: number
  ): Position => {
    if (singleSideAmount.currency.equals(pool.token0)) {
      return Position.fromAmount0({
        pool,
        tickLower,
        tickUpper,
        amount0: singleSideAmount.quotient,
        useFullPrecision: true,
      });
    }

    return Position.fromAmount1({
      pool,
      tickLower,
      tickUpper,
      amount1: singleSideAmount.quotient,
    });
  };

  const computeOppositeAmount = (
    pool: Pool,
    pos: Position,
    inputCurrency: Currency
  ): CurrencyAmount<Currency> => {
    const otherTokenAmount = inputCurrency.equals(pool.token0)
      ? pos.amount1
      : pos.amount0;
    return otherTokenAmount;
  };

  const inputCalculator = useCallback(() => {
    if (!pool || !tokens?.tokenA || !tokens.tokenB) return;

    console.log("inputCalculator canonicalTickLower", canonicalTickLower);
    console.log("inputCalculator canonicalTickUpper", canonicalTickUpper);

    if (
      canonicalTickLower == null ||
      canonicalTickUpper == null ||
      !Number.isFinite(canonicalTickLower) ||
      !Number.isFinite(canonicalTickUpper)
    )
      return;

    // TOP SIDE (lpCalTop true)
    if (lpCalTop) {
      setLpCalBottom(false);
      const rawTop = currencyATokenInputAmount;
      if (!rawTop || !isValidNumberStr(rawTop)) return;
      const topAmountJSBI = decimalStringToJSBI(
        rawTop,
        tokens?.tokenA.decimals ?? 18
      );
      const topCurrencyAmount = CurrencyAmount.fromRawAmount(
        tokens?.tokenA as unknown as Currency,
        topAmountJSBI
      );

      const pos = buildPositionFromSingleSide(
        pool,
        topCurrencyAmount,
        canonicalTickLower,
        canonicalTickUpper
      );

      const otherAmount = computeOppositeAmount(
        pool,
        pos,
        topCurrencyAmount.currency
      );

      console.log("inputCalculator pos", pos);
      console.log("inputCalculator otherAmount", otherAmount.toExact());

      const nextBottom = toFixedWithoutScientific(
        parseFloat(otherAmount.toExact()),
        18
      ).replace(/\.?0+$/, "");
      setActiveValue(null);
      if (nextBottom !== currencyBTokenInputAmount) {
        setCurrencyBTokenInputAmount(nextBottom);
      }
    }

    // BOTTOM SIDE (lpCalBottom true)
    if (lpCalBottom) {
      setLpCalTop(false);
      const rawBottom = currencyBTokenInputAmount;
      if (!rawBottom || !isValidNumberStr(rawBottom)) return;
      const bottomAmountJSBI = decimalStringToJSBI(
        rawBottom,
        tokens.tokenB.decimals ?? 18
      );
      const bottomCurrencyAmount = CurrencyAmount.fromRawAmount(
        tokens.tokenB as unknown as Currency,
        bottomAmountJSBI
      );

      const pos = buildPositionFromSingleSide(
        pool,
        bottomCurrencyAmount,
        canonicalTickLower,
        canonicalTickUpper
      );

      const otherAmount = computeOppositeAmount(
        pool,
        pos,
        bottomCurrencyAmount.currency
      );

      const nextTop = toFixedWithoutScientific(
        parseFloat(otherAmount.toExact()),
        18
      ).replace(/\.?0+$/, "");
      setActiveValue(null);
      if (nextTop !== currencyATokenInputAmount) {
        setCurrencyATokenInputAmount(nextTop);
      }
    }
  }, [
    pool,
    tokens,
    lpCalTop,
    lpCalBottom,
    currencyATokenInputAmount,
    currencyBTokenInputAmount,
    canonicalTickLower,
    canonicalTickUpper,
    setCurrencyBTokenInputAmount,
    setCurrencyATokenInputAmount,
  ]);

  const handleCopy = async () => {
    if (currencyB?.address) {
      let copyToken =
        currencyB?.address.toLowerCase() === "native"
          ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          : currencyB?.address;
      try {
        await navigator.clipboard.writeText(copyToken);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      } catch (err) {
        console.log("Failed to copy:", err);
      }
    }
  };

  useEffect(() => {
    inputCalculator();
    // console.log("toLPTokenInputAmount", toLPTokenInputAmount);
  }, [
    currencyATokenInputAmount,
    currencyBTokenInputAmount,
    canonicalTickLower,
    canonicalTickUpper,
  ]);

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

  return (
    <div className="flex flex-col pt-1 w-full">
      <div className="flex flex-row justify-between items-center py-2">
        <div>
          <div className="flex flex-row space-x-2 items-center justify-center">
            {currencyB && (
              <>
                {currencyB?.logoURI ? (
                  <Image
                    src={currencyB?.logoURI as string}
                    alt={currencyB?.name as string}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-[25px] h-[25px]  rounded-full border"
                  />
                ) : (
                  <div className="rounded-full w-[30px] h-[30px] border-[2px] flex items-center justify-center dark:bg-gray-200 dark:text-black text-sm font-bold">
                    {getInitials(currencyB?.name ?? "NA")}
                  </div>
                )}
                <div className="text-xs sm:text-[13px] font-normal dark:text-white truncate max-w-[80px] xs:max-w-[100px] sm:max-w-none">
                  {currencyB?.symbol ?? "NA"}
                </div>
              </>
            )}
            {currencyB && (
              <Copy
                size={12}
                className="hover:text-primary hover:cursor-pointer"
                // onClick={handleCopy}
              />
            )}
            {isCopied && (
              <span className="text-green-500 text-xs">Copied!</span>
            )}
          </div>
        </div>
        {!address ? (
          <div className="flex justify-end items-center gap-1 text-[10px] xs:text-[12px] font-normal dark:text-[#FFFFFF99] text-[#00000099] text-right max-w-[180px] xs:max-w-none">
            <span className="truncate">
              Connect wallet to view {currencyB?.symbol} balance
            </span>
          </div>
        ) : (
          <div className="text-[11px] xs:text-sm font-normal dark:text-[#ffffff99] flex flex-row justify-center items-center flex-shrink-0">
            {" "}
            Balance:
            <div className="dark:text-[#FFFFFF] ml-0.5">
              {isBalanceLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                `${
                  currencyBBalance === "0.00"
                    ? currencyBBalance
                    : currencyBBalance.split(".")[1]?.length > 4
                    ? parseFloat(currencyBBalance).toFixed(4)
                    : currencyBBalance
                }`
              )}
            </div>
          </div>
        )}
      </div>
      <div className="rounded-lg border dark:border-[#1A1A1A] dark:bg-black p-3 w-full">
        <div className="flex flex-row justify-between items-center gap-2">
          <div className="py-2 text-start flex-1 min-w-0">
            <input
              value={getTrimmedResult(currencyBTokenInputAmount)}
              onChange={handleChange}
              placeholder="0.00"
              type="text"
              disabled={disabled}
              className={`focus:outline-none bg-transparent text-primary text-[16px] sm:text-[19px] font-medium text-start w-full disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>
          <div className="py-2 flex-shrink-0">
            <div className="flex space-x-1.5 xs:space-x-2 justify-end">
              {[0.25, 0.5, 0.75, 1].map((value, index) => (
                <div
                  key={index}
                  onClick={
                    disabled ? undefined : () => inputAmountHandler(value)
                  }
                  className={`button-range items-center !font-lato !font-bold !text-[9px] xs:!text-[10px] px-2 xs:px-3 py-1 whitespace-nowrap
            ${
              activeValue === value
                ? "!bg-primary !text-white dark:!text-black"
                : ""
            }
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:cursor-pointer"
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

export default TradeLpBottom;
