"use client";
import React from "react";
import { useLPStore } from "@/store/useDexStore";
import { FeeTier } from "@/interfaces/index.i";
import { CircleCheck } from "lucide-react";

const LPFeeTierCard: React.FC<{ fee: FeeTier }> = ({ fee }) => {
  const { feeTier, setFeeTier, setTickSpace, setPoolFee } = useLPStore();
  const feeHandler = (fee: number, value: number) => {
    setFeeTier(fee.toString());
    setTickSpace(value);
    setPoolFee(fee * 10000);
  };
  return (
    <div
      onClick={() => feeHandler(fee.fee, fee.value)}
      className={`flex flex-col w-full flex-grow p-3 border border-primary rounded-xl dark:hover:bg-[#1A1A1A] hover:cursor-pointer space-y-1 ${
        feeTier === fee.fee.toString()
          ? "bg-[#1A1A1A]/20 dark:bg-[#1A1A1A]"
          : ""
      } `}
    >
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm font-medium inline-flex justify-start items-center">
          {fee.fee}%
        </div>
        {feeTier === fee.fee.toString() && <CircleCheck className="h-4 w-4" />}
      </div>

      <p className="text-xs dark:text-[#ffffff] font-lato font-normal justify-start">
        {fee.desp}
      </p>
      <p className="text-xs dark:text-[#a1a1a1] font-lato font-normal justify-start">
        {fee.desp1}
      </p>
    </div>
  );
};

export default LPFeeTierCard;
