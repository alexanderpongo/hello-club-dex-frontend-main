"use client";
import React, { useEffect, useState } from "react";
import StatSection from "./StatSection";
import Transactions from "./Transactions";
import {
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
} from "@/service/blockchain.service";
import { useAccount, useConfig } from "wagmi";
import { chains } from "@/config/chains";
import { TokenType } from "@/interfaces/index.i";
import { suggestedToken } from "@/config/suggest-tokens";
import { useSwapStore } from "@/store/useDexStore";
import { useRouter } from "next/navigation";
import { BadgeInfo, ChevronLeft } from "lucide-react";
import { getTokenDisplayInfo } from "@/lib/token-utils";
import clsx from "clsx";

interface PairDetailsProps {
  id: string;
}

function PairDetails({ id }: PairDetailsProps) {
  const { chainId } = useAccount();
  const config = useConfig();
  const router = useRouter();
  const chain = chains.filter((chain) => chain.chainId == chainId)[0];

  const { dataRow } = useSwapStore();

  // Early return if dataRow is not available
  if (!dataRow || !dataRow.result) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
      chainId,
      dataRow?.result[2]!.toLowerCase()
    );
    const tokenSymbol = await fetchTokenSymbol(
      config,
      chainId,
      dataRow?.result[2]!.toLowerCase()
    );
    const tokenDecimals = await fetchTokenDecimals(
      config,
      chainId,
      dataRow?.result[2]!.toLowerCase()
    );
    setTokenA({
      chainId: chainId as number,
      address: dataRow?.result[2].toLowerCase(),
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
      dataRow?.result[3]!.toLowerCase()
    );
    const tokenSymbol = await fetchTokenSymbol(
      config,
      chainId,
      dataRow?.result[3]!.toLowerCase()
    );
    const tokenDecimals = await fetchTokenDecimals(
      config,
      chainId,
      dataRow?.result[3]!.toLowerCase()
    );
    setTokenB({
      chainId: chainId as number,
      address: dataRow?.result[3].toLowerCase(),
      name: tokenName as string,
      symbol: tokenSymbol as string,
      decimals: tokenDecimals as number,
      logoURI: "",
    });
  };

  const fetchTokenA = async () => {
    setIsLoadingTokenA(true);
    try {
      const tokenA = await fetchTokenDetail(dataRow.result[2]);
      if (tokenA) {
        setTokenA(tokenA);
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
      const tokenB = await fetchTokenDetail(dataRow?.result[3]);
      if (tokenB) {
        setTokenB(tokenB);
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
    if (chainId && dataRow?.result[2]!) {
      fetchTokenA();
    }
    // console.log("token a", tokenA);
  }, []);

  useEffect(() => {
    // console.log("dataRowdataRowdataRowVBBB", dataRow.result[3]);

    if (chainId && dataRow?.result[3]!) {
      fetchTokenB();
    }
    // console.log("token b", tokenB);
  }, []);

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      {/* Back Button */}
      <div
        className={clsx(
          "my-3",
          parseFloat(dataRow?.liquidity) !== 0 && "md:px-[140px]"
        )}
      >
        <div
          className="flex gap-2 text-primary cursor-pointer "
          onClick={handleBack}
        >
          <div>
            <ChevronLeft className="my-auto" />
          </div>

          <div>
            <p className="my-auto">Go Back</p>
          </div>
        </div>
      </div>

      {/* <div className="flex flex-col md:flex-row md:justify-between w-full md:px-[140px] gap-5">
        <div>
          <Transactions id={id} tokenA={tokenA} tokenB={tokenB} chain={chain} />
        </div>
        <div>
          <StatSection />
        </div>
      </div> */}
      {parseFloat(dataRow?.liquidity) !== 0 ? (
        <div className="flex flex-col md:flex-row md:justify-between w-full max-w-[1200px] mx-auto px-4 md:px-[140px] gap-5">
          <div className="w-full">
            <Transactions
              id={id}
              tokenA={tokenA}
              tokenB={tokenB}
              chain={chain}
            />
          </div>
          <div className="w-full">
            <StatSection id={id} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col my-32 justify-center items-center w-full h-full space-y-2">
          <div className="py-2 flex gap-2 rounded-xl text-gray-400 text-start items-start text-sm">
            <BadgeInfo className="!h-[24px] !w-[24px]" />
          </div>

          <div className="uppercase font-barlow text-black dark:text-white text-xl">
            <span>No liquidity available</span>
          </div>
          <span className="text-sm text-gray-400 ">
            This pool currently has no liquidity.
          </span>
        </div>
      )}
    </>
  );
}

export default PairDetails;
