"use client";
import React from "react";
import TokenSelectDialog from "./TokenSelectDialog";
import { useLPStore } from "@/store/useDexStore";
import V3FeeTier from "./V3FeeTier";
import DepositAmount from "./DepositAmount";
import { Button } from "../ui/button";

const TokenPair = () => {
  const { setFromLPToken, fromLPToken, setToLPToken, toLPToken } = useLPStore();
  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-row justify-start items-center">
          <div className="uppercase text-primary text-lg !font-formula font-semibold">
            Choose token pair
          </div>
        </div>

        <div className="flex flex-row items-center space-x-2 w-full py-3">
          <div className="flex-grow">
            <TokenSelectDialog
              setSelectedToken={setFromLPToken}
              selectedToken={fromLPToken}
            />
          </div>
          <div className="text-[#ffffff] inline-flex text-xl font-bold items-center justify-center ">
            +
          </div>
          <div className="flex-grow">
            <TokenSelectDialog
              setSelectedToken={setToLPToken}
              selectedToken={toLPToken}
            />
          </div>
        </div>
        <div>
          <V3FeeTier />
        </div>
        <div className="pt-2">
          <DepositAmount />
        </div>
      </div>
    </>
  );
};

export default TokenPair;
