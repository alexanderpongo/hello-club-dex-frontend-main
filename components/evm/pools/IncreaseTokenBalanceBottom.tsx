"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useLPStore } from "@/store/useDexStore";
import { useAccount, useConfig } from "wagmi";
import { getBalance } from "@wagmi/core";
import { Address, formatUnits, parseUnits } from "viem";
import { fetchBalance } from "@/service/blockchain.service";
import { Copy, Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils";

const IncreaseTokenBalanceBottom = () => {
  const {
    toLPToken,
    setToLPTokenBalance,
    toLPTokenBalance,
    setToLPTokenInputAmount,
    setFromLPTokenInputAmount,
    toLPTokenInputAmount,
    basePrice,
    increasePairRatio,
    fromLPTokenInputAmount,
    fromLPToken,
    feeTier,
    tickLowerPrice,
    activePriceRange,
    poolAddress,
    lpCalTop,
    lpCalBottom,
    setLpCalBottom,
    setLpCalTop,
  } = useLPStore();
  const { address, chainId } = useAccount();
  const config = useConfig();
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeValue, setActiveValue] = useState<number | null>(null);

  let inputToken =
    fromLPToken?.address! === "native"
      ? chainId === 56
        ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
        : chainId === 1
        ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        : chainId === 97
        ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
        : "0x4200000000000000000000000000000000000006"
      : fromLPToken?.address;

  let outputToken =
    toLPToken?.address! === "native"
      ? chainId === 56
        ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
        : chainId === 1
        ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        : chainId === 97
        ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
        : "0x4200000000000000000000000000000000000006"
      : toLPToken?.address;

  const fetchFromTokenBalance = async () => {
    setIsBalanceLoading(true);
    try {
      if (toLPToken?.address === "native") {
        const balance = await getBalance(config, {
          address: address as Address,
          chainId: chainId,
          unit: "ether",
        });

        setToLPTokenBalance(balance.formatted);
      } else {
        const balance = await fetchBalance(
          config,
          chainId,
          address as Address,
          toLPToken
        );

        setToLPTokenBalance(balance == "0" ? "0.00" : balance);
      }
    } catch (error) {
      console.error(`Error while fetching ${toLPToken?.symbol} balance`, error);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (toLPToken) {
      fetchFromTokenBalance();
    }
  }, [toLPToken]);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setLpCalBottom(true);
  //   let input = e.target.value;
  //   input = input.replace(/[^0-9.%]/g, "");
  //   setActiveValue(null);
  //   setToLPTokenInputAmount(input);
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLpCalBottom(true);
    setLpCalTop(false);
    let input = e.target.value;

    // Only allow digits and one decimal point
    input = input.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = input.split(".");
    if (parts.length > 2) {
      input = parts[0] + "." + parts.slice(1).join("");
    }

    setActiveValue(null);
    setToLPTokenInputAmount(input);
  };

  const inputAmountHandler = (value: number) => {
    setLpCalTop(false);
    setLpCalBottom(true);
    let inputValue = value * parseFloat(toLPTokenBalance);
    setActiveValue(value);

    setToLPTokenInputAmount(inputValue.toFixed(18).replace(/\.?0+$/, ""));
  };

  // const inputCalculator = () => {
  //   if (!fromLPTokenInputAmount || !basePrice || !fromLPToken?.decimals) return;

  //   const feePercentage = 1 - parseFloat(feeTier) / 100;

  //   // Convert inputs to BigInt safely
  //   const fromAmountBigInt = parseUnits(
  //     fromLPTokenInputAmount,
  //     fromLPToken.decimals
  //   );
  //   let balance: number;
  //   let passValue: number;

  //   if (
  //     activePriceRange === 1 ||
  //     !poolAddress ||
  //     poolAddress === "0x0000000000000000000000000000000000000000" ||
  //     chainId !== 56
  //   ) {
  //     passValue = parseFloat(basePrice) * 0.99;
  //   } else {
  //     balance = (parseFloat(basePrice) - parseFloat(tickLowerPrice)) / 2;
  //     passValue = parseFloat(basePrice) - balance;
  //   }

  //   const basePriceBigInt = parseUnits(passValue?.toString()!, 18); // assuming basePrice has 18 decimals
  //   // console.log("basePriceBigInt", basePriceBigInt);

  //   // Multiply amounts safely
  //   let bottomInputBigInt =
  //     (fromAmountBigInt * basePriceBigInt) / BigInt(10 ** 18);

  //   // If you want to apply fee
  //   // bottomInputBigInt = (bottomInputBigInt * BigInt(Math.floor(feePercentage * 1e6))) / BigInt(1e6);

  //   // Convert back to decimal string for display
  //   const bottomInputValue = formatUnits(
  //     bottomInputBigInt,
  //     fromLPToken.decimals
  //   );

  //   setActiveValue(null);
  //   setToLPTokenInputAmount(bottomInputValue);
  // };

  const inputCalculator = () => {
    if (lpCalTop) {
      setLpCalBottom(false);
      if (
        !fromLPTokenInputAmount ||
        !increasePairRatio ||
        !fromLPToken?.decimals ||
        !toLPToken?.decimals
      )
        return;

      const fromAmount = parseFloat(fromLPTokenInputAmount);
      const currentPrice = increasePairRatio;

      // For LP addition - no fee applied, just price conversion
      let outputAmount = fromAmount * currentPrice;

      setActiveValue(null);
      setToLPTokenInputAmount(outputAmount.toFixed(18).replace(/\.?0+$/, ""));
    }

    if (lpCalBottom) {
      setLpCalTop(false);
      if (
        !toLPTokenInputAmount ||
        !increasePairRatio ||
        !fromLPToken?.decimals ||
        !toLPToken?.decimals
      )
        return;

      const toAmount = parseFloat(toLPTokenInputAmount);
      const currentPrice = 1 / increasePairRatio;

      // For LP addition - no fee applied, just price conversion
      let inputAmount = toAmount * currentPrice;

      setActiveValue(null);
      setFromLPTokenInputAmount(inputAmount.toFixed(18).replace(/\.?0+$/, ""));
    }
  };
  const handleCopy = async () => {
    if (toLPToken?.address) {
      let copyToken =
        toLPToken?.address.toLowerCase() === "native"
          ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
          : toLPToken?.address;
      try {
        await navigator.clipboard.writeText(copyToken);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  useEffect(() => {
    inputCalculator();
    // console.log("toLPTokenInputAmount", toLPTokenInputAmount);
  }, [fromLPTokenInputAmount, toLPTokenInputAmount]);

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

  return (
    <div className="flex flex-col pt-1">
      <div className="flex flex-row justify-between items-center py-2">
        <div>
          <div className="flex flex-row space-x-2 items-center justify-center">
            {toLPToken ? (
              <>
                {toLPToken?.logoURI ? (
                  <Image
                    src={toLPToken?.logoURI as string}
                    alt={toLPToken?.name as string}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-[25px] h-[25px]  rounded-full border"
                  />
                ) : (
                  <div className="rounded-full w-[30px] h-[30px] border-[2px] flex items-center justify-center dark:bg-gray-200 dark:text-black text-sm font-bold">
                    {getInitials(toLPToken?.name ?? "NA")}
                  </div>
                )}
                <div className="text-xs sm:text-[13px] font-normal dark:text-white">
                  {toLPToken?.symbol ?? "HELLO"}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center text-xs">
                Select a token
              </div>
            )}
            {toLPToken && (
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
          {" "}
          Balance:
          <div className="dark:text-[#FFFFFF] ml-0.5">
            {isBalanceLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              `${
                toLPTokenBalance === "0.00"
                  ? toLPTokenBalance
                  : toLPTokenBalance.split(".")[1]?.length > 4
                  ? parseFloat(toLPTokenBalance).toFixed(4)
                  : toLPTokenBalance
              }`
            )}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border dark:border-[#1A1A1A] dark:bg-[#FFFFFF14] p-3 w-full">
        <div className="flex flex-row justify-between items-center">
          <div className="py-2 text-start">
            <input
              value={getTrimmedResult(toLPTokenInputAmount)}
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
                  className={`button-range items-center !font-lato !text-[10px] px-3 py-1 hover:cursor-pointer 
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

export default IncreaseTokenBalanceBottom;
