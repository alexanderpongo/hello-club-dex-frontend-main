"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { useSwapStore } from "@/store/useDexStore";
import { getBalance } from "@wagmi/core";
import { Address } from "viem";
import { useAccount, useConfig } from "wagmi";
import { fetchBalance, tradeFetchBalance } from "@/service/blockchain.service";
import { ChevronDown, Loader2 } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import TokenSelectDialog from "../evm/TokenSelectDialog";
import { TradeTokenType } from "@/interfaces/index.i";
import { getInitials } from "@/lib/utils";
import Image from "next/image";

function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface TokenProps {
  tradeFromToken: TradeTokenType | null;
  tradeChainId: number;
  tradeToToken: TradeTokenType | null;
  disabled?: boolean;
}

function TradeFromTokenDetails({
  tradeFromToken,
  tradeChainId,
  tradeToToken,
  disabled = false,
}: TokenProps) {
  const { address, chainId, chain } = useAccount();
  const config = useConfig();
  const {
    fromToken,
    toToken,
    setFromToken,
    fromTokenBalance,
    setFromTokenBalance,
    fromTokenInputAmount,
    setFromTokenInputAmount,
    setDebounceFromTokenInputAmount,
    setTradeFromInputQuote,
    setTradeToInputQuote,
    setIsLoadingTopQuote,
    isLoadingBottomQuote,
    updateBalance,
    setUpdateBalance,
    setIsLoadingQ2,
    tradeFromTokenInputAmount,
    setTradeFromTokenInputAmount,
  } = useSwapStore();

  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const { openConnectModal } = useConnectModal();

  const fetchFromTokenBalance = async () => {
    setIsBalanceLoading(true);

    try {
      if (tradeFromToken?.address === "native") {
        const balance = await getBalance(config, {
          address: address as Address,
          chainId: tradeChainId,
          unit: "ether",
        });

        setFromTokenBalance(balance.formatted);
      } else {
        const balance = await tradeFetchBalance(
          config,
          tradeChainId,
          address as Address,
          tradeFromToken
        );
        console.log("setFromTokenBalance", balance);
        setFromTokenBalance(balance == "0" ? "0.00" : balance);
      }
    } catch (error) {
      console.error(`Error while fetching ${fromToken?.symbol} balance`, error);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (tradeFromToken && address) {
      fetchFromTokenBalance();
    }
    setUpdateBalance(false);
  }, [tradeFromToken, updateBalance, address, chainId]);

  const handleClickMax = () => {
    setTradeFromTokenInputAmount(fromTokenBalance);
    setTradeFromInputQuote(true);
    setIsLoadingTopQuote(true);
    setTradeToInputQuote(false);
    setIsLoadingQ2(true);
    // if (fromToken && toToken && chainId && parseFloat(fromTokenBalance) > 0) {
    //   fetchToTokenAmountOut(fromTokenBalance);
    // }
    // if (!(parseFloat(fromTokenBalance) > 0)) {
    //   setToTokenInputAmount("0.0");
    //
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    if (tradeFromToken && tradeToToken) {
      setIsLoadingTopQuote(true);
      setTradeFromInputQuote(true);
      setTradeToInputQuote(false);
      setIsLoadingQ2(true);
    }

    // Allow only numbers and one dot
    input = input.replace(/[^0-9.]/g, "");

    // Normalize multiple dots (0.1 stays 0.1)
    if (input.includes(".")) {
      const parts = input.split(".");
      input = parts[0] + "." + parts.slice(1).join("");
    }

    setTradeFromTokenInputAmount(input);
    debouncedFromTokenInputAmount(input);
  };

  const debouncedFromTokenInputAmount = useCallback(
    debounce((input: string) => {
      setDebounceFromTokenInputAmount(input);
    }, 1500),
    []
  );

  return (
    <div>
      {" "}
      <Card className="h-[120px] border dark:border-[#1A1A1A] !w-full rounded-lg dark:bg-black p-2">
        <div className="px-[0.5rem] py-[0.5rem] flex flex-col gap-2">
          <div className="w-full flex flex-row justify-between items-center">
            <div className="text-[12px] font-normal dark:text-[#FFFFFF99] text-[#00000099]  ">
              - From
            </div>
            {!address ? (
              <div className="flex justify-end items-center gap-1 text-[12px] font-normal dark:text-[#FFFFFF99] text-[#00000099] ">
                Connect wallet to view {tradeFromToken?.symbol} balance
              </div>
            ) : (
              <div className="flex justify-end items-center gap-1">
                <Button
                  variant={"ghost"}
                  onClick={handleClickMax}
                  disabled={disabled}
                  className="cursor-pointer text-primary h-[1rem] p-1 m-0 text-[0.688rem] rounded-[0.25rem] font-normal bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  MAX
                </Button>
                <div className="text-[11px] text-[#7E7E7C] max-w-[100px] sm:max-w-full overflow-hidden">
                  {isBalanceLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    `(${
                      fromTokenBalance === "0.0"
                        ? fromTokenBalance
                        : fromTokenBalance.split(".")[1]?.length > 4
                        ? parseFloat(fromTokenBalance).toFixed(4)
                        : fromTokenBalance
                    })`
                  )}
                </div>
              </div>
            )}
          </div>
          <Separator />
          <div className="w-full flex flex-row justify-between items-center !h-[52.5px]">
            {/* <div className="-mt-6 max-w-[120px] md:max-w-[150px] flex-grow"> */}
            <div className="flex flex-row space-x-2 items-center justify-center">
              {tradeFromToken?.logoURI ? (
                <Image
                  src={tradeFromToken?.logoURI as string}
                  alt={tradeFromToken?.name as string}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-[24px] h-[24px] rounded-full dark:bg-[#000000]"
                />
              ) : (
                <div className="rounded-full w-[24px] h-[24px] border-[2px] flex items-center justify-center bg-gray-200 text-black text-xs font-bold">
                  {getInitials(tradeFromToken?.name ?? "N/A")}
                </div>
              )}
              <div className="text-xs sm:text-[13px] font-normal dark:text-white">
                {tradeFromToken?.symbol ?? "N/A"}
              </div>
            </div>

            <div className="flex flex-col justify-center items-end">
              <div className="flex flex-col items-end">
                {isLoadingBottomQuote ? (
                  <Loader2
                    // size={15}
                    className="animate-spin text-[15px] sm:text-[19px] items-end justify-end focus:outline-none"
                  />
                ) : (
                  <input
                    value={tradeFromTokenInputAmount}
                    onInput={handleChange}
                    placeholder="0.0"
                    type="text"
                    disabled={disabled}
                    className={`focus:outline-none bg-transparent text-[15px] sm:text-[19px] font-normal text-right w-[9.313rem] md:w-full disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default TradeFromTokenDetails;
