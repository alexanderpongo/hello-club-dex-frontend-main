"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { formatUnits } from "viem";
import { useUserTokens } from "@/hooks/useUserTokens";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { ChevronDown, ChevronLeft, Loader } from "lucide-react";
import Image from "next/image";
import { Separator } from "../ui/separator";
import { ChainConfigItemType, TokenType } from "@/interfaces/index.i";
import { useAccount, useConfig } from "wagmi";
import { InputSearch } from "../ui/input-search";
import { isAddress } from "viem";
import {
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
} from "@/service/blockchain.service";
import { useSwapStore } from "@/store/useDexStore";
import { useTokenStore } from "@/store/useTokenStore";
import { getInitials } from "@/lib/utils";
import { chainConfig } from "@/config/blockchain.config";
import { ScrollArea } from "../ui/scroll-area";
import ChainSelector from "./ChainSelector";
import { useHaptic } from "@/hooks/useHaptic";

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function TokenSelectDialog({
  selectedToken,
  setSelectedToken,
  isFromToken = false,
}: {
  selectedToken: any;
  setSelectedToken: React.Dispatch<React.SetStateAction<any>>;
  isFromToken?: boolean;
}) {
  const config = useConfig();
  const { address, chainId } = useAccount();
  const { triggerHaptic } = useHaptic();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [manualToken, setManualToken] = useState<TokenType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [swapTokenSelectWarning, setSwapTokenSelectWarning] =
    useState<string>("");
  const {
    data: userTokens = [],
    isLoading: isUserTokensLoading,
    error: userTokensError,
  } = useUserTokens();

  // Reference for the scrollable container
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Use shared token store
  const { combinedTokens } = useTokenStore();

  const chainConf: ChainConfigItemType = useMemo(
    () => chainConfig[chainId!] || chainConfig["default"],
    [chainId]
  );

  const {
    setFromTokenInputAmount,
    setToTokenInputAmount,
    setSwapPairAddresses,
    setIsAggregating,
    setAggregatorResult,
  } = useSwapStore();

  const handleOpenDialog = useCallback(() => {
    setSwapTokenSelectWarning("");
    setIsOpen(true);
    setSearchTerm("");
    setManualToken(null);
    setIsAggregating(false);
    setAggregatorResult(null);
  }, []);

  const fetchTokenDetails = useCallback(
    async (address: string) => {
      if (!isAddress(address.toLowerCase()) || !chainId) return;

      setIsLoading(true);
      try {
        const [tokenName, tokenSymbol, tokenDecimals] = await Promise.all([
          fetchTokenName(config, chainId, address.toLowerCase()),
          fetchTokenSymbol(config, chainId, address.toLowerCase()),
          fetchTokenDecimals(config, chainId, address.toLowerCase()),
        ]);

        setManualToken({
          chainId: chainId as number,
          address: address.toLowerCase(),
          name: tokenName as string,
          symbol: tokenSymbol as string,
          decimals: tokenDecimals as number,
          logoURI: "",
        });
      } catch (error) {
        console.error("Error fetching token details:", error);
        setManualToken(null);
      } finally {
        setIsLoading(false);
      }
    },
    [config, chainId]
  );

  // Use debounced search term for token fetching
  useEffect(() => {
    if (isAddress(debouncedSearchTerm.toLowerCase())) {
      fetchTokenDetails(debouncedSearchTerm);
    } else {
      setManualToken(null);
    }
  }, [debouncedSearchTerm, fetchTokenDetails]);

  const handleSelect = useCallback(
    (token: TokenType) => {
      if (!token) {
        setSwapTokenSelectWarning(
          "Please select a valid token before proceeding."
        );
        return;
      }
      triggerHaptic("light");
      setSelectedToken(token);
      setFromTokenInputAmount("");
      setToTokenInputAmount("");
      setSwapTokenSelectWarning("");
      setIsOpen(false);
      setSwapPairAddresses([]);
    },
    [setSelectedToken, setFromTokenInputAmount, setToTokenInputAmount, triggerHaptic]
  );

  // Memoize filtered tokens using debounced search term
  const filteredTokens = useMemo(() => {
    const userTokenAddresses = new Set(
      userTokens.map((t) => t.address.toLowerCase())
    );
    const availableTokens = combinedTokens.filter(
      (token) => !userTokenAddresses.has(token.address.toLowerCase())
    );

    const tokensToFilter = !debouncedSearchTerm ? availableTokens : availableTokens;

    if (!debouncedSearchTerm) return availableTokens.sort((a, b) => (a.symbol || "").localeCompare(b.symbol || ""));

    const term = debouncedSearchTerm.toLowerCase();
    return availableTokens
      .filter(
        (token) =>
          token?.name?.toLowerCase().includes(term) ||
          token?.symbol?.toLowerCase().includes(term) ||
          token?.address?.toLowerCase() === term
      )
      .sort((a, b) => (a.symbol || "").localeCompare(b.symbol || ""));
  }, [combinedTokens, debouncedSearchTerm, userTokens]);

  const filteredUserTokens = useMemo(() => {
    if (!debouncedSearchTerm) return [...userTokens].sort((a, b) => (a.symbol || "").localeCompare(b.symbol || ""));
    const term = debouncedSearchTerm.toLowerCase();
    return userTokens
      .filter(
        (token) =>
          token?.name?.toLowerCase().includes(term) ||
          token?.symbol?.toLowerCase().includes(term) ||
          token?.address?.toLowerCase() === term
      )
      .sort((a, b) => (a.symbol || "").localeCompare(b.symbol || ""));
  }, [userTokens, debouncedSearchTerm]);

  // Group tokens for alphabet scroll
  const groupedTokens = useMemo(() => {
    const groups: { [key: string]: TokenType[] } = {};

    // Combine user tokens and common tokens for the alphabetical view
    // if no search term is present
    if (searchTerm) return null;

    const allTokens = [...filteredUserTokens, ...filteredTokens];

    allTokens.forEach(token => {
      const firstLetter = (token.symbol || "#")[0].toUpperCase();
      const key = /^[A-Z]$/.test(firstLetter) ? firstLetter : "#";
      if (!groups[key]) groups[key] = [];
      groups[key].push(token);
    });

    return Object.keys(groups)
      .sort()
      .reduce((obj: any, key) => {
        obj[key] = groups[key];
        return obj;
      }, {});
  }, [filteredTokens, filteredUserTokens, searchTerm]);

  const alphabet = useMemo(() => {
    if (!groupedTokens) return [];
    return Object.keys(groupedTokens);
  }, [groupedTokens]);

  const scrollToSection = (letter: string) => {
    triggerHaptic("light");
    const section = sectionRefs.current[letter];
    if (section && scrollRef.current) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const addressAlreadyExists = useMemo(
    () =>
      isAddress(debouncedSearchTerm.toLowerCase()) &&
      filteredTokens.some(
        (token) =>
          token.address.toLowerCase() === debouncedSearchTerm.toLowerCase()
      ),
    [debouncedSearchTerm, filteredTokens]
  );

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild onClick={handleOpenDialog}>
          <Button
            variant={"link"}
            size={"sm"}
            className="w-full py-[9px] px-[10px] dark:bg-[#FFFFFF14] hover:no-underline flex flex-row justify-between items-center gap-[10px] rounded-[12px] border dark:border-[#FFFFFF0D]"
          >
            {selectedToken ? (
              <div className="flex flex-row space-x-2 items-center justify-center">
                {selectedToken?.logoURI ? (
                  <Image
                    src={selectedToken?.logoURI as string}
                    alt={selectedToken?.name as string}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-[24px] h-[24px] rounded-full dark:bg-[#000000]"
                  />
                ) : (
                  <div className="rounded-full w-[24px] h-[24px] border-[2px] flex items-center justify-center bg-gray-200 text-black text-xs font-bold">
                    {getInitials(selectedToken?.name)}
                  </div>
                )}
                <div className="text-xs sm:text-[13px] font-normal dark:text-white">
                  {selectedToken?.symbol ?? ""}
                </div>
              </div>
            ) : (
              <div className="text-xs sm:text-[13px] font-normal dark:text-white">
                Select a token
              </div>
            )}

            <ChevronDown className="dark:text-white" width={14} height={14} />
          </Button>
        </DialogTrigger>
        <DialogContent className="!top-[45%] card-primary dark:bg-[#1a1a1a] border-[2px] right-0 dark:border-[#ffffff14] w-full h-fit rounded-[12px] p-2 max-w-sm sm:max-w-xl">
          <ScrollArea className="h-fit">
            <div className="p-2">
              <DialogHeader>
                <DialogTitle className="relative flex justify-center items-center">
                  <div className="text-[16px] font-medium">Select a token</div>
                  <DialogClose asChild className="cursor-pointer">
                    <ChevronLeft
                      width={14}
                      height={18}
                      className="absolute left-0 top-0"
                    />
                  </DialogClose>
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground text-center">
                  Choose a token to swap from your available balance
                </DialogDescription>
              </DialogHeader>
              <div className="w-full mt-[14px] flex flex-col gap-3 items-start">
                <InputSearch
                  placeholder="Search name or paste address"
                  className="rounded-[12px] w-full h-[48px] bg-[#ffffff05] text-sm"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                />

                {swapTokenSelectWarning !== "" && (
                  <div className="text-red-500 text-sm mb-2">
                    {swapTokenSelectWarning}
                  </div>
                )}
                {isFromToken && (
                  <div className="flex w-full py-2">
                    <ChainSelector />
                  </div>
                )}
                <div className="w-full flex flex-wrap justify-start items-center gap-2">
                  {chainId && !searchTerm && (
                    <>
                      <div className="w-full dark:text-neutral-400 px-2 mt-2">
                        Popular tokens
                      </div>

                      {combinedTokens?.slice(0, 8).map((token) => (
                        <Button
                          key={token.address}
                          onClick={() => handleSelect(token)}
                          size={"sm"}
                          className="rounded-[12px] p-[9px] bg-white dark:bg-black dark:hover:bg-[#0000000b] border dark:border-[#1A1A1A] hover:border-primary dark:hover:border-primary text-sm flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              src={token?.logoURI}
                              alt="logo"
                              className="w-[20px] h-[20px] rounded-full"
                              width={20}
                              height={20}
                              loading="lazy"
                            />
                            <div className="text-[10px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                              {token?.symbol ?? "N/A"}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <Separator className="mt-[15px] h-[1px]  bg-black/10 dark:bg-white/10" />

              <div className="relative flex w-full">
                <div
                  ref={scrollRef}
                  className="token-list w-full mt-[14px] h-[300px] max-h-fit flex flex-col gap-3 items-start overflow-auto pr-6 scroll-smooth"
                >
                  {isUserTokensLoading && (
                    <div className="w-full p-3 flex justify-center items-center">
                      <Loader className="w-[20px] h-[20px] animate-spin" />
                    </div>
                  )}
                  {userTokensError && (
                    <div className="w-full p-3 text-red-500 text-center">
                      {userTokensError.message}
                    </div>
                  )}

                  {/* Alphabetical sections */}
                  {groupedTokens && Object.entries(groupedTokens).map(([letter, tokens]: [string, any]) => (
                    <div
                      key={letter}
                      className="w-full group"
                      ref={el => { sectionRefs.current[letter] = el; }}
                    >
                      <div className="sticky top-0 bg-[#1a1a1a] z-10 py-1 text-[10px] font-bold text-primary/60 tracking-widest px-2 mb-2">
                        {letter}
                      </div>
                      <div className="flex flex-col gap-2">
                        {tokens.map((token: TokenType) => (
                          <div
                            key={token.address}
                            className="cursor-pointer w-full p-[9px] text-sm flex justify-between items-center hover:bg-black/20 dark:hover:bg-white/20 hover:shadow-inner rounded-xl transition-colors"
                            onClick={() => handleSelect(token)}
                          >
                            <div className="flex items-center gap-2 ">
                              {token.logoURI ? (
                                <Image
                                  src={token.logoURI}
                                  alt="logo t"
                                  className="w-[20px] h-[20px] rounded-full border border-white/5"
                                  width={20}
                                  height={20}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="rounded-full w-[20px] h-[20px] border border-white/5 flex items-center justify-center bg-gray-200 text-black text-xs font-bold">
                                  {getInitials(token?.name ?? "")}
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {token.symbol}
                                </div>
                                <div className="text-[10px] font-normal dark:text-gray-400">
                                  {token.name}
                                </div>
                              </div>
                            </div>
                            {token.balance && (
                              <div className="text-xs font-medium text-gray-300">
                                {parseFloat(
                                  formatUnits(
                                    BigInt(token.balance ?? 0),
                                    token.decimals
                                  )
                                ).toFixed(4)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Search results logic (fallback when groupedTokens is null) */}
                  {!groupedTokens && (
                    <div className="w-full flex flex-col gap-2">
                      {filteredUserTokens.concat(filteredTokens).map((token) => (
                        <div
                          key={token.address}
                          className="cursor-pointer w-full p-[9px] text-sm flex justify-between items-center hover:bg-black/20 dark:hover:bg-white/20 hover:shadow-inner rounded-xl"
                          onClick={() => handleSelect(token)}
                        >
                          <div className="flex items-center gap-2 ">
                            {token.logoURI ? (
                              <Image
                                src={token.logoURI}
                                alt="logo t"
                                className="w-[20px] h-[20px] rounded-full border border-white/5"
                                width={20}
                                height={20}
                                loading="lazy"
                              />
                            ) : (
                              <div className="rounded-full w-[20px] h-[20px] border border-white/5 flex items-center justify-center bg-gray-200 text-black text-xs font-bold">
                                {getInitials(token?.name ?? "")}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-white">
                                {token.symbol}
                              </div>
                              <div className="text-[10px] font-normal dark:text-gray-400">
                                {token.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isLoading && isAddress(debouncedSearchTerm.toLowerCase()) && (
                    <div className="w-full p-3 flex justify-center items-center">
                      <Loader className="w-[20px] h-[20px] animate-spin" />
                    </div>
                  )}

                  {isAddress(debouncedSearchTerm.toLowerCase()) &&
                    manualToken &&
                    !addressAlreadyExists && (
                      <div
                        className="cursor-pointer w-full p-[9px] text-sm flex justify-between items-center hover:bg-black/20 dark:hover:bg-white/20 hover:shadow-inner rounded-xl"
                        onClick={() => handleSelect(manualToken)}
                      >
                        <div className="flex items-center gap-2 ">
                          <div className="rounded-full w-[20px] h-[20px] border border-white/5 flex items-center justify-center bg-gray-200 text-black text-xs font-bold">
                            {getInitials(manualToken?.name ?? "")}
                          </div>
                          <div>
                            <div className="text-[13px] font-normal text-white">
                              {manualToken?.symbol}
                            </div>
                            <div className="text-[13px] font-normal dark:text-gray-400">
                              {manualToken?.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {/* Alphabet Sidebar */}
                {alphabet.length > 0 && (
                  <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center gap-0.5 px-1 py-4 z-20">
                    {alphabet.map(letter => (
                      <button
                        key={letter}
                        onClick={() => scrollToSection(letter)}
                        className="text-[9px] font-bold text-gray-500 hover:text-primary transition-colors p-0.5"
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TokenSelectDialog;

