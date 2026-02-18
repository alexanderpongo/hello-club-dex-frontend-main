import { ChainInfo, TokenInfo } from "@/types/trading-live-table.types";
import Image from "next/image";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { chains } from "@/config/chains";
import { adjustTokenSymbol } from "@/lib/token-utils";

interface TokenPairProps {
  chain: ChainInfo;
  token0: TokenInfo;
  token1: TokenInfo;
}

const TokenPair: React.FC<TokenPairProps> = (props) => {
  const { chain, token0, token1 } = props;
  const chainId =
    chain.id === "bsc"
      ? 56
      : chain.id === "ethereum"
      ? 1
      : chain.id === "base"
      ? 8453
      : 56;

  const chainInfo = chains.find((c) => c.chainId === Number(chainId));
  const adjustedToken0Symbol = adjustTokenSymbol(token0.symbol, chainId);
  const adjustedToken1Symbol = adjustTokenSymbol(token1.symbol, chainId);

  const token0Initial = (token0.symbol?.trim()?.charAt(0) ?? "").toUpperCase();
  const token1Initial = (token1.symbol?.trim()?.charAt(0) ?? "").toUpperCase();
  return (
    <div className="flex items-center gap-3 cursor-pointer sm:w-full w-[150px]">
      <div className="flex items-center">
        <Avatar className="w-7 h-7 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2 ">
          <AvatarImage
            src={token0.logo || ""}
            alt={adjustedToken0Symbol}
            width={28}
            height={28}
            // className="w-6 h-6  rounded-full bg-white/10 object-contain"
          />
          <AvatarFallback>{token0Initial}</AvatarFallback>
        </Avatar>
        <Avatar className="w-5 h-5 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white z-10">
          <AvatarImage
            src={token1.logo || ""}
            alt={adjustedToken1Symbol}
            width={28}
            height={28}
            // className="w-6 h-6  rounded-full bg-white/10 object-contain"
          />
          <AvatarFallback>{token1Initial}</AvatarFallback>
        </Avatar>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <div className="text-sm dark:text-white text-black font-medium">
            {adjustedToken0Symbol} / {adjustedToken1Symbol}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
          <Image
            src={chainInfo?.image || ""}
            alt=""
            width={12}
            height={12}
            className="rounded-full w-3 h-3 object-contain"
          />
          <span className="font-family: Lato, sans-serif; font-weight: 400;">
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
      </div>
    </div>
  );
};

export default TokenPair;
