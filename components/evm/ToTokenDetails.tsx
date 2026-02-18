"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import TokenSelectDialog from "./TokenSelectDialog";
import { useSwapStore } from "@/store/useDexStore";
import { ChevronDown, Loader2 } from "lucide-react";
import { fetchBalance } from "@/service/blockchain.service";
import { Address } from "viem";
import { useAccount, useConfig } from "wagmi";
import { getBalance } from "@wagmi/core";
import { useConnectModal } from "@rainbow-me/rainbowkit";

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

function ToTokenDetails() {
  const { address, chainId, chain } = useAccount();
  const config = useConfig();
  const {
    toToken,
    fromToken,
    setToToken,
    toTokenBalance,
    setToTokenBalance,
    toTokenInputAmount,
    setToTokenInputAmount,
    fromTokenInputAmount,
    setDebounceToTokenInputAmount,
    isLoadingTopQuote,
    setToInputQuote,
    setIsLoadingBottomQuote,
    updateBalance,
    setUpdateBalance,
    setIsLoadingQ1,
    setFromInputQuote,
  } = useSwapStore();

  const [isBalanceLoading, setIsBalnceLoading] = useState(false);

  const { openConnectModal } = useConnectModal();

  const fetchToTokenBalance = async () => {
    setIsBalnceLoading(true);
    try {
      if (toToken?.address === "native") {
        const balance = await getBalance(config, {
          address: address as Address,
          chainId: chainId,
          unit: "ether",
        });

        setToTokenBalance(balance.formatted);
      } else {
        const balance = await fetchBalance(
          config,
          chainId,
          address as Address,
          toToken
        );

        setToTokenBalance(balance == "0" ? "0.0" : balance);
      }
    } catch (error) {
      console.error(`Error while fetching ${toToken?.symbol} balance`, error);
    } finally {
      setIsBalnceLoading(false);
    }
  };

  useEffect(() => {
    if (toToken) {
      fetchToTokenBalance();
    }
    setUpdateBalance(false);
  }, [toToken, updateBalance]);

  const handleClickMax = () => {
    setToTokenInputAmount(toTokenBalance);

    setIsLoadingBottomQuote(true);
    setIsLoadingQ1(true);
    setToInputQuote(true);
    setFromInputQuote(false);
    // if (fromToken && toToken && chainId && parseFloat(fromTokenBalance) > 0) {
    //   fetchToTokenAmountOut(fromTokenBalance);
    // }
    // if (!(parseFloat(fromTokenBalance) > 0)) {
    //   setToTokenInputAmount("0.0");
    // }
  };

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   let input = e.target.value;
  //   if (fromToken && toToken) {
  //     setIsLoadingBottomQuote(true);
  //     setIsLoadingQ1(true);
  //   }
  //   setToInputQuote(true);
  //   setFromInputQuote(false);

  //   input = input.replace(/[^0-9.%]/g, "");
  //   // setUpdateBalance(false);
  //   if (input.includes(".")) {
  //     const parts = input.split(".");
  //     input = parts[0] + "." + parts.slice(1).join("");
  //   }

  //   setToTokenInputAmount(input);
  //   // setToTokenAmountOut(input);
  //   debouncedFromTokenInputAmount(input);
  //   // if (fromToken && toToken && chainId && parseFloat(input) > 0) {
  //   //   fetchFromTokenAmountIn(input);
  //   // }
  //   // if (!(parseFloat(input) > 0)) {
  //   //   setFromTokenInputAmount("0.0");
  //   // }
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    if (fromToken && toToken) {
      setIsLoadingBottomQuote(true);
      setIsLoadingQ1(true);
    }

    setToInputQuote(true);
    setFromInputQuote(false);

    // Allow only numbers and one dot
    input = input.replace(/[^0-9.]/g, "");

    // Normalize multiple dots (0.1 stays 0.1)
    if (input.includes(".")) {
      const parts = input.split(".");
      input = parts[0] + "." + parts.slice(1).join("");
    }

    setToTokenInputAmount(input);
    debouncedFromTokenInputAmount(input);
  };

  const debouncedFromTokenInputAmount = useCallback(
    debounce((input: string) => {
      setDebounceToTokenInputAmount(input);
    }, 2000),
    []
  );

  return (
    <div>
      {" "}
      <Card
        className="h-[120px] border dark:border-[#1A1A1A] w-full rounded-lg dark:bg-black p-2"
      //   style={
      //     fromToken &&
      //     parseFloat(fromTokenBalance) < parseFloat(fromTokenInputAmount)
      //       ? {
      //           border: "0.001rem solid #96344e55",
      //           background: "#96344e19",
      //           boxShadow: "0px 1px 2px 0px #0000000D",
      //         }
      //       : {
      //           border: "0.001rem solid #E5E5E5",
      //           background: "#F1F3F5",
      //           boxShadow: "0px 1px 2px 0px #0000000D",
      //         }
      //   }
      >
        <div className="px-[0.5rem] py-[0.5rem] flex flex-col gap-2">
          <div className="w-full flex flex-row justify-between items-center">
            <div className="text-[12px] font-normal dark:text-[#FFFFFF99] text-[#00000099]  ">
              + To
            </div>
            <div className="flex justify-end items-center gap-1">
              <Button
                variant={"ghost"}
                onClick={handleClickMax}
                className="cursor-pointer text-primary h-[1rem] p-1 m-0 text-[0.688rem] rounded-[0.25rem] font-normal bg-transparent"
              >
                MAX
              </Button>
              <div className="text-[11px] text-[#7E7E7C] max-w-[100px] sm:max-w-full overflow-hidden">
                {isBalanceLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  `(${toTokenBalance === "0.0"
                    ? toTokenBalance
                    : toTokenBalance.split(".")[1]?.length > 4
                      ? parseFloat(toTokenBalance).toFixed(4)
                      : toTokenBalance
                  })`
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="w-full flex flex-row justify-between items-center !h-[52.5px]">
            <div className="-mt-6 max-w-[120px] md:max-w-[150px] flex-grow">
              {!chain ? (
                <div className="w-full">
                  <Button
                    onClick={openConnectModal}
                    variant={"link"}
                    size={"sm"}
                    className="w-full py-[9px] px-[10px] dark:bg-[#FFFFFF14] hover:no-underline flex flex-row justify-between items-center gap-[10px] rounded-[12px] border dark:border-[#FFFFFF0D]"
                  >
                    <div className="text-xs sm:text-[13px] font-normal dark:text-white">
                      Select a token
                    </div>
                    <ChevronDown
                      className="dark:text-white"
                      width={14}
                      height={14}
                    />
                  </Button>
                </div>
              ) : (
                <TokenSelectDialog
                  setSelectedToken={setToToken}
                  selectedToken={toToken}
                />
              )}
            </div>
            <div className="flex flex-col justify-center items-end">
              <div className="flex flex-col items-end">
                {isLoadingTopQuote ? (
                  <Loader2
                    // size={15}
                    className="animate-spin text-[15px] sm:text-[19px] h-[28.5px] items-end justify-end focus:outline-none"
                  />
                ) : (
                  <input
                    value={toTokenInputAmount}
                    onInput={handleChange}
                    placeholder="0.0"
                    type="text"
                    className={`focus:outline-none bg-transparent text-[15px] sm:text-[19px] font-normal text-right w-[9.313rem] md:w-full`}
                  />
                )}

                {/* <p className="dark:text-[#ffffff99] text-end">
                  {usdPrice && !isNaN(usdPrice)
              ? `$ ${usdPrice.toFixed(2)}`
              : "$ 0.0"}
                  $ 0.00
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ToTokenDetails;
