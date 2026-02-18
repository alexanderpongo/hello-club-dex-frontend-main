"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { AlertTriangle, ArrowDownUp } from "lucide-react";
import { SinglePoolData } from "@/types/trading-live-table.types";
import TradeFromTokenDetails from "./TradeFromTokenDetails";
import TradeToTokenDetails from "./TradeToTokenDetails";
import { TradeTokenType } from "@/interfaces/index.i";
import { useSwapStore } from "@/store/useDexStore";
import { useAccount } from "wagmi";
import { formatUnits, parseUnits } from "viem";

import TradeSwapButton from "./TradeSwapButton";
import SlippageSettingDialog from "../evm/SlippageSettingDialog";
import SwitchNetworkButton from "./SwitchNetworkButton";

type TradeProps = {
  poolData: SinglePoolData;
  liquidityAmount?: number | null;
};

const Trade = ({ poolData, liquidityAmount }: TradeProps) => {
  const { address, chainId } = useAccount();
  const {
    tradeFromTokenInputAmount,
    setTradeFromTokenInputAmount,
    tradeToTokenInputAmount,
    setTradeToTokenInputAmount,
    setIsLoadingTopQuote,
    setIsLoadingBottomQuote,
    tradeToInputQuote,
    tradeFromInputQuote,
    setTradeFromInputQuote,
    feeTier,
    slippage,
  } = useSwapStore();

  const [tradeFromToken, setTradeFromToken] = useState<TradeTokenType | null>(
    null
  );
  const [tradeToToken, setTradeToToken] = useState<TradeTokenType | null>(null);
  const [tradeChainId, setTradeChainId] = useState(1);

  useEffect(() => {
    if (poolData) {
      // Map API token info to TradeTokenType shape expected by UI
      setTradeFromToken({
        name: poolData.token0.name,
        symbol: poolData.token0.symbol,
        address: poolData.token0.address,
        decimal: poolData.token0.decimals,
        logoURI: poolData.token0.logo || "",
      });
      setTradeToToken({
        name: poolData.token1.name,
        symbol: poolData.token1.symbol,
        address: poolData.token1.address,
        decimal: poolData.token1.decimals,
        logoURI: poolData.token1.logo || "",
      });
      const mappedChainId =
        poolData.chain.id === "bsc"
          ? 56
          : poolData.chain.id === "ethereum"
          ? 1
          : 8453;
      setTradeChainId(mappedChainId);
    }
  }, [poolData]);

  useEffect(() => {
    const hasTokens = !!tradeFromToken && !!tradeToToken;
    const hasFromAmount =
      tradeFromTokenInputAmount && parseFloat(tradeFromTokenInputAmount) > 0;
    const hasToAmount =
      tradeToTokenInputAmount && parseFloat(tradeToTokenInputAmount) > 0;

    if (!hasTokens) return;

    const timer = setTimeout(() => {
      if (hasFromAmount && hasToAmount) {
        // ✅ Check which input was last active
        if (tradeToInputQuote) {
          newQuote2();
          console.log("newQuote2(); (both inputs have value, bottom drives)");
        } else if (tradeFromInputQuote) {
          newQuote1();
          console.log("newQuote1(); (both inputs have value, top drives)");
        }
        return;
      }

      if (hasFromAmount && tradeFromInputQuote) {
        newQuote1();
        console.log("newQuote1(); (top input drives)");
        return;
      }

      if (hasToAmount && tradeToInputQuote) {
        newQuote2();
        console.log("newQuote2(); (bottom input drives)");
      }
    }, 400); // ✅ Debounce 400ms

    return () => clearTimeout(timer);
  }, [
    tradeFromToken,
    tradeToToken,
    tradeFromTokenInputAmount,
    tradeToTokenInputAmount,
    tradeFromInputQuote,
    tradeToInputQuote,
  ]);

  const handleSwapTokenDetails = () => {
    // setTokenSwitchValue(0);
    // setSwitchToken(true);
    // let pairAddress: string;
    // if (swapPairAddress !== "") {
    //   pairAddress = swapPairAddress;
    // }

    const token = tradeFromToken;
    if (tradeToToken) {
      setTradeFromToken(tradeToToken);
      setTradeFromTokenInputAmount(tradeToTokenInputAmount);
      setTradeFromInputQuote(true);
      newQuote1();
      // setSwapPairAddress(pairAddress!);
    }
    if (token) {
      setTradeToToken(token);
    }

    // fetchToTokenAmountOut(
    //   toTokenInputAmount,
    //   toToken as TokenType,
    //   fromToken as TokenType
    // );
  };

  const poolFeeTier: number = poolData?.fee_tier_raw;

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
  async function newQuote1(): Promise<void> {
    console.log("console.log(slippage!, feeTier!);", slippage!, feeTier!);
    const sqrtPriceX96 = BigInt(poolData?.sqrt_price);

    try {
      if (!tradeFromToken || !tradeToToken) {
        console.error("Missing token details");
        return;
      }

      const inputAmount = safeParseUnits(
        tradeFromTokenInputAmount,
        tradeFromToken.decimal
      );

      const feePercent = BigInt(poolData?.fee_tier_raw);
      // Apply fee on input
      const effectiveAmountIn =
        (inputAmount! * (BigInt(1_000_000) - feePercent)) / BigInt(1_000_000);
      const Q96 = BigInt(2) ** BigInt(96);
      let amountOut: bigint;
      let direction: "token0ToToken1" | "token1ToToken0";
      if (
        poolData?.token0.address.toLowerCase() ===
        tradeFromToken.address.toLowerCase()
      ) {
        direction = "token0ToToken1";
        amountOut =
          (effectiveAmountIn * sqrtPriceX96 * sqrtPriceX96) / (Q96 * Q96);
      } else if (
        tradeFromToken.address.toLowerCase() ===
        poolData?.token1.address.toLowerCase()
      ) {
        direction = "token1ToToken0";
        amountOut =
          (effectiveAmountIn * Q96 * Q96) / (sqrtPriceX96 * sqrtPriceX96);
      } else {
        throw new Error("Input token does not match pool tokens");
      }

      // console.log("output amount q2 ", amountOut);

      const rawValue = safeFormatUnits(amountOut, tradeToToken.decimal);
      const formattedValue = getTrimmedResult(rawValue);
      setTradeToTokenInputAmount(formattedValue);
    } catch (error) {
      console.error("swap quote error", error);
    } finally {
      setIsLoadingBottomQuote(false);
    }
  }

  async function newQuote2(): Promise<void> {
    // console.log("console.log(slippage!, feeTier!);", slippage!, feeTier!);

    const sqrtPriceX96 = BigInt(poolData?.sqrt_price);
    const Q96 = BigInt(2) ** BigInt(96);
    const feePercent = BigInt(poolData?.fee_tier_raw);
    try {
      if (!tradeFromToken || !tradeToToken) {
        console.error("Missing token details");
        return;
      }

      let direction: "token0ToToken1" | "token1ToToken0";
      let requiredEffectiveInput: bigint;
      const outputAmount = safeParseUnits(
        tradeToTokenInputAmount,
        tradeToToken.decimal
      );
      if (
        tradeToToken?.address.toLowerCase() ===
          poolData?.token1.address.toLowerCase() &&
        tradeFromToken?.address.toLowerCase() ===
          poolData?.token0.address.toLowerCase()
      ) {
        direction = "token0ToToken1";
        requiredEffectiveInput =
          (outputAmount! * Q96 * Q96) / (sqrtPriceX96 * sqrtPriceX96);
      } else if (
        tradeToToken?.address.toLowerCase() ===
          poolData?.token0.address.toLowerCase() &&
        tradeFromToken?.address.toLowerCase() ===
          poolData?.token1.address.toLowerCase()
      ) {
        direction = "token1ToToken0";
        requiredEffectiveInput =
          (outputAmount! * sqrtPriceX96 * sqrtPriceX96) / (Q96 * Q96);
      } else {
        throw new Error("Input/output tokens do not match pool tokens");
      }

      // Adjust for fee: gross input = effective input / (1 - fee%)
      const requiredInput =
        (requiredEffectiveInput * BigInt(1_000_000)) /
        (BigInt(1_000_000) - feePercent);

      //   address: chainContractConfig.quoterContractAddress as Address,
      //   abi: chainContractConfig.quoterContractABI,
      //   functionName: "quoteExactInputSingle",
      //   args: [
      //     {
      //       tokenIn: tradeFromToken.address as Address,
      //       tokenOut: tradeToToken.address as Address,
      //       amount: parseUnits(
      //         tradeFromTokenInputAmount,
      //         tradeFromToken?.decimal as number
      //       ),
      //       fee: poolFeeTier,
      //       sqrtPriceLimitX96: 0,
      //     },
      //   ],
      //   chainId: chainId,
      // });
      // console.log("input amount ", requiredInput);
      const rawValue = safeFormatUnits(requiredInput, tradeFromToken.decimal);
      const formattedValue = getTrimmedResult(rawValue);
      setTradeFromTokenInputAmount(formattedValue);
    } catch (error) {
      console.error("swap quote error", error);
      setIsLoadingTopQuote(false);
    } finally {
      setIsLoadingTopQuote(false);
    }
  }

  const getChainName = (id: number | string | undefined) => {
    switch (Number(id)) {
      case 1:
        return "Ethereum";
      case 56:
        return "BSC";
      case 8453:
        return "Base";
      default:
        return "Unknown Network";
    }
  };

  const effectiveLiquidity =
    liquidityAmount ?? poolData.pool_liquidity.total_value_usd;

  // Check if user is on wrong network
  const isWrongNetwork = address && chainId !== tradeChainId;

  return (
    <Card className="w-full card-primary rounded-xl  flex flex-col border dark:border-[#ffffff] dark:border-opacity-10 items-center justify-center p-5 space-y-3">
      <div className="flex  justify-between items-center w-full p-2">
        <div className="text-primary text-[32px] font-formula leading-7 font-light uppercase">
          Trade
        </div>
        <div>
          <SlippageSettingDialog />
        </div>
      </div>
      {effectiveLiquidity !== null && effectiveLiquidity < 10 ? (
        <div className="h-[300px] w-full flex justify-center items-center">
          <div className="text-yellow-500">
            No enough liquidity available for swap
          </div>
        </div>
      ) : (
        <>
          <CardContent className="p-2 w-full">
            <div className="space-y-4 w-full">
              <div className="flex w-full flex-col gap-2 items-center">
                <div className="w-full">
                  <TradeFromTokenDetails
                    tradeFromToken={tradeFromToken}
                    tradeChainId={tradeChainId}
                    tradeToToken={tradeToToken}
                    disabled={isWrongNetwork}
                  />
                </div>

                <div
                  className={`w-8 h-8 rounded-full bg-primary dark:bg-primary flex justify-center items-center ${
                    isWrongNetwork
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={isWrongNetwork ? undefined : handleSwapTokenDetails}
                >
                  <ArrowDownUp className="w-4 h-4 text-black" />
                </div>

                <div className="w-full">
                  <TradeToTokenDetails
                    tradeToToken={tradeToToken}
                    tradeChainId={tradeChainId}
                    tradeFromToken={tradeFromToken}
                    disabled={isWrongNetwork}
                  />
                </div>
              </div>
              {isWrongNetwork ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex justify-center text-center items-center gap-2 text-[#ffac2f] text-xs font-sans font-light">
                    <AlertTriangle size={14} className="sm:flex hidden" />
                    <span>
                      Please switch your network to{" "}
                      <span className="font-medium">
                        {getChainName(tradeChainId)}
                      </span>{" "}
                      to continue the swap.
                    </span>
                  </div>
                  <SwitchNetworkButton
                    targetChainId={tradeChainId}
                    chainName={getChainName(tradeChainId)}
                  />
                </div>
              ) : (
                <TradeSwapButton
                  tradeToToken={tradeToToken}
                  tradeChainId={tradeChainId}
                  tradeFromToken={tradeFromToken}
                  poolFeeTier={poolFeeTier}
                />
              )}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default Trade;
