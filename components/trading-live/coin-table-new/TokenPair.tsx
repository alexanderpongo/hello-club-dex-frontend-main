import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChainInfo, TokenInfo } from "@/types/trading-live-table.types";
import Image from "next/image";
import React from "react";
import { chains } from "@/config/chains";
import { adjustTokenSymbol, getCorrectLogoURI } from "@/lib/token-utils";

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

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Avatar className="w-[30px] h-[30px]">
          <AvatarImage
            src={token0.logo || ""}
            alt={adjustedToken0Symbol}
            width={24}
            height={24}
            className="w-6 h-6  rounded-full bg-white/10 object-contain"
          />
          <AvatarFallback>{token0Initial}</AvatarFallback>
        </Avatar>
        <div className="w-[18px] h-[18px] bg-gradient-to-r from-[#A855F7] to-[#3B82F6] rounded-full absolute bottom-0 right-[-4px] text-[8px] font-bold border-2 border-black items-center justify-center flex">
          {/* {chainInitial} */}
          <Image
            src={chainInfo?.image || ""}
            width={0}
            height={0}
            alt={chainInfo?.name || "chain logo"}
            className="w-[15px] h-[15px] rounded-full object-contain"
          />
        </div>
      </div>
      <div>
        <span className="font-lato dark:text-white text-black text-sm leading-5">
          {token0.symbol}
        </span>
        <span className="mx-1 font-lato text-[#9CA3AF] text-xs leading-4 ">
          /
        </span>
        <span className="text-[#9CA3AF] font-lato text-xs leading-4 ">
          {token1.symbol}
        </span>
      </div>
    </div>
  );
};

export default TokenPair;
