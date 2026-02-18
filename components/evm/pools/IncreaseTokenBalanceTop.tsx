"use client";
import { getInitials } from "@/lib/utils";
import { fetchBalance } from "@/service/blockchain.service";
import { useLPStore } from "@/store/useDexStore";
import { getBalance } from "@wagmi/core";
import { Copy, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount, useConfig } from "wagmi";

const IncreaseTokenBalanceTop = () => {
  const {
    fromLPToken,
    setFromLPTokenBalance,
    fromLPTokenBalance,
    setFromLPTokenInputAmount,
    fromLPTokenInputAmount,
    setLpCalTop,
    setLpCalBottom,
  } = useLPStore();
  const { address, chainId } = useAccount();
  const config = useConfig();
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeValue, setActiveValue] = useState<number | null>(null);

  const fetchFromTokenBalance = async () => {
    setIsBalanceLoading(true);
    try {
      if (fromLPToken?.address === "native") {
        const balance = await getBalance(config, {
          address: address as Address,
          chainId: chainId,
          unit: "ether",
        });

        setFromLPTokenBalance(balance.formatted);
      } else {
        const balance = await fetchBalance(
          config,
          chainId,
          address as Address,
          fromLPToken
        );

        setFromLPTokenBalance(balance == "0" ? "0.00" : balance);
      }
    } catch (error) {
      console.error(
        `Error while fetching ${fromLPToken?.symbol} balance`,
        error
      );
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (fromLPToken) {
      fetchFromTokenBalance();
    }
  }, [fromLPToken]);

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

    // Only allow digits and one decimal point
    input = input.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = input.split(".");
    if (parts.length > 2) {
      input = parts[0] + "." + parts.slice(1).join("");
    }

    setActiveValue(null);
    setFromLPTokenInputAmount(input);
  };

  const inputAmountHandler = (value: number) => {
    setLpCalTop(true);
    setLpCalBottom(false);
    let inputValue = value * parseFloat(fromLPTokenBalance);
    setActiveValue(value);
    setFromLPTokenInputAmount(inputValue.toFixed(18).replace(/\.?0+$/, ""));
  };

  const handleCopy = async () => {
    if (fromLPToken?.address) {
      // console.log("copy");

      let copyToken =
        fromLPToken?.address.toLowerCase() === "native"
          ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          : fromLPToken?.address;
      try {
        await navigator.clipboard.writeText(copyToken);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };


  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between items-center py-2">
        <div>
          <div className="flex flex-row space-x-2 items-center justify-center">
            {fromLPToken ? (
              <>
                {fromLPToken?.logoURI ? (
                  <Image
                    src={fromLPToken?.logoURI as string}
                    alt={fromLPToken?.name as string}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-[25px] h-[25px] rounded-full border"
                  />
                ) : (
                  <div className="rounded-full w-[30px] h-[30px] border-[2px] flex items-center justify-center dark:bg-gray-200 dark:text-black text-sm font-bold">
                    {getInitials(fromLPToken?.name ?? "NA")}
                  </div>
                )}
                <div className="text-xs sm:text-[13px] font-normal dark:text-white">
                  {fromLPToken?.symbol ?? ""}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center text-xs">
                Select a token
              </div>
            )}
            {fromLPToken && (
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
        <div className="text-sm font-normal dark:text-[#ffffff99] flex flex-row justify-center items-center">
          Balance:
          <div className="dark:text-[#FFFFFF] ml-0.5">
            {isBalanceLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              `${
                fromLPTokenBalance === "0.00"
                  ? fromLPTokenBalance
                  : fromLPTokenBalance.split(".")[1]?.length > 4
                  ? parseFloat(fromLPTokenBalance).toFixed(4)
                  : fromLPTokenBalance
              }`
            )}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border dark:border-[#1A1A1A] dark:bg-[#FFFFFF14] p-3 w-full">
        <div className="flex flex-row justify-between items-center">
          <div className="py-2 text-start">
            <input
              value={getTrimmedResult(fromLPTokenInputAmount)}
              onChange={handleChange}
              placeholder="0.00"
              type="text"
              className={`focus:outline-none bg-transparent text-primary text-[16px] sm:text-[19px] font-medium text-start w-[9.313rem] md:w-full`}
            />
          </div>
          <div className="py-2">
            <div className="flex space-x-2 justify-end">
              {[0.25, 0.5, 0.75, 1].map((value, index) => (
                <div
                  key={index}
                  onClick={() => inputAmountHandler(value)}
                  className={`button-range items-center !font-lato !font-bold !text-[10px] px-3 py-1 hover:cursor-pointer 
            ${
              activeValue === value
                ? "!bg-primary !text-white dark:!text-black"
                : ""
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

export default IncreaseTokenBalanceTop;
