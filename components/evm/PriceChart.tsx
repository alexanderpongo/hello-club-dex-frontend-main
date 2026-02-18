"use client";
import React from "react";
import { useLPStore } from "@/store/useDexStore";
import { ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { LPChart } from "./LPChart";
import { Card } from "../ui/card";
// import { LPChart } from "./LPChart1";

const PriceChart = () => {
  const { fromLPToken, toLPToken } = useLPStore();
  return (
    <div className="py-2 flex flex-col">
      <div className="flex flex-row justify-between items-center w-full pt-2">
        <div className="flex justify-start flex-1">
          <div className="text-xs text-[#FFFFFF99]">Current Price:</div>
          <div className="text-xs text-[#ffffff] ml-0.5">
            0.23 {fromLPToken?.symbol} per {toLPToken?.symbol}
          </div>
        </div>
        <div className="flex flex-row justify-end space-x-2 items-center">
          <ZoomIn
            size={16}
            className="text-[#ffffff] hover:text-primary hover:cursor-pointer"
          />
          <ZoomOut
            size={16}
            className="text-[#ffffff] hover:text-primary hover:cursor-pointer"
          />
        </div>
      </div>
      <div className="w-full h-fit py-2">
        {fromLPToken && toLPToken ? (
          <LPChart />
        ) : (
          <Card className="border border-[#FFFFFF0D] bg-[#FFFFFF14] flex flex-col h-[194px] justify-center">
            <Image
              alt="chart"
              width={100}
              height={100}
              className="w-[70px] h-[70px] items-center flex justify-center mx-auto"
              src="/assets/hello-logo.svg"
            />
            <div className="text-center  text-[#ffffff99] font-lato font-bold">
              Your position will appear here.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PriceChart;
