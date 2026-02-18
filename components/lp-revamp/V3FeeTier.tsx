"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { FeeTier } from "@/interfaces/index.i";
import { useLiquidityPoolStore } from "@/store/liquidity-pool.store";
import LPFeeTierCard from "@/components/lp-revamp/LPFeeTierCard";

const V3FeeTier = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFeeTierOn, setIsFeeTierOn] = useState(false);
  const { feeTier, currencyA, currencyB } = useLiquidityPoolStore();

  const feeTiers: FeeTier[] = [
    {
      fee: 0.01,
      value: 1,
      desp: "Best for highly competitive pairs.",
      desp1: "1% selected",
    },
    {
      fee: 0.05,
      value: 10,
      desp: "Best for stable and bluechip pairs",
      desp1: "65% selected",
    },
    {
      fee: 0.3,
      value: 60,
      desp: "Best for most pairs",
      desp1: "30% selected",
    },
    {
      fee: 1,
      value: 200,
      desp: "Best for unique pairs",
      desp1: "3% selected",
    },
    {
      fee: 2.5,
      value: 500,
      desp: "Highest profitablilty, but less competitive",
      desp1: "1% selected",
    },
  ];

  const feeTierHandler = () => {
    setIsFeeTierOn((prevState) => !prevState);
  };

  return (
    <>
      <div className="rounded-2xl border border-black/10 dark:border-[rgba(255,255,255,0.03)] dark:bg-[#121212] bg-slate-100 p-3 w-full">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col justify-start">
            <div className="dark:text-white text-base font-lato font-semibold ">
              {feeTier}% fee tier
            </div>

            <p className="text-sm dark:text-[#a1a1a1] font-lato font-normal pt-2">
              The % you will earn in fees
            </p>
          </div>
          <div
            onClick={feeTierHandler}
            className="flex flex-row items-center text-xs font-lato font-semibold gap-2 hover:cursor-pointer hover:text-primary"
          >
            {isFeeTierOn ? (
              <div>Hide</div>
            ) : (
              <div className="flex flex-row gap-1 items-center">
                More <ChevronDown size={15} />
              </div>
            )}
          </div>
        </div>
        {isFeeTierOn &&
          (isLoading ? (
            <div className="flex justify-center items-center my-5 mx-auto ">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 md:flex md:space-x-2 py-3">
              {feeTiers.map((fee, index) => (
                <LPFeeTierCard key={index} fee={fee} />
              ))}
            </div>
          ))}
      </div>
    </>
  );
};

export default V3FeeTier;
