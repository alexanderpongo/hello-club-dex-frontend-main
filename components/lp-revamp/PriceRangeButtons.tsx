import { useLiquidityPoolStore } from "@/store/liquidity-pool.store";
import React, { useMemo, useState } from "react";


interface PriceRangeButtonsProps {
  inputAmount: string;
}

const PriceRangeButtons: React.FC<PriceRangeButtonsProps> = (props) => {
  const {
    feeTier,
    activePriceRange,
    setRangeSelectMinValue,
    setRangeSelectMaxValue,
    setIsFullRangeSelected,
    setActivePriceRange,
    poolAddress,
  } = useLiquidityPoolStore();
  const [isDisable, setIsDisable] = useState(false);

  const { inputAmount } = props;

  const priceRangeHandler = (value: number) => {
    if (value !== 1) {
      const initialMin = 1 - value;
      const initialMax = 1 + value;

      setRangeSelectMinValue(initialMin);
      setRangeSelectMaxValue(initialMax);
      setIsFullRangeSelected(false);
      setActivePriceRange(value);
    } else {
      setIsFullRangeSelected(true);
      setActivePriceRange(value);
    }
  };

  useMemo(() => {
    if (poolAddress === null && inputAmount === "") {
      setIsDisable(true);
    } else {
      setIsDisable(false);
    }
  }, [inputAmount, poolAddress]);

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
