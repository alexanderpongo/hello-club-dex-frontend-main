import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { chains } from "@/config/chains";
import { useAccount } from "wagmi";
import Link from "next/link";
import { Hex } from "viem";
import Image from "next/image";

interface TokenPairProps {
  token0Symbol: string;
  token0LogoURI: string;
  token1Symbol: string;
  token1LogoURI: string;
  poolId: string;
  poolAddress: Hex;
  chainId: number;
}

const TokenPair: React.FC<TokenPairProps> = (props) => {
  const {
    token0Symbol,
    token0LogoURI,
    token1Symbol,
    token1LogoURI,
    poolId,
    poolAddress,
    chainId,
  } = props;

  const defaultChainId = 56;

  const effectiveChainId = chainId ?? defaultChainId;
  const token0Initial = (token0Symbol?.trim()?.charAt(0) ?? "").toUpperCase();

  const chain = chains.find((c) => c.chainId === effectiveChainId);

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Avatar className="w-[30px] h-[30px]">
          <AvatarImage
            src={token0LogoURI}
            alt={token0Symbol}
            width={25}
            height={25}
          />
          <AvatarFallback>{token0Initial}</AvatarFallback>
        </Avatar>
        <div className="w-[18px] h-[18px] bg-gradient-to-r from-[#A855F7] to-[#3B82F6] rounded-full absolute bottom-0 right-[-4px] text-[8px] font-bold border-2 border-black items-center justify-center flex">
          {/* {chainInitial} */}
          <Image
            src={chain?.image || ""}
            width={0}
            height={0}
            alt={chain?.name || "chain logo"}
            className="w-[15px] h-[15px] rounded-full object-contain"
          />
        </div>
      </div>
      <div>
        <span className="font-lato text-white text-sm leading-5">
          {token0Symbol}
        </span>
        <span className="mx-1 font-lato text-[#9CA3AF] text-xs leading-4 ">
          /
        </span>
        <span className="text-[#9CA3AF] font-lato text-xs leading-4 ">
          {token1Symbol}
        </span>
      </div>
    </div>
  );
};

export default TokenPair;
