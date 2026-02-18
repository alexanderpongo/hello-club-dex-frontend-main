"use client";
import React, { useEffect, useState } from "react";
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
import {
  ChevronDown,
  ChevronLeft,
  Loader,
  // ChevronLeft, Loader
} from "lucide-react";
// import { Separator } from "../ui/separator";
import Image from "next/image";
import { Separator } from "../ui/separator";
import { TokenType } from "@/interfaces/index.i";
import { useAccount, useConfig } from "wagmi";
import { suggestedToken } from "@/config/suggest-tokens";
import { InputSearch } from "../ui/input-search";
import { isAddress } from "viem";
import {
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
} from "@/service/blockchain.service";
import { useSwapStore } from "@/store/useDexStore";
import { getInitials } from "@/lib/utils";
import { testTokens } from "@/config/test-token";

function TokenSelectDialog({
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
  const [manualToken, setManualToken] = useState<TokenType>();
  const suggestedTokens: TokenType[] = suggestedToken[chainId ?? "default"];

  const { setFromTokenInputAmount, setToTokenInputAmount } = useSwapStore();

  //handle open dialog
  const handleOpenDialog = () => {
    setIsOpen(true);
    // getTokens();
  };

  const fetchTokenDetails = async () => {
    const tokenName = await fetchTokenName(
      config,
      chainId,
      searchTerm.toLowerCase()
    );
    const tokenSymbol = await fetchTokenSymbol(
      config,
      chainId,
      searchTerm.toLowerCase()
    );
    const tokenDecimals = await fetchTokenDecimals(
      config,
      chainId,
      searchTerm.toLowerCase()
    );

    setManualToken({
      chainId: chainId as number,
      address: searchTerm.toLowerCase(),
      name: tokenName as string,
      symbol: tokenSymbol as string,
      decimals: tokenDecimals as number,
      logoURI: "",
    });
  };

  useEffect(() => {
    if (isAddress(searchTerm.toLowerCase())) {
      fetchTokenDetails();
    }
  }, [searchTerm]);

  const handleSelect = (address: string) => {
    // if (tokens?.find((token) => token.address === address)) {
    //   setSelectedToken(tokens?.find((token) => token.address === address));
    // } else if (filteredTokens?.find((token) => token.address === address)) {
    //   setSelectedToken(
    //     filteredTokens?.find((token) => token.address === address)
    //   );
    // } else
    if (manualToken) {
      setSelectedToken(manualToken);
    } else {
      console.error("something wrong while select token");
    }

    setIsOpen(false);
  };

  const tokenSelectHandler = (token: TokenType) => {
    setSelectedToken(token);
    setFromTokenInputAmount("");
    setToTokenInputAmount("");
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild onClick={handleOpenDialog}>
          <Button
            variant={"link"}
            size={"sm"}
            className="w-full py-[9px] px-[10px] bg-[#FFFFFF14] hover:no-underline flex flex-row justify-between items-center gap-[10px] rounded-[12px] border border-[#FFFFFF0D]"
          >
            {selectedToken ? (
              <div className="flex flex-row space-x-2 items-center justify-center">
                {/* <Image
                  src={
                    selectedToken?.logoURI ??
                    "https://app.chain-swap.org/ETH.png"
                  }
                  alt="logo t"
                  className="w-[20px] h-[20px] p-0.5 rounded-full"
                  width={0}
                  height={0}
                  sizes="100vw"
                /> */}
                {selectedToken?.logoURI ? (
                  <Image
                    src={selectedToken?.logoURI as string}
                    alt={selectedToken?.name as string}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-[20px] h-[20px] p-0.5 rounded-full bg-[#000000]"
                  />
                ) : (
                  <div className="rounded-full w-[25px] h-[25px] border-[2px] flex items-center justify-center bg-gray-200 text-black text-sm font-bold">
                    {getInitials(selectedToken?.name ?? "NA")}
                  </div>
                )}
                <div className="text-xs sm:text-[13px] font-normal text-white">
                  {selectedToken?.symbol ?? "ETH"}
                </div>
              </div>
            ) : (
              <div className="text-xs sm:text-[13px] font-normal text-white">
                Select a token
              </div>
            )}

            <ChevronDown className="text-white" width={14} height={14} />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#1a1a1a] border-[2px] right-0 border-[#ffffff14] w-full rounded-[12px] p-2">
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
              <div className="flex flex-wrap justify-start items-center gap-2">
                {chainId && (
                  <div className="w-full  text-neutral-400 px-2">
                    Popular tokens
                  </div>
                )}
                {suggestedTokens?.map((token, key) => (
                  <Button
                    key={key}
                    onClick={() => {
                      tokenSelectHandler(token);
                      setIsOpen(false);
                    }}
                    size={"sm"}
                    // variant={"ghost"}
                    className="rounded-[12px] p-[9px] bg-black hover:bg-[#0000000b] border border-[#1A1A1A] hover:border-primary text-sm flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={token?.logoURI}
                        alt="logo"
                        className="w-[20px] h-[20px] rounded-full"
                        width={0}
                        height={0}
                        sizes="100vw"
                      />
                      <div className="text-[10px] font-semibold">
                        {token?.symbol}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            <Separator className="mt-[15px] h-[1px] bg-white/10" />
            <div className="token-list w-full mt-[14px] max-h-[300px] flex flex-col gap-3 items-start overflow-scroll">
              {/* {isTokensLoading && isInitialLoad && (
                <div className="w-full p-3 bg-[#ffffff05] animate-pulse flex justify-center items-center">
                  <Loader className="w-[30px] h-[30px] animate-spin" />
                </div>
              )}
              {searchLoading && (
                <div className="w-full p-3 bg-[#ffffff05] animate-pulse flex justify-center items-center">
                  <Loader className="w-[20px] h-[20px] animate-spin" />
                </div>
              )}
              {(debouncedSearchTerm ? filteredTokens : tokens)?.map(
                (token, key, arr) => (
                  <div
                    key={key}
                    ref={key === arr.length - 1 ? lastTokenElementRef : null} // Add the ref to the last token element
                    className="cursor-pointer w-full p-[9px] text-sm flex justify-between items-center hover:bg-[#e5e5e5] hover:shadow-inner"
                    onClick={() => handleSelect(token?.address)}
                  >
                    <div className="flex items-center gap-2 ">
                      {token.logoURI && (
                        <Image
                          src={token.logoURI}
                          alt="logo t"
                          className="w-[20px] h-[20px]"
                          width={0}
                          height={0}
                          sizes="100vw"
                        />
                      )}
                      <div>
                        <div className="text-[13px] font-normal">
                          {token.symbol}
                        </div>
                        <div className="text-[13px] font-normal text-gray-500">
                          {token.name}
                        </div>
                      </div>
                    </div>
                    <TokenBalance token={token} />
                  </div>
                )
              )} */}

              {testTokens?.map((token, key) => (
                <Button
                  key={key}
                  onClick={() => {
                    tokenSelectHandler(token);
                    setIsOpen(false);
                  }}
                  size={"sm"}
                  // variant={"ghost"}
                  className="rounded-[12px] p-[9px] bg-black hover:bg-[#0000000b] border border-[#1A1A1A] hover:border-primary text-sm flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={token?.logoURI}
                      alt="logo"
                      className="w-[20px] h-[20px] rounded-full"
                      width={0}
                      height={0}
                      sizes="100vw"
                    />
                    <div className="text-[10px] font-semibold">
                      {token?.symbol}
                    </div>
                  </div>
                </Button>
              ))}

              {(searchTerm &&
                isAddress(searchTerm.toLowerCase()) &&
                !suggestedTokens?.find(
                  (token) =>
                    token.address.toLowerCase() ===
                    manualToken?.address.toLowerCase()
                )) ||
                (testTokens?.find(
                  (token) =>
                    token?.address.toLowerCase() === searchTerm.toLowerCase() ||
                    token?.name.toLowerCase() === searchTerm.toLowerCase()
                ) && (
                    <div
                      className="cursor-pointer w-full p-[9px] text-sm flex justify-between items-center hover:bg-[#ffffff14] rounded-xl hover:shadow-inner"
                      onClick={() => handleSelect(manualToken?.address as string)}
                    >
                      <div className="flex items-center gap-2 ">
                        {manualToken?.logoURI && (
                          <Image
                            src={manualToken?.logoURI}
                            alt="logo t"
                            className="w-[20px] h-[20px] rounded-full"
                            width={0}
                            height={0}
                            sizes="100vw"
                          />
                        )}
                        <div>
                          <div className="text-[13px] font-normal">
                            {manualToken?.symbol}
                          </div>
                          <div className="text-[13px] font-normal text-gray-500">
                            {manualToken?.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
            {/* {scrollLoading && !isInitialLoad && (
              <div className="w-full p-3 bg-[#ffffff05] animate-pulse flex justify-center items-center">
                <Loader className="w-[20px] h-[20px] animate-spin" />
              </div>
            )} */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TokenSelectDialog;
