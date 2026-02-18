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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useLPStore } from "@/store/useDexStore";
import { RotateCcw } from "lucide-react";
import React, { use, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";

const ResetDialog = () => {
  const { chainId } = useAccount();
  const {
    activeStep,
    setActiveStep,
    setFromLPToken,
    setToLPToken,
    fromLPToken,
    toLPToken,
    setFromLPTokenInputAmount,
    setToLPTokenInputAmount,
    setFeeTier,
    setActivePriceRange,
    setTickLowerPrice,
    setTickUpperPrice,
    setTickSpace,
  } = useLPStore();
  const searchParams = useSearchParams();


  const resetHandler = () => {
    setActiveStep(1);
    setFromLPToken(null);
    setToLPToken(null);
    setFromLPTokenInputAmount("");
    setToLPTokenInputAmount("");
    setFeeTier("0.3");
    setTickSpace(60);
    setActivePriceRange(0);
    setTickLowerPrice("0");
    setTickUpperPrice("0");
  };

  useEffect(() => {
    if(searchParams.get("tab") === "lp") {
      setActiveStep(1);
    }
  }, [chainId]);

  return (
    // <Dialog>
    //   <DialogTrigger asChild>
    //     <div
    //       className={`flex flex-row items-center justify-center gap-2 border bg-[#1A1A1A] text-sm rounded-xl p-2  ${
    //         !fromLPToken && !toLPToken && activeStep === 1
    //           ? "border-[#FFFFFF1A] text-neutral-400 bg-[#FFFFFF1A] cursor-default"
    //           : "border-[#FFFFFF1A] hover:border-[#00ffff] hover:text-[#00ffff] cursor-pointer"
    //       }`}
    //     >
    //       <RotateCcw className="h-[14px] w-[14px] mt-[1px] inline-flex items-center" />{" "}
    //       <span>Reset</span>
    //     </div>
    //     {/* <div className="flex justify-end items-center border border-[#FFFFFF1A] bg-[#1A1A1A] text-sm rounded-xl p-1 group cursor-pointer hover:border-[#00ffff]"></div> */}
    //   </DialogTrigger>
    //   {fromLPToken && toLPToken ? (
    //     <DialogContent
    //       onClick={resetHandler}
    //       className="bg-[#1a1a1a] border-[2px] right-0 border-[#ffffff14] px-1 sm:p-6 sm:max-w-[425px]"
    //     >
    //       close
    //     </DialogContent>
    //   ) : (
    //     ""
    //   )}
    // </Dialog>

    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div
          className={`flex flex-row items-center justify-center gap-2 border dark:bg-[#1A1A1A] text-sm rounded-xl p-2  ${
            !fromLPToken && !toLPToken && activeStep === 1
              ? "dark:border-[#FFFFFF1A] dark:text-neutral-400 dark:!bg-[#FFFFFF1A] cursor-default"
              : "dark:border-[#FFFFFF1A] hover:border-primary hover:text-primary cursor-pointer dark:bg-[#1A1A1A]"
          }`}
          //   disabled={!fromLPToken || !toLPToken}
        >
          {" "}
          <RotateCcw className="h-[14px] w-[14px] mt-[1px] inline-flex items-center" />{" "}
          <span>Reset</span>
        </div>
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
