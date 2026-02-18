"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";
import { useAccount, useConfig } from "wagmi";
import { TokenType } from "@/interfaces/index.i";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { switchChain } from "@wagmi/core";
import { suggestedToken } from "@/config/suggest-tokens";
import { useConnectModal } from "@rainbow-me/rainbowkit";

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

export default function ReferralLinkCard({
  referralLink,
  isLoading = false,
}: {
  referralLink?: string;
  isLoading?: boolean;
}) {
  const { address, chainId } = useAccount();
  const config = useConfig();
  const { openConnectModal } = useConnectModal();
  const [isCopied, setIsCopied] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState<string>("");
  const [fromToken, setFromToken] = useState<string>("");
  const [toToken, setToToken] = useState<string>("");
  const [generatedLink, setGeneratedLink] = useState<string>("");

  // Get tokens for the selected chain
  const availableTokens = useMemo(() => {
    if (!selectedChainId) return [];
    return suggestedToken[Number(selectedChainId)] || [];
  }, [selectedChainId]);

  // Set initial chain
  useEffect(() => {
    if (chainId) {
      setSelectedChainId(chainId.toString());
    }
  }, [chainId]);

  const handleCopy: (text: string) => Promise<void> = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleChainChange = async (value: string) => {
    setSelectedChainId(value);
    setFromToken("");
    setToToken("");

    // Switch the actual wallet chain
    try {
      await switchChain(config, { chainId: Number(value) });
    } catch (error) {
      console.error("Error switching chain:", error);
    }
  };

  // Generate the referral link with selected parameters
  useEffect(() => {
    if (referralLink) {
      let link = referralLink;

      // Add chainId if selected
      if (selectedChainId) {
        link += `&chainId=${selectedChainId}`;
      }

      // Add from token if selected
      if (fromToken) {
        link += `&from=${fromToken}`;
      }

      // Add to token if selected
      if (toToken) {
        link += `&to=${toToken}`;
      }

      setGeneratedLink(link);
    } else {
      setGeneratedLink("");
    }
  }, [referralLink, selectedChainId, fromToken, toToken]);

  const getTokenByAddress = (address: string): TokenType | undefined => {
    return availableTokens.find((token) => token.address === address);
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-formula font-normal uppercase text-primary">
        Share & Earn
      </h2>

      {/* Outer Card Container */}
      <Card className="dark:bg-[#121212] bg-slate-100 border-black/10 dark:border-[rgba(255,255,255,0.03)] p-4 rounded-xl border">
        <CardContent className="p-0 space-y-4">
          {chainId !== 8453 && (
            <p className="text-xs text-muted-foreground font-sans">
              Share your link and earn{" "}
              <span className="text-primary font-semibold">20% of trading fees</span>
            </p>
          )}

          {!address ? (
            // Show connect wallet button when not connected
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <p className="text-sm text-muted-foreground font-sans text-center">
                Connect your wallet to generate your referral link
              </p>
              <Button
                onClick={openConnectModal}
                className="button-primary"
              >
                Connect Wallet
              </Button>
            </div>
          ) : chainId === 8453 ? (
            // Show message for Base chain
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <p className="dark:text-[#a3a3a3] text-gray-500 font-sans">
                Referrals are not yet available for Base chain
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Network Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-sans uppercase text-muted-foreground">
                    Network
                  </label>
                  <Select value={selectedChainId} onValueChange={handleChainChange}>
                    <SelectTrigger className="w-full dark:bg-dark border-[2px] dark:border-[#ffffff14] rounded-[0.625rem]">
                      <SelectValue placeholder="Select a network">
                        {selectedChainId && (
                          <div className="flex items-center gap-2">
                            <Image
                              src={
                                chains.find((c) => c.id === Number(selectedChainId))
                                  ?.icon || ""
                              }
                              alt="Chain"
                              width={20}
                              height={20}
                              className="rounded-full w-5 h-5 object-contain"
                            />
                            <span>
                              {chains.find((c) => c.id === Number(selectedChainId))
                                ?.name}
                            </span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#1a1a1a] border-[2px] dark:border-[#ffffff14]">
                      <SelectGroup>
                        <SelectLabel>Networks</SelectLabel>
                        {chains.map((chain) => (
                          <SelectItem
                            key={chain.id}
                            value={chain.id.toString()}
                            className="hover:cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Image
                                src={chain.icon}
                                alt={chain.name}
                                width={20}
                                height={20}
                                className="rounded-full w-5 h-5 object-contain"
                              />
                              <span>{chain.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {/* FROM Token */}
                <div className="space-y-2">
                  <label className="text-xs font-sans uppercase text-muted-foreground">
                    From
                  </label>
                  <Select value={fromToken} onValueChange={setFromToken}>
                    <SelectTrigger className="w-full dark:bg-dark border-[2px] dark:border-[#ffffff14] rounded-[0.625rem]">
                      <SelectValue placeholder="Select token">
                        {fromToken && getTokenByAddress(fromToken) && (
                          <div className="flex items-center gap-2">
                            <Image
                              src={getTokenByAddress(fromToken)?.logoURI || ""}
                              alt={getTokenByAddress(fromToken)?.symbol || ""}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <span>{getTokenByAddress(fromToken)?.symbol}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#1a1a1a] border-[2px] dark:border-[#ffffff14] max-h-[300px]">
                      <SelectGroup>
                        <SelectLabel>Tokens</SelectLabel>
                        {availableTokens.map((token) => (
                          <SelectItem
                            key={token.address}
                            value={token.address}
                            className="hover:cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Image
                                src={token.logoURI || ""}
                                alt={token.symbol}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                              <span>{token.symbol}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* TO Token */}
                <div className="space-y-2">
                  <label className="text-xs font-sans uppercase text-muted-foreground">
                    To
                  </label>
                  <Select value={toToken} onValueChange={setToToken}>
                    <SelectTrigger className="w-full dark:bg-dark border-[2px] dark:border-[#ffffff14] rounded-[0.625rem]">
                      <SelectValue placeholder="Select token">
                        {toToken && getTokenByAddress(toToken) && (
                          <div className="flex items-center gap-2">
                            <Image
                              src={getTokenByAddress(toToken)?.logoURI || ""}
                              alt={getTokenByAddress(toToken)?.symbol || ""}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <span>{getTokenByAddress(toToken)?.symbol}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#1a1a1a] border-[2px] dark:border-[#ffffff14] max-h-[300px]">
                      <SelectGroup>
                        <SelectLabel>Tokens</SelectLabel>
                        {availableTokens.map((token) => (
                          <SelectItem
                            key={token.address}
                            value={token.address}
                            className="hover:cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Image
                                src={token.logoURI || ""}
                                alt={token.symbol}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                              <span>{token.symbol}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generated Link Display */}
              {isLoading ? (
                <Skeleton className="h-10 w-full rounded-[0.625rem]" />
              ) : (
                <div className="bg-gray-100 dark:bg-black border dark:border-white/5 border-black/5 rounded-[0.625rem] p-1 pl-4 flex items-center justify-between gap-2">
                  <code className="flex-1 font-mono text-xs text-primary truncate">
                    {generatedLink || referralLink}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="button-primary text-xs m-1"
                    onClick={() => handleCopy(generatedLink || referralLink || "")}
                  >
                    <Copy className="w-3 h-3 mr-1.5" />
                    {isCopied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
