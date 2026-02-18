"use client";
import { useLPStore } from "@/store/useDexStore";
import { tr } from "date-fns/locale";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const PriceRangeButtons = () => {
  const { chainId } = useAccount();
  const {
    setActivePriceRange,
    activePriceRange,
    basePrice,
    setTickLowerPrice,
    setTickUpperPrice,
    feeTier,
    poolAddress,
    fromLPToken,
    toLPToken,
  } = useLPStore();

  const [isDisable, setIsDisable] = useState(false);

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

  const priceRangeHandler = (value: number) => {
    setActivePriceRange(value);

    const parsedPrice = parseFloat(basePrice);
    console.log("parsedPrice : ", parsedPrice);
    console.log("value : ", value);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return;
    }

    // Calculate upper and lower prices based on CURRENT basePrice
    let upperPrice = value * parsedPrice + parsedPrice;
    console.log("upperPrice : ", upperPrice);
    let lowerPrice = parsedPrice - value * parsedPrice;
    console.log("lowerPrice : ", lowerPrice);

    // Update the tick prices
    setTickLowerPrice(lowerPrice.toString());
    setTickUpperPrice(upperPrice.toString());

    // IMPORTANT: Don't update inverse values here
    // They will be recalculated when needed during toggle
  };

  useEffect(() => {
    if (parseFloat(basePrice) === 0 || isNaN(parseFloat(basePrice))) {
      setIsDisable(true);
    } else {
      setIsDisable(false);
    }
  }, [basePrice]);

  return (
    <div className="py-3">
      <div className="flex space-x-2 justify-center w-full">
        {(parseFloat(feeTier) === 0.01
          ? [0.001, 0.005, 0.01, 1] //  [0, 0.001, 0.005, 0.01,0.05,0.1,0.2,0.5 ,1]
          : parseFloat(feeTier) === 0.05
          ? [0.05, 0.1, 0.2, 1]
          : [0.1, 0.2, 0.5, 1]
        ).map((value, index) => (
          <button
            key={index}
            disabled={isDisable}
            onClick={() => priceRangeHandler(value)}
            className={`ring-2  ring-inset rounded-[12px]  grow text-center items-center !font-lato !font-bold !text-sm px-2 py-1.5
    ${
      isDisable
        ? "bg-[#ffffff0a] text-[#c2fe0c94] ring-[#c2fe0c94] cursor-default" // Faded background, no hover, disabled cursor
        : `bg-[#ffffff14] hover:cursor-pointer hover:bg-primary hover:text-black ring-primary text-primary ${
            activePriceRange === value ? "!bg-primary !text-black" : ""
          }`
    }
    `}
          >
            {value === 1 ? "Full Range" : `${value * 100}%`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PriceRangeButtons;
