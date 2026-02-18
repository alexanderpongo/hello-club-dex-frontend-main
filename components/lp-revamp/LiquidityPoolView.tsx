"use client";
import React from "react";
import LPSlippageSettingDialog from "@/components/lp-revamp/models/slipage-model/LPSlippageSettingDialog";
import ResetDialog from "@/components/lp-revamp/models/reset-model/ResetDialog";
import { useLiquidityPoolStore } from "@/store/liquidity-pool.store";
import ChainSelector from "@/components/lp-revamp/ChainSelector";
import StepComponent from "@/components/lp-revamp/step-form/StepComponent";
import SelectTokenPair from "@/components/lp-revamp/step-form/SelectTokenPair";
import PriceRange from "@/components/lp-revamp/step-form/PriceRange";
import LPAmountDeposit from "@/components/lp-revamp/step-form/LPAmountDeposit";
import LPSuccessResponse from "@/components/lp-revamp/LPSuccessResponse";

const LiquidityPoolView = () => {
  const { activeStep, lpAddingSuccess } = useLiquidityPoolStore();
  return (
    <div className="flex flex-col w-full space-y-4 max-w-6xl mx-auto">
      <div className="flex flex-col w-full">
        {lpAddingSuccess === false ? (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row w-full justify-between items-end gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="title-large-semi-bold uppercase">
                  Add V3 Liquidity
                </h1>
                <p className="text-xs font-lato font-normal dark:text-[#a3a3a3] text-gray-500 tracking-wider">
                  Create a new liquidity position and start earning fees from trades
                </p>
              </div>
              <div className="flex flex-row items-center space-x-2 pb-1">
                <ResetDialog />
                <LPSlippageSettingDialog />
              </div>
            </div>

            <div className="flex flex-row justify-start w-[250px]">
              <ChainSelector noBlackBG={true} />
            </div>

            <div className="pt-0">
              <div className="flex flex-col md:flex-row w-full justify-center gap-6">
                <StepComponent />
                <div className="w-full md:w-[800px] dark:bg-[#121212] bg-slate-100 border border-black/10 dark:border-[rgba(255,255,255,0.03)] rounded-xl p-3 md:p-6">
                  {activeStep === 1 ? (
                    <SelectTokenPair />
                  ) : activeStep === 2 ? (
                    <PriceRange />
                  ) : (
                    <LPAmountDeposit />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full md:w-[800px] gap-6">
            <div className="flex flex-row w-full gap-4">
              <div className="border-l-4 pl-4 border-primary">
                <h2 className="text-primary font-formula font-normal text-left tracking-tight uppercase text-2xl">
                  Add V3 Liquidity
                </h2>
              </div>
            </div>
            <LPSuccessResponse />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiquidityPoolView;
