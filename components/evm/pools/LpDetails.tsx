"use client";
import { chains } from "@/config/chains";
import { LucideLoader2 } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { useAccount, useConfig } from "wagmi";
import { suggestedToken } from "@/config/suggest-tokens";
import { TokenType } from "@/interfaces/index.i";
import {
  fetchTokenName,
  fetchTokenDecimals,
  fetchTokenSymbol,
} from "@/service/blockchain.service";
import { getInitials } from "@/lib/utils";
import { useLPStore } from "@/store/useDexStore";
// import { fallbackImage } from "@/lib/fallback";

const LpDetails = ({ row }: { row: any }) => {
  const { chainId, address } = useAccount();
  const config = useConfig();
  const chain = chains.filter((chain) => chain.chainId == chainId)[0];
  const { setLpDetailsTokenA, setLpDetailsTokenB } = useLPStore();

  const [tokenA, setTokenA] = useState<TokenType>();
  const [isLoadingTokenA, setIsLoadingTokenA] = useState<boolean>(false);
  const [tokenB, setTokenB] = useState<TokenType>();
  const [isLoadingTokenB, setIsLoadingTokenB] = useState<boolean>(false);

  const suggestedTokens: TokenType[] = suggestedToken[chainId ?? "default"];

  const fetchTokenDetail = async (address: string) => {
    try {
      // First check if the token exists in suggested tokens
      const suggestedToken = suggestedTokens?.find(
        (token) => token.address.toLowerCase() === address.toLowerCase()
      );
      console.log("suggestedToken", suggestedToken);

      if (suggestedToken) {
        return suggestedToken;
      }

      // If not found in suggested tokens, return null to fallback to contract calls
      return null;
    } catch (error) {
      console.error("Error while fetching tokens", error);
      return null;
    }
  };

  const fetchTokenADetailsFromContract = async () => {
    const tokenName = await fetchTokenName(
      config,
      chainId ?? 97,
      row.original.result[2].toLowerCase()
    );
    const tokenSymbol = await fetchTokenSymbol(
      config,
      chainId ?? 97,
      row.original.result[2].toLowerCase()
    );
    const tokenDecimals = await fetchTokenDecimals(
      config,
      chainId ?? 97,
      row.original.result[2].toLowerCase()
    );
    setTokenA({
      chainId: (chainId as number) ?? (97 as number),
      address: row.original.result[2].toLowerCase(),
      name: tokenName as string,
      symbol: tokenSymbol as string,
      decimals: tokenDecimals as number,
      logoURI: "",
    });
  };

  const fetchTokenBDetailsFromContract = async () => {
    const tokenName = await fetchTokenName(
      config,
      chainId,
      row.original.result[3].toLowerCase()
    );
    const tokenSymbol = await fetchTokenSymbol(
      config,
      chainId,
      row.original.result[3].toLowerCase()
    );
    const tokenDecimals = await fetchTokenDecimals(
      config,
      chainId,
      row.original.result[3].toLowerCase()
    );
    setTokenB({
      chainId: chainId as number,
      address: row.original.result[3].toLowerCase(),
      name: tokenName as string,
      symbol: tokenSymbol as string,
      decimals: tokenDecimals as number,
      logoURI: "",
    });
  };

  const fetchTokenA = async () => {
    setIsLoadingTokenA(true);
    try {
      const tokenA = await fetchTokenDetail(row.original.result[2]);
      if (tokenA) {
        setTokenA(tokenA);
        setLpDetailsTokenA(tokenA);
      } else {
        // Fallback to contract call if not found in suggested tokens
        await fetchTokenADetailsFromContract();
      }
    } catch (error) {
      console.error("Error fetching token A details:", error);
      // Try to fallback to contract call even if token lookup fails
      try {
        await fetchTokenADetailsFromContract();
      } catch (contractError) {
        console.error("Error fetching token A from contract:", contractError);
      }
    } finally {
      setIsLoadingTokenA(false);
    }
  };

  const fetchTokenB = async () => {
    setIsLoadingTokenB(true);
    try {
      const tokenB = await fetchTokenDetail(row.original.result[3]);
      if (tokenB) {
        setTokenB(tokenB);
        setLpDetailsTokenB(tokenB);
      } else {
        // Fallback to contract call if not found in suggested tokens
        await fetchTokenBDetailsFromContract();
      }
    } catch (error) {
      console.error("Error fetching token B details:", error);
      // Try to fallback to contract call even if token lookup fails
      try {
        await fetchTokenBDetailsFromContract();
      } catch (contractError) {
        console.error("Error fetching token B from contract:", contractError);
      }
    } finally {
      setIsLoadingTokenB(false);
    }
  };

  useEffect(() => {
    if ((chainId ?? 97) && row.original.result[2]) {
      fetchTokenA();
    }
  }, [row.original?.result[2]!, chainId]);

  useEffect(() => {
    if ((chainId ?? 97) && row.original.result[3]) {
      fetchTokenB();
    }
  }, [row.original?.result[3]!, chainId]);

  // useEffect(() => {
  //   console.log("print row", row.original.result[2]);
  // }, []);

  return (
    <div className="flex justify-start items-center">
      {isLoadingTokenA || isLoadingTokenB ? (
        <LucideLoader2 className="animate-spin ml-3" />
      ) : (
        <>
          <div className="w-[78px] flex flex-row justify-start items-end relative">
            {tokenA?.logoURI ? (
              <Image
                src={tokenA?.logoURI as string}
                alt={tokenA?.name as string}
                width={0}
                height={0}
                sizes="100vw"
                className="rounded-full w-[30px] h-[30px] border-[2px] z-10"
              />
            ) : (
              <div className="rounded-full w-[30px] h-[30px] border-[2px] border-[#1a1a1a] flex items-center justify-center bg-[#1a1a1a] text-white text-sm font-bold">
                {getInitials(tokenA?.name ?? "NA")}
              </div>
            )}
            {tokenB?.logoURI ? (
              <Image
                src={tokenB?.logoURI as string}
                alt={tokenB?.name as string}
                width={0}
                height={0}
                sizes="100vw"
                className="rounded-full w-[30px] h-[30px] border-[2px] absolute left-6 z-20 bg-[#000000]"
              />
            ) : (
              <div className="rounded-full w-[30px] h-[30px] border-[2px] flex items-center justify-center bg-gray-200 text-black text-sm font-bold">
                {getInitials(tokenB?.name ?? "NA")}
              </div>
            )}
          </div>
          <div>
            <div>
              {tokenA?.symbol} / {tokenB?.symbol}
            </div>
            {address && (
              <div className="flex flex-row justify-center items-center">
                {chain?.image && (
                  <Image
                    src={chain?.image}
                    alt={chain?.name}
                    width={0}
                    height={0}
                    sizes="100vw"
                    //   className="rounded-full w-[18px] h-[18px] border-[2px] border-[#0F172A] absolute left-12 z-30"
                    className="rounded-full w-[18px] h-[18px] border-[2px] border-[#0F172A] mr-[2px]"
                  />
                )}{" "}
                {chain.name}
              </div>
            )}
            {/* <div className="flex gap-1 text-[10px]  font-bold">
              <div className="w-[29px] rounded-full bg-[#EC489933] text-[#EC4899] text-center">
                V3
              </div>
              <div className="w-[39px] rounded-full text-center bg-[#00ffff] text-[#000]">
                {row.original?.result[4]! / 10000}%
              </div>
            </div> */}
          </div>
        </>
      )}
    </div>
  );
};

export default LpDetails;
