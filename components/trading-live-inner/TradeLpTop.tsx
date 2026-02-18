"use client";
import { getInitials } from "@/lib/utils";
import { fetchBalance, tradeFetchBalance } from "@/service/blockchain.service";
import { useTradingLivePoolStore } from "@/store/trading-live-pool-store";
import { getBalance } from "@wagmi/core";
import { Copy, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount, useConfig } from "wagmi";

interface TradeLpTopProps {
  tradeChainId: number;
  disabled: boolean;
}

const TradeLpTop: React.FC<TradeLpTopProps> = (props) => {
  const { tradeChainId, disabled } = props;

  const {
    currencyA,
    currencyB,
    setLpCalTop,
    setLpCalBottom,
    setCurrencyATokenInputAmount,
    currencyATokenBalance,
    currencyATokenInputAmount,
    setCurrencyATokenBalance,
  } = useTradingLivePoolStore();
  const { address, chainId } = useAccount();
  const config = useConfig();
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeValue, setActiveValue] = useState<number | null>(null);

  const fetchFromTokenBalance = async () => {
    setIsBalanceLoading(true);
    try {
      if (currencyA?.address === "native") {
        const balance = await getBalance(config, {
          address: address as Address,
          chainId: tradeChainId,
          unit: "ether",
        });

        setCurrencyATokenBalance(balance.formatted);
      } else {
        const balance = await tradeFetchBalance(
          config,
          tradeChainId,
          address as Address,
          {
            address: currencyA?.address,
            decimal: currencyA?.decimals!,
            symbol: currencyA?.symbol!,
            name: currencyA?.name!,
            logoURI: currencyA?.logoURI!,
          }
        );

        console.log("balance", balance);

        setCurrencyATokenBalance(balance == "0" ? "0.00" : balance);
      }
    } catch (error) {
      console.error(`Error while fetching ${currencyA?.symbol} balance`, error);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (currencyA && address) {
      fetchFromTokenBalance();
    }
  }, [currencyA, tradeChainId, chainId, address]);

  const getTrimmedResult = (raw: string) => {
    const [intPart, decimalPart] = raw.split(".");
    if (decimalPart === undefined) return raw;

    // Just return if the input is like "0.", "0.0", or "0.00"
    if (raw.endsWith(".") || /^0+(\.0*)?$/.test(raw)) return raw;

    if (intPart === "0") {
      const firstNonZeroIndex = decimalPart.search(/[1-9]/);
      if (firstNonZeroIndex === -1) return "0";

      const sliceEnd = Math.min(firstNonZeroIndex + 3, 18);
      const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");

      return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
    }

    // For non-zero intPart, return int with trimmed decimals
    const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
    return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLpCalTop(true);
    setLpCalBottom(false);
    let input = e.target.value;

    // Prevent scientific notation input
    if (input.toLowerCase().includes('e')) {
      return;
    }

    // Only allow digits and one decimal point
    input = input.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = input.split(".");
    if (parts.length > 2) {
      input = parts[0] + "." + parts.slice(1).join("");
    }

    setActiveValue(null);
    setCurrencyATokenInputAmount(input);
  };

  const inputAmountHandler = (value: number) => {
    setLpCalTop(true);
    setLpCalBottom(false);
    let inputValue = value * parseFloat(currencyATokenBalance);
    setActiveValue(value);
    
    // Convert to string without scientific notation
    const inputValueStr = inputValue.toLocaleString('fullwide', { 
      useGrouping: false, 
      maximumFractionDigits: 18 
    });
    
    // Remove trailing zeros after decimal point
    setCurrencyATokenInputAmount(inputValueStr.replace(/\.?0+$/, ""));
  };

  const handleCopy = async () => {
    if (currencyA?.address) {
      // console.log("copy");

      let copyToken =
        currencyA?.address.toLowerCase() === "native"
          ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          : currencyA?.address;
      try {
        await navigator.clipboard.writeText(copyToken);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  // const getTrimmedResult = (raw: string) => {
  //   const [intPart, decimalPart] = raw.split(".");
  //   if (!decimalPart) return raw;

  //   if (intPart === "0") {
  //     const firstNonZeroIndex = decimalPart.search(/[1-9]/);
  //     if (firstNonZeroIndex === -1) return "0";

  //     const sliceEnd = Math.min(firstNonZeroIndex + 3, 18);
  //     const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");

  //     return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
  //   }

  //   // For non-zero intPart, return int with 2–3 decimals
  //   const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
  //   return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
  // };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between items-center py-2">
        <div>
          <div className="flex flex-row space-x-2 items-center justify-center">
            {currencyA && (
              <>
                {currencyA?.logoURI ? (
                  <Image
                    src={currencyA?.logoURI as string}
                    alt={currencyA?.name as string}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-[25px] h-[25px] rounded-full border"
                  />
                ) : (
                  <div className="rounded-full w-[30px] h-[30px] border-[2px] flex items-center justify-center dark:bg-gray-200 dark:text-black text-sm font-bold">
                    {getInitials(currencyA?.name ?? "NA")}
                  </div>
                )}
                <div className="text-xs sm:text-[13px] font-normal dark:text-white truncate max-w-[80px] xs:max-w-[100px] sm:max-w-none">
                  {currencyA?.symbol ?? ""}
                </div>
              </>
            )}
            {currencyA && (
              <Copy
                size={12}
                className="hover:text-primary hover:cursor-pointer"
                onClick={handleCopy}
              />
            )}
            {isCopied && (
              <span className="text-green-500 text-xs">Copied!</span>
            )}
          </div>
        </div>
        {!address ? (
          <div className="flex justify-end items-center gap-1 text-[10px] xs:text-[12px] font-normal dark:text-[#FFFFFF99] text-[#00000099] text-right max-w-[180px] xs:max-w-none">
            <span className="truncate">
              Connect wallet to view {currencyA?.symbol} balance
            </span>
          </div>
        ) : (
          <div className="text-[11px] xs:text-sm font-normal dark:text-[#ffffff99] flex flex-row justify-center items-center flex-shrink-0">
            Balance:
            <div className="dark:text-[#FFFFFF] ml-0.5">
              {isBalanceLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                `${
                  currencyATokenBalance === "0.00"
                    ? currencyATokenBalance
                    : currencyATokenBalance.split(".")[1]?.length > 4
                    ? parseFloat(currencyATokenBalance).toFixed(4)
                    : currencyATokenBalance
                }`
              )}
            </div>
          </div>
        )}
      </div>
      <div className="rounded-lg border dark:border-[#1A1A1A] dark:bg-black p-3 w-full">
        <div className="flex flex-row justify-between items-center gap-2">
          <div className="py-2 text-start flex-1 min-w-0">
            <input
              value={getTrimmedResult(currencyATokenInputAmount)}
              onChange={handleChange}
              placeholder="0.00"
              type="text"
              disabled={disabled}
              className={`focus:outline-none bg-transparent text-primary text-[16px] sm:text-[19px] font-medium text-start w-full disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>
          <div className="py-2 flex-shrink-0">
            <div className="flex space-x-1.5 xs:space-x-2 justify-end">
              {[0.25, 0.5, 0.75, 1].map((value, index) => (
                <div
                  key={index}
                  onClick={
                    disabled ? undefined : () => inputAmountHandler(value)
                  }
                  className={`button-range items-center !font-lato !font-bold !text-[9px] xs:!text-[10px] px-2 xs:px-3 py-1 whitespace-nowrap
             ${
               activeValue === value
                 ? "!bg-primary !text-white dark:!text-black"
                 : ""
             }
             ${
               disabled
                 ? "opacity-50 cursor-not-allowed"
                 : "hover:cursor-pointer"
             }`}
                >
                  {value === 1 ? "MAX" : `${value * 100}%`}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeLpTop;
