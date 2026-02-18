"use client";
import React from "react";
import StepComponent from "./StepComponent";
import SelectPair from "./SelectPair";
import SetPriceRange from "./SetPriceRange";
import { useLPStore } from "@/store/useDexStore";
import LPDepositAmount from "./LPDepositAmount";
import ResetDialog from "./ResetDialog";
import ChainSelector from "../ChainSelector";
import LPSlippageSettingDialog from "./LPSlippageSettingDialog";
import LPSuccessResponse from "./LPSuccessResponse";

const LPView = () => {
  const { activeStep, fromLPToken, toLPToken, lpAddingSuccess } = useLPStore();

  return (
    <>
      <div className="flex justify-center items-center w-full md:px-[140px] ">
        <div className="w-full">
          {lpAddingSuccess === false ? (
            <>
              <div className="flex flex-row w-full justify-between">
                <div className="inline-flex flex-row gap-4 justify-center items-center">
                  <div className="title-large-semi-bold uppercase">
                    Add V3 Liquidity.
                    {/* <hr className="title-underline" /> */}
                  </div>
                </div>
                <div className="inline-flex flex-row items-center space-x-2">
                  <div className="inline-flex items-center justify-center ">
                    <button disabled={!fromLPToken || !toLPToken}>
                      <ResetDialog />
                    </button>
                  </div>
                  <div className="inline-flex items-center justify-center  ">
                    <LPSlippageSettingDialog />
                  </div>
                </div>
              </div>
              <div className="flex flex-row  justify-start mt-4 md:mt-5 w-[250px]">
                <ChainSelector noBlackBG={true} />
              </div>
              <div className="pt-5">
                <div className="flex flex-col md:flex-row md:justify- w-full justify-between gap-6">
                  {/* <div className="hidden md:flex flex-col  w-40 border border-[#FFFFFF1A] bg-[#1a1a1a] rounded-xl space-y-3 h-fit items-center"> */}
                  <StepComponent />
                  {/* </div> */}
                  <div className="border border-white/10 bg-white dark:bg-dark rounded-xl p-3 md:p-6 w-full">
                    {activeStep === 1 ? (
                      <SelectPair />
                    ) : activeStep === 2 ? (
                      <SetPriceRange />
                    ) : (
                      <LPDepositAmount />
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col w-full md:w-[800px] gap-6">
              <div className="flex flex-row w-full  gap-4 !font-formula">
                <div className="border-l-4 pl-8 border-primary title-regular-semi-bold uppercase">
                  Add V3 Liquidity
                  {/* <hr className="title-underline" /> */}
                </div>
              </div>
              <LPSuccessResponse />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LPView;
