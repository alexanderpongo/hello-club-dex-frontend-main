import Image from "next/image";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { chains } from "@/config/chains";
import { adjustTokenSymbol } from "@/lib/token-utils";
import { IPool } from "@/types/my-positions.types";
import {
  getPositionOneOftheTokenPairBasedOnTokenAddress,
  getPositionTwoOftheTokenPairBasedOnTokenAddress,
} from "@/lib/utils";

interface TokenPairProps {
  chain: string;
  pool: IPool;
  hideChain?: boolean;
}

const TokenPair: React.FC<TokenPairProps> = (props) => {
  const { chain, pool, hideChain = false } = props;
  const chainId =
    chain === "bsc"
      ? 56
      : chain === "ethereum"
        ? 1
        : chain === "base"
          ? 8453
          : 56;

  const position1 = getPositionOneOftheTokenPairBasedOnTokenAddress(pool);
  const position2 = getPositionTwoOftheTokenPairBasedOnTokenAddress(pool);

  const chainInfo = chains.find((c) => c.chainId === Number(chainId));
  const adjustedToken0Symbol = adjustTokenSymbol(position1.symbol, chainId);
  const adjustedToken1Symbol = adjustTokenSymbol(position2.symbol, chainId);

  const token0Initial = (
    position1.symbol?.trim()?.charAt(0) ?? ""
  ).toUpperCase();
  const token1Initial = (
    position2.symbol?.trim()?.charAt(0) ?? ""
  ).toUpperCase();
  return (
    <div className="flex items-center gap-3 cursor-pointer sm:w-full w-[150px]">
      <div className="flex items-center">
        <Avatar className="w-8 h-8 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2.5">
          <AvatarImage
            src={position1.logo || ""}
            alt={adjustedToken0Symbol}
            width={32}
            height={32}
          // className="w-6 h-6  rounded-full bg-white/10 object-contain"
          />
          <AvatarFallback>{token0Initial}</AvatarFallback>
        </Avatar>
        <Avatar className="w-6 h-6 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white z-10">
          <AvatarImage
            src={position2.logo || ""}
            alt={adjustedToken1Symbol}
            width={24}
            height={24}
          // className="w-6 h-6  rounded-full bg-white/10 object-contain"
          />
          <AvatarFallback>{token1Initial}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-[14px] dark:text-white text-black font-bold uppercase tracking-tight">
            {adjustedToken0Symbol} / {adjustedToken1Symbol}
          </div>
          {!hideChain && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-lato font-normal uppercase whitespace-nowrap bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded-sm">
              <Image
                src={chainInfo?.image || ""}
                alt=""
                width={10}
                height={10}
                className="rounded-full w-2.5 h-2.5 object-contain opacity-80"
              />
              <span>
                {chainInfo?.chainId === 1
                  ? "ETH"
                  : chainInfo?.chainId === 56
                    ? "BSC"
                    : chainInfo?.chainId === 8453
                      ? "BASE"
                      : ""}{" "}
                CHAIN
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenPair;
