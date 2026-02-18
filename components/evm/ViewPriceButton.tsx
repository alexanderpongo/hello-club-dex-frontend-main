"use client";
import React from "react";
import { Button } from "../ui/button";
import { ArrowRightLeft } from "lucide-react";
import { useLPStore } from "@/store/useDexStore";

interface ViewPriceButtonProps {
  inputAmount: string;
  setInputAmount: (value: string) => void;
}

const ViewPriceButton: React.FC<ViewPriceButtonProps> = ({
  inputAmount,
  setInputAmount,
}) => {
  const {
    fromLPToken,
    toLPToken,
    setFromLPToken,
    setToLPToken,
    setBasePrice,
    basePrice,
    tickLowerPrice,
    setTickLowerPrice,
    tickUpperPrice,
    setTickUpperPrice,
    isInversePriceView,
    setIsInversePriceView,
    setInverseTickLowerPrice,
    setInverseTickUpperPrice,
    setInverseBasePrice,
    activePriceRange,
  } = useLPStore();

  const basePriceChanger = (bp: string) => {
    let price = parseFloat(bp);
    if (isNaN(price)) {
      price = 0;
      return 0;
    }
    const newPrice = 1 / price;
    return newPrice;
  };

  const viewPriceHandler = () => {
    // Toggle the inverse price view flag
    setIsInversePriceView(!isInversePriceView);

    // Calculate the new basePrice as 1 / current basePrice
    const currentBasePrice = parseFloat(basePrice);
    if (currentBasePrice <= 0 || isNaN(currentBasePrice)) {
      console.error("Invalid basePrice:", basePrice);
      return;
    }

    const newBasePrice = 1 / currentBasePrice;

    // Update basePrice to the inverted value
    setBasePrice(newBasePrice.toString());

    // Also update inverseBasePrice for SetPriceRange calculations
    setInverseBasePrice(currentBasePrice.toString());

    // If a percentage is selected, recalculate tick prices immediately with the NEW basePrice
    if (activePriceRange > 0) {
      const upperPrice = activePriceRange * newBasePrice + newBasePrice;
      const lowerPrice = newBasePrice - activePriceRange * newBasePrice;

      setTickLowerPrice(lowerPrice.toString());
      setTickUpperPrice(upperPrice.toString());

      // Store inverse tick values
      if (lowerPrice > 0 && upperPrice > 0) {
        setInverseTickLowerPrice((1 / upperPrice).toString());
        setInverseTickUpperPrice((1 / lowerPrice).toString());
      }
    } else {
      // No percentage selected, so invert the current tick values
      const currentLower = parseFloat(tickLowerPrice);
      const currentUpper = parseFloat(tickUpperPrice);

      if (currentLower > 0 && currentUpper > 0) {
        setTickLowerPrice((1 / currentUpper).toString());
        setTickUpperPrice((1 / currentLower).toString());
        setInverseTickLowerPrice(currentUpper.toString());
        setInverseTickUpperPrice(currentLower.toString());
      }
    }

    // Update the input amount display
    let initialInputAmount: string;
    if (parseFloat(inputAmount) > 0) {
      initialInputAmount = inputAmount;
    } else {
      initialInputAmount = basePrice;
    }
    const testAmount = basePriceChanger(initialInputAmount);
    if (testAmount > 0) {
      setInputAmount(testAmount.toString());
    } else {
      setInputAmount("0.0");
    }

    // Swap the tokens
    const token = toLPToken;
    setToLPToken(fromLPToken);
    setFromLPToken(token);
  };

  return (
    <>
      {fromLPToken && toLPToken && (
        <div className="flex flex-row justify-end space-x-2 items-center">
          {/* <div className="text-[#ffffff] text-xs font-normal !-pt-3 ">
            View prices in
          </div> */}
          <Button
            onClick={viewPriceHandler}
            className="button-primary group !font-lato !font-normal flex justify-between items-center"
          >
            <ArrowRightLeft className="dark:text-[#000000] group-hover:text-primary" />
            <div className="dark:text-[#000000] group-hover:text-primary ">
              {fromLPToken?.symbol}
            </div>
          </Button>
        </div>
      )}
    </>
  );
};

export default ViewPriceButton;
