"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import TokenSelectDialog from "./TokenSelectDialog";
import { useSwapStore } from "@/store/useDexStore";
import { getBalance } from "@wagmi/core";
import { Address } from "viem";
import { useAccount, useConfig } from "wagmi";
import { fetchBalance } from "@/service/blockchain.service";
import { ChevronDown, Loader2 } from "lucide-react";
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

function FromTokenDetails() {
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
    setFromInputQuote,
    setToInputQuote,
    setIsLoadingTopQuote,
    isLoadingBottomQuote,
    updateBalance,
    setUpdateBalance,
    setIsLoadingQ2,
  } = useSwapStore();
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const { openConnectModal } = useConnectModal();

  const fetchFromTokenBalance = async () => {
    setIsBalanceLoading(true);
    try {
      if (fromToken?.address === "native") {
        const balance = await getBalance(config, {
          address: address as Address,
          chainId: chainId,
          unit: "ether",
        });



        setFromTokenBalance(balance.formatted);
      } else {
        const balance = await fetchBalance(
          config,
          chainId,
          address as Address,
          fromToken
        );

        setFromTokenBalance(balance == "0" ? "0.00" : balance);
      }
    } catch (error) {
      console.error(`Error while fetching ${fromToken?.symbol} balance`, error);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (fromToken) {
      fetchFromTokenBalance();
    }
    setUpdateBalance(false);
  }, [fromToken, updateBalance]);

  const handleClickMax = () => {
    setFromTokenInputAmount(fromTokenBalance);
    setFromInputQuote(true);
    setIsLoadingTopQuote(true);
    setToInputQuote(false);
    setIsLoadingQ2(true);
    // if (fromToken && toToken && chainId && parseFloat(fromTokenBalance) > 0) {
    //   fetchToTokenAmountOut(fromTokenBalance);
    // }
    // if (!(parseFloat(fromTokenBalance) > 0)) {
    //   setToTokenInputAmount("0.0");
    //
  };

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   let input = e.target.value;
  //   if (fromToken && toToken) {
  //     setIsLoadingTopQuote(true);
  //     setFromInputQuote(true);
  //     setToInputQuote(false);
  //     setIsLoadingQ2(true);
  //   }

  //   input = input.replace(/[^0-9.%]/g, "");
  //   // setUpdateBalance(false);
  //   if (input.includes(".")) {
  //     const parts = input.split(".");
  //     input = parts[0] + "." + parts.slice(1).join("");
  //   }

  //   setFromTokenInputAmount(input);
  //   debouncedFromTokenInputAmount(input);
  //   // if (fromToken && toToken && chainId && parseFloat(input) > 0) {
  //   //   fetchToTokenAmountOut(input);
  //   // }
  //   // if (!(parseFloat(input) > 0)) {
  //   //   setToTokenInputAmount("0.0");
  //   // }
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    if (fromToken && toToken) {
      setIsLoadingTopQuote(true);
      setFromInputQuote(true);
      setToInputQuote(false);
      setIsLoadingQ2(true);
    }

    // Allow only numbers and one dot
    input = input.replace(/[^0-9.]/g, "");

    // Normalize multiple dots (0.1 stays 0.1)
    if (input.includes(".")) {
      const parts = input.split(".");
      input = parts[0] + "." + parts.slice(1).join("");
    }

    setFromTokenInputAmount(input);
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
      <Card
        className="h-[120px] border dark:border-[#1A1A1A] w-full rounded-lg dark:bg-black p-2"
      // style={
      //   fromToken &&
      //   parseFloat(fromTokenBalance) < parseFloat(fromTokenInputAmount)
      //     ? {
      //         border: "0.001rem solid #96344e55",
      //         background: "#96344e19",
      //         boxShadow: "0px 1px 2px 0px #0000000D",
      //       }
      //     : {
      //         border: "0.001rem solid #E5E5E5",
      //         background: "#F1F3F5",
      //         boxShadow: "0px 1px 2px 0px #0000000D",
      //       }
      // }
      >
        <div className="px-[0.5rem] py-[0.5rem] flex flex-col gap-2">
          <div className="w-full flex flex-row justify-between items-center">
            <div className="text-[12px] font-normal dark:text-[#FFFFFF99] text-[#00000099]  ">
              - From
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
                  `(${fromTokenBalance === "0.0"
                    ? fromTokenBalance
                    : fromTokenBalance.split(".")[1]?.length > 4
                      ? parseFloat(fromTokenBalance).toFixed(4)
                      : fromTokenBalance
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
                  setSelectedToken={setFromToken}
                  selectedToken={fromToken}
                  isFromToken={true}
                />
              )}
              {/* <TokenSelectDialog
                setSelectedToken={setFromToken}
                selectedToken={fromToken}
              /> */}
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
                    value={fromTokenInputAmount}
                    onInput={handleChange}
                    placeholder="0.0"
                    type="text"
                    className={`focus:outline-none bg-transparent text-[15px] sm:text-[19px] font-normal text-right w-[9.313rem] md:w-full`}
                  />
                )}
                {/* <input
                  value={fromTokenInputAmount}
                  onInput={handleChange}
                  placeholder="0.00"
                  type="text"
                  className={`focus:outline-none bg-transparent text-[15px] sm:text-[19px] font-normal text-right w-[9.313rem] md:w-full`}
                /> */}
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

export default FromTokenDetails;
