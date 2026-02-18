"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import ToTokenDetails from "./ToTokenDetails";
import FromTokenDetails from "./FromTokenDetails";
import { ArrowDownUp, CheckCircle, Loader2, OctagonAlert } from "lucide-react";
import { useSwapStore } from "@/store/useDexStore";
import { useTokenStore } from "@/store/useTokenStore";
import { chainConfig, contractConfig } from "@/config/blockchain.config";
import { useAccount, useConfig } from "wagmi";
import {
  BestRouteRequest,
  ChainConfigItemType,
  ContractConfigItemType,
  PoolDetails,
  TokenType,
} from "@/interfaces/index.i";

import { Abi, Address, formatUnits, parseUnits } from "viem";

import { readContract, switchChain } from "@wagmi/core";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import SlippageSettingDialog from "./SlippageSettingDialog";

import SwapButton from "./SwapButton";
import { useRouter, useSearchParams } from "next/navigation";
import { suggestedToken } from "@/config/suggest-tokens";
import { chains } from "@/config/chains";
import AggregatorSwapButton from "./AggregatorSwapButton";

function SwapWidget() {
  const config = useConfig();
  const { chainId, address } = useAccount();
  const {
    fromToken,
    setFromToken,
    toToken,
    setToToken,
    fromTokenInputAmount,
    setFromTokenInputAmount,
    toTokenInputAmount,
    setToTokenInputAmount,
    setIsLoadingTopQuote,
    setIsLoadingBottomQuote,
    toInputQuote,
    fromInputQuote,
    setFromInputQuote,
    setFeeTier,
    feeTier,
    setSwapPairAddress,
    swapPairAddresses,
    setSwapPairAddresses,
    slippage,
    resetting,
    setResetting,
    isAggregating,
    setIsAggregating,
    aggregatorResult,
    setAggregatorResult,
  } = useSwapStore();

  const [swapWarning, setSwapWarning] = useState("");

  const [hasRestoredFromURL, setHasRestoredFromURL] = useState(false);
  const isUpdatingUrlRef = useRef(false);
  const [allRoutes, setAllRoutes] = useState(false);

  const bestBaseRouteUrl = process.env.NEXT_PUBLIC_BEST_ROUTE_URL;

  // Use shared token store
  const {
    suggestedTokens,
    testTokens,
    setSuggestedTokens,
    setTestTokens,
    setWalletTokens,
    resetTokens,
  } = useTokenStore();

  // Reset tokens and amounts when chain changes
  useEffect(() => {
    setFromToken(null);
    setToToken(null);
    setFromTokenInputAmount("");
    setToTokenInputAmount("");
    setSwapPairAddress("");
    setSwapWarning("");
    setHasRestoredFromURL(false); // Reset URL restoration flag
    setAggregatorResult(null);
    setIsAggregating(false);
    resetTokens(); // Reset all tokens in store
  }, [chainId, resetTokens]);

  // Fetch wallet tokens when component mounts and when chainId changes
  useEffect(() => {
    if (chainId && address) {
      fetchWalletTokens();
    }
  }, [chainId, address]);

  useEffect(() => {
    if (fromToken?.address === toToken?.address) {
      setSwapWarning("Select different tokens for swapping.");
      return;
    }
    setSwapWarning("");
  }, [fromToken, toToken]);

  // Helper function to get wrapped address for internal calculations
  const getWrappedAddress = (tokenAddress: string, chainId: number) => {
    if (tokenAddress === "native") {
      switch (chainId) {
        case 56:
          return "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
        case 1:
          return "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        case 97:
          return "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
        case 8453:
          return "0x4200000000000000000000000000000000000006";
        default:
          return "0x4200000000000000000000000000000000000006";
      }
    }
    return tokenAddress;
  };

  // Helper function to get chains name for internal calculations
  const getChain = (chainId: number) => {
    if (chainId) {
      switch (chainId) {
        case 56:
          return "bsc";
        case 1:
          return "ethereum";
        case 8453:
          return "base";
        default:
          return "bsc";
      }
    }
  };

  // These are used for internal calculations only - they convert native to wrapped
  const inputTokenForCalculation = getWrappedAddress(
    fromToken?.address || "",
    chainId || 1
  );
  const outputTokenForCalculation = getWrappedAddress(
    toToken?.address || "",
    chainId || 1
  );

  const handleSwapTokenDetails = () => {
    const token = fromToken;
    if (toToken) {
      setFromToken(toToken);
      setFromTokenInputAmount(toTokenInputAmount);
      setFromInputQuote(true);
      newQuote1();
      // setSwapPairAddress(pairAddress!);
    }
    if (token) {
      setToToken(token);
    }
  };

  const getTrimmedResult = (raw: string) => {
    if (!raw) return "0";

    const [intPart, decimalPart] = raw.split(".");
    if (!decimalPart) return intPart;

    // Number >= 1 → trim trailing zeros, max 5 decimals
    if (parseInt(intPart) > 0) {
      const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
      return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
    }

    // Number < 1 → find first 3–4 significant digits
    const firstNonZeroIndex = decimalPart.search(/[1-9]/);
    if (firstNonZeroIndex === -1) return "0";

    // Take up to 4 significant digits after leading zeros
    const sigDigits = 4;
    const sliceEnd = Math.min(
      firstNonZeroIndex + sigDigits,
      decimalPart.length
    );
    const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");

    return `0.${trimmedDecimals}`;
  };

  useEffect(() => {
    const hasTokens = !!fromToken && !!toToken;
    const hasFromAmount =
      fromTokenInputAmount && parseFloat(fromTokenInputAmount) > 0;
    const hasToAmount =
      toTokenInputAmount && parseFloat(toTokenInputAmount) > 0;

    if (!hasTokens) return;

    const timer = setTimeout(() => {
      if (hasFromAmount && hasToAmount) {
        // ✅ Check which input was last active
        if (toInputQuote) {
          newQuote2();
          console.log("newQuote2(); (both inputs have value, bottom drives)");
        } else if (fromInputQuote) {
          newQuote1();
          console.log("newQuote1(); (both inputs have value, top drives)");
        }
        return;
      }

      if (hasFromAmount && fromInputQuote) {
        newQuote1();
        console.log("newQuote1(); (top input drives)");
        return;
      }

      if (hasToAmount && toInputQuote) {
        newQuote2();
        console.log("newQuote2(); (bottom input drives)");
      }
    }, 400); // ✅ Debounce 400ms

    return () => clearTimeout(timer);
  }, [
    fromToken,
    toToken,
    fromTokenInputAmount,
    toTokenInputAmount,
    fromInputQuote,
    toInputQuote,
  ]);

  function isValidTokenAmount(value: string, decimals: number): boolean {
    if (!value || value === ".") return false;
    const regex = new RegExp(`^\\d*(\\.\\d{0,${decimals}})?$`);
    return regex.test(value);
  }

  function safeParseUnits(value: string, decimals: number): bigint | null {
    try {
      if (!isValidTokenAmount(value, decimals)) return null;
      return parseUnits(value, decimals);
    } catch {
      return null;
    }
  }

  function safeFormatUnits(
    value: bigint | null | undefined,
    decimals: number
  ): string {
    if (!value) return "0";
    try {
      return formatUnits(value, decimals);
    } catch {
      return "0";
    }
  }

  let inputToken =
    fromToken?.address === "native"
      ? chainId === 56
        ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
        : chainId === 1
          ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          : chainId === 97
            ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
            : "0x4200000000000000000000000000000000000006"
      : fromToken?.address!;

  let outputToken =
    toToken?.address! === "native"
      ? chainId === 56
        ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
        : chainId === 1
          ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          : chainId === 97
            ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
            : "0x4200000000000000000000000000000000000006"
      : toToken?.address!;

  const testNet =
    process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? true : false;

  async function newQuote1(): Promise<void> {
    console.log("console.log(slippage!, feeTier!);", slippage!, feeTier!);
    setSwapWarning("");
    setAggregatorResult(null);
    try {
      if (!fromToken || !toToken) {
        console.error("Missing token details");
        return;
      }

      if (fromToken?.address === toToken?.address) {
        setSwapWarning("Select different tokens for swapping.");
        return;
      }
      setSwapWarning("");

      // Validate input
      if (!isValidTokenAmount(fromTokenInputAmount, fromToken.decimals)) {
        console.error("Invalid fromToken input amount");
        return;
      }

      const inputAmount = safeParseUnits(
        fromTokenInputAmount,
        fromToken.decimals
      );
      if (!inputAmount) {
        console.error("Failed to parse input amount");
        return;
      }

      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId || "default"];
      if (!chainContractConfig) {
        console.error("Invalid chainContractConfig.");
        return;
      }

      const pools = await getAllPoolsWithDetails();

      console.log("pools quote1", pools);

      const quotes = pools.map((pool) =>
        calculateQuoteAutoDirection(
          pool,
          inputAmount,
          inputTokenForCalculation,
          fromTokenInputAmount
        )
      );

      const routes = quotes
        .filter(
          (pool) =>
            pool && pool.expectedTokens && !Number.isNaN(pool.expectedTokens)
        )
        .map((pool) => {
          // Normalize liquidity score (0-100) - use log scale for better distribution
          const liquidityInEth = Number(pool.liquidityNum!) / 1e18;
          const liquidityScore = Math.min(
            Math.log10(liquidityInEth + 1) * 20,
            100
          );

          // Fee score: lower fees get higher scores (0.05% = 10, 2.5% = 0)
          const feeScore = Math.max(0, 10 - pool?.calc?.feePercent! * 4);

          // Tick score: closer to current price gets higher score
          const tickScore =
            Math.abs(pool.tick!) < 100000
              ? 10
              : Math.abs(pool.tick!) < 200000
                ? 7
                : 3;

          const outputScore = pool.expectedTokens!;
          // Weight liquidity and fee more heavily than tick
          const successScore =
            liquidityScore * 0.4 + feeScore * 0.4 + tickScore * 0.2;

          // Normalize output score to 0-100 range for fair comparison
          const normalizedOutputScore = Math.min(
            Math.log10(outputScore + 1) * 10,
            100
          );

          // Balance amount vs success probability more evenly
          const combinedScore =
            normalizedOutputScore * 0.4 + successScore * 0.6;

          return {
            ...pool,
            liquidityScore,
            feeScore,
            tickScore,
            successScore,
            combinedScore,
          };
        });

      if (routes.length === 0) {
        if (chainId === 56) {
          console.error("No valid routes found in helloDEX");
          setAllRoutes(true);
          setIsAggregating(true);
          setAggregatorResult(null);
          setSwapWarning("");

          const requestParams: BestRouteRequest = {
            network: getChain(chainId!),
            tokenIn: inputToken,
            tokenOut: outputToken,
            amountIn: fromTokenInputAmount,
            isTestnet: testNet,
            slippage: slippage!,
          };
          console.log("requestParams", requestParams);
          try {
            const response = await fetch("api/get-best-route", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                request: requestParams,
                url: bestBaseRouteUrl + "/api/best-route",
              }),
            });
            const bestRouteData = await response.json();
            console.log("bestRouteData", bestRouteData);

            if (bestRouteData.message === "success") {
              console.log("response best route", bestRouteData?.data);
              setAggregatorResult(bestRouteData?.data);

              if (bestRouteData?.data?.amountOutFormatted > 0) {
                const formattedValue = getTrimmedResult(
                  bestRouteData?.data.amountOutFormatted
                );
                setToTokenInputAmount(formattedValue);
              }
              if (bestRouteData?.data !== null) {
                setSwapPairAddress(bestRouteData?.data.poolAddress!);
                setSwapPairAddresses([bestRouteData?.data.poolAddress!]);
                setFeeTier(bestRouteData?.data.feeTier);
              }
            } else {
              setSwapWarning("Insufficient liquidity for this pair");
            }
          } catch (error) {
            console.log("response best route error", error);
          } finally {
            setIsAggregating(false);
          }
        } else {
          setSwapWarning("Insufficient liquidity for this pair");
        }

        return;
      } else {
        setSwapWarning("");
        setAllRoutes(false);
        const bestRoute = routes.sort(
          (a, b) => b.combinedScore - a.combinedScore
        )[0];
        const bestQuote = bestRoute;

        const rawValue = safeFormatUnits(bestQuote.amountOut, toToken.decimals);
        const formattedValue = getTrimmedResult(rawValue);

        setSwapPairAddress(bestQuote.poolAddress!);
        setToTokenInputAmount(formattedValue);
        setFeeTier(bestQuote.feeTier);
        setIsLoadingTopQuote(false);

        console.log("bestQuote", bestQuote);
        console.log("quotes", quotes);

        // Debug scoring
        console.log("=== SCORING DEBUG ===");
        routes.forEach((route, i) => {
          const normalizedOutputScore = Math.min(
            Math.log10(route.expectedTokens! + 1) * 10,
            100
          );
          console.log(`Pool ${i} (${route.feeTier}):`, {
            feeTier: route.feeTier,
            liquidityScore: route.liquidityScore,
            feeScore: route.feeScore,
            tickScore: route.tickScore,
            successScore: route.successScore,
            expectedTokens: route.expectedTokens,
            normalizedOutputScore: normalizedOutputScore,
            combinedScore: route.combinedScore,
          });
        });
      }
    } catch (error) {
      console.log("swap quote error", error);
      setIsLoadingTopQuote(false);
    } finally {
      setIsLoadingTopQuote(false);
    }
  }

  async function newQuote2(): Promise<void> {
    console.log("console.log(slippage!, feeTier!);", slippage!, feeTier!);
    setSwapWarning("");
    setAggregatorResult(null);
    try {
      if (!fromToken || !toToken) {
        console.error("Missing token details");
        return;
      }

      // Validate input
      if (!isValidTokenAmount(toTokenInputAmount, toToken.decimals)) {
        console.error("Invalid toToken input amount");
        return;
      }

      if (fromToken?.address === toToken?.address) {
        setSwapWarning("Select different tokens for swapping.");
        return;
      }
      setSwapWarning("");

      const desiredOutputAmount = safeParseUnits(
        toTokenInputAmount,
        toToken.decimals
      );
      if (!desiredOutputAmount) {
        console.error("Failed to parse output amount");
        return;
      }

      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId || "default"];
      if (!chainContractConfig) {
        console.error("Invalid chainContractConfig.");
        return;
      }

      const pools = await getAllPoolsWithDetails();
      console.log("pools quote2", pools);

      const quotes = pools.map((pool) =>
        calculateInputForOutput(
          pool,
          desiredOutputAmount,
          outputTokenForCalculation,
          inputTokenForCalculation
        )
      );

      const routes = quotes
        .filter(
          (pool) =>
            pool && pool.expectedAmount && !Number.isNaN(pool.expectedAmount)
        )
        .map((pool) => {
          // Normalize liquidity score (0-100) - use log scale for better distribution
          const liquidityInEth = Number(pool.liquidityNum!) / 1e18;
          const liquidityScore = Math.min(
            Math.log10(liquidityInEth + 1) * 20,
            100
          );

          // Fee score: lower fees get higher scores (0.05% = 0, 2.5% = 10)
          const feeScore = Math.max(0, 10 - pool?.calc?.feePercent! * 4);

          // Tick score: closer to current price gets higher score
          const tickScore =
            Math.abs(pool.tick!) < 100000
              ? 10
              : Math.abs(pool.tick!) < 200000
                ? 7
                : 3;

          const inputScore = pool.expectedAmount!;
          // Weight liquidity and fee more heavily than tick
          const successScore =
            liquidityScore * 0.4 + feeScore * 0.4 + tickScore * 0.2;

          // Normalize input score to 0-100 range for fair comparison
          const normalizedInputScore = Math.min(
            Math.log10(inputScore + 1) * 10,
            100
          );

          // Balance amount vs success probability more evenly
          const combinedScore = normalizedInputScore * 0.4 + successScore * 0.6;

          return {
            ...pool,
            liquidityScore,
            feeScore,
            tickScore,
            successScore,
            combinedScore,
          };
        });

      if (routes.length === 0) {
        if (chainId === 56) {
          console.error("No valid routes found in helloDEX");
          setAllRoutes(true);
          setIsAggregating(true);
          setAggregatorResult(null);
          setSwapWarning("");

          const requestParams: BestRouteRequest = {
            network: getChain(chainId!),
            tokenIn: outputToken,
            tokenOut: inputToken,
            amountIn: toTokenInputAmount,
            isTestnet: testNet,
            slippage: slippage!,
          };

          try {
            const response = await fetch("api/get-best-route", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                request: requestParams,
                url: bestBaseRouteUrl + "/api/best-route",
              }),
            });
            const bestRouteData = await response.json();
            console.log("response best route", bestRouteData?.data);
            if (bestRouteData.message === "success") {
              console.log("response best route", bestRouteData?.data);
              setAggregatorResult(bestRouteData?.data);

              if (bestRouteData?.data?.amountOutFormatted > 0) {
                const formattedValue = getTrimmedResult(
                  bestRouteData?.data.amountOutFormatted
                );
                setFromTokenInputAmount(formattedValue);
              }
              if (bestRouteData?.data !== null) {
                setSwapPairAddress(bestRouteData?.data.poolAddress!);
                setSwapPairAddresses([bestRouteData?.data.poolAddress!]);
                setFeeTier(bestRouteData?.data.feeTier);
              }
            } else {
              setSwapWarning("Insufficient liquidity for this pair");
            }
          } catch (error) {
            console.log("response best route error", error);
          } finally {
            setIsAggregating(false);
          }
        } else {
          setSwapWarning("Insufficient liquidity for this pair");
        }
        return;
      } else {
        setSwapWarning("");
        setAllRoutes(false);
        const bestRoute = routes.sort(
          (a, b) => b.combinedScore - a.combinedScore
        )[0];
        const bestQuote = bestRoute;

        const rawValue = safeFormatUnits(
          bestQuote.amountIn,
          fromToken.decimals
        );
        const formattedValue = getTrimmedResult(rawValue);

        setFromTokenInputAmount(formattedValue);
        setSwapPairAddress(bestQuote.poolAddress!);
        setFeeTier(bestQuote.feeTier);

        console.log("bestQuote", bestQuote);
        console.log("quotes", quotes);
      }
      // Debug scoring
      console.log("=== SCORING DEBUG ===");
      routes.forEach((route, i) => {
        const normalizedInputScore = Math.min(
          Math.log10(route.expectedAmount! + 1) * 10,
          100
        );
        console.log(`Pool ${i} (${route.feeTier}):`, {
          feeTier: route.feeTier,
          liquidityScore: route.liquidityScore,
          feeScore: route.feeScore,
          tickScore: route.tickScore,
          successScore: route.successScore,
          expectedAmount: route.expectedAmount,
          normalizedInputScore: normalizedInputScore,
          combinedScore: route.combinedScore,
        });
      });
    } catch (error) {
      console.log("swap quote error", error);
    } finally {
      setIsLoadingBottomQuote(false);
    }
  }

  async function getAllPoolsWithDetails(): Promise<PoolDetails[]> {
    try {
      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId || "default"];

      if (!chainContractConfig || !fromToken || !toToken) {
        throw new Error("Invalid configuration or token data.");
      }

      const resolveTokenAddress = (
        token: TokenType,
        chainId: number
      ): string => {
        if (token?.address !== "native") return token.address;
        if (chainId === 56) return "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // BSC WBNB
        if (chainId === 1) return "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // ETH WETH
        if (chainId === 97) return "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"; // BSC Testnet WBNB
        return "0x4200000000000000000000000000000000000006"; // Optimism WETH
      };

      const inputToken = inputTokenForCalculation;
      const outputToken = outputTokenForCalculation;

      const feeTiers = [100, 500, 3000, 10000, 25000]; // standard Uniswap V3 fee tiers

      const pools: PoolDetails[] = [];

      for (const fee of feeTiers) {
        const pool = await readContract(config, {
          address: chainContractConfig.v3FactoryAddress as Address,
          abi: chainContractConfig.v3FactoryABI,
          functionName: "getPool",
          args: [inputToken, outputToken, fee],
        });

        if (!pool || pool === "0x0000000000000000000000000000000000000000") {
          continue; // skip invalid pools
        }
        // Add to poolAddresses regardless of validity
        swapPairAddresses.push(pool as string);
        const [token0, token1, poolFee, slot0, liquidity] = await Promise.all([
          readContract(config, {
            address: pool as Address,
            abi: IUniswapV3PoolABI.abi as Abi,
            functionName: "token0",
          }) as Promise<string>,

          readContract(config, {
            address: pool as Address,
            abi: IUniswapV3PoolABI.abi as Abi,
            functionName: "token1",
          }) as Promise<string>,

          readContract(config, {
            address: pool as Address,
            abi: IUniswapV3PoolABI.abi as Abi,
            functionName: "fee",
          }) as Promise<number>,

          readContract(config, {
            address: pool as Address,
            abi: IUniswapV3PoolABI.abi as Abi,
            functionName: "slot0",
          }) as Promise<
            [bigint, number, number, number, number, number, boolean]
          >,

          readContract(config, {
            address: pool as Address,
            abi: IUniswapV3PoolABI.abi as Abi,
            functionName: "liquidity",
          }) as Promise<bigint>,
        ]);
        // Skip pools with zero liquidity
        if (liquidity === BigInt("0")) continue;
        pools.push({
          poolAddress: pool as string,
          token0,
          token1,
          fee: poolFee,
          sqrtPriceX96: slot0[0],
          tick: slot0[1],
          liquidity,
        });
      }
      setSwapPairAddresses(swapPairAddresses);
      return pools;
    } catch (error) {
      console.error("Error fetching pools and details:", error);
      return [];
    }
  }

  const Q96 = BigInt(2) ** BigInt(96);

  function calculateQuoteAutoDirection(
    pool: PoolDetails,
    amountIn: bigint,
    inputToken: string,
    fromTokenInputAmount: string
  ) {
    const sqrtPriceX96 = pool.sqrtPriceX96;
    const feePercent = BigInt(pool.fee); // e.g., 3000 for 0.3%
    const Q96 = BigInt(2) ** BigInt(96);
    const feeTier = pool.fee;
    const poolAddress = pool.poolAddress;
    const liquidity = pool.liquidity;
    const tick = pool.tick;

    let direction: "token0ToToken1" | "token1ToToken0";

    // Apply fee on input
    const effectiveAmountIn =
      (amountIn * (BigInt(1_000_000) - feePercent)) / BigInt(1_000_000);

    let amountOut: bigint;

    if (inputToken.toLowerCase() === pool.token0.toLowerCase()) {
      direction = "token0ToToken1";
      amountOut =
        (effectiveAmountIn * sqrtPriceX96 * sqrtPriceX96) / (Q96 * Q96);
    } else if (inputToken.toLowerCase() === pool.token1.toLowerCase()) {
      direction = "token1ToToken0";
      amountOut =
        (effectiveAmountIn * Q96 * Q96) / (sqrtPriceX96 * sqrtPriceX96);
    } else {
      throw new Error("Input token does not match pool tokens");
    }

    const calc = calculateExpectedTokens(
      sqrtPriceX96.toString(),
      fromTokenInputAmount,
      feePercent.toString()
    );

    if (!calc || !isFinite(calc.expectedTokens) || calc.expectedTokens <= 0) {
      console.error(`   ⚠️  Cannot calculate expected output - SKIP`);
      // continue;
    }

    const exchangeRate =
      formatAmount(amountOut, toToken?.decimals!) /
      formatAmount(amountIn, fromToken?.decimals!);

    return {
      feeTier: pool.fee,
      poolAddress: pool.poolAddress,
      amountOut,
      direction,
      exchangeRate,
      calc,
      liquidityStr: liquidity.toString(),
      liquidityNum: parseFloat(liquidity?.toString()),
      expectedTokens: calc?.expectedTokens!,
      tick: tick,
    };
  }

  const fetchTokens = async (chainConf: any) => {
    try {
      if (!chainConf?.tokenApi) return;

      const res = await fetch(chainConf.tokenApi);
      const data = await res.json();

      if (Array.isArray(data.tokens)) {
        setTestTokens(data.tokens);
      } else {
        console.error("Invalid token data format", data);
      }
    } catch (err) {
      console.error("Failed to fetch tokens", err);
    }
  };

  // Fetch wallet tokens
  const fetchWalletTokens = async () => {
    if (!address || !chainId) return;

    try {
      const userChain =
        chainId === 56
          ? "bnb"
          : chainId === 1
            ? "eth"
            : chainId === 8453
              ? "base"
              : "unknown";
      if (userChain === "unknown") return;

      const url = process.env.NEXT_PUBLIC_ALCHEMY_API;
      if (!url) return;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: `{"addresses":[{"address":"${address}","networks":["${userChain}-mainnet"]}]}`,
      });

      const data = await response.json();
      if (data?.data?.tokens) {
        const tokens: TokenType[] = data.data.tokens
          .filter((t: any) => t.tokenAddress !== null)
          .map((t: any, index: number) => ({
            id: index + 1,
            chainId: t.network.includes("eth")
              ? 1
              : t.network.includes("bnb")
                ? 56
                : 8453,
            address: t.tokenAddress,
            name: t.tokenMetadata.name,
            symbol: t.tokenMetadata.symbol,
            decimals: t.tokenMetadata.decimals,
            logoURI: t.tokenMetadata.logoURI,
          }));
        setWalletTokens(tokens);
      }
    } catch (error) {
      console.error("Error fetching wallet tokens:", error);
    }
  };

  // Helper function to get native token from wrapped address
  const getNativeTokenFromWrapped = (
    wrappedAddress: string,
    tokens: TokenType[]
  ) => {
    const wrappedToken = tokens.find(
      (t) => t.address.toLowerCase() === wrappedAddress.toLowerCase()
    );

    if (!wrappedToken) {
      return {
        address: "native",
        symbol: "Native",
        name: "Native Token",
        decimals: 18,
        // other default properties
      };
    }

    return {
      ...wrappedToken,
      address: "native",
      symbol: wrappedToken.symbol.replace(/^W/, ""),
      name: wrappedToken.name.replace(/^Wrapped /, ""),
    };
  };

  const wrappedNativeAddresses = useMemo(
    () => ({
      1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase(), // ETH
      56: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c".toLowerCase(), // BNB
      97: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd".toLowerCase(), // BSC Testnet
      10: "0x4200000000000000000000000000000000000006".toLowerCase(), // Optimism
      8453: "0x4200000000000000000000000000000000000006".toLowerCase(), // Base
      // Add other chains as needed
    }),
    []
  );

  // Update suggested tokens when chainId changes
  useEffect(() => {
    const tokens = suggestedToken[chainId ?? "default"] || [];
    setSuggestedTokens(tokens);
  }, [chainId]);

  const allChains = useMemo(() => {
    const networks = [...chains];

    return networks.filter(
      (chain, index, self) =>
        index === self.findIndex((t) => t.chainId === chain.chainId)
    );
  }, [chains]);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!chainId) return;

    const currentTab = searchParams.get("tab");
    // if (currentTab !== "trade") return;

    if (resetting) {
      setResetting(false);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("chainId", chainId.toString());

    if (!fromToken && !toToken) return;

    if (fromToken) {
      const fromAddress =
        fromToken.address === "native"
          ? "native"
          : fromToken.address.toLowerCase();
      params.set("from", fromAddress);
    }
    if (toToken) {
      const toAddress =
        toToken.address === "native" ? "native" : toToken.address.toLowerCase();
      params.set("to", toAddress);
    }

    const newUrl = `?${params.toString()}`;
    if (window.location.search === newUrl) return;

    // mark we're updating URL internally so restore effect ignores it
    isUpdatingUrlRef.current = true;

    // Preferred: avoid router navigation by using history.replaceState (no navigation)
    try {
      window.history.replaceState(null, "", newUrl);
      // small delay to ensure any listeners see it as internal
      setTimeout(() => {
        isUpdatingUrlRef.current = false;
      }, 80);
    } catch (err) {
      // fallback to Next router.replace (keeps same behaviour but we still use the ref to ignore it)
      router.replace(newUrl, { scroll: false });
      setTimeout(() => {
        isUpdatingUrlRef.current = false;
      }, 80);
    }
  }, [fromToken, toToken, chainId, searchParams, resetting]);

  useEffect(() => {
    const handleChainSwitch = async () => {
      const urlChain = searchParams.get("chainId");
      const currentTab = searchParams.get("tab");

      if (!urlChain || currentTab !== "trade") return;
      if (!chainId) return; // Wait for chainId to be available
      if (resetting) return; // Don't switch during reset

      // If chainId doesn't match URL, try to switch chains
      if (chainId.toString() !== urlChain) {
        console.log(
          "Chain mismatch detected, attempting to switch chain from",
          chainId,
          "to",
          urlChain
        );
        try {
          await switchChain(config, { chainId: parseInt(urlChain) });
          console.log("Successfully switched to chain", urlChain);
        } catch (error) {
          console.error("Failed to switch chain:", error);
        }
      }
    };

    // Add a small delay to prevent rapid chain switching
    const timer = setTimeout(handleChainSwitch, 100);
    return () => clearTimeout(timer);
  }, [chainId, searchParams, config, resetting]);

  const restoreFromURL = async () => {
    // ⛔ run only once per session
    if (resetting || hasRestoredFromURL) return;

    const urlChain = searchParams.get("chainId");

    const urlFrom = searchParams.get("from");

    const urlTo = searchParams.get("to");
    console.log("Restoring tokens from URL:", { urlChain, urlFrom, urlTo });
    if (!urlChain) return;
    if (!chainId) return; // wait for wallet chainId
    console.log("Restoring tokens from URL:", { urlChain, urlFrom, urlTo });
    if (chainId.toString() !== urlChain) return; // mismatch → ignore

    // ✅ fetch tokens
    const chainConf: ChainConfigItemType =
      chainConfig[parseFloat(urlChain)] || chainConfig["default"];
    await fetchTokens(chainConf);

    // ✅ merge suggested + test tokens (deduplicated by address)
    const combined = [...suggestedTokens, ...testTokens].filter(
      (token, index, self) =>
        index ===
        self.findIndex(
          (t) => t.address.toLowerCase() === token.address.toLowerCase()
        )
    );

    // const combined = [...suggestedTokens, ...testTokens];

    console.log("Combined tokens for restoration:", combined);

    const wrappedNative =
      wrappedNativeAddresses[
      parseInt(urlChain) as keyof typeof wrappedNativeAddresses
      ];

    // ------------------
    // restore fromToken
    // ------------------
    if (urlFrom) {
      const fromLower = urlFrom.toLowerCase();
      console.log("fromLower", fromLower);
      if (fromLower === "native") {
        console.log("running native token restore");
        // Look for native token
        const nativeToken = combined.find(
          (t) => t.address.toLowerCase() === "native"
        );
        if (nativeToken) {
          setFromToken(nativeToken);
        } else if (wrappedNative) {
          const wrapped = combined.find(
            (t) => t.address.toLowerCase() === wrappedNative
          );
          if (wrapped) {
            setFromToken({
              ...wrapped,
              address: "native",
              symbol: wrapped.symbol.replace(/^W/, ""),
              name: wrapped.name.replace(/^Wrapped /, ""),
            });
          }
        }
      } else if (wrappedNative && fromLower === wrappedNative) {
        // Convert wrapped to native
        const wrapped = combined.find(
          (t) => t.address.toLowerCase() === wrappedNative
        );
        if (wrapped) {
          setFromToken({
            ...wrapped,
            address: "native",
            symbol: wrapped.symbol.replace(/^W/, ""),
            name: wrapped.name.replace(/^Wrapped /, ""),
          });
        }
      } else {
        console.log("non native token");
        const tok = combined.find(
          (t) => t.address.toLowerCase() === fromLower.toLocaleLowerCase()
        );
        console.log("tok", tok);
        setFromToken(
          tok || {
            address: fromLower,
            symbol: "UNKNOWN",
            name: "Unknown Token",
            decimals: 18,
            logoURI: "",
            chainId: parseInt(urlChain),
          }
        );
      }
    }

    // ------------------
    // restore toToken
    // ------------------
    if (urlTo) {
      const toLower = urlTo.toLowerCase();
      if (toLower === "native") {
        const nativeToken = combined.find(
          (t) => t.address.toLowerCase() === "native"
        );
        if (nativeToken) {
          setToToken(nativeToken);
        } else if (wrappedNative) {
          const wrapped = combined.find(
            (t) => t.address.toLowerCase() === wrappedNative
          );
          if (wrapped) {
            setToToken({
              ...wrapped,
              address: "native",
              symbol: wrapped.symbol.replace(/^W/, ""),
              name: wrapped.name.replace(/^Wrapped /, ""),
            });
          }
        }
      } else if (wrappedNative && toLower === wrappedNative) {
        const wrapped = combined.find(
          (t) => t.address.toLowerCase() === wrappedNative
        );
        if (wrapped) {
          setToToken({
            ...wrapped,
            address: "native",
            symbol: wrapped.symbol.replace(/^W/, ""),
            name: wrapped.name.replace(/^Wrapped /, ""),
          });
        }
      } else {
        const tok = combined.find((t) => t.address.toLowerCase() === toLower);
        setToToken(
          tok || {
            address: toLower,
            symbol: "UNKNOWN",
            name: "Unknown Token",
            decimals: 18,
            logoURI: "",
            chainId: parseInt(urlChain),
          }
        );
      }
    }

    // ✅ mark as restored
    setHasRestoredFromURL(true);
  };

  useEffect(() => {
    restoreFromURL();
  }, [
    chainId,
    // allChains,
    // searchParams,
    // chainId,
    resetting,
    hasRestoredFromURL,
    suggestedTokens,
    testTokens,
    wrappedNativeAddresses,
    chainConfig,
  ]);

  function calculateInputForOutput(
    pool: PoolDetails,
    desiredAmountOut: bigint,
    outputToken: string,
    inputToken: string
  ) {
    const sqrtPriceX96 = pool.sqrtPriceX96;
    const feePercent = BigInt(pool.fee);
    const Q96 = BigInt(2) ** BigInt(96);
    const feeTier = pool.fee;
    const poolAddress = pool.poolAddress;
    const liquidity = pool.liquidity;
    const tick = pool.tick;

    let direction: "token0ToToken1" | "token1ToToken0";
    let requiredEffectiveInput: bigint;

    if (
      outputToken.toLowerCase() === pool.token1.toLowerCase() &&
      inputToken.toLowerCase() === pool.token0.toLowerCase()
    ) {
      direction = "token0ToToken1";
      requiredEffectiveInput =
        (desiredAmountOut * Q96 * Q96) / (sqrtPriceX96 * sqrtPriceX96);
    } else if (
      outputToken.toLowerCase() === pool.token0.toLowerCase() &&
      inputToken.toLowerCase() === pool.token1.toLowerCase()
    ) {
      direction = "token1ToToken0";
      requiredEffectiveInput =
        (desiredAmountOut * sqrtPriceX96 * sqrtPriceX96) / (Q96 * Q96);
    } else {
      throw new Error("Input/output tokens do not match pool tokens");
    }

    // Adjust for fee: gross input = effective input / (1 - fee%)
    const requiredInput =
      (requiredEffectiveInput * BigInt(1_000_000)) /
      (BigInt(1_000_000) - feePercent);

    const exchangeRate =
      formatAmount(desiredAmountOut, toToken?.decimals!) /
      formatAmount(requiredInput, fromToken?.decimals!);

    const calc = calculateRequiredInput(
      sqrtPriceX96.toString(),
      toTokenInputAmount,
      (pool.fee / 10000).toString()
    );

    if (!calc || !isFinite(calc.requiredInput) || calc.requiredInput <= 0) {
      console.log(`   ⚠️  Cannot calculate expected output - SKIP`);
      // continue;
    }

    return {
      amountIn: requiredInput,
      amountOut: desiredAmountOut,
      exchangeRate,
      direction,
      feeTier: pool.fee,
      poolAddress: pool.poolAddress,
      calc,
      liquidityStr: liquidity.toString(),
      liquidityNum: parseFloat(liquidity?.toString()),
      tick,
      expectedAmount: calc?.requiredInput!,
    };
  }

  function formatAmount(amount: bigint, decimals: number) {
    return Number(amount) / 10 ** decimals;
  }

  function calculateExpectedTokens(
    sqrtPriceX96String: string,
    amountIn: string,
    feeRate: string
  ) {
    try {
      const sqrtPriceX96Num = parseFloat(sqrtPriceX96String);
      const Q96 = Math.pow(2, 96);
      const sqrtPrice = sqrtPriceX96Num / Q96;
      const price = sqrtPrice * sqrtPrice;
      const tokensPerInput = 1 / price;
      const feeDecimal = parseFloat(feeRate) / 1000000;
      const amountAfterFee = parseFloat(amountIn) * (1 - feeDecimal);
      const expectedTokens = amountAfterFee * tokensPerInput;

      return {
        expectedTokens: expectedTokens,
        rate: tokensPerInput,
        feePercent: feeDecimal * 100,
      };
    } catch (error) {
      return null;
    }
  }

  function calculateRequiredInput(
    sqrtPriceX96String: string,
    desiredOutput: string,
    feeRate: string
  ) {
    try {
      const sqrtPriceX96Num = parseFloat(sqrtPriceX96String);
      const Q96 = Math.pow(2, 96);
      const sqrtPrice = sqrtPriceX96Num / Q96;
      const price = sqrtPrice * sqrtPrice;
      const tokensPerInput = price;
      const feeDecimal = parseFloat(feeRate) / 1000000;

      const requiredInput =
        parseFloat(desiredOutput) / (tokensPerInput * (1 - feeDecimal));

      return {
        requiredInput,
        rate: tokensPerInput,
        feePercent: feeDecimal * 100,
      };
    } catch (error) {
      return null;
    }
  }

  async function getPoolConstants(): Promise<any | null> {
    try {
      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId || "default"];

      if (!chainContractConfig || !fromToken || !toToken) {
        throw new Error("wish key: Invalid configuration or token data.");
      }

      let poolAddress;
      let inputToken =
        fromToken?.address === "native"
          ? chainId === 56
            ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
            : chainId === 1
              ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
              : chainId === 97
                ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
                : "0x4200000000000000000000000000000000000006"
          : fromToken.address;

      let outputToken =
        toToken?.address! === "native"
          ? chainId === 56
            ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
            : chainId === 1
              ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
              : chainId === 97
                ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
                : "0x4200000000000000000000000000000000000006"
          : toToken?.address;

      const feeTiers = [100, 500, 3000, 10000, 25000];

      // console.log("feeTier tx", feeTier);

      if (feeTier) {
        const pool = await readContract(config, {
          address: chainContractConfig.v3FactoryAddress as Address,
          abi: chainContractConfig.v3FactoryABI,
          functionName: "getPool",
          args: [inputToken!, outputToken!, feeTier],
        });
        // console.log("wish pools and fees 11", feeTier, "=", pool);
        setSwapPairAddress(pool as string);
        if (pool) {
          poolAddress = pool;
        }
      } else {
        for (let i = 0; i < feeTiers.length; i++) {
          let fees = feeTiers[i];
          // Get the pool address
          const pool = await readContract(config, {
            address: chainContractConfig.v3FactoryAddress as Address,
            abi: chainContractConfig.v3FactoryABI,
            functionName: "getPool",
            args: [inputToken, outputToken!, fees],
          });

          // Check if pool is valid (not address zero)
          if (pool && pool !== "0x0000000000000000000000000000000000000000") {
            poolAddress = pool;
            setFeeTier(fees!);
            console.log("Found valid pool:", poolAddress);
            break; // Exit loop after finding first valid pool
          }
        }
      }

      // console.log("wish key: Retrieved pool address:", poolAddress);

      if (poolAddress == "0x0000000000000000000000000000000000000000") {
        throw new Error("wish key: Pool address not found.");
      }

      setSwapPairAddress(poolAddress as string);
    } catch (error) {
      console.error("wish key: Error fetching pool constants:", error);
      return null;
    }
  }

  return (
    <div className="flex justify-center items-center !w-full">
      <div className="!w-full md:min-w-[550px]">
        <Card className="w-full bg-white dark:bg-dark border-transparent rounded-xl  pt-2 border border-white/10">
          <CardHeader className="space-y-0 p-3 pb-0 sm:p-5 sm:pt-1 sm:pb-1 flex flex-row justify-between items-end">
            <div className="w-full">
              <CardTitle className="text-[1.375rem] font-normal sm:font-medium flex justify-between items-center">
                <div className=" title-large-semi-bold uppercase">
                  Swap.
                  {/* <hr className="title-underline" /> */}
                </div>
                <div>
                  <SlippageSettingDialog />
                </div>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2 p-3 sm:p-5 sm:pt-2">
            <div className="space-y-4 w-full">
              <div className="flex flex-col gap-2 items-center">
                <div className="w-full">
                  <FromTokenDetails />
                </div>

                {/* Swap Button */}
                <div
                  className="cursor-pointer w-8 h-8 rounded-full bg-primary dark:bg-primary flex justify-center items-center"
                  onClick={handleSwapTokenDetails}
                >
                  <ArrowDownUp className="w-4 h-4 text-black" />
                </div>

                <div className="w-full">
                  <ToTokenDetails />
                </div>
              </div>
              {parseFloat(fromTokenInputAmount) !== 0 &&
                parseFloat(toTokenInputAmount) !== 0 &&
                fromTokenInputAmount !== "" &&
                toTokenInputAmount !== "" &&
                slippage! <= feeTier! / 10000 &&
                fromToken?.address! &&
                toToken?.address && (
                  <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm leading-[24px]">
                    <OctagonAlert className="!h-[24px] !w-[24px] shrink-0" />
                    <span>
                      Transaction will fail due to price movement. Increase
                      slippage tolerance or reduce trade size.
                    </span>
                  </div>
                )}
              {fromToken?.address! &&
                toToken?.address &&
                swapWarning !== "" && (
                  <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm leading-[24px]">
                    <OctagonAlert className="!h-[24px] !w-[24px] shrink-0" />
                    <span>{swapWarning}</span>
                  </div>
                )}

              {allRoutes && isAggregating && (
                <div className="p-3 flex gap-2 rounded-xl border dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 bg-neutral-200 text-neutral-600 text-sm items-center">
                  <Loader2 className="animate-spin h-4 w-4 shrink-0" />
                  <span>Finding best swap route across DEXs...</span>
                </div>
              )}

              {allRoutes && aggregatorResult !== null && (
                <div className="p-3 flex flex-col rounded-xl border border-primary text-primary bg-green-900/20 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>
                      Best route found through{" "}
                      <strong>{aggregatorResult.dexName}</strong>.
                    </span>
                  </div>
                </div>
              )}
              {allRoutes ? <AggregatorSwapButton /> : <SwapButton />}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SwapWidget;
