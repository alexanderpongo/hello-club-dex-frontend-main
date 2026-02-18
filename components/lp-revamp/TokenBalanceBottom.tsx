"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useAccount, useConfig } from "wagmi";
import { getBalance, readContract } from "@wagmi/core";
import { Abi, Address, formatUnits, Hex, parseUnits } from "viem";
import { fetchBalance } from "@/service/blockchain.service";
import { Copy, Loader2 } from "lucide-react";
import { decimalStringToJSBI, getInitials } from "@/lib/utils";
import { useLiquidityPoolStore } from "@/store/liquidity-pool.store";
import { Currency, CurrencyAmount, Price, Token } from "@uniswap/sdk-core";
import { Pool, Position, priceToClosestTick, TickMath } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";

const TokenBalanceBottom = () => {
  const {
    setCurrencyBTokenBalance,
    currencyB,
    currencyA,
    lpCalTop,
    lpCalBottom,
    setLpCalBottom,
    setLpCalTop,
    currencyBBalance,
    setCurrencyBTokenInputAmount,
    setCurrencyATokenInputAmount,
    currencyBTokenInputAmount,
    currencyATokenInputAmount,

    // for creating pool instance
    poolAddress,
    token0,
    token1,
    poolFee,
    // lowerTick,
    // upperTick,
    isInverted,
    canonicalTickLower,
    canonicalTickUpper,
    priceWhenPoolNotInitialized,

    setDisableBottomInput,
  } = useLiquidityPoolStore();
  const { address, chainId } = useAccount();
  const config = useConfig();
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeValue, setActiveValue] = useState<number | null>(null);

  // Simple debounce hook to avoid recalculations on every keystroke
  const useDebounce = <T,>(value: T, delay: number) => {
    const [debounced, setDebounced] = useState<T>(value);
    useEffect(() => {
      const id = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
  };

  // Memoize token instances so they are not recreated on each render/keystroke
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
      console.error("Error creating Token instances:", error);
      return null;
    }
  }, [token0, token1, chainId]);

  // UI mapping: top/bottom depends on inversion flag
  const uiTopToken = isInverted ? tokens?.tokenB : tokens?.tokenA;
  const uiBottomToken = isInverted ? tokens?.tokenA : tokens?.tokenB;

  // Cache pool instance derived from on-chain reads
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
          console.log("tickCurrent : ", tickCurrent);
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

          console.log("pool address: ", poolAddress);
          console.log("pool token0", p.token0);
          console.log("pool token1", p.token1);
          console.log("pool slot0", tickCurrent);
        } catch (error) {
          console.error("Error creating Pool instance:", error);
          setPool(null);
        }
      } else {
        // create mock pool when pool address is null (not deployed yet)
        // cast to any to avoid incompatible @uniswap/sdk-core type declarations between packages

        const currentTick = priceToClosestTick(
          priceWhenPoolNotInitialized as unknown as any
        );

        console.log("currentTick", currentTick);
        const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick);
        console.log("currentSqrt : ", currentSqrt.toString());

        const p = new Pool(
          tokens.tokenA,
          tokens.tokenB,
          poolFee,
          JSBI.BigInt(currentSqrt.toString()),
          JSBI.BigInt("0"),
          currentTick
        );
        setPool(p);
      }
    };
    buildPool();
    return () => {
      mounted = false;
    };
  }, [poolAddress, tokens, poolFee, priceWhenPoolNotInitialized]);

  const fetchFromTokenBalance = async () => {
    setIsBalanceLoading(true);
    try {
      if (currencyB?.address === "native") {
        const balance = await getBalance(config, {
          address: address as Address,
          chainId: chainId,
          unit: "ether",
        });

        setCurrencyBTokenBalance(balance.formatted);
      } else {
        const balance = await fetchBalance(
          config,
          chainId,
          address as Address,
          currencyB
        );

        setCurrencyBTokenBalance(balance == "0" ? "0.00" : balance);
      }
    } catch (error) {
      console.error(`Error while fetching ${currencyB?.symbol} balance`, error);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (currencyB && address) {
      fetchFromTokenBalance();
    }
  }, [currencyB, address]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLpCalBottom(true);
      setLpCalTop(false);
      let input = e.target.value;

      // Only allow digits and one decimal point
      input = input.replace(/[^0-9.]/g, "");

      // Ensure only one decimal point
      const parts = input.split(".");
      if (parts.length > 2) {
        input = parts[0] + "." + parts.slice(1).join("");
      }

      setActiveValue(null);
      setCurrencyBTokenInputAmount(input);
    },
    [setLpCalBottom, setLpCalTop, setCurrencyBTokenInputAmount]
  );

  const inputAmountHandler = useCallback(
    (value: number) => {
      setLpCalTop(false);
      setLpCalBottom(true);
      const bal = parseFloat(currencyBBalance || "0");
      let inputValue = value * (isFinite(bal) ? bal : 0);
      setActiveValue(value);

      setCurrencyBTokenInputAmount(
        inputValue.toFixed(18).replace(/\.?0+$/, "")
      );
    },
    [
      setLpCalTop,
      setLpCalBottom,
      currencyBBalance,
      setCurrencyBTokenInputAmount,
    ]
  );

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
    if (!pool || !uiTopToken || !uiBottomToken) return;

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
        uiTopToken.decimals ?? 18
      );
      const topCurrencyAmount = CurrencyAmount.fromRawAmount(
        uiTopToken as unknown as Currency,
        topAmountJSBI
      );

      const pos = buildPositionFromSingleSide(
        pool,
        topCurrencyAmount,
        canonicalTickLower,
        canonicalTickUpper
      );

      const { amount0: a0, amount1: a1 } = pos.mintAmounts;
      console.log("a0 , a1", a0.toString(), a1.toString());

      const otherAmount = computeOppositeAmount(
        pool,
        pos,
        topCurrencyAmount.currency
      );

      console.log("inputCalculator pos", pos);
      console.log("inputCalculator otherAmount", otherAmount.toExact());

      const nextBottom = parseFloat(otherAmount.toExact())
        .toFixed(18)
        .replace(/\.?0+$/, "");
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
        uiBottomToken.decimals ?? 18
      );
      const bottomCurrencyAmount = CurrencyAmount.fromRawAmount(
        uiBottomToken as unknown as Currency,
        bottomAmountJSBI
      );

      const pos = buildPositionFromSingleSide(
        pool,
        bottomCurrencyAmount,
        canonicalTickLower,
        canonicalTickUpper
      );

      const { amount0: a0, amount1: a1 } = pos.mintAmounts;
      console.log("a0 , a1", a0.toString(), a1.toString());

      const otherAmount = computeOppositeAmount(
        pool,
        pos,
        bottomCurrencyAmount.currency
      );

      const nextTop = parseFloat(otherAmount.toExact())
        .toFixed(18)
        .replace(/\.?0+$/, "");
      setActiveValue(null);
      if (nextTop !== currencyATokenInputAmount) {
        setCurrencyATokenInputAmount(nextTop);
      }
    }
  }, [
    pool,
    uiTopToken,
    uiBottomToken,
    lpCalTop,
    lpCalBottom,
    currencyATokenInputAmount,
    currencyBTokenInputAmount,
    canonicalTickLower,
    canonicalTickUpper,
    setCurrencyBTokenInputAmount,
    setCurrencyATokenInputAmount,
    isInverted,
  ]);

  // Determine which side should be deposited (single-sided vs both)
  // Logic: if current price <= lower -> only token0; if >= upper -> only token1; else both
  const disableBottomInput = useMemo(() => {
    if (!pool || canonicalTickLower == null || canonicalTickUpper == null) {
      return false;
    }

    const tick = pool.tickCurrent;
    const belowRange = tick <= canonicalTickLower; // only token0
    const aboveRange = tick >= canonicalTickUpper; // only token1

    // Map token0/token1 to UI bottom token
    if (!uiBottomToken) return false;

    if (belowRange) {
      // Only token0 is relevant -> disable the input for token1
      return (
        uiBottomToken.address.toLowerCase() ===
        pool.token1.address.toLowerCase()
      );
    }

    if (aboveRange) {
      // Only token1 is relevant -> disable the input for token0
      return (
        uiBottomToken.address.toLowerCase() ===
        pool.token0.address.toLowerCase()
      );
    }

    // In-range: both sides can be provided
    return false;
  }, [pool, canonicalTickLower, canonicalTickUpper, uiBottomToken]);

  useEffect(() => {
    setDisableBottomInput(disableBottomInput);
    return () => setDisableBottomInput(false);
  }, [disableBottomInput, setDisableBottomInput]);

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
        console.error("Failed to copy:", err);
      }
    }
  };

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

  // Debounce input values to prevent heavy calculations on every keystroke
  const debouncedFrom = useDebounce(currencyATokenInputAmount, 250);
  const debouncedTo = useDebounce(currencyBTokenInputAmount, 250);

  useEffect(() => {
    inputCalculator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFrom, debouncedTo, pool]);

  return (
    <div className="flex flex-col pt-1">
      <div className="flex flex-row justify-between items-center py-2">
        <div>
          <div className="flex flex-row space-x-2 items-center justify-center">
            {currencyB ? (
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
                <div className="text-xs sm:text-[13px] font-normal dark:text-white">
                  {currencyB?.symbol ?? "HELLO"}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center text-xs">
                Select a token
              </div>
            )}
            {currencyB && (
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
          {" "}
          Balance:
          <div className="dark:text-[#FFFFFF] ml-0.5">
            {isBalanceLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              `${currencyBBalance === "0.0"
                ? currencyBBalance
                : currencyBBalance.split(".")[1]?.length > 4
                  ? parseFloat(currencyBBalance).toFixed(4)
                  : currencyBBalance
              }`
            )}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3 w-full">
        <div className="flex flex-row justify-between items-center">
          <div className="py-2 text-start">
            <input
              value={getTrimmedResult(currencyBTokenInputAmount)}
              onChange={handleChange}
              placeholder="0.0"
              type="text"
              disabled={disableBottomInput}
              readOnly={disableBottomInput}
              className={`focus:outline-none bg-transparent text-primary text-[16px] sm:text-[19px] font-medium text-start w-[9.313rem] md:w-full ${disableBottomInput ? "opacity-60 cursor-not-allowed" : ""
                }`}
            />
          </div>
          <div className="py-2">
            <div className="flex space-x-2 justify-end">
              {[0.25, 0.5, 0.75, 1].map((value, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (!disableBottomInput) inputAmountHandler(value);
                  }}
                  className={`button-range items-center !font-lato !font-bold !text-[10px] px-3 py-1 hover:cursor-pointer 
                   ${activeValue === value
                      ? "!bg-primary !text-white dark:!text-black"
                      : ""
                    } ${disableBottomInput
                      ? "opacity-60 cursor-not-allowed pointer-events-none"
                      : ""
                    }`}
                //       className={`button-range items-center !font-lato !text-[10px] px-3 py-1 hover:cursor-pointer
                // ${
                //   activeValue === value
                //     ? "!bg-primary !text-white dark:!text-black"
                //     : ""
                // }`}
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

export default TokenBalanceBottom;
