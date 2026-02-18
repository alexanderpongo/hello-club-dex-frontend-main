"use client";
import { useLPStore } from "@/store/useDexStore";
import React, { useEffect } from "react";

const MinPriceRangeButtons = () => {
  const {
    setActivePriceRange,
    activePriceRange,
    basePrice,
    setTickLowerPrice,
    setTickUpperPrice,
  } = useLPStore();
  const priceRangeHandler = (value: number) => {
    setActivePriceRange(value);
    let upperPrice = value * parseFloat(basePrice) + parseFloat(basePrice);
    let lowerPrice = parseFloat(basePrice) - value * parseFloat(basePrice);
    if (value === 0.01) {
      setTickLowerPrice("0");
    } else {
      setTickLowerPrice(lowerPrice.toString());
    }

    setTickUpperPrice(upperPrice.toString());
  };

  useEffect(() => {
    priceRangeHandler(activePriceRange);
  }, []);

  return (
    <div className="py-3">
      <div className="flex space-x-2 justify-center w-full">
        {[0.1, 0.5, 1, 2].map((value, index) => (
          <div
            key={index}
            onClick={() => priceRangeHandler(value)}
            className={`ring-2 ring-primary ring-inset rounded-[12px] text-primary bg-[#ffffff14] grow text-center items-center !font-lato !font-bold !text-sm px-2 py-1.5 hover:cursor-pointer hover:bg-primary hover:text-black
                ${activePriceRange === value ? "!bg-primary !text-black" : ""}`}
          >
            <button>{value === 2 ? "Full Range" : `${value}%`}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MinPriceRangeButtons;
