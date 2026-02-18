"use client";
import React from "react";
import { useLPStore } from "@/store/useDexStore";
import { FeeTier } from "@/interfaces/index.i";

const FeeTierCard: React.FC<{ fee: FeeTier }> = ({ fee }) => {
  const { setFeeTier, setTickSpace, setBasePrice } = useLPStore();
  const feeHandler = (fee: number, value: number) => {
    setFeeTier(fee.toString());
    // console.log("fc setTickSpace", value);
    setBasePrice("");
    setTickSpace(value);
  };
  return (
    <div
      onClick={() => feeHandler(fee.fee, fee.value)}
      className="flex flex-col w-full flex-grow p-2 border border-primary rounded-2xl hover:bg-[#1A1A1A] hover:cursor-pointer"
    >
      <div className="text-sm font-medium inline-flex justify-center items-center">
        {fee.fee}%
      </div>
      <div className="text-[10px] border border-primary p-1 rounded-lg mt-1 mx-auto text-center text-primary">
        No Data
      </div>
    </div>
  );
};

export default FeeTierCard;
