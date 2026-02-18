"use client";

import { useLiquidityPoolStore } from "@/store/liquidity-pool.store";
import { CircleMinus, CirclePlus, Infinity } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

const MaxPriceCard = () => {
  const {
    activePriceRange,
    currencyA,
    currencyB,
    tickLowerPrice,
    setTickLowerPrice,
    tickSpace,
    basePrice,
    tickUpperPrice,
  } = useLiquidityPoolStore();

  const step = useMemo(() => {
    const priceNow = parseFloat(basePrice?.toSignificant(6) || "0");
    if (priceNow <= 0 || !tickSpace) return 0;
    return priceNow * (Math.pow(1.0001, tickSpace) - 1);
  }, [basePrice, tickSpace]);

  const getParsedValue = (value: string) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const tickDecreaseHandler = () => {
    const lower = getParsedValue(tickLowerPrice);
    const upper = getParsedValue(tickUpperPrice);
    const newValue = upper - step;
    if (step <= 0) return;
    if (newValue <= 0) return;
    if (newValue >= upper && activePriceRange !== 1) return;
    setTickLowerPrice(newValue.toString());
  };

  const tickIncreaseHandler = () => {
    const lower = getParsedValue(tickLowerPrice);
    const upper = getParsedValue(tickUpperPrice);
    if (step <= 0) return;
    const newValue = upper + step;
    if (newValue >= upper && activePriceRange !== 1) return;
    setTickLowerPrice(newValue.toString());
  };

  const maxTickHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    let input = event.target.value.replace(/[^0-9.]/g, "");
    setTickLowerPrice(input);
  };

  const getTrimmedResult = (raw: string) => {
    const [intPart, decimalPart] = raw.split(".");
    if (!decimalPart) return raw;

    if (intPart === "0") {
      const firstNonZeroIndex = decimalPart.search(/[1-9]/);
      if (firstNonZeroIndex === -1) return "0";

      const sliceEnd = Math.min(firstNonZeroIndex + 9, 18);
      const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");

      return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
    }

    const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
    return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
  };

  const priceNow = parseFloat(basePrice?.toSignificant(6) || "0");
  const lowerVal = getParsedValue(tickLowerPrice);
  const upperVal = getParsedValue(tickUpperPrice);

  const inputDisabled = priceNow <= 0 || activePriceRange === 1 || step <= 0;
  const minusDisabled = inputDisabled || lowerVal <= 0 || lowerVal - step <= 0;
  const plusDisabled =
    inputDisabled || (lowerVal + step >= upperVal && activePriceRange !== 1);

  return (
    <div className="flex w-full flex-row md:grow items-center rounded-xl py-3 px-2 card-primary">
      <button disabled={minusDisabled} onClick={tickDecreaseHandler}>
        <CircleMinus
          className={`${
            minusDisabled
              ? "text-[#c2fe0c94] cursor-default"
              : "text-primary hover:cursor-pointer"
          }`}
        />
      </button>
      <div className="flex flex-col !font-lato justify-center items-center grow w-full font-normal text-base space-y-2">
        <div className="font-normal text-xs">Max Price</div>
        <div className="font-bold">
          {activePriceRange === 1 ? (
            <Infinity className="text-[16px] sm:text-xl h-[26px]" />
          ) : (
            <input
              disabled={inputDisabled}
              value={
                isNaN(parseFloat(tickUpperPrice))
                  ? "0"
                  : getTrimmedResult(tickUpperPrice)
              }
              onChange={maxTickHandler}
              placeholder={activePriceRange === 1 ? "∞" : "0.00"}
              type="text"
              className={`focus:outline-none bg-transparent ${
                inputDisabled
                  ? "text-black dark:text-[#ffffff]"
                  : "text-gray-400 dark:text-gray-200"
              } text-[16px] sm:text-[20px] font-bold text-center w-full`}
            />
          )}
        </div>
        {currencyA && currencyB && (
          <div className="text-xs w-full text-center">
            {currencyB.symbol} per {currencyA.symbol}
          </div>
        )}
      </div>

      <button disabled={plusDisabled} onClick={tickIncreaseHandler}>
        <CirclePlus
          className={`${
            plusDisabled
              ? "text-[#c2fe0c94] cursor-default"
              : "text-primary hover:cursor-pointer"
          }`}
        />
      </button>
    </div>
  );
};

export default MaxPriceCard;
