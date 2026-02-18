"use client";

import { switchChain } from "@wagmi/core";
import { useAccount, useConfig } from "wagmi";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { useSwapStore, useLPStore } from "@/store/useDexStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const chains = [
  {
    id: 56,
    name: "BSC",
    icon: "https://etherscan.io/token/images/binancebnb_32.svg",
  },
  {
    id: 1,
    name: "Ethereum",
    icon: "https://etherscan.io/images/svg/brands/ethereum-original.svg",
  },
  {
    id: 8453,
    name: "Base",
    icon: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
  },
  ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
    ? [
        {
          id: 97,
          name: "BSC Testnet",
          icon: "/icons/bscTest.png",
        },
      ]
    : []),
];

export default function ChainSelector({ noBlackBG }: { noBlackBG?: boolean }) {
  const config = useConfig();
  const { chainId } = useAccount();
  const [selectedChain, setSelectedChain] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    setFromToken,
    setToToken,
    setFromTokenBalance,
    setToTokenBalance,
    setFromTokenInputAmount,
    setToTokenInputAmount,
  } = useSwapStore();
  const {
    setFromLPToken,
    setToLPToken,
    setFromLPTokenBalance,
    setToLPTokenBalance,
    setFeeTier,
    setFromLPTokenInputAmount,
    setToLPTokenInputAmount,
  } = useLPStore();

  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (chainId) {
      setSelectedChain(chainId.toString());
    }
  }, [chainId]);

  // Get selected chain name
  const selectedChainName = useMemo(() => {
    const chain = chains.find((c) => c.id.toString() === selectedChain);
    return chain ? chain.name : null;
  }, [selectedChain]);

  const MAX_VISIBLE_CHAINS = isSmallScreen ? 4 : 6;
  const visibleChains = chains.slice(0, MAX_VISIBLE_CHAINS);
  const overflowChains = chains.slice(MAX_VISIBLE_CHAINS);
  const hasOverflow = chains.length > MAX_VISIBLE_CHAINS;

  const handleSwitchChain = async (newChainId: number) => {
    // console.log("Switching to chain:", newChainId);

    try {
      await switchChain(config, { chainId: newChainId });
      setSelectedChain(newChainId.toString());

      // Clear all token states when switching chains
      setFromToken(null);
      setToToken(null);
      setFromTokenBalance("");
      setToTokenBalance("");
      setFromTokenInputAmount("");
      setToTokenInputAmount("");
      setFromLPToken(null);
      setToLPToken(null);
      setFromLPTokenBalance("");
      setToLPTokenBalance("");
      setFeeTier("0.3");
      setFromLPTokenInputAmount("");
      setToLPTokenInputAmount("");

      // Update URL with new chainId (pure client-side)
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(searchParams.toString());
        params.set("chainId", newChainId.toString());

        // Clear swap-specific parameters when switching chains
        params.delete("from");
        params.delete("to");
        params.delete("amount");
        params.delete("contribute");

        const queryString = params.toString();
        const newUrl = queryString ? `?${queryString}` : "";

        // Use pure browser History API - no Next.js router
        try {
          window.history.replaceState(null, "", newUrl);
        } catch (error) {
          console.warn("Chain selector URL update failed:", error);
        }
      }
    } catch (error) {
      console.error("Error switching chain:", error);
    }
  };

  const handleButtonClick = (chainId: number) => {
    if (!address) {
      openConnectModal?.();
    } else {
      handleSwitchChain(chainId);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 w-full">
      <p className="ml-2 text-sm font-normal dark:text-[#FFFFFF99] text-[#00000099]">
        Network :{" "}
        {address
          ? selectedChainName
            ? selectedChainName
            : "No Network Selected"
          : "Connect Wallet to select a chain"}
      </p>
      <div className="flex flex-wrap gap-3 w-full">
        {visibleChains.map((chain) => (
          <Button
            key={chain.id}
            onClick={() => handleButtonClick(chain.id)}
            className={`
              flex flex-col items-center justify-center p-2 
              border-[2px] rounded-[12px] transition-all
              hover:cursor-pointer
              ${
                selectedChain === chain.id.toString()
                  ? "border-primary bg-gray-300 dark:bg-gray-300/20"
                  : "dark:bg-black bg-white dark:border-[#ffffff14] border-gray-300 hover:bg-[#cecccce9] dark:hover:bg-[#3c3c3ce9]"
              }  w-[50px] h-[50px]
            `}
            disabled={!address}
            title={
              address
                ? `Switch to ${chain.name}`
                : "Connect wallet to select chain"
            }
          >
            <Image
              src={chain.icon}
              alt={chain.name}
              width={32}
              height={32}
              className="rounded-full w-8 h-8"
            />
          </Button>
        ))}
        {/* show dropdown when there are more than max visible chains */}
        {hasOverflow && (
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                className={`
                  flex flex-row items-center justify-center p-2 
                  border-[2px] rounded-[12px] transition-all
                  hover:cursor-pointer
                  dark:border-[#ffffff14] border-gray-300 
                  hover:bg-[#cecccce9] dark:hover:bg-[#3c3c3ce9]
                  bg:white
                  dark:bg-black w-[50px] h-[50px]
                `}
                disabled={!address}
                title={
                  address ? "More networks" : "Connect wallet to select chain"
                }
              >
                <span className="text-lg font-semibold">
                  +{overflowChains.length}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-white dark:bg-[#1a1a1a] border-[2px] dark:border-[#ffffff14] rounded-[12px] p-2"
              align="end"
            >
              {overflowChains.map((chain) => (
                <DropdownMenuItem
                  key={chain.id}
                  onClick={() => handleButtonClick(chain.id)}
                  className={`
                    flex flex-row items-center gap-3 p-3 rounded-[8px]
                    hover:cursor-pointer hover:bg-[#cecccce9] dark:hover:bg-[#3c3c3ce9]
                    ${
                      selectedChain === chain.id.toString()
                        ? "bg-gray-300 dark:bg-gray-300 border-[2px] border-primary"
                        : ""
                    }
                  `}
                >
                  <Image
                    src={chain.icon}
                    alt={chain.name}
                    width={24}
                    height={24}
                    className="rounded-full w-6 h-6"
                  />
                  <span className="text-sm font-medium">{chain.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
