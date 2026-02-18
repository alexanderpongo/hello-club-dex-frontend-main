"use client";
import { useTradingLivePoolStore } from "@/store/trading-live-pool-store";
import { CircleMinus, CirclePlus } from "lucide-react";
import React, { useMemo } from "react";

const MinPriceCard = () => {
  const {
    activePriceRange,
    currencyA,
    currencyB,
    tickLowerPrice,
    tickUpperPrice,
    tickSpace,
    basePrice,
    setTickLowerPrice,
  } = useTradingLivePoolStore();

  const getParsedValue = (value: string) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Derived disabled states (no internal mutating state)
  const priceNow = parseFloat(basePrice?.toSignificant(6) || "0");
  const lowerVal = getParsedValue(tickLowerPrice);
  const upperVal = getParsedValue(tickUpperPrice);

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

  const minTickHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    let input = event.target.value.replace(/[^0-9.]/g, "");
    setTickLowerPrice(input);
  };

  return (
    <div className="flex w-full flex-row md:grow items-center rounded-xl py-3 px-2 card-primary">
      <div className="flex flex-col !font-lato justify-center items-center grow w-full font-normal text-base space-y-2">
        <div className="font-normal text-xs">Min Price</div>
        <div className="font-bold text-lg">
          {activePriceRange === 1 ? (
            <span className="text-[16px] sm:text-xl">0</span>
          ) : (
            <input
              disabled={true}
              value={
                isNaN(parseFloat(tickLowerPrice))
                  ? "0"
                  : getTrimmedResult(tickLowerPrice)
              }
              onChange={minTickHandler}
              placeholder="0.00"
              type="text"
              className={`focus:outline-none bg-transparent text-gray-400 dark:text-gray-200 text-[16px] sm:text-[20px] font-bold text-center w-full`}
            />
          )}
        </div>
        {currencyA && currencyB && (
          <div className="text-xs w-full text-center">
            {currencyB.symbol} per {currencyA.symbol}
          </div>
        )}
      </div>
    </div>
  );
};

export default MinPriceCard;
