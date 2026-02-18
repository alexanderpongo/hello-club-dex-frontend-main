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
import { Abi, Address } from "viem";
import { fetchBalance } from "@/service/blockchain.service";
import { Copy, Loader2 } from "lucide-react";
import { decimalStringToJSBI, getInitials } from "@/lib/utils";
import { Position, Pool, FeeAmount, nearestUsableTick } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import { CurrencyAmount, type Currency, Token } from "@uniswap/sdk-core";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { SinglePoolData } from "@/types/trading-live-table.types";
import { useNewIncreaseLpStore } from "@/store/new-increase-lp.store";
import { getTickSpacingForFee } from "@/lib/utils";

interface IncreaseTokenBalanceBottomProps {
  pool_address: Address;
  tickRanges: {
    tickLower: number;
    tickUpper: number;
  };
  poolData: SinglePoolData;
}

const IncreaseTokenBalanceBottom: React.FC<IncreaseTokenBalanceBottomProps> = (
  props
) => {
  const { pool_address, tickRanges, poolData } = props;
  const {
    setToLPTokenBalance,
    toLPToken,
    fromLPToken,
    lpCalTop,
    lpCalBottom,
    setLpCalBottom,
    setLpCalTop,
    toLPTokenBalance,
    setToLPTokenInputAmount,
    setFromLPTokenInputAmount,
    toLPTokenInputAmount,
    fromLPTokenInputAmount,
  } = useNewIncreaseLpStore();
  // const { pairFromToken, pairToToken } = useSwapStore();
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

  const poolChainId = useMemo(() => {
    return poolData.chain.id === "bsc"
      ? 56
      : poolData.chain.id === "ethereum"
      ? 1
      : poolData.chain.id === "base"
      ? 8453
      : 56;
  }, [poolData.chain.id]);

  // Memoize token instances so they are not recreated on each render/keystroke
  const tokens = useMemo(() => {
    try {
      if (!fromLPToken || !toLPToken) return null;
      const tokenA = new Token(
        poolChainId as number,
        fromLPToken.address as Address,
        (fromLPToken.decimals as number) ?? 18,
        fromLPToken.symbol,
        fromLPToken.name
      );
      const tokenB = new Token(
        poolChainId as number,
        toLPToken.address as Address,
        (toLPToken.decimals as number) ?? 18,
        toLPToken.symbol,
        toLPToken.name
      );
      return { tokenA, tokenB };
    } catch (error) {
      console.error("Error creating Token instances:", error);
      return null;
    }
  }, [fromLPToken, toLPToken, poolChainId]);

  // Cache pool instance derived from on-chain reads
  const [pool, setPool] = useState<Pool | null>(null);
  const requestCounterRef = useRef(0);

  const readSlot = async (): Promise<any> => {
    const result = await readContract(config, {
      address: pool_address,
      abi: IUniswapV3PoolABI.abi as Abi,
      functionName: "slot0",
    });
    return result;
  };

  const readPoolLiquidity = async (): Promise<any> => {
    const result = await readContract(config, {
      address: pool_address,
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
          poolData.fee_tier_raw,
          sqrtRatioX96,
          liquidityPool,
          tickCurrent
        );

        const canonicalPrice = p.priceOf(tokens.tokenA); // token0 denominated in token1
        const canonicalInverse = p.priceOf(tokens.tokenB); // token1 denominated in token0

        console.log("Created Pool instance:", {
          sqrtRatioX96: sqrtRatioX96.toString(),
          tickCurrent,
          liquidityPool: liquidityPool.toString(),
          tokenA: tokens.tokenA,
          tokenB: tokens.tokenB,
          fee: poolData.fee_tier_raw,
          p,
          canonicalPrice: canonicalPrice.toSignificant(6),
          canonicalInverse: canonicalInverse.toSignificant(6),
        });

        setPool(p);
      } catch (error) {
        console.error("Error creating Pool instance:", error);
        setPool(null);
      }
    };
    buildPool();
    return () => {
      mounted = false;
    };
  }, [pool_address, tokens]);

  const fetchFromTokenBalance = async () => {
    setIsBalanceLoading(true);
    try {
      if (toLPToken?.address === "native") {
        const balance = await getBalance(config, {
          address: address as Address,
          chainId: chainId,
          unit: "ether",
        });

        setToLPTokenBalance(balance.formatted);
      } else {
        const balance = await fetchBalance(
          config,
          chainId,
          address as Address,
          toLPToken
        );

        setToLPTokenBalance(balance == "0" ? "0.00" : balance);
      }
    } catch (error) {
      console.error(`Error while fetching ${toLPToken?.symbol} balance`, error);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (toLPToken && address) {
      fetchFromTokenBalance();
    }
  }, [toLPToken, address]);

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
      setToLPTokenInputAmount(input);
    },
    [setLpCalBottom, setLpCalTop, setToLPTokenInputAmount]
  );

  const inputAmountHandler = useCallback(
    (value: number) => {
      setLpCalTop(false);
      setLpCalBottom(true);
      const bal = parseFloat(toLPTokenBalance || "0");
      let inputValue = value * (isFinite(bal) ? bal : 0);
      setActiveValue(value);

      setToLPTokenInputAmount(inputValue.toFixed(18).replace(/\.?0+$/, ""));
    },
    [setLpCalTop, setLpCalBottom, toLPTokenBalance, setToLPTokenInputAmount]
  );

  const isValidNumberStr = (s: string) => /^\d+(\.\d+)?$/.test(s);

  const inputCalculator = useCallback(async () => {
    if (!pool || !tokens) return;

    const tickSpacing = await getTickSpacingForFee(poolData.fee_tier_raw);

    console.log("tickRanges:", tickRanges);
    console.log("tickSpacing : ", tickSpacing);

    const tickLowerAligned = nearestUsableTick(
      tickRanges.tickLower,
      tickSpacing
    );
    const tickUpperAligned = nearestUsableTick(
      tickRanges.tickUpper,
      tickSpacing
    );

    console.log("tickLowerAligned : ", tickLowerAligned);
    console.log("tickUpperAligned : ", tickUpperAligned);

    if (lpCalTop) {
      setLpCalBottom(false);
      if (
        !fromLPTokenInputAmount ||
        !fromLPToken?.decimals ||
        !toLPToken?.decimals
      )
        return;
      if (!isValidNumberStr(fromLPTokenInputAmount)) return;

      const amount0JSBI = decimalStringToJSBI(
        fromLPTokenInputAmount,
        fromLPToken?.decimals ?? 18
      );

      const fromAmountTokenAmount = CurrencyAmount.fromRawAmount(
        tokens.tokenA as unknown as Currency,
        amount0JSBI
      );

      const pos = Position.fromAmount0({
        pool,
        tickLower: tickLowerAligned,
        tickUpper: tickUpperAligned,
        amount0: fromAmountTokenAmount.quotient,
        useFullPrecision: true,
      });

      const amount1 = pos.amount1.toExact();
      setActiveValue(null);
      const nextTo = parseFloat(amount1)
        .toFixed(18)
        .replace(/\.?0+$/, "");
      if (nextTo !== toLPTokenInputAmount) {
        setToLPTokenInputAmount(nextTo);
      }
    }

    if (lpCalBottom) {
      setLpCalTop(false);
      if (
        !toLPTokenInputAmount ||
        !fromLPToken?.decimals ||
        !toLPToken?.decimals
      )
        return;
      if (!isValidNumberStr(toLPTokenInputAmount)) return;

      const amount1JSBI = decimalStringToJSBI(
        toLPTokenInputAmount,
        toLPToken?.decimals ?? 18
      );

      const toAmountTokenAmount = CurrencyAmount.fromRawAmount(
        tokens.tokenB as unknown as Currency,
        amount1JSBI
      );

      const pos = Position.fromAmount1({
        pool,
        tickLower: tickLowerAligned,
        tickUpper: tickUpperAligned,
        amount1: toAmountTokenAmount.quotient,
      });

      const amount0 = pos.amount0.toExact();
      setActiveValue(null);
      const nextFrom = parseFloat(amount0)
        .toFixed(18)
        .replace(/\.?0+$/, "");
      if (nextFrom !== fromLPTokenInputAmount) {
        setFromLPTokenInputAmount(nextFrom);
      }
    }
  }, [
    pool,
    tokens,
    tickRanges.tickLower,
    tickRanges.tickUpper,
    lpCalTop,
    lpCalBottom,
    fromLPTokenInputAmount,
    toLPTokenInputAmount,
    fromLPToken?.decimals,
    toLPToken?.decimals,
    setFromLPTokenInputAmount,
    setToLPTokenInputAmount,
    setLpCalBottom,
    setLpCalTop,
  ]);

  const handleCopy = async () => {
    if (toLPToken?.address) {
      let copyToken =
        toLPToken?.address.toLowerCase() === "native"
          ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          : toLPToken?.address;
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
  const debouncedFrom = useDebounce(fromLPTokenInputAmount, 250);
  const debouncedTo = useDebounce(toLPTokenInputAmount, 250);

  useEffect(() => {
    inputCalculator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFrom, debouncedTo, pool]);

  return (
    <div className="flex flex-col pt-1">
      <div className="flex flex-row justify-between items-center py-2">
        <div>
          <div className="flex flex-row space-x-2 items-center justify-center">
            {toLPToken ? (
              <>
                {toLPToken?.logoURI ? (
                  <Image
                    src={toLPToken?.logoURI as string}
                    alt={toLPToken?.name as string}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-[25px] h-[25px]  rounded-full border"
                  />
                ) : (
                  <div className="rounded-full w-[30px] h-[30px] border-[2px] flex items-center justify-center dark:bg-gray-200 dark:text-black text-sm font-bold">
                    {getInitials(toLPToken?.name ?? "NA")}
                  </div>
                )}
                <div className="text-xs sm:text-[13px] font-normal dark:text-white">
                  {toLPToken?.symbol ?? "HELLO"}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center text-xs">
                Select a token
              </div>
            )}
            {toLPToken && (
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
              `${
                toLPTokenBalance === "0.00"
                  ? toLPTokenBalance
                  : toLPTokenBalance.split(".")[1]?.length > 4
                  ? parseFloat(toLPTokenBalance).toFixed(4)
                  : toLPTokenBalance
              }`
            )}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border dark:border-[#1A1A1A] dark:bg-[#FFFFFF14] p-3 w-full">
        <div className="flex flex-row justify-between items-center">
          <div className="py-2 text-start">
            <input
              value={getTrimmedResult(toLPTokenInputAmount)}
              onChange={handleChange}
              placeholder="0.00"
              type="text"
              className={`focus:outline-none bg-transparent text-primary text-[16px] sm:text-[19px] font-medium text-start w-[9.313rem] md:w-full`}
            />
          </div>
          <div className="py-2">
            <div className="flex space-x-2 justify-end">
              {[0.25, 0.5, 0.75, 1].map((value, index) => (
                <div
                  key={index}
                  onClick={() => inputAmountHandler(value)}
                  className={`button-range items-center !font-lato !text-[10px] px-3 py-1 hover:cursor-pointer 
            ${
              activeValue === value
                ? "!bg-primary !text-white dark:!text-black"
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

export default IncreaseTokenBalanceBottom;
