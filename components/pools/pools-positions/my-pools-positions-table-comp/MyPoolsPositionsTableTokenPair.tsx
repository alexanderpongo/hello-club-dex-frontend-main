import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChainInfo,
  SinglePoolData,
  SingleTokenInfo,
} from "@/types/trading-live-table.types";
import { chains } from "@/config/chains";
import { adjustTokenSymbol } from "@/lib/token-utils";
import {
  getPositionOneOftheTokenPair,
  getPositionTwoOftheTokenPair,
} from "@/lib/utils";

interface MyPoolsPositionsTableTokenPairProps {
  poolData: SinglePoolData;
  positionId: string;
}

const MyPoolsPositionsTableTokenPair: React.FC<
  MyPoolsPositionsTableTokenPairProps
> = (props) => {
  const { poolData, positionId } = props;

  const chainId =
    poolData.chain.id === "bsc"
      ? 56
      : poolData.chain.id === "ethereum"
      ? 1
      : poolData.chain.id === "base"
      ? 8453
      : 56;

  const chainInfo = chains.find((c) => c.chainId === Number(chainId));

  const positionOneOfTheTokenPair = getPositionOneOftheTokenPair(poolData);
  const positionTwoOfTheTokenPair = getPositionTwoOftheTokenPair(poolData);

  const adjustedToken0Symbol = adjustTokenSymbol(
    positionOneOfTheTokenPair.symbol,
    chainId
  );
  const adjustedToken1Symbol = adjustTokenSymbol(
    positionTwoOfTheTokenPair.symbol,
    chainId
  );

  const token0Initial = (
    positionOneOfTheTokenPair.symbol?.trim()?.charAt(0) ?? ""
  ).toUpperCase();
  const token1Initial = (
    positionTwoOfTheTokenPair.symbol?.trim()?.charAt(0) ?? ""
  ).toUpperCase();

  return (
    <div className="flex gap-2 items-center flex-col sm:flex-row">
      <div className="flex items-center ">
        <Avatar className="w-7 h-7 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2 ">
          <AvatarImage
            src={positionOneOfTheTokenPair.logo || ""}
            alt={adjustedToken0Symbol}
            width={28}
            height={28}
            // className="w-6 h-6  rounded-full bg-white/10 object-contain"
          />
          <AvatarFallback>{token0Initial}</AvatarFallback>
        </Avatar>
        <Avatar className="w-6 h-6 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white z-10">
          <AvatarImage
            src={positionTwoOfTheTokenPair.logo || ""}
            alt={adjustedToken1Symbol}
            width={28}
            height={28}
            // className="w-6 h-6  rounded-full bg-white/10 object-contain"
          />
          <AvatarFallback>{token1Initial}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-center gap-1 w-[100px] sm:w-full">
        <div className="sm:text-sm text-[10px]  dark:text-white text-black font-medium font-lato ">
          {adjustedToken0Symbol} / {adjustedToken1Symbol}
        </div>
        <span className="text-gray-500 font-normal">#{positionId}</span>
      </div>
    </div>
  );
};

export default MyPoolsPositionsTableTokenPair;
