"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useClaimReferralReward } from "@/hooks/useClaimReferralReward";
import { Hex } from "viem";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";

interface EarningItem {
  symbol: string;
  token: string;
  tokenAddress: string;
  name: string;
  amount: string;
  rawAmount: string;
  decimals: number;
  usdValue: number;
  icon?: string;
}

interface ClaimModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedToken: EarningItem | null;
  onSuccess?: () => void;
}

export default function ClaimModal({
  isOpen,
  onOpenChange,
  selectedToken,
  onSuccess,
}: ClaimModalProps) {
  const { claimReward, isClaiming, claimStep, statusMessage, error, resetState } =
    useClaimReferralReward({
      onSuccess: (txHash) => {
        console.log("Claim successful, tx:", txHash);

        setTimeout(() => {
          onOpenChange(false);
          onSuccess?.();
        }, 2000);
      },
      onError: (err) => {
        console.error("Claim error:", err);
      },
    });


  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  const confirmClaim = async () => {
    if (!selectedToken) return;

    try {
      await claimReward(
        selectedToken.tokenAddress as Hex,
        selectedToken.amount,
        selectedToken.decimals
      );
    } catch (error) {
      console.error("Claim failed:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="card-primary border-black/10 dark:border-white/10 sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-formula font-normal uppercase text-2xl text-primary tracking-wider">
            Claim Rewards
          </DialogTitle>
          <DialogDescription className="font-sans text-[#a3a3a3]">
            You are about to claim your earnings for this token.
          </DialogDescription>
        </DialogHeader>

        {selectedToken && (
          <div className="space-y-4 py-2">
            {/* Token being claimed */}
            <Card className="card-primary flex items-center gap-3 p-3 border border-white/10 rounded-[0.625rem]">
              <Image
                src={selectedToken.icon || "/icons/hello.svg"}
                alt={selectedToken.symbol}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border border-white/10"
              />
              <div className="flex-1">
                <div className="font-sans font-bold text-sm">
                  {selectedToken.name}
                </div>
                <div className="font-sans text-xs text-[#a3a3a3]">
                  {renderFormattedValue(parseFloat(selectedToken.amount))} {selectedToken.token}
                </div>
              </div>
              <div className="font-mono text-base font-medium text-primary">
                ${renderFormattedValue(selectedToken.usdValue)}
              </div>
            </Card>

            {/* Status message */}
            {(isClaiming || claimStep === "success" || claimStep === "error") && (
              <Card className="card-primary flex items-center gap-3 p-3 border border-white/10 rounded-[0.625rem]">
                {claimStep === "generating-signature" && (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="font-sans text-sm text-[#a3a3a3]">
                      {statusMessage}
                    </span>
                  </>
                )}
                {claimStep === "claiming" && (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="font-sans text-sm text-[#a3a3a3]">
                      {statusMessage}
                    </span>
                  </>
                )}
                {claimStep === "success" && (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-sans text-sm text-green-500">
                      {statusMessage}
                    </span>
                  </>
                )}
                {claimStep === "error" && (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="font-sans text-sm text-red-500">
                      {error}
                    </span>
                  </>
                )}
              </Card>
            )}

            {/* Network fee and estimated time */}
            {claimStep === "idle" && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                {/* <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-[#a3a3a3]">
                    Network Fee
                  </span>
                  <span className="font-sans text-xs ">~$2.50</span>
                </div> */}
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-[#a3a3a3]">
                    Estimated Time
                  </span>
                  <span className="font-sans text-xs ">~30 seconds</span>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isClaiming}
            className="h-auto py-2.5 px-[18px] text-sm font-sans font-normal uppercase rounded-full border-white/10 hover:border-primary hover:text-primary hover:bg-primary/5 active:border-primary active:text-primary active:bg-primary/5 bg-transparent whitespace-nowrap"
          >
            {claimStep === "success" ? "Close" : "Cancel"}
          </Button>
          <Button
            onClick={confirmClaim}
            disabled={isClaiming || claimStep === "success"}
            className="h-auto py-2.5 px-[18px] text-sm font-sans font-normal uppercase bg-primary text-black border-2 border-primary hover:bg-transparent hover:text-primary active:bg-transparent active:text-primary rounded-full min-w-[120px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClaiming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : claimStep === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              "Confirm Claim"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
