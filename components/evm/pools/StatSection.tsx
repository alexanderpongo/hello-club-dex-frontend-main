"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { contractConfig } from "@/config/blockchain.config";
import {
  ContractConfigItemType,
  TickData,
  TokenType,
} from "@/interfaces/index.i";
import { getInitials } from "@/lib/utils";
import { useSwapStore, useLPStore } from "@/store/useDexStore";
import {
  ArrowBigDown,
  ArrowBigUp,
  ArrowUpDown,
  BadgeInfo,
  Check,
  Loader2,
  LucideLoader2,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Abi,
  Address,
  createPublicClient,
  formatUnits,
  getContract,
} from "viem";
import { useAccount, http, useConfig } from "wagmi";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { readContract } from "@wagmi/core";
import IncreaseLpDialog from "./IncreaseLpDialog";

interface idProps {
  id: string;
}

function StatSection({ id }: idProps) {
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const {
    pairFromToken,
    pairToToken,
    singleDataRow,
    dataRow,
    setFromToken,
    setToToken,
    setFeeTier,
    setPairFromToken,
    setPairToToken,
    defaultTab,
  } = useSwapStore();
  const {
    pendingFee0,
    setPendingFee0,
    pendingFee1,
    setPendingFee1,
    setFromLPToken,
    setLpAddingSuccess,
    setToLPToken,
    setPoolFee,
    setFeeTier: setLpFeeTier,
    setActiveStep,
    setHandleContribute,
  } = useLPStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isTVLLoading, setIsTVLLoading] = useState(false);
  const [isPoolLoading, setIsPoolLoading] = useState(true);
  const [token0PoolBalance, setToken0PoolBalance] = useState("0");
  const [token1PoolBalance, setToken1PoolBalance] = useState("0");
  const [fee0, setFee0] = useState("0");
  const [fee1, setFee1] = useState("0");
  const { address, chainId } = useAccount();
  const config = useConfig();
  const [isInRange, setIsInRange] = useState(false);
  const [manualToken, setManualToken] = useState<TokenType>();
  const [searchTerm, setSearchTerm] = useState("");

  // Local token state that won't be overwritten by store updates
  const [localPairFromToken, setLocalPairFromToken] =
    useState<TokenType | null>(null);
  const [localPairToToken, setLocalPairToToken] = useState<TokenType | null>(
    null
  );

  // useEffect(() => {
  //   setIsLoading(true);
  // }, []);

  // const getTrimmedResult = (raw: string) => {
  //   const [intPart, decimalPart] = raw.split(".");
  //   if (!decimalPart) return raw;

  //   if (intPart === "0") {
  //     const firstNonZeroIndex = decimalPart.search(/[1-9]/);
  //     if (firstNonZeroIndex === -1) return "0";

  //     const sliceEnd = Math.min(firstNonZeroIndex + 5, 18);
  //     const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");

  //     return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
  //   }

  //   // For non-zero intPart, return int with 2–3 decimals
  //   const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
  //   return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
  // };

  const getTrimmedResult = (raw: number | string) => {
    const str = typeof raw === "number" ? raw.toFixed(18) : raw;
    const [intPart, decimalPart] = str?.split(".");
    if (!decimalPart) return str;

    if (intPart === "0") {
      const firstNonZeroIndex = decimalPart.search(/[1-9]/);
      if (firstNonZeroIndex === -1) return "0";

      const sliceEnd = Math.min(firstNonZeroIndex + 5, 18);
      const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");
      return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
    }

    const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
    return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
  };

  useEffect(() => {
    // console.log("singleDataRow", singleDataRow);

    const interval = setInterval(() => {
      progressCalculator();
    }, 100);

    return () => clearInterval(interval);
  }, [singleDataRow, pairFromToken, pairToToken]);

  // const addLiquidityTabHandler = () => {
  //   console.log("setDefaultTab lp");
  //   setIsLoading(true);
  //   setDefaultTab("lp");
  // };

  // const swapTabHandler = () => {
  //   console.log("setDefaultTab swap");
  //   setIsLoading(true);
  //   setDefaultTab("trade");
  // };
  // const addLiquidityTabHandler = () => {
  //   // console.log("setDefaultTab lp");
  //   if (isClient) {
  //     setIsLoading(true);
  //     setDefaultTab("lp");
  //     // router.push("/"); // Navigate to the homepage
  //   }
  // };

  // const swapTabHandler = () => {
  //   // console.log("setDefaultTab swap");
  //   if (isClient) {
  //     setIsLoading(true);
  //     setDefaultTab("trade");
  //     // router.push("/"); // Navigate to the homepage
  //   }
  // };

  const formatNumber = (value: number) => {
    const num = value;
    if (num % 1 === 0) {
      return num.toFixed(2); // No decimal, fix to 2
    }
    const decimalPart = num.toString().split(".")[1];
    if (decimalPart && decimalPart.length > 5 && decimalPart.length < 18) {
      return num.toFixed(5).toString(); // Keep original decimal precision
    }
    return num.toFixed(2); // Fix to 2 decimal places
  };

  // const formatToMillionOrBillion = (num: number) => {
  //   let value = num;
  //   if (value >= 1e15) {
  //     return (value / 1e15).toFixed(1) + "Q"; // Quadrillions (Q)
  //   } else if (value >= 1e12) {
  //     return (value / 1e12).toFixed(1) + "T"; // Trillions (T)
  //   } else if (value >= 1e9) {
  //     return (value / 1e9).toFixed(1) + "B"; // Billions (B)
  //   } else if (value >= 1e6) {
  //     return (value / 1e6).toFixed(1) + "M"; // Millions (M)
  //   } else if (value >= 1e3) {
  //     return (value / 1e3).toFixed(1) + "K"; // Millions (M)
  //   }
  //   return formatNumber(value);
  // };

  // const formatNumberReadable = (num: number) => {
  //   const absNum = Math.abs(num);

  //   // Use exponential for very small or very large numbers
  //   if ((absNum > 0 && absNum < 0.0001) || absNum >= 1e15) {
  //     return num.toExponential(4); // 4 decimals in exponential
  //   }

  //   // Large numbers with suffix
  //   if (absNum >= 1e15) return (num / 1e15).toFixed(1) + "Q"; // Quadrillions
  //   if (absNum >= 1e12) return (num / 1e12).toFixed(1) + "T"; // Trillions
  //   if (absNum >= 1e9) return (num / 1e9).toFixed(1) + "B"; // Billions
  //   if (absNum >= 1e6) return (num / 1e6).toFixed(1) + "M"; // Millions
  //   if (absNum >= 1e3) return (num / 1e3).toFixed(1) + "K"; // Thousands

  //   // Small numbers: show up to 5 significant digits
  //   if (absNum > 0 && absNum < 0.0001) {
  //     return num.toPrecision(5);
  //   }

  //   // Normal numbers: show up to 5 decimals
  //   return parseFloat(num.toFixed(5)).toString();
  // };

  // const formatNumberReadable = (num: number) => {
  //   const absNum = Math.abs(num);

  //   if (absNum >= 1e15) return num.toExponential(4); // very large numbers
  //   if (absNum > 0 && absNum < 1e-8) return num.toExponential(4); // extremely small numbers
  //   if (absNum > 0 && absNum < 0.0001) return num.toFixed(8); // tiny but readable
  //   if (absNum >= 1e15) return (num / 1e15).toFixed(1) + "Q";
  //   if (absNum >= 1e12) return (num / 1e12).toFixed(1) + "T";
  //   if (absNum >= 1e9) return (num / 1e9).toFixed(1) + "B";
  //   if (absNum >= 1e6) return (num / 1e6).toFixed(1) + "M";
  //   if (absNum >= 1e3) return (num / 1e3).toFixed(1) + "K";

  //   return parseFloat(num.toFixed(5)).toString();
  // };

  const formatNumberReadable = (num: number) => {
    const absNum = Math.abs(num);

    // Handle zero
    if (num === 0) return "0";

    // Extremely small numbers
    if (absNum < 1e-18) return "<0.00000001"; // truncate very small numbers
    if (absNum < 0.0001) return "<0.0001"; // tiny but readable

    // Large number abbreviations
    if (absNum >= 1e15) return (num / 1e15).toFixed(1) + "Q";
    if (absNum >= 1e12) return (num / 1e12).toFixed(1) + "T";
    if (absNum >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (absNum >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (absNum >= 1e3) return (num / 1e3).toFixed(1) + "K";

    // Small but normal numbers
    return parseFloat(num.toFixed(5)).toString();
  };

  const progressCalculator = () => {
    const tokenAValue = poolBalanceCalculator(
      parseFloat(singleDataRow?.amount0!),
      pairFromToken?.decimals!
    );
    // parseFloat(singleDataRow?.amount0!) / pairFromToken?.decimals!;
    const tokenBValue = poolBalanceCalculator(
      parseFloat(singleDataRow?.amount1!),
      pairToToken?.decimals!
    );

    if (parseFloat(tokenAValue) > 0 && parseFloat(tokenBValue) === 0) {
      let progress =
        (parseFloat(tokenBValue) /
          (parseFloat(tokenAValue) + parseFloat(tokenBValue))) *
        100;
      progress = Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
      setProgress(progress);
    } else if (parseFloat(tokenBValue) > 0 && parseFloat(tokenAValue) === 0) {
      let progress =
        (parseFloat(tokenAValue) /
          (parseFloat(tokenAValue) + parseFloat(tokenBValue))) *
        100;
      progress = Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
      setProgress(progress);
    } else {
      let progress =
        (parseFloat(tokenBValue) /
          (parseFloat(tokenAValue) + parseFloat(tokenBValue))) *
        100;
      progress = Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
      setProgress(progress);
    }
  };

  // const poolBalanceCalculator = useCallback(
  //   (amount: number, decimal: number) => {
  //     if (!amount || isNaN(amount)) {
  //       console.error("Invalid amount:", amount);
  //       return `${"0.0"} `;
  //     }

  //     const tokenValue = formatUnits(BigInt(Math.floor(amount)), decimal);
  //     const formattedValue = formatToMillionOrBillion(parseFloat(tokenValue));

  //     if (parseFloat(tokenValue) > 0) {
  //       return `${formattedValue} `;
  //     } else {
  //       return `${"0.0"} `;
  //     }
  //   },
  //   []
  // );

  // const poolBalanceCalculator = useCallback(
  //   (amount: number, decimals: number) => {
  //     if (!amount || isNaN(amount)) {
  //       console.error("Invalid amount:", amount);
  //       return "0.0";
  //     }

  //     // Convert amount to BigInt considering decimals
  //     // const scaledAmount = BigInt(Math.floor(amount * 10 ** decimals));
  //     const tokenValue = formatUnits(BigInt(Math.floor(amount)), decimals);

  //     // Format small or large numbers
  //     const formattedValue = formatNumberReadable(parseFloat(tokenValue));

  //     return parseFloat(tokenValue) > 0 ? formattedValue : "0.0";
  //   },
  //   []
  // );

  const poolBalanceCalculator = useCallback(
    (amount: number | string, decimals: number) => {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return "0.0";
      }

      try {
        // Convert to BigInt safely
        const amountNum = Number(amount);
        const scaledAmount = BigInt(Math.floor(amountNum)); // basic case

        const tokenValue = formatUnits(scaledAmount, decimals);
        const parsedValue = parseFloat(tokenValue);

        return parsedValue > 0 ? formatNumberReadable(parsedValue) : "0.0";
      } catch (error) {
        console.error("Error in poolBalanceCalculator:", error);
        return "0.0";
      }
    },
    []
  );

  // Precompute values using useMemo
  const poolBalance0 = useMemo(() => {
    // console.log(
    //   "singleDataRow?.amount0",
    //   singleDataRow?.amount0,
    //   "pairFromToken?.decimals",
    //   pairFromToken?.decimals
    // );

    if (!singleDataRow?.amount0 || !pairFromToken?.decimals) return null;
    let poolBalanceToken0 = poolBalanceCalculator(
      parseFloat(singleDataRow?.amount0!),
      pairFromToken?.decimals ?? "18"
    );
    return poolBalanceToken0;
  }, [singleDataRow?.amount0, pairFromToken?.decimals]);

  const poolBalance1 = useMemo(() => {
    // console.log(
    //   "test singleDataRow?.amount0",
    //   singleDataRow?.amount0,
    //   "pairFromToken?.decimals",
    //   pairFromToken?.decimals
    // );
    if (!singleDataRow?.amount1 || !pairToToken?.decimals) return null;
    // console.log(
    //   "test singleDataRow?.amount1",
    //   singleDataRow?.amount1,
    //   "      pairToToken.decimals",
    //   pairToToken.decimals
    // );

    let poolBalanceToken1 = poolBalanceCalculator(
      parseFloat(singleDataRow?.amount1!),
      pairToToken?.decimals ?? "18"
    );
    return poolBalanceToken1;
  }, [singleDataRow?.amount1, pairToToken?.decimals]);

  // Use effect to update loading state
  useEffect(() => {
    if (poolBalance0 || poolBalance1) {
      // console.log("poolBalance0", poolBalance0, "poolBalance1", poolBalance1);

      setIsPoolLoading(false);
    }
  }, [poolBalance0, poolBalance1]);

  // const tvlValue = useMemo(() => {
  //   if (
  //     !singleDataRow?.amount0 ||
  //     !pairFromToken?.decimals ||
  //     !singleDataRow?.amount1 ||
  //     !pairToToken?.decimals
  //   )
  //     return null;

  //   const amount0 = parseFloat(singleDataRow.amount0.toString());
  //   const amount1 = parseFloat(singleDataRow.amount1.toString());
  //   if (isNaN(amount0)) {
  //     console.error("Invalid amount0:", amount0);
  //     return "Error: Invalid amount";
  //   }

  //   let feeAmount: number;
  //   if (amount0 > 0) {
  //     feeAmount = amount0 * 2;
  //   } else {
  //     amount1 * 2;
  //   }

  //   console.log("feeAmount:", feeAmount!);

  //   const tokenAValue = formatUnits(
  //     BigInt(Math.floor(feeAmount!)),
  //     pairFromToken.decimals
  //   );
  //   // const trimmedValueA = getTrimmedResult(tokenAValue);
  //   const formattedValue = formatNumberReadable(parseFloat(tokenAValue));
  //   console.log("Formatted Value:", formattedValue);
  //   if (amount0 > 0) {
  //     return `${formattedValue} ${pairFromToken.symbol}`;
  //   } else {
  //     return `${formattedValue} ${pairToToken.symbol}`;
  //   }
  // }, [
  //   singleDataRow?.amount0,
  //   pairFromToken?.decimals,
  //   singleDataRow?.amount1,
  //   pairToToken?.decimals,
  // ]);

  // const tvlValue = useMemo(() => {
  //   if (
  //     !singleDataRow?.amount0 ||
  //     !pairFromToken?.decimals ||
  //     !singleDataRow?.amount1 ||
  //     !pairToToken?.decimals
  //   )
  //     return null;

  //   console.log("singleDataRow", singleDataRow);

  //   const amount0 = parseFloat(singleDataRow.amount0.toString());
  //   const amount1 = parseFloat(singleDataRow.amount1.toString());
  //   if (isNaN(amount0) || isNaN(amount1)) {
  //     console.error("Invalid amounts:", amount0, amount1);
  //     return 0;
  //   }

  //   let feeAmount = 0;
  //   if (parseFloat(singleDataRow?.liquidity) === 0) {
  //     feeAmount = 0;
  //   } else if (amount0 > 0 && amount1 > 0) {
  //     feeAmount = amount0 * 2;
  //   } else if (amount0 > 0) {
  //     feeAmount = amount0;
  //   } else if (amount1 > 0) {
  //     feeAmount = amount1;
  //   }

  //   console.log("feeAmount:", feeAmount);

  //   const tokenAValue = formatUnits(
  //     BigInt(Math.floor(feeAmount)),
  //     amount0 > 0 ? pairFromToken.decimals : pairToToken.decimals
  //   );

  //   const formattedValue = formatNumberReadable(parseFloat(tokenAValue));
  //   console.log("Formatted Value:", formattedValue);

  //   return amount0 > 0
  //     ? `${formattedValue} ${pairFromToken.symbol}`
  //     : `${formattedValue} ${pairToToken.symbol}`;
  // }, [
  //   singleDataRow?.amount0,
  //   pairFromToken?.decimals,
  //   pairFromToken?.symbol,
  //   singleDataRow?.amount1,
  //   pairToToken?.decimals,
  //   pairToToken?.symbol,
  // ]);

  const tvlValue = useMemo(() => {
    if (
      !singleDataRow?.amount0 ||
      !pairFromToken?.decimals ||
      !singleDataRow?.amount1 ||
      !pairToToken?.decimals
    )
      return null;

    const getTVL = (
      fee: { amount0: any; amount1: any; liquidity: any },
      token0: { decimals: number; symbol: string },
      token1: { decimals: number; symbol: string }
    ) => {
      const amount0 = BigInt(fee.amount0?.toString() || "0");
      const amount1 = BigInt(fee.amount1?.toString() || "0");
      const liquidity = BigInt(fee.liquidity?.toString() || "0");

      if (liquidity === BigInt(0)) {
        return { value: null, symbol: "" };
      }

      let feeAmount: BigInt = BigInt(0);
      let decimals = token0.decimals;
      let symbol = token0.symbol;

      if (amount0 > BigInt(0) && amount1 > BigInt(0)) {
        feeAmount = amount0 * BigInt(2);
      } else if (amount0 > BigInt(0)) {
        feeAmount = amount0;
      } else if (amount1 > BigInt(0)) {
        feeAmount = amount1;
        decimals = token1.decimals;
        symbol = token1.symbol;
      }

      const formatted = formatUnits(feeAmount as bigint, decimals);
      const formattedValue = getTrimmedResult(formatted);

      return { value: formattedValue, symbol };
    };

    const { value, symbol } = getTVL(singleDataRow, pairFromToken, pairToToken);

    const formatValue = (val: string | null) => {
      if (!val) return "0";
      const [integer, fraction = ""] = val.split(".");
      const truncatedFraction = fraction.slice(0, 18);
      return parseInt(truncatedFraction) === 0
        ? integer
        : `${integer}.${truncatedFraction}`;
    };

    return `${formatValue(value)} ${symbol}`;
  }, [
    singleDataRow?.amount0,
    singleDataRow?.amount1,
    singleDataRow?.liquidity,
    pairFromToken?.decimals,
    pairFromToken?.symbol,
    pairToToken?.decimals,
    pairToToken?.symbol,
  ]);

  useEffect(() => {
    if (tvlValue) {
      setIsTVLLoading(false);
    }
  }, [tvlValue]);

  // Set token pair from dataRow when available
  useEffect(() => {
    if (dataRow && dataRow.token0 && dataRow.token1) {
      // Helper function to check if a token is the native token for the current chain
      const isNativeToken = (tokenAddress: string, chainId: number) => {
        // Check if the token is explicitly marked as native
        if (tokenAddress === "native") return true;

        const wrappedNativeAddresses = {
          1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase(), // ETH
          56: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c".toLowerCase(), // BNB
          97: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd".toLowerCase(), // BSC Testnet
          10: "0x4200000000000000000000000000000000000006".toLowerCase(), // Optimism
          8453: "0x4200000000000000000000000000000000000006".toLowerCase(), // Base
        };

        return (
          tokenAddress.toLowerCase() ===
          wrappedNativeAddresses[chainId as keyof typeof wrappedNativeAddresses]
        );
      };

      // Use the chainId from dataRow instead of the user's current chainId
      const dataRowChainId = dataRow.chainId || chainId || 1;

      // Create token0 - convert to native if it's the wrapped native token
      const token0 = {
        chainId: dataRowChainId,
        address: isNativeToken(dataRow.token0.address, dataRowChainId)
          ? "native"
          : dataRow.token0.address,
        name: isNativeToken(dataRow.token0.address, dataRowChainId)
          ? dataRow.token0.name.replace(/^Wrapped /, "")
          : dataRow.token0.name,
        symbol: isNativeToken(dataRow.token0.address, dataRowChainId)
          ? dataRow.token0.symbol.replace(/^W/, "")
          : dataRow.token0.symbol,
        decimals: dataRow.token0.decimal || dataRow.token0.decimals || 18,
        logoURI: dataRow.token0.logoURI || "",
      };

      // Create token1 - convert to native if it's the wrapped native token
      const token1 = {
        chainId: dataRowChainId,
        address: isNativeToken(dataRow.token1.address, dataRowChainId)
          ? "native"
          : dataRow.token1.address,
        name: isNativeToken(dataRow.token1.address, dataRowChainId)
          ? dataRow.token1.name.replace(/^Wrapped /, "")
          : dataRow.token1.name,
        symbol: isNativeToken(dataRow.token1.address, dataRowChainId)
          ? dataRow.token1.symbol.replace(/^W/, "")
          : dataRow.token1.symbol,
        decimals: dataRow.token1.decimal || dataRow.token1.decimals || 18,
        logoURI: dataRow.token1.logoURI || "",
      };

      setPairFromToken(token0);
      setPairToToken(token1);

      // Also set local state to prevent overwrites
      setLocalPairFromToken(token0);
      setLocalPairToToken(token1);
    }
  }, [dataRow, chainId, setPairFromToken, setPairToToken]);

  const calculatePendingFees = async () => {
    try {
      setPendingFee0("0");
      setPendingFee1("0");

      // Early return if no valid data
      if (!dataRow || !dataRow.result || dataRow.result.length < 7) {
        console.log("No valid dataRow available for fee calculation");
        return;
      }

      if (!chainId) {
        console.log("No chainId available for fee calculation");
        return;
      }

      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId] || contractConfig["default"];

      if (!chainContractConfig) {
        console.log("No contract config available for chainId:", chainId);
        return;
      }

      // Get the pool address
      const pool = (await readContract(config, {
        address: chainContractConfig.v3FactoryAddress as Address,
        abi: chainContractConfig.v3FactoryABI,
        functionName: "getPool",
        args: [dataRow?.result[2]!, dataRow?.result[3]!, dataRow?.result[4]!],
      })) as Address;

      // Check if pool exists (not zero address)
      if (!pool || pool === "0x0000000000000000000000000000000000000000") {
        console.log("Pool does not exist for the given parameters");
        return;
      }

      // console.log("pool", pool);

      const publicClient = createPublicClient({
        chain: chainContractConfig.chain!,
        transport: http(),
      });

      // Initialize the pool contract
      const poolContract = getContract({
        address: pool as `0x${string}`,
        abi: IUniswapV3PoolABI.abi as Abi,
        client: publicClient,
      });

      // console.log("poolContract", poolContract);

      // Get slot0 data
      const slot0 = (await readContract(config, {
        address: poolContract.address,
        abi: poolContract.abi,
        functionName: "slot0",
      })) as [bigint, number, number, number, number, number, boolean];

      const currentTick = slot0[1];

      // console.log("currentTick", currentTick);

      // Get global fee growth values
      const feeGrowthGlobal0 = (await readContract(config, {
        address: poolContract.address,
        abi: poolContract.abi,
        functionName: "feeGrowthGlobal0X128",
      })) as bigint;

      // console.log("feeGrowthGlobal0", feeGrowthGlobal0);

      const feeGrowthGlobal1 = (await readContract(config, {
        address: poolContract.address,
        abi: poolContract.abi,
        functionName: "feeGrowthGlobal1X128",
      })) as bigint;

      // console.log("feeGrowthGlobal1", feeGrowthGlobal1);

      // Get tick data
      const lowerTickIndex = dataRow?.result[5] as number;
      const upperTickIndex = dataRow?.result[6] as number;

      // Fetch lower tick data
      const lowerTick = (await readContract(config, {
        address: poolContract.address,
        abi: poolContract.abi,
        functionName: "ticks",
        args: [lowerTickIndex],
      })) as TickData;

      // Fetch upper tick data
      const upperTick = (await readContract(config, {
        address: poolContract.address,
        abi: poolContract.abi,
        functionName: "ticks",
        args: [upperTickIndex],
      })) as TickData;

      // console.log("lowerTick", lowerTick[2], "upperTick", upperTick[3]);

      let lowerTicks = {
        feeGrowthOutside0X128: lowerTick[2],
        feeGrowthOutside1X128: lowerTick[3],
      };

      let upperTicks = {
        feeGrowthOutside0X128: upperTick[2],
        feeGrowthOutside1X128: upperTick[3],
      };

      // Calculate fee growth inside the range
      let feeGrowthInside0X128: any;
      let feeGrowthInside1X128: any;

      // console.log("teeee Debug Info:");
      // console.log("teeee currentTick:", currentTick);
      // console.log("lowerTickIndex:", lowerTickIndex);
      // console.log("upperTickIndex:", upperTickIndex);
      // console.log("teeee lowerTick:", lowerTick);
      // console.log("teeee upperTick:", upperTick);
      // console.log("feeGrowthGlobal0:", feeGrowthGlobal0);
      // console.log("feeGrowthGlobal1:", feeGrowthGlobal1);

      // if (
      //   !lowerTick?.feeGrowthOutside0X128 ||
      //   !lowerTick?.feeGrowthOutside1X128 ||
      //   !upperTick?.feeGrowthOutside0X128 ||
      //   !upperTick?.feeGrowthOutside1X128
      // ) {
      //   console.warn("Missing tick data");
      //   return;
      // }

      if (currentTick < lowerTickIndex) {
        // Current tick is below the position range
        feeGrowthInside0X128 = (
          Number(lowerTicks.feeGrowthOutside0X128) -
          Number(upperTicks.feeGrowthOutside0X128)
        ).toString();

        feeGrowthInside1X128 = (
          Number(lowerTicks.feeGrowthOutside1X128) -
          Number(upperTicks.feeGrowthOutside1X128)
        ).toString();
      } else if (currentTick >= upperTickIndex) {
        // Current tick is above the position range
        feeGrowthInside0X128 = (
          Number(upperTicks.feeGrowthOutside0X128) -
          Number(lowerTicks.feeGrowthOutside0X128)
        ).toString();

        feeGrowthInside1X128 = (
          Number(upperTicks.feeGrowthOutside1X128) -
          Number(lowerTicks.feeGrowthOutside1X128)
        ).toString();
      } else {
        // Current tick is within the position range
        feeGrowthInside0X128 = (
          Number(feeGrowthGlobal0) -
          Number(lowerTicks.feeGrowthOutside0X128) -
          Number(upperTicks.feeGrowthOutside0X128)
        ).toString();

        feeGrowthInside1X128 = (
          Number(feeGrowthGlobal1) -
          Number(lowerTicks.feeGrowthOutside1X128) -
          Number(upperTicks.feeGrowthOutside1X128)
        ).toString();
      }

      // console.log(
      //   "feeGrowthInside0X128:",
      //   feeGrowthInside0X128,
      //   "feeGrowthInside1X128:",
      //   feeGrowthInside1X128
      // );

      // setFee0(feeGrowthInside0X128.toString());
      // setFee1(feeGrowthInside1X128.toString());

      if (currentTick >= lowerTickIndex && currentTick < upperTickIndex) {
        setIsInRange(true);
      } else {
        setIsInRange(false);
      }

      // console.log(
      //   dataRow.result[8],
      //   Number(dataRow.result[8]),
      //   dataRow.result[9],
      //   Number(dataRow.result[9])
      // );

      // Calculate fee growth since last position update
      const feeGrowthDelta0 =
        Number(feeGrowthInside0X128) - Number(dataRow.result[8]);
      const feeGrowthDelta1 =
        Number(feeGrowthInside1X128) - Number(dataRow.result[9]);

      // console.log(
      //   "feeGrowthDelta0",
      //   feeGrowthDelta0,
      //   "feeGrowthDelta1",
      //   feeGrowthDelta1
      // );

      const Q128 = BigInt(2) ** BigInt(128);

      // Calculate fees
      let pendingFees0 = BigInt(0);
      let pendingFees1 = BigInt(0);

      // Safe parse
      const rawLiquidity = dataRow.result[7];
      const liquidity = BigInt(Math.floor(Number(rawLiquidity)));
      const formattedFeeGrowthDelta0 = BigInt(Math.floor(feeGrowthDelta0));
      const formattedFeeGrowthDelta1 = BigInt(Math.floor(feeGrowthDelta1));
      // console.log("liquidity", liquidity);

      // console.log(
      //   "liquidity",
      //   liquidity
      //   // "BigInt(feeGrowthDelta0.toString())",
      //   // BigInt(feeGrowthDelta0.toString()),
      //   // "BigInt(feeGrowthDelta1.toString()))",
      //   // BigInt(feeGrowthDelta1.toString())
      // );

      if ((liquidity as bigint) > BigInt(0)) {
        pendingFees0 = (liquidity * formattedFeeGrowthDelta0) / Q128;
        pendingFees1 = (liquidity * formattedFeeGrowthDelta1) / Q128;
      }

      console.log("token pair decimals");

      let formattedPendingFee0 = 0;
      let formattedPendingFee1 = 0;

      console.log("pairToToken?.decimals", pairToToken?.decimals);

      // Get the actual token addresses for comparison
      const token0Address = dataRow.token0.address.toLowerCase();
      const token1Address = dataRow.token1.address.toLowerCase();

      // console.log("token0Address", token0Address);
      // console.log("token1Address", token1Address);
      // console.log("pairFromToken?.address", pairFromToken?.address);
      // console.log("pairToToken?.address", pairToToken?.address);

      // Determine which token is token0 and which is token1 based on the dataRow
      const isFromToken0 =
        pairFromToken?.address.toLowerCase() === token0Address ||
        (pairFromToken?.address === "native" &&
          token0Address === "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c") ||
        (pairFromToken?.address === "native" &&
          token0Address === "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2") ||
        (pairFromToken?.address === "native" &&
          token0Address === "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd") ||
        (pairFromToken?.address === "native" &&
          token0Address === "0x4200000000000000000000000000000000000006") ||
        (pairFromToken?.address === "native" &&
          token0Address === "0x4200000000000000000000000000000000000006");

      // console.log("isFromToken0", isFromToken0);

      if (isFromToken0) {
        // pairFromToken is token0, pairToToken is token1
        formattedPendingFee0 = parseFloat(
          formatUnits(pendingFees0, pairFromToken?.decimals)
        );
        formattedPendingFee1 = parseFloat(
          formatUnits(pendingFees1, pairToToken?.decimals)
        );
      } else {
        // pairFromToken is token1, pairToToken is token0
        formattedPendingFee0 = parseFloat(
          formatUnits(pendingFees0, pairToToken?.decimals)
        );
        formattedPendingFee1 = parseFloat(
          formatUnits(pendingFees1, pairFromToken?.decimals)
        );
      }

      // console.log("dataRow", dataRow);

      // console.log("token0", pairFromToken);
      // console.log("token1", pairToToken);
      // console.log("pendingFees0", pendingFees0);
      // console.log("pendingFees1", pendingFees1);
      // console.log({ formattedPendingFee0, formattedPendingFee1 });

      // Format fees

      // console.log(
      //   "pendingFees0",
      //   formattedPendingFee0,
      //   "pendingFees1",
      //   formattedPendingFee1
      // );

      // // Utility function to clean the number
      // function cleanFeeValue(value: number) {
      //   // If negative or nearly zero, return 0
      //   if (value < 0 || Math.abs(value) < 1e-12) {
      //     return "0";
      //   }
      //   // Check if value has meaningful decimals
      //   const str = value.toFixed(12); // up to 12 decimals
      //   if (parseFloat(str) === Math.floor(value)) {
      //     return Math.floor(value).toString();
      //   }
      //   return parseFloat(str).toString(); // remove unnecessary trailing zeros
      // }

      // Use the same trimming logic as collected fees
      const getTrimmedResult = (raw: string) => {
        const [intPart, decimalPart] = raw.split(".");
        if (!decimalPart) return raw;

        if (intPart === "0") {
          const firstNonZeroIndex = decimalPart.search(/[1-9]/);
          if (firstNonZeroIndex === -1) return "0";

          const sliceEnd = Math.min(firstNonZeroIndex + 3, 18);
          const trimmedDecimals = decimalPart
            .slice(0, sliceEnd)
            .replace(/0+$/, "");

          return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
        }

        // For non-zero intPart, return int with 2–3 decimals
        const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
        return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
      };

      // Cleaned values using the same logic as collected fees
      // Convert scientific notation to regular decimal first
      const fee0String = (
        Math.abs(formattedPendingFee0) < 1e-18 ? 0 : formattedPendingFee0
      ).toFixed(18);
      const fee1String = (
        Math.abs(formattedPendingFee1) < 1e-18 ? 0 : formattedPendingFee1
      ).toFixed(18);

      // const fee0String = formattedPendingFee0.toFixed(18);
      // const fee1String = formattedPendingFee1.toFixed(18);

      const cleanedFee0 = getTrimmedResult(fee0String);
      const cleanedFee1 = getTrimmedResult(fee1String);

      console.log("Final cleaned values:", { cleanedFee0, cleanedFee1 });

      // Set the final values
      setPendingFee0(cleanedFee0);
      setPendingFee1(cleanedFee1);

      // Optionally return the values
      // return {
      //   feeGrowthInside0X128,
      //   feeGrowthInside1X128,
      // };
    } catch (error) {
      console.error("Error calculating pending fees:", error);
      // Set default values on error
      setPendingFee0("0");
      setPendingFee1("0");
    }
  };

  const tickRangeCalculator = async () => {
    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId!] || contractConfig["default"];

    // Validate dataRow before use
    if (!dataRow || !dataRow.result || dataRow.result.length < 7) {
      throw new Error("Invalid dataRow structure");
    }

    // Get the pool address
    const pool = (await readContract(config, {
      address: chainContractConfig.v3FactoryAddress as Address,
      abi: chainContractConfig.v3FactoryABI,
      functionName: "getPool",
      args: [dataRow?.result[2]!, dataRow?.result[3]!, dataRow?.result[4]!],
    })) as Address;

    // console.log("pool", pool);

    // Validate pool address - check if it's not the zero address
    if (!pool || pool === "0x0000000000000000000000000000000000000000") {
      console.warn("Invalid pool address:", pool);
      setIsInRange(false);
      return;
    }

    const publicClient = createPublicClient({
      chain: chainContractConfig.chain!,
      transport: http(),
    });

    // Initialize the pool contract
    const poolContract = getContract({
      address: pool as `0x${string}`,
      abi: IUniswapV3PoolABI.abi as Abi,
      client: publicClient,
    });

    // console.log("poolContract", poolContract);

    // Get slot0 data
    const slot0 = (await readContract(config, {
      address: poolContract.address,
      abi: poolContract.abi,
      functionName: "slot0",
    })) as [bigint, number, number, number, number, number, boolean];

    const currentTick = slot0[1];

    // console.log("currentTick", currentTick);

    // Get tick data
    const lowerTickIndex = dataRow?.result[5] as number;
    const upperTickIndex = dataRow?.result[6] as number;

    // setFee0(feeGrowthInside0X128.toString());
    // setFee1(feeGrowthInside1X128.toString());

    if (currentTick >= lowerTickIndex && currentTick < upperTickIndex) {
      setIsInRange(true);
    } else {
      setIsInRange(false);
    }
  };

  useEffect(() => {
    if (defaultTab === "my" && dataRow != null && chainId) {
      // console.log("check dataRow", dataRow);

      calculatePendingFees().catch((error) => {
        console.error("Error in calculatePendingFees:", error);
        setPendingFee0("0");
        setPendingFee1("0");
      });
    }
  }, [chainId]);

  useEffect(() => {
    if (defaultTab === "all" && dataRow != null && chainId) {
      // console.log("check dataRow 1", dataRow);

      tickRangeCalculator().catch((error) => {
        console.error("Error in tickRangeCalculator:", error);
        setIsInRange(false);
      });
    }
  }, [chainId]);

  // useEffect(() => {
  //   if (defaultTab === "my" && dataRow != null) {
  //     console.log("check dataRow", dataRow);

  //     if (dataRow?.tokenLocked) {
  //     }
  //   }
  //   if (defaultTab === "all" && dataRow != null) {
  //     console.log("check dataRow", dataRow);

  //     tickRangeCalculator();
  //   }
  // }, []);

  useEffect(() => {
    if (defaultTab === "my" && dataRow != null && chainId) {
      // console.log("check dataRow", dataRow);
      calculatePendingFees();
    }
  }, [poolBalance0, poolBalance1, chainId]);

  const swapPoolHandler = () => {
    // Use local state instead of store state to prevent overwrites
    const fromToken = localPairFromToken || pairFromToken;
    const toToken = localPairToToken || pairToToken;

    console.log("localPairFromToken", localPairFromToken);
    console.log("localPairToToken", localPairToToken);
    console.log("pairFromToken", pairFromToken);
    console.log("pairToToken", pairToToken);
    console.log("chainId", chainId);

    if (!fromToken || !toToken) {
      console.error("Token pair not available");
      return;
    }

    // Set URL parameters with token addresses
    const params = new URLSearchParams();

    // Handle native tokens properly - use the original token addresses from dataRow
    const fromAddress =
      fromToken.address === "native"
        ? "native"
        : fromToken.address.toLowerCase();
    const toAddress =
      toToken.address === "native" ? "native" : toToken.address.toLowerCase();

    params.set("from", fromAddress);
    params.set("to", toAddress);
    params.set("chainId", chainId?.toString() || "56");

    console.log("Setting URL params:", { from: fromAddress, to: toAddress });

    // Use setTimeout to defer state updates until after navigation begins
    setTimeout(() => {
      setFromToken(fromToken);
      setToToken(toToken);
      setFeeTier(dataRow.result[4]);
    }, 0);

    console.log(`/trade?${params.toString()}`);

    // Navigate with URL parameters
    router.push(`/trade?${params.toString()}`);
  };

  const addLiquidityPoolHandler = () => {
    // Use local state instead of store state to prevent overwrites
    const fromToken = localPairFromToken || pairFromToken;
    const toToken = localPairToToken || pairToToken;

    // console.log("pairFromToken", pairFromToken);
    // console.log("pairToToken", pairToToken);
    // console.log("pair feetier", dataRow.result[4]/10000);
    const poolFeeTier = dataRow.result[4] / 10000 || 0.3;

    // Use setTimeout to defer state updates until after navigation begins
    setTimeout(() => {
      setLpAddingSuccess(false);
      setFromLPToken(fromToken);
      setToLPToken(toToken);
      setPoolFee(dataRow.result[4] || 3000);
      setLpFeeTier(poolFeeTier.toString());
      setActiveStep(2);
      setHandleContribute(true);
    }, 0);
  };

  return (
    <div className="mt-6 md:mt-0 flex-col w-full min-w-[320px] ">
      <div className="flex flex-row w-full gap-4 ">
        {/* <Link href="/" legacyBehavior passHref> */}
        <Button
          onClick={swapPoolHandler}
          className="w-1/2 button-primary  inline-flex justify-center items-center basis-1/2 uppercase pt-3"
        >
          {isLoading && <Loader2 size={20} className="animate-spin -mt-1" />}
          <ArrowUpDown className="button-primary -mt-1" />
          Swap
        </Button>
        {/* </Link> */}
        <IncreaseLpDialog id={id as string} />
        {/* <Button
          onClick={() => {
            addLiquidityPoolHandler();
            router.push("/?tab=lp");
          }}
          className="w-1/2 button-primary inline-flex justify-center items-center uppercase pt-3"
        >
          {isLoading && <Loader2 size={20} className="animate-spin" />}
          <Plus className="button-primary -mt-1" /> Add liquidity
        </Button> */}
        {/* <button onClick={() => router.push("/")}>Go Home</button> */}
      </div>
      {/* <Button onClick={calculatePendingFees}>testttt</Button> */}
      <div className="mt-6 p-2 md:p-4 w-full flex flex-col border dark:border-[#FFFFFF1A] rounded-xl dark:bg-[#1A1A1A] card-primary">
        <div className="flex text-xl font-formula text-primary">Stats</div>
        {parseFloat(singleDataRow?.liquidity!) === 0 && (
          <div className="py-2 flex gap-2 rounded-xl text-red-400 text-start items-start text-sm">
            <BadgeInfo className="!h-[24px] !w-[24px]" />
            <span>No liquidity available</span>
          </div>
        )}
        {parseFloat(singleDataRow?.liquidity!) !== 0 && (
          <div className="flex flex-col py-2">
            <label className="flex w-full text-neutral-500 text-sm pb-1">
              Pool Balances
            </label>
            <div className="flex flex-row justify-between items-center">
              <div>
                {isPoolLoading ? (
                  <>
                    {" "}
                    <LucideLoader2 size={12} className="animate-spin mb-1" />
                  </>
                ) : (
                  <>
                    {/* {poolBalanceCalculator(
                    parseFloat(singleDataRow?.amount0!),
                    pairFromToken?.decimals!
                  )} */}
                    {/* {token0PoolBalance} */}
                    {getTrimmedResult(poolBalance0!)}&nbsp;
                    {pairFromToken?.symbol}
                  </>
                )}
              </div>

              <div>
                {isPoolLoading ? (
                  <>
                    {" "}
                    <LucideLoader2 size={12} className="animate-spin mb-1" />
                  </>
                ) : (
                  <>
                    {/* {poolBalanceCalculator(
                    parseFloat(singleDataRow?.amount1!),
                    pairToToken?.decimals!
                  )} */}
                    {/* {token1PoolBalance} */}
                    {getTrimmedResult(poolBalance1!)}
                    &nbsp;
                    {pairToToken?.symbol}
                  </>
                )}
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
        {parseFloat(singleDataRow?.liquidity!) !== 0 && (
          <div className="flex flex-col py-2">
            <label className="flex w-full text-neutral-500 text-sm pb-1">
              TVL
            </label>
            <div className="flex flex-row  items-center">
              <div className="font-bold text-sm">
                {/* {isTVLLoading ? (
                <>
                  {" "}
                  <LucideLoader2 className="animate-spin text-xl" />
                </>
              ) : ( */}
                {/* {tvlCalculator()} */}
                {/* )} */}
                {isTVLLoading ? (
                  <LucideLoader2 className="animate-spin text-xl" />
                ) : (
                  <>{tvlValue}</>
                )}
              </div>
              {/* <div className="inline-flex font-semibold text-lg  text-neutral-500 ml-1 mt-2.5 ">
              <ArrowBigDown fill="red" className="!text-red h-4 w-4" />
              {Math.random() * 0.01}%
            </div> */}
              {/* <div className="inline-flex font-semibold text-lg text-neutral-500 ml-1 mt-2.5">
        
              {isPositive ? (
                <ArrowBigUp fill="green" className="!text-green-500 h-4 w-4" />
              ) : (
                <ArrowBigDown fill="red" className="!text-red-500 h-4 w-4" />
              )}
         
              {Math.abs(randomValue).toFixed(2)}%
            </div> */}
            </div>
          </div>
        )}
        {/* <div className="flex flex-col py-2">
          <label className="flex w-full text-neutral-500 text-sm pb-1">
            24H volume
          </label>
          <div className="flex flex-row  items-center">
            <div className="font-bold text-3xl">
              {" "}
              {dayAmount ? (
                dayAmount
              ) : (
                <LucideLoader2 className="animate-spin text-xl" />
              )}
            </div>

            <div className="inline-flex font-semibold text-lg text-neutral-500 ml-1 mt-2.5">
              {isPositive ? (
                <ArrowBigUp fill="green" className="!text-green-500 h-4 w-4" />
              ) : (
                <ArrowBigDown fill="red" className="!text-red-500 h-4 w-4" />
              )}
              {Math.abs(randomValue).toFixed(2)}%
            </div>
          </div>
        </div> */}
        {parseFloat(singleDataRow?.liquidity!) !== 0 && (
          <>
            <div className="flex flex-col py-2">
              <label className="flex w-full text-neutral-500 text-sm pb-1">
                Position Status
              </label>
              <div className="flex flex-row  items-center">
                <div className="font-bold text-sm flex items-center gap-2">
                  {isInRange ? (
                    <div className="flex items-center gap-1">
                      <span>In Range</span>
                      <Check className="text-green-500 font-extrabold !text-sm h-5 w-5" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span>Out of Range</span>
                      <X className="text-red-500 font-extrabold !text-sm h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col py-2">
              <label className="flex w-full text-neutral-500 text-sm pb-1">
                Locked Status
              </label>
              <div className="flex flex-row  items-center">
                <div className="font-bold text-sm flex items-center gap-2">
                  {/* {dataRow?.tokenLocked! ? (
                    <div className="flex items-center gap-1">
                      <span>Locked </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span>Open to lock</span>
                    </div>
                  )} */}

                  <div className="flex items-center justify-start h-[20px]">
                    <span
                      className={`text-xs ${
                        dataRow?.tokenLocked!
                          ? "text-[#4ADE80] bg-[#22C55E33] border border-[#4ADE80]/20 rounded-full px-3 py-[2px]"
                          : "text-[#906565] bg-[#6B728033] border border-[#A3A3A3]/20 rounded-full px-3 py-[2px]"
                      }`}
                    >
                      {dataRow?.tokenLocked! ? "Locked" : "Unlock"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {parseFloat(singleDataRow?.liquidity!) !== 0 &&
          dataRow?.owner.toLowerCase() === address?.toLowerCase() && (
            <div className="flex flex-col py-2">
              <label className="flex w-full text-neutral-500 text-sm pb-1">
                Uncollected Fees
              </label>
              {/* <div className="flex flex-row  items-center">
            <div className="font-semibold text-3xl">$ 12.7k</div>
          </div> */}
              <div className="my-2 flex flex-col w-full border-[2px] p-2 border-[#ffffff14] rounded-xl space-y-2">
                {/* <PairTokens /> */}
                <div className="flex items-center flex-row w-full">
                  <div className="flex items-center flex-row w-full">
                    <div className="rounded-full w-[35px] h-[35px] border-[2px] border-[#000] flex items-center justify-center bg-[#000] text-white text-sm font-bold">
                      {pairFromToken?.address.toLowerCase() <
                      pairToToken?.address.toLowerCase()
                        ? getInitials(pairFromToken?.name! ?? "NA")
                        : getInitials(pairToToken?.name! ?? "NA")}
                    </div>
                    <div className="ml-2">
                      {pairFromToken?.address.toLowerCase() <
                      pairToToken?.address.toLowerCase()
                        ? pairFromToken?.symbol!
                        : pairToToken?.symbol!}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="dark:text-[#ffffff37]">
                      {getTrimmedResult(pendingFee0)}
                      {/* {formatUnits(
                      dataRow?.result[8] ?? BigInt("0"),
                      pairFromToken?.decimals!
                    )}{" "} */}
                    </div>
                    {/* <div className="ml-2 inline-flex">{pairFromToken?.symbol!}</div> */}
                  </div>
                </div>
                <div className="flex items-center flex-row w-full">
                  <div className="flex items-center flex-row w-full">
                    <div className="rounded-full w-[35px] h-[35px] border-[2px] border-[#000] flex items-center justify-center bg-[#000] text-white text-sm font-bold">
                      {pairFromToken?.address.toLowerCase() <
                      pairToToken?.address.toLowerCase()
                        ? getInitials(pairToToken?.name! ?? "NA")
                        : getInitials(pairFromToken?.name! ?? "NA")}
                    </div>
                    <div className="ml-2">
                      {pairFromToken?.address.toLowerCase() <
                      pairToToken?.address.toLowerCase()
                        ? pairToToken?.symbol!
                        : pairFromToken?.symbol!}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="dark:text-[#ffffff37]">
                      {getTrimmedResult(pendingFee1)}
                      {/* {formatUnits(
                      dataRow?.result[9] ?? BigInt("0"),
                      pairToToken?.decimals!
                    )} */}
                    </div>
                    {/* <div className="ml-2 inline-flex">{pairToToken?.symbol!}</div> */}
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default StatSection;
