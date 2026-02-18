import { getInitials } from "@/lib/utils";
import { useSwapStore } from "@/store/useDexStore";
import React from "react";

function PairTokens() {
  const { dataRow, pairFromToken, pairToToken } = useSwapStore();
  return (
    <div>
      {" "}
      <div className={`flex flex-row w-full items-center justify-start `}>
        <div className="w-[78px] flex flex-row justify-start items-end relative">
          <div className="rounded-full w-[35px] h-[35px] border-[2px] border-[#000] flex items-center justify-center bg-[#000] text-white text-sm font-bold">
            {getInitials(pairFromToken?.name! ?? "NA")}
          </div>
          <div className="rounded-full w-[33px] h-[33px] border-[2px] flex items-center justify-center bg-gray-200 text-black text-sm font-bold">
            {getInitials(pairToToken?.name! ?? "NA")}
          </div>
        </div>
        <div className="flex flex-row justify-center items-center gap-4">
          <div>
            {pairFromToken?.symbol!} / {pairToToken?.symbol!}
          </div>

          {dataRow && (
            <div className="flex gap-1 text-[10px]  font-bold">
              <div className="w-[29px] rounded-full bg-[#EC489933] text-[#EC4899] text-center">
                V3
              </div>
              <div className="w-[39px] rounded-full text-center bg-primary text-[#000]">
                {dataRow?.result[4]! / 10000}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PairTokens;
