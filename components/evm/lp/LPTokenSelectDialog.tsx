"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, Loader } from "lucide-react";
import Image from "next/image";
import { ChainConfigItemType, TokenType } from "@/interfaces/index.i";
import { useAccount, useConfig } from "wagmi";
import { suggestedToken } from "@/config/suggest-tokens";
import { InputSearch } from "@/components/ui/input-search";
import { Separator } from "@/components/ui/separator";
import { isAddress } from "viem";
import {
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
} from "@/service/blockchain.service";
import { getInitials } from "@/lib/utils";
import { chainConfig } from "@/config/blockchain.config";
import { ScrollArea } from "@/components/ui/scroll-area";

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function LPTokenSelectDialog({
  selectedToken,
  setSelectedToken,
}: {
  selectedToken: any;
  setSelectedToken: React.Dispatch<React.SetStateAction<any>>;
}) {
  const config = useConfig();
  const { address, chainId } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [manualToken, setManualToken] = useState<TokenType | null>(null);
  const [walletTokens, setWalletTokens] = useState<TokenType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletTokenLoading, setIsWalletTokenLoading] = useState(false);
  const [testTokens, setTestTokens] = useState<TokenType[]>([]);
  const [lpTokenSelectWarning, setLpTokenSelectWarning] = useState<string>("");
  const [tokensLoaded, setTokensLoaded] = useState(false);

  // Memoize static data that doesn't change frequently
  const suggestedTokens: TokenType[] = useMemo(
    () => suggestedToken[chainId ?? "default"] || [],
    [chainId]
  );

  const chainConf: ChainConfigItemType = useMemo(
    () => chainConfig[chainId!] || chainConfig["default"],
    [chainId]
  );

  // Memoize userChain calculation
  const userChain = useMemo(() => {
    if (chainId === 56) return "bnb";
    if (chainId === 1) return "eth";
    if (chainId === 8453) return "base";
    return "unknown";
  }, [chainId]);

  // Memoize API options
  const apiOptions = useMemo(
    () => ({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: `{"addresses":[{"address":"${address}","networks":["${userChain}-mainnet"]}]}`,
    }),
    [address, userChain]
  );

  // Cache fetched tokens and only fetch once per chain/address combination
  const fetchUserTokens = useCallback(async () => {
    if (!address || userChain === "unknown" || isWalletTokenLoading) return;

    setIsWalletTokenLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_ALCHEMY_API;
      if (!url) return;

      const response = await fetch(url, apiOptions);
      const data = await response.json();

      if (data?.data?.tokens) {
        const tokens: TokenType[] = data.data.tokens
          .filter((t: any) => {
            if (!t.tokenAddress) return false;
            const balance = BigInt(t.tokenBalance ?? "0x0");
            return balance > BigInt("0");
          })
          .map((t: any, index: number) => ({
            id: index + 1,
            chainId: t.network.includes("eth")
              ? 1
              : t.network.includes("bnb")
                ? 56
                : 8453,
            address: t.tokenAddress,
            name: t.tokenMetadata.name,
            symbol: t.tokenMetadata.symbol,
            decimals: t.tokenMetadata.decimals,
            logoURI: t.tokenMetadata.logoURI,
          }));
        setWalletTokens(tokens);
      }
    } catch (error) {
      console.error("Error fetching wallet tokens:", error);
    } finally {
      setIsWalletTokenLoading(false);
    }
  }, [address, userChain, apiOptions, isWalletTokenLoading]);

  // Reset tokens when chain changes
  useEffect(() => {
    setWalletTokens([]);
    setTestTokens([]);
    setTokensLoaded(false);
    setManualToken(null);
    setSearchTerm("");
  }, [chainId]);

  // Only fetch tokens when dialog opens for the first time
  useEffect(() => {
    if (isOpen && !tokensLoaded && address && chainId) {
      fetchUserTokens();
      setTokensLoaded(true);
    }
  }, [isOpen, tokensLoaded, address, chainId, fetchUserTokens]);

  const handleOpenDialog = useCallback(() => {
    setIsOpen(true);
    setLpTokenSelectWarning("");
    setSearchTerm("");
    setManualToken(null);
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
        setLpTokenSelectWarning(
          "Please select a valid token before proceeding."
        );
        return;
      }
      setSelectedToken(token);
      setLpTokenSelectWarning("");
      setIsOpen(false);
    },
    [setSelectedToken]
  );

  // Fetch test tokens with caching
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        if (!chainConf?.tokenApi) return;

        const res = await fetch(chainConf.tokenApi);
        const data = await res.json();

        if (Array.isArray(data.tokens)) {
          setTestTokens(data.tokens);
        } else {
          console.error("Invalid token data format", data);
        }
      } catch (err) {
        console.error("Failed to fetch tokens", err);
      }
    };

    if (chainId === 97) {
      const tokens: TokenType[] = Array.isArray(chainConf?.tokens)
        ? chainConf.tokens
        : [];
      setTestTokens(tokens);
    } else if (chainConf?.tokenApi) {
      fetchTokens();
    }
  }, [chainId, chainConf]);

  // Memoize combined tokens to prevent unnecessary recalculations
  const combinedTokens = useMemo(() => {
    const tokens = [...suggestedTokens, ...testTokens, ...walletTokens];
    // Remove duplicates based on address
    return tokens.filter(
      (token, index, self) =>
        index ===
        self.findIndex(
          (t) => t.address.toLowerCase() === token.address.toLowerCase()
        )
    );
  }, [suggestedTokens, testTokens, walletTokens]);

  // Memoize filtered tokens using debounced search term
  const filteredTokens = useMemo(() => {
    if (!debouncedSearchTerm) return combinedTokens;

    const term = debouncedSearchTerm.toLowerCase();
    return combinedTokens.filter(
      (token) =>
        token?.name?.toLowerCase().includes(term) ||
        token?.symbol?.toLowerCase().includes(term) ||
        token?.address?.toLowerCase() === term
    );
  }, [combinedTokens, debouncedSearchTerm]);

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
            className="w-full h-11 py-[9px] px-[10px] dark:bg-black hover:no-underline flex flex-row justify-between items-center gap-[10px] rounded-[16px] border dark:border-[#FFFFFF0D]"
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
                    className="w-[25px] h-[25px] p-0.5 rounded-full dark:bg-[#000000]"
                  />
                ) : (
                  <div className="rounded-full w-[30px] h-[30px] border-[2px] flex items-center justify-center bg-gray-200 text-black text-sm font-bold">
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
        <DialogContent className="!top-[45%] dark:bg-[#1a1a1a] border-[2px] right-0 dark:border-[#ffffff14] w-full h-fit rounded-[12px] card-primary p-2 max-w-sm sm:max-w-xl">
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
                  Choose a token for liquidity provision
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
                {lpTokenSelectWarning !== "" && (
                  <div className="text-red-500 text-sm mb-2">
                    {lpTokenSelectWarning}
                  </div>
                )}
                <div className="flex flex-wrap justify-start items-center gap-2">
                  {chainId && !searchTerm && (
                    <>
                      <div className="w-full dark:text-neutral-400 px-2 mt-2">
                        Popular tokens
                      </div>

                      {suggestedTokens?.slice(0, 8).map((token) => (
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

              <Separator className="mt-[15px] h-[1px] bg-black/10 dark:bg-white/10" />
              <div className="token-list w-full mt-[14px] h-[300px] max-h-fit flex flex-col gap-3 items-start overflow-auto">
                {filteredTokens.slice(0, 50).map((token) => (
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
                          className="w-[20px] h-[20px] rounded-full border"
                          width={20}
                          height={20}
                          loading="lazy"
                        />
                      ) : (
                        <div className="rounded-full w-[20px] h-[20px] border flex items-center justify-center bg-gray-200 text-black text-xs font-bold">
                          {getInitials(token?.name ?? "")}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-normal">
                          {token.symbol}
                        </div>
                        <div className="text-xs font-normal dark:text-gray-300">
                          {token.name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

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
                        <div className="rounded-full w-[20px] h-[20px] border flex items-center justify-center bg-gray-200 text-black text-xs font-bold">
                          {getInitials(manualToken?.name ?? "")}
                        </div>
                        <div>
                          <div className="text-[13px] font-normal">
                            {manualToken?.symbol}
                          </div>
                          <div className="text-[13px] font-normal dark:text-gray-300">
                            {manualToken?.name}
                          </div>
                        </div>
                      </div>
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

export default LPTokenSelectDialog;
