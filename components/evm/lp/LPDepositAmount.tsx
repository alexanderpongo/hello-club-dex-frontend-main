"use client";
import React, { useEffect, useState } from "react";
import TokenBalanceTop from "../TokenBalanceTop";
import TokenBalanceBottom from "../TokenBalanceBottom";
import AddLPButton from "../AddLPButton";
import { useLPStore } from "@/store/useDexStore";
// import { nearestUsableTick } from "@uniswap/v3-sdk";
import {
  FeeAmount,
  Pool,
  Position,
  TICK_SPACINGS,
  TickMath,
  encodeSqrtRatioX96,
  nearestUsableTick,
  priceToClosestTick,
} from "@pancakeswap/v3-sdk";
import { Address, formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";

const LPDepositAmount = () => {
  const {
    activePriceRange,
    tickRanges,
    inverseTickRanges,
    setTickLower,
    setTickUpper,
    setInverseTickLower,
    setInverseTickUpper,
    tickUpperPrice,
    tickLowerPrice,
    inverseTickUpperPrice,
    inverseTickLowerPrice,
    tickSpace,
    fromLPTokenInputAmount,
    toLPTokenInputAmount,
    feeTier,
    initialTick,
    sqrtPriceX96,
    pairSelectLiquidity,
    tickLower,
    tickUpper,
    fromLPToken,
    toLPToken,
  } = useLPStore();

  const { chainId } = useAccount();

  const [lowerToken, setLowerToken] = useState(false);

  useEffect(() => {
    if (activePriceRange === 0) {
      const { tickLowValue, tickUpperValue, itickLowValue, itickUpperValue } =
        manualTickSet();
      setTickLower(tickLowValue);
      setTickUpper(tickUpperValue);
      setInverseTickLower(itickLowValue);
      setInverseTickUpper(itickUpperValue);
    } else if (activePriceRange === 0.001) {
      setTickLower(tickRanges?.range01.lower!);
      setTickUpper(tickRanges?.range01.upper!);
      setInverseTickLower(inverseTickRanges?.range01.lower!);
      setInverseTickUpper(inverseTickRanges?.range01.upper!);
    } else if (activePriceRange === 0.005) {
      setTickLower(tickRanges?.range05.lower!);
      setTickUpper(tickRanges?.range05.upper!);
      setInverseTickLower(inverseTickRanges?.range05.lower!);
      setInverseTickUpper(inverseTickRanges?.range05.upper!);
    } else if (activePriceRange === 0.01) {
      setTickLower(tickRanges?.range1.lower!);
      setTickUpper(tickRanges?.range1.upper!);
      setInverseTickLower(inverseTickRanges?.range1.lower!);
      setInverseTickUpper(inverseTickRanges?.range1.upper!);
    } else if (activePriceRange === 0.05) {
      setTickLower(tickRanges?.range5.lower!);
      setTickUpper(tickRanges?.range5.upper!);
      setInverseTickLower(inverseTickRanges?.range5.lower!);
      setInverseTickUpper(inverseTickRanges?.range5.upper!);
    } else if (activePriceRange === 0.1) {
      setTickLower(tickRanges?.range10.lower!);
      setTickUpper(tickRanges?.range10.upper!);
      setInverseTickLower(inverseTickRanges?.range10.lower!);
      setInverseTickUpper(inverseTickRanges?.range10.upper!);
    } else if (activePriceRange === 0.2) {
      setTickLower(tickRanges?.range20.lower!);
      setTickUpper(tickRanges?.range20.upper!);
      setInverseTickLower(inverseTickRanges?.range20.lower!);
      setInverseTickUpper(inverseTickRanges?.range20.upper!);
    } else if (activePriceRange === 0.5) {
      setTickLower(tickRanges?.range50.lower!);
      setTickUpper(tickRanges?.range50.upper!);
      setInverseTickLower(inverseTickRanges?.range50.lower!);
      setInverseTickUpper(inverseTickRanges?.range50.upper!);
    } else {
      if (feeTier === "0.3") {
        setTickLower(-887220);
        setTickUpper(887220);
        setInverseTickLower(-887220);
        setInverseTickUpper(887220);
      } else if (feeTier === "1") {
        setTickLower(-887200);
        setTickUpper(887200);
        setInverseTickLower(-887200);
        setInverseTickUpper(887200);
      } else if (feeTier === "2.5") {
        setTickLower(-887000);
        setTickUpper(887000);
        setInverseTickLower(-887000);
        setInverseTickUpper(887000);
      } else {
        setTickLower(tickRanges?.fullRange.lower!);
        setTickUpper(tickRanges?.fullRange.upper!);
        setInverseTickLower(inverseTickRanges?.fullRange.lower!);
        setInverseTickUpper(inverseTickRanges?.fullRange.upper!);
      }
    }
  }, [fromLPTokenInputAmount, toLPTokenInputAmount]);

  // Function to align ticks to valid Uniswap tick spacing
  function alignToTickSpacing(tick: number, tickSpacing: number) {
    return Math.round(tick / tickSpacing) * tickSpacing;
  }

  // Function to convert price to tick
  function priceToTick(price: number): number {
    const tick = Math.floor(Math.log(price) / Math.log(1.0001));

    const nearestTick = alignToTickSpacing(tick, tickSpace);
    // const nearestTick = nearestUsableTick(tick, tickSpace);
    return nearestTick; // Adjusts to valid tick
  }

  const manualTickSet = () => {
    let tickUpper = priceToTick(parseFloat(tickUpperPrice));
    let tickLower = priceToTick(parseFloat(tickLowerPrice));
    let itickUpper = priceToTick(parseFloat(tickUpperPrice));
    let itickLower = priceToTick(parseFloat(tickLowerPrice));

    const feeAmount: FeeAmount = parseFloat(feeTier) * 10000;
    const tickLowValue: number = alignToTickSpacing(tickLower, tickSpace);
    const tickUpperValue: number = alignToTickSpacing(tickUpper, tickSpace);
    const itickLowValue: number = alignToTickSpacing(itickLower, tickSpace);
    const itickUpperValue: number = alignToTickSpacing(itickUpper, tickSpace);
    // [Bound.UPPER]: feeAmount ? nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount!]) : undefined,
    // const tickLowValue = feeAmount
    //   ? nearestUsableTick(tickLower, TICK_SPACINGS[feeAmount!])
    //   : undefined;
    // const tickUpperValue = feeAmount
    //   ? nearestUsableTick(tickUpper, TICK_SPACINGS[feeAmount!])
    //   : undefined;
    return { tickLowValue, tickUpperValue, itickLowValue, itickUpperValue };
  };

  interface CalculateV3OutputParams {
    sqrtPriceX96: bigint; // from slot0
    tickLower: number;
    tickUpper: number;
    amountIn: string; // human-readable input amount
    tokenInIsToken0: boolean;
    decimalsIn: number;
    decimalsOut: number;
  }

  let inputToken =
    fromLPToken?.address! === "native"
      ? chainId === 56
        ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
        : chainId === 1
        ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        : chainId === 97
        ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
        : "0x4200000000000000000000000000000000000006"
      : fromLPToken?.address;

  let outputToken =
    toLPToken?.address! === "native"
      ? chainId === 56
        ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
        : chainId === 1
        ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        : chainId === 97
        ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
        : "0x4200000000000000000000000000000000000006"
      : toLPToken?.address;

  useEffect(() => {
    if (inputToken! < outputToken!) {
      setLowerToken(true);
    } else {
      setLowerToken(false);
    }
  }, [inputToken, outputToken]);

  const tokenIn: Address = lowerToken
    ? (inputToken as Address)
    : (outputToken as Address);

  const params = {
    sqrtPriceX96: pairSelectLiquidity!,
    tickLower: tickLower!,
    tickUpper: tickUpper!,
    amountIn: fromLPTokenInputAmount!,
    tokenInIsToken0: lowerToken!,
    decimalsIn: fromLPToken?.decimals!,
    decimalsOut: toLPToken?.decimals!,
  };

  const outParams = {
    sqrtPriceX96: pairSelectLiquidity!,
    tickLower: tickLower!,
    tickUpper: tickUpper!,
    amountOut: toLPTokenInputAmount!,
    tokenInIsToken0: lowerToken!,
    decimalsIn: fromLPToken?.decimals!,
    decimalsOut: toLPToken?.decimals!,
  };

  const handleLPAdd = () => {
    if (params) {
      const output = calculateV3Output(params);

      // optionally set state or pass to AddLPButton
    }
  };

  interface CalculateV3OutputParams {
    sqrtPriceX96: bigint; // from slot0
    tickLower: number;
    tickUpper: number;
    amountIn: string; // human-readable input amount
    tokenInIsToken0: boolean;
    decimalsIn: number;
    decimalsOut: number;
  }

  const calculateV3Output = ({
    sqrtPriceX96,
    tickLower,
    tickUpper,
    amountIn,
    tokenInIsToken0,
    decimalsIn,
    decimalsOut,
  }: CalculateV3OutputParams) => {
    const sqrtLowerX96 = TickMath.getSqrtRatioAtTick(tickLower);
    const sqrtUpperX96 = TickMath.getSqrtRatioAtTick(tickUpper);
    const Q96 = BigInt(2) ** BigInt(96);

    const amountInRaw = parseUnits(amountIn, decimalsIn);

    let amount0 = BigInt(0);
    let amount1 = BigInt(0);

    if (tokenInIsToken0) {
      if (sqrtPriceX96 <= sqrtLowerX96) {
        amount0 = amountInRaw;
        amount1 = BigInt(0);
      } else if (sqrtPriceX96 >= sqrtUpperX96) {
        amount0 = BigInt(0);
        amount1 = amountInRaw;
      } else {
        const liquidity =
          (amountInRaw * sqrtUpperX96 * sqrtPriceX96) /
          (sqrtUpperX96 - sqrtPriceX96);

        amount1 = (liquidity * (sqrtPriceX96 - sqrtLowerX96)) / Q96;

        amount0 = amountInRaw;
      }
    } else {
      if (sqrtPriceX96 <= sqrtLowerX96) {
        amount0 = amountInRaw;
        amount1 = BigInt(0);
      } else if (sqrtPriceX96 >= sqrtUpperX96) {
        amount0 = BigInt(0);
        amount1 = amountInRaw;
      } else {
        const liquidity = (amountInRaw * Q96) / (sqrtPriceX96 - sqrtLowerX96);
        amount0 = (liquidity * (sqrtUpperX96 - sqrtPriceX96)) / sqrtUpperX96;
        amount1 = amountInRaw;
      }
    }

    const outputRaw = tokenInIsToken0 ? amount1 : amount0;

    const outputFormatted = formatUnits(outputRaw, decimalsOut);

    // This return statement was missing!
    return outputFormatted;
  };

  return (
    <div className="flex flex-col w-full ">
      <div className="flex flex-col justify-start">
        <div className="uppercase text-primary font-formula text-lg">
          Deposit Amount
        </div>
        <p className="text-sm text-neutral-400 font-lato font-normal">
          Specify the token amounts for your liquidity contribution.
        </p>
      </div>

      <div className="flex flex-col w-full pt-1">
        <TokenBalanceTop />
        <TokenBalanceBottom />
        <div className="pt-3">
          <AddLPButton />
        </div>
        {/* <button onClick={handleLPAdd}>lp add</button> */}
      </div>
    </div>
  );
};

export default LPDepositAmount;
