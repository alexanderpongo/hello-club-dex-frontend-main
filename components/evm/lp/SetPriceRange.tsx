"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ViewPriceButton from "../ViewPriceButton";
import PriceChart from "../PriceChart";
import MinPriceCard from "../MinPriceCard";
import MaxPriceCard from "../MaxPriceCard";
import PriceRangeButtons from "../PriceRangeButtons";
// import AddLPButton from "../AddLPButton";
import { Button } from "@/components/ui/button";
import { useLPStore } from "@/store/useDexStore";
import PriceRangeTabs from "./PriceRangeTabs";
import { TickMath } from "@uniswap/v3-sdk";
// import MinPriceRangeButtons from "./MinPriceRangeButtons";

import { priceToClosestTick } from "@pancakeswap/v3-sdk";
import { Price, Token } from "@pancakeswap/swap-sdk-core";
import { BadgeInfo, OctagonAlert } from "lucide-react";
import { useAccount } from "wagmi";
import { number } from "zod";

const PriceRange = () => {
  const {
    setActiveStep,
    fromLPToken,
    toLPToken,
    basePrice,
    tickSpace,
    setBaseTick,
    baseTick,
    setTickRanges,
    setInverseTickRanges,
    feeTier,
    lpSlippage,
    poolAddress,
    setBasePrice,
    setInverseBasePrice,
    setInverseSqrtPriceX96,
    inverseSqrtPriceX96,
    setSqrtPriceX96,
    sqrtPriceX96,
    token0Address,
    token1Address,
    tickUpperPrice,
    tickLowerPrice,
    activePriceRange,
    pairSelectLiquidity,
    setInitialBP,
  } = useLPStore();
  const { chainId, chain, address } = useAccount();
  const [initialInputAmount, setInitialInputAmount] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [warning, setWarning] = useState("");
  const [hasOrientedPrice, setHasOrientedPrice] = useState(false);

  // Function to align ticks to valid Uniswap tick spacing
  function alignToTickSpacing(tick: number, tickSpacing: number) {
    return Math.round(tick / tickSpacing) * tickSpacing;
  }

  function priceToTick(price: number) {
    return Math.floor(Math.log(price!) / Math.log(1.0001));
  }

  const slippageFactor = lpSlippage! / 100;

  // Function to calculate tick ranges
  function calculateTickRanges(price: string) {
    const currentPrice = parseFloat(price);
    // const currentTick = priceToClosestTick(currentPrice as any);

    const baseTickValue = priceToTick(currentPrice);

    const alignedBaseTick = alignToTickSpacing(baseTickValue, tickSpace);

    // setBaseTick(baseTick);
    setBaseTick(alignedBaseTick);

    // Percentage-based tick ranges
    const tickLow01 = alignToTickSpacing(
      priceToTick(currentPrice * 0.9995),
      tickSpace
    );
    const tickHigh01 = alignToTickSpacing(
      priceToTick(currentPrice * 1.0005),
      tickSpace
    );
    const tickLow05 = alignToTickSpacing(
      priceToTick(currentPrice * 0.9975),
      tickSpace
    );
    const tickHigh05 = alignToTickSpacing(
      priceToTick(currentPrice * 1.0025),
      tickSpace
    );

    const tickLow1 = alignToTickSpacing(
      priceToTick(currentPrice * 0.995),
      tickSpace
    );
    const tickHigh1 = alignToTickSpacing(
      priceToTick(currentPrice * 1.005),
      tickSpace
    );

    const tickLow5 = alignToTickSpacing(
      priceToTick(currentPrice * 0.975),
      tickSpace
    );
    const tickHigh5 = alignToTickSpacing(
      priceToTick(currentPrice * 1.025),
      tickSpace
    );

    const tickLow10 = alignToTickSpacing(
      priceToTick(currentPrice * 0.95),
      tickSpace
    );

    const tickHigh10 = alignToTickSpacing(
      priceToTick(currentPrice * 1.05),
      tickSpace
    );

    const tickLow20 = alignToTickSpacing(
      priceToTick(currentPrice * 0.9),
      tickSpace
    );

    const tickHigh20 = alignToTickSpacing(
      priceToTick(currentPrice * 1.1),
      tickSpace
    );

    const tickLow50 = alignToTickSpacing(
      priceToTick(currentPrice * 0.75),
      tickSpace
    );

    const tickHigh50 = alignToTickSpacing(
      priceToTick(currentPrice * 1.25),
      tickSpace
    );

    // Full range (Uniswap V3 min/max ticks)
    let fullRangeLow: number;
    let fullRangeHigh: number;

    if (feeTier === "0.3") {
      fullRangeLow = -887220;
      fullRangeHigh = 887220;
    } else if (feeTier === "1") {
      fullRangeLow = -887200;
      fullRangeHigh = 887200;
    } else if (feeTier === "2.5") {
      fullRangeLow = -887000;
      fullRangeHigh = 887000;
    } else {
      fullRangeLow = alignToTickSpacing(TickMath.MIN_TICK, tickSpace);
      fullRangeHigh = alignToTickSpacing(TickMath.MAX_TICK, tickSpace);
    }
    return {
      range01: { lower: tickLow01, upper: tickHigh01 },
      range05: { lower: tickLow05, upper: tickHigh05 },
      range1: { lower: tickLow1, upper: tickHigh1 },
      range5: { lower: tickLow5, upper: tickHigh5 },
      range10: { lower: tickLow10, upper: tickHigh10 },
      range20: { lower: tickLow20, upper: tickHigh20 },
      range50: { lower: tickLow50, upper: tickHigh50 },
      fullRange: { lower: fullRangeLow, upper: fullRangeHigh },
    };
  }

  function getSqrtPriceX96(price: number) {
    const sqrtPrice = Math.sqrt(Number(price)); // Compute square root
    return BigInt(Math.floor(sqrtPrice! * 2 ** 96)); // Convert to BigInt
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

  let [token0, token1] =
    inputToken?.toLowerCase()! < outputToken?.toLowerCase()!
      ? [inputToken, outputToken]
      : [outputToken, inputToken];

  useEffect(() => {
    [token0, token1] =
      inputToken?.toLowerCase()! < outputToken?.toLowerCase()!
        ? [inputToken, outputToken]
        : [outputToken, inputToken];
  }, [fromLPToken, toLPToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^0-9.]/g, ""); // Allow only numbers & decimal

    // Check for multiple decimals
    const decimalCount = (input.match(/\./g) || []).length;
    if (decimalCount > 1) {
      setWarning("Invalid number format: multiple decimal points"); // show warning
      return;
    } else {
      setWarning(""); // clear warning when valid
    }

    if (input === "") {
      setInputAmount("");
      setSqrtPriceX96("0");
      setInverseSqrtPriceX96("0");
      setInitialInputAmount("");
      setBasePrice("");
      setInverseBasePrice("");
      return;
    }

    const price = parseFloat(input);
    if (isNaN(price)) {
      setWarning("Invalid number format");
      return;
    }

    setInputAmount(input);
    try {
      const sqrtPriceX96 = getSqrtPriceX96(price);
      const inversePrice = 1 / price;
      const inverseSqrtPriceX96 = getSqrtPriceX96(inversePrice);

      const ticks = calculateTickRanges(price.toString());
      const inverseTicks = calculateTickRanges(inversePrice.toString());

      setTickRanges(ticks);
      setInverseTickRanges(inverseTicks);

      setSqrtPriceX96(sqrtPriceX96.toString());
      setInverseSqrtPriceX96(inverseSqrtPriceX96.toString());
      setInverseBasePrice(inversePrice.toString());
    } catch (error) {
      console.error("Error calculating sqrtPriceX96:", error);
    }

    setInitialInputAmount(input);
    setBasePrice(input);
  };

  useEffect(() => {
    if (basePrice && tickSpace) {
      const ticks = calculateTickRanges(basePrice);
      setTickRanges(ticks);
      const inverse = 1 / parseFloat(basePrice);
      const inverseTicks = calculateTickRanges(inverse.toString());
      setInverseTickRanges(inverseTicks);

      const inversePrice = 1 / parseFloat(basePrice!);
      if (parseFloat(basePrice) > 0) {
        const inverseSqrtPriceX96 = getSqrtPriceX96(inversePrice! ?? "0");
        setInverseSqrtPriceX96(inverseSqrtPriceX96.toString());
        // Set the inverse base price
        setInverseBasePrice(inversePrice.toString());
      }
    }
  }, [basePrice, tickSpace]);

  // Reset the orientation flag when pool changes
  useEffect(() => {
    setHasOrientedPrice(false);
  }, [poolAddress]);

  // Orient the basePrice ONCE when pool is first loaded
  // This ensures basePrice is correctly aligned with token0/token1 ordering
  useEffect(() => {
    if (
      !token0Address ||
      !token1Address ||
      !fromLPToken ||
      !toLPToken ||
      !basePrice ||
      hasOrientedPrice
    )
      return;

    const inputToken =
      fromLPToken.address === "native"
        ? fromLPToken.wrappedAddress
        : fromLPToken.address;

    const price = parseFloat(basePrice);
    let newPrice = price;

    // If fromLPToken is token0, use price as is (token1 per token0)
    // Otherwise invert it
    if (inputToken?.toLowerCase() === token0Address.toLowerCase()) {
      newPrice = price;
    } else {
      newPrice = 1 / price;
    }

    // Only update if the price actually needs to be oriented
    if (newPrice !== price) {
      setBasePrice(newPrice.toString());
      setInverseBasePrice((1 / newPrice).toString());
    }

    setHasOrientedPrice(true);
  }, [
    token0Address,
    token1Address,
    fromLPToken,
    toLPToken,
    basePrice,
    hasOrientedPrice,
  ]);

  const validPriceRange = [0, 0.001, 0.005, 0.01, 0.05, 0.1, 0.2, 0.5, 1];

  const getTrimmedResult = (raw: string) => {
    const [intPart, decimalPart] = raw.split(".");
    if (!decimalPart) return raw;

    if (intPart === "0") {
      const firstNonZeroIndex = decimalPart.search(/[1-9]/);
      if (firstNonZeroIndex === -1) return "0";

      const sliceEnd = Math.min(firstNonZeroIndex + 3, 18);
      const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");

      return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
    }

    // For non-zero intPart, return int with 2–3 decimals
    const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
    return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
  };

  return (
    <>
      <div className="flex flex-col w-full ">
        <div className="pt-5 md:pt-0 flex flex-row justify-between">
          <div
            // onClick={calculateTickRanges}
            className="uppercase text-primary font-formula text-lg"
          >
            Set Price Range
          </div>
          <ViewPriceButton
            inputAmount={inputAmount}
            setInputAmount={setInputAmount}
          />
        </div>
        {/* <div className="py-1 flex ">
        <PriceRangeTabs />
      </div> */}

        {/* <PriceChart /> */}
        {(!poolAddress ||
          poolAddress === "0x0000000000000000000000000000000000000000") && (
          <div className="pt-2">
            <div className="w-full text-xs md:text-sm font-bold flex items-center space-x-2 text-black/60 dark:text-white/60">
              Set Starting Price
            </div>
            <div className="border rounded-xl mt-2 dark:border-[#FFFFFF0D]/40 active:border-primary focus:border-primary">
              <div className="py-2 text-end px-2">
                <input
                  value={inputAmount}
                  onInput={handleChange}
                  placeholder="Enter starting price"
                  type="text"
                  className={`focus:outline-none bg-transparent text-[#000] dark:text-[#fff] text-[16px] sm:text-[19px] placeholder:text-xs font-medium text-right w-[9.313rem] md:w-full`}
                />
              </div>
              {/* {warning && <p className="text-red-500 text-sm">{warning}</p>} */}
            </div>
          </div>
        )}

        <div className="pt-3 pb-2 w-full text-xs md:text-sm font-bold flex items-center space-x-2 text-black/60 dark:text-white/60">
          <span>Current price:</span>
          {parseFloat(inputAmount) > 0 ? (
            <span className="text-black dark:text-white">
              1 {fromLPToken?.symbol!}={" "}
              {isNaN(parseFloat(inputAmount))
                ? "0.0"
                : getTrimmedResult(inputAmount)}{" "}
              {toLPToken?.symbol!}
            </span>
          ) : (
            <span className="text-black dark:text-white">
              1 {fromLPToken?.symbol!}={" "}
              {isNaN(parseFloat(basePrice))
                ? "0.0"
                : getTrimmedResult(basePrice)}{" "}
              {toLPToken?.symbol!}
            </span>
          )}
        </div>
        {pairSelectLiquidity === BigInt("0") && initialInputAmount === "" && (
          <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm">
            <OctagonAlert className="!h-[24px] !w-[24px]" />
            The pool you are adding liquidity to is out of the current market
            price range. Your liquidity will only earn fees once the price moves
            into this range. In some cases, the transaction may fail if the
            price is too far away.
          </div>
        )}
        <div className="py-1 pt-3  flex flex-row justify-between columns-2 w-full space-x-2">
          <MinPriceCard />
          <MaxPriceCard />
        </div>

        <div className="py-2 flex gap-2 text-black/60 dark:text-white/60  text-start items-start text-xs">
          <BadgeInfo className="!h-[24px] !w-[24px]" /> Full range is simple and
          covers all prices but increases impermanent loss. Custom range targets
          specific prices for higher efficiency and fees but requires active
          management.
        </div>
        <div>
          {/* {feeTier === "0.01" ? <MinPriceRangeButtons /> : <PriceRangeButtons />} */}
          <PriceRangeButtons />
        </div>
        <div className="space-y-2">
          {(parseFloat(tickLowerPrice) !== 0 ||
            parseFloat(tickUpperPrice) !== 0) &&
            parseFloat(inputAmount) !== 0 &&
            parseFloat(inputAmount) >= parseFloat(tickUpperPrice) && (
              <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm">
                <OctagonAlert className="!h-[24px] !w-[24px]" /> Invalid range
                selected. The max price must be greater than the input price.
              </div>
            )}
          {(parseFloat(tickLowerPrice) !== 0 ||
            parseFloat(tickUpperPrice) !== 0) &&
            parseFloat(inputAmount) !== 0 &&
            parseFloat(tickLowerPrice) >= parseFloat(inputAmount) && (
              <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm">
                <OctagonAlert className="!h-[24px] !w-[24px]" /> Invalid range
                selected. The min price must be lower than the input price.
              </div>
            )}
          {parseFloat(inputAmount) !== 0 &&
            parseFloat(tickLowerPrice) > parseFloat(tickUpperPrice) && (
              <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm">
                <OctagonAlert className="!h-[24px] !w-[24px]" /> Invalid range
                selected. The min price must be lower than the max price.
              </div>
            )}
          {(parseFloat(tickLowerPrice) > parseFloat(inputAmount) ||
            parseFloat(inputAmount) > parseFloat(tickUpperPrice)) &&
            parseFloat(tickLowerPrice) !== 0 &&
            parseFloat(tickUpperPrice) !== 0 && (
              <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm">
                <OctagonAlert className="!h-[24px] !w-[24px] shrink-0 mt-0.5" />
                <span>
                  Your position will not earn fees or be used in trades until
                  the market price moves into your range.
                </span>
              </div>
            )}
        </div>
        <div className="pt-3">
          <Button
            className="w-full button-primary uppercase h-10"
            onClick={() => {
              setActiveStep(3);
              setInitialBP(parseFloat(basePrice));
            }}
            disabled={
              (tickLowerPrice === "" && tickUpperPrice === "") ||
              activePriceRange === null ||
              sqrtPriceX96 === null ||
              !validPriceRange.includes(activePriceRange) ||
              parseFloat(tickLowerPrice) >= parseFloat(tickUpperPrice) ||
              parseFloat(tickLowerPrice) >= parseFloat(inputAmount) ||
              parseFloat(inputAmount) >= parseFloat(tickUpperPrice)
            }
          >
            Continue
          </Button>
        </div>
      </div>
    </>
  );
};

export default PriceRange;
