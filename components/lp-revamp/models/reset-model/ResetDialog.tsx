"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLiquidityPoolStore } from "@/store/liquidity-pool.store";

import { RotateCcw } from "lucide-react";
import React from "react";

const ResetDialog = () => {
  const {
    currencyA,
    currencyB,
    activeStep,
    setCurrencyA,
    setCurrencyB,
    setActiveStep,
    setCurrencyATokenInputAmount,
    setCurrencyBTokenInputAmount,
    setFeeTier,
    setActivePriceRange,
    setTickLowerPrice,
    setTickUpperPrice,
    setTickSpace,
  } = useLiquidityPoolStore();

  const resetHandler = () => {
    setActiveStep(1);
    setCurrencyA(null);
    setCurrencyB(null);
    setCurrencyATokenInputAmount("");
    setCurrencyBTokenInputAmount("");
    setFeeTier("0.3");
    setTickSpace(60);
    setActivePriceRange(0);
    setTickLowerPrice("0");
    setTickUpperPrice("0");
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={"ghost"}
          disabled={!currencyA && !currencyB && activeStep === 1}
        >
          <div
            className={`flex flex-row items-center justify-center gap-2 border dark:bg-[#1A1A1A] text-sm rounded-xl p-2  ${
              !currencyA && !currencyB && activeStep === 1
                ? "dark:border-[#FFFFFF1A] dark:text-neutral-400 dark:!bg-[#FFFFFF1A] cursor-default"
                : "dark:border-[#FFFFFF1A] hover:border-primary hover:text-primary cursor-pointer dark:bg-[#1A1A1A]"
            }`}
          >
            {" "}
            <RotateCcw className="h-[14px] w-[14px] mt-[1px] inline-flex items-center" />{" "}
            <span>Reset</span>
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="!border dark:!border-[#FFFFFF1A] bg-white dark:!bg-[#1A1A1A] max-w-[350px] !rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Your tokens, price, and range
            selections will be reset.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="w-full">
          <AlertDialogCancel className="!border dark:!border-[#FFFFFF1A] dark:!bg-[#1A1A1A] rounded-xl hover:!border-primary hover:!text-primary  w-20">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="button-primary w-20"
            onClick={resetHandler}
          >
            Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetDialog;
