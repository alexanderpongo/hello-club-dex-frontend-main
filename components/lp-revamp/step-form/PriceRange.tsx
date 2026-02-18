"use client";
import React, { useEffect, useMemo, useState } from "react";
import ViewPriceButton from "@/components/lp-revamp/ViewPriceButton";
import { useLiquidityPoolStore } from "@/store/liquidity-pool.store";
import MinPriceCard from "@/components/lp-revamp/MinPriceCard";
import MaxPriceCard from "@/components/lp-revamp/MaxPriceCard";
import PriceRangeButtons from "@/components/lp-revamp/PriceRangeButtons";
import { BadgeInfo, OctagonAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseUnits } from "viem";
import { Currency, CurrencyAmount, Price, Token } from "@uniswap/sdk-core";

const getTrimmedResult = (raw: string) => {
  const [intPart, decimalPart] = raw.split(".");
  if (!decimalPart) return raw;

  if (intPart === "0") {
    const firstNonZeroIndex = decimalPart.search(/[1-9]/);
    if (firstNonZeroIndex === -1) return "0";

    const sliceEnd = Math.min(firstNonZeroIndex + 3, 18);
    const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");

    return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
  }

  // For non-zero intPart, return int with 2–3 decimals
  const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
  return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
};

const PriceRange = () => {
  const [initialInputAmount, setInitialInputAmount] = useState("");
  const [warning, setWarning] = useState("");

  const {
    currencyA,
    currencyB,
    setActiveStep,
    poolAddress,
    token0,
    token1,
    basePrice,
    isInverted,
    tickLowerPrice,
    tickUpperPrice,
    activePriceRange,
    pairSelectLiquidity,
    setPriceWhenPoolNotInitialized,
    setInputAmount,
    inputAmount,
  } = useLiquidityPoolStore();
  const validPriceRange = [0, 0.001, 0.005, 0.01, 0.05, 0.1, 0.2, 0.5, 1];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^0-9.]/g, ""); // Allow only numbers & decimal

    const decimalCount = (input.match(/\./g) || []).length;
    if (decimalCount > 1) {
      setWarning("Invalid number format: multiple decimal points"); // show warning
      return;
    } else {
      setWarning(""); // clear warning when valid
    }
    setInputAmount(input);
  };

  function getPriceObject<T extends Currency>(
    value?: string,
    currency?: T
  ): CurrencyAmount<T> | undefined {
    if (!value || !currency) return undefined;
    try {
      const parsedValue = parseUnits(value, currency.decimals);
      return CurrencyAmount.fromRawAmount(currency, parsedValue.toString());
    } catch (error) {
      console.error("Error parsing value:", error);
      return undefined;
    }
  }

  const price = useMemo(() => {
    if (
      poolAddress === null ||
      poolAddress === "0x0000000000000000000000000000000000000000"
    ) {
      if (inputAmount !== "" && inputAmount !== "0" && token0 && token1) {
        let Token0 = new Token(
          token0.chainId,
          token0.address,
          token0.decimals,
          token0.symbol,
          token0.name
        );
        let Token1 = new Token(
          token1.chainId,
          token1.address,
          token1.decimals,
          token1.symbol,
          token1.name
        );

        console.log("DEBUG: price memo Token0 : ", Token0);
        console.log("DEBUG: price memo Token1 : ", Token1);
        console.log("DEBUG: isInverted : ", isInverted);

        const parsedQuoteAmount = getPriceObject(
          inputAmount,
          isInverted ? Token0 : Token1
        );
        const baseAmount = getPriceObject("1", isInverted ? Token1 : Token0);

        console.log(
          "DEBUG: parsedQuoteAmount : ",
          parsedQuoteAmount?.toSignificant(6)
        );
        console.log("DEBUG: baseAmount : ", baseAmount?.toSignificant(6));

        const p =
          parsedQuoteAmount && baseAmount && !parsedQuoteAmount.equalTo(0)
            ? new Price({
              baseAmount: baseAmount,
              quoteAmount: parsedQuoteAmount,
            })
            : undefined;
        console.log(
          "DEBUG base price mock pool inverted : ",
          p?.invert()?.toSignificant(6)
        );
        console.log("DEBUG: base price mock pool : ", p?.toSignificant(6));
        return (isInverted ? p?.invert() : p) || undefined;
      }
    }
  }, [inputAmount, isInverted, token0, token1, poolAddress]);

  useEffect(() => {
    setPriceWhenPoolNotInitialized(price || null);

    console.log("DEBUG isInverted effect price: ", isInverted);
    console.log("DEBUG price value: ", price?.toSignificant(6));
  }, [price]);

  // debug

  useEffect(() => {
    console.log("DEBUG inputAmount: ", inputAmount);
    console.log("DEBUG basePrice: ", basePrice?.toSignificant(6));
    console.log("DEBUG tickLowerPrice: ", tickLowerPrice);
    console.log("DEBUG tickUpperPrice: ", tickUpperPrice);
    console.log("DEBUG activePriceRange: ", activePriceRange);
  }, [
    inputAmount,
    basePrice,
    tickLowerPrice,
    tickUpperPrice,
    activePriceRange,
  ]);

  return (
    <div className="flex flex-col w-full ">
      <div className="pt-5 md:pt-0 flex flex-row justify-between">
        <div className="uppercase text-primary font-formula text-lg">
          Set Price Range
        </div>
        <ViewPriceButton
          inputAmount={inputAmount}
          setInputAmount={setInputAmount}
          poolPriceWhenPoolNotInitialized={price}
        />
      </div>
      {(!poolAddress ||
        poolAddress === "0x0000000000000000000000000000000000000000") && (
          <div className="pt-2">
            <div className="w-full text-xs md:text-sm font-bold flex items-center space-x-2 text-black/60 dark:text-white/60">
              Set Starting Price
            </div>
            <div className="border rounded-xl mt-2 border-black/10 dark:border-white/10 active:border-primary focus:border-primary">
              <div className="py-2 text-end px-2">
                <input
                  value={inputAmount}
                  onInput={handleChange}
                  placeholder="Enter starting price"
                  type="text"
                  className={`focus:outline-none bg-transparent text-[#000] dark:text-[#fff] text-[16px] sm:text-[19px] placeholder:text-xs font-medium text-right w-[9.313rem] md:w-full`}
                />
              </div>
              {/* {warning && <p className="text-red-500 text-sm">{warning}</p>} */}
            </div>
          </div>
        )}
      <div className="pt-3 pb-2 w-full text-xs md:text-sm font-bold flex items-center space-x-2 text-black/60 dark:text-white/60">
        <span>Current price:</span>
        {poolAddress === null ? (
          <span className="text-black dark:text-white">
            1 {currencyA?.symbol!}={" "}
            {isNaN(parseFloat(inputAmount))
              ? "0.0"
              : getTrimmedResult(inputAmount)}{" "}
            {currencyB?.symbol!}
          </span>
        ) : (
          <span className="text-black dark:text-white">
            1 {currencyA?.symbol!}={" "}
            {isInverted
              ? basePrice?.invert().toSignificant(6)
              : basePrice?.toSignificant(6)}{" "}
            {currencyB?.symbol!}
          </span>
        )}
      </div>
      {pairSelectLiquidity === BigInt("0") && initialInputAmount === "" && (
        <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm">
          <OctagonAlert className="!h-[24px] !w-[24px]" />
          The pool you are adding liquidity to is out of the current market
          price range. Your liquidity will only earn fees once the price moves
          into this range. In some cases, the transaction may fail if the price
          is too far away.
        </div>
      )}
      <div className="py-1 pt-3  flex flex-row justify-between columns-2 w-full space-x-2">
        <MinPriceCard />
        <MaxPriceCard />
      </div>
      <div className="py-2 flex gap-2 text-black/60 dark:text-white/60  text-start items-start text-xs">
        <BadgeInfo className="!h-[24px] !w-[24px]" /> Full range is simple and
        covers all prices but increases impermanent loss. Custom range targets
        specific prices for higher efficiency and fees but requires active
        management.
      </div>
      <div>
        <PriceRangeButtons inputAmount={inputAmount} />
      </div>
      <div className="space-y-2">
        {(parseFloat(tickLowerPrice) !== 0 ||
          parseFloat(tickUpperPrice) !== 0) &&
          parseFloat(inputAmount) !== 0 &&
          parseFloat(inputAmount) >= parseFloat(tickUpperPrice) && (
            <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm">
              <OctagonAlert className="!h-[24px] !w-[24px]" /> Invalid range
              selected. The max price must be greater than the input price.
            </div>
          )}
        {(parseFloat(tickLowerPrice) !== 0 ||
          parseFloat(tickUpperPrice) !== 0) &&
          parseFloat(inputAmount) !== 0 &&
          parseFloat(tickLowerPrice) >= parseFloat(inputAmount) && (
            <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm">
              <OctagonAlert className="!h-[24px] !w-[24px]" /> Invalid range
              selected. The min price must be lower than the input price.
            </div>
          )}
        {parseFloat(inputAmount) !== 0 &&
          parseFloat(tickLowerPrice) > parseFloat(tickUpperPrice) && (
            <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm">
              <OctagonAlert className="!h-[24px] !w-[24px]" /> Invalid range
              selected. The min price must be lower than the max price.
            </div>
          )}
        {(parseFloat(tickLowerPrice) > parseFloat(inputAmount) ||
          parseFloat(inputAmount) > parseFloat(tickUpperPrice)) &&
          parseFloat(tickLowerPrice) !== 0 &&
          parseFloat(tickUpperPrice) !== 0 && (
            <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm">
              <OctagonAlert className="!h-[24px] !w-[24px] shrink-0 mt-0.5" />
              <span>
                Your position will not earn fees or be used in trades until the
                market price moves into your range.
              </span>
            </div>
          )}
      </div>
      <div className="pt-3">
        <Button
          className="w-full button-primary uppercase h-10"
          onClick={() => {
            setActiveStep(3);
          }}
          disabled={
            (tickLowerPrice === "" && tickUpperPrice === "") ||
            activePriceRange === null ||
            !validPriceRange.includes(activePriceRange) ||
            parseFloat(tickLowerPrice) >= parseFloat(tickUpperPrice) ||
            parseFloat(tickLowerPrice) >= parseFloat(inputAmount) ||
            parseFloat(inputAmount) >= parseFloat(tickUpperPrice)
          }
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default PriceRange;
