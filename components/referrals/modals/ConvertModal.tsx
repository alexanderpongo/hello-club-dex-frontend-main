"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";

interface EarningItem {
  token: string;
  name: string;
  amount: string;
  usdValue: number;
  icon?: string;
}

interface ConvertModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  earnings: EarningItem[];
  totalRewardValue: number;
  estimatedNative: number;
  onConfirm?: () => void | Promise<void>;
}

export default function ConvertModal({
  isOpen,
  onOpenChange,
  earnings,
  totalRewardValue,
  estimatedNative,
  onConfirm,
}: ConvertModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmConvert = async () => {
    setIsProcessing(true);
    try {
      if (onConfirm) {
        await onConfirm();
      }
      // Close modal after successful conversion
      setTimeout(() => {
        setIsProcessing(false);
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error("Conversion failed:", error);
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="card-primary border-white/10 sm:max-w-lg !rounded-sm">
        <DialogHeader>
          <DialogTitle className="font-formula font-light uppercase text-2xl text-primary tracking-wider">
            Convert All Rewards
          </DialogTitle>
          <DialogDescription className="font-sans text-[#a3a3a3]">
            Convert all your accumulated tokens into HELLO Token in one transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Tokens being converted */}
          <div className="space-y-2">
            <h4 className="font-sans text-xs font-bold uppercase text-[#a3a3a3]">
              Converting
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {earnings.map((item) => (
                <div
                  key={item.token}
                  className="flex items-center gap-3 p-2 bg-[#1a1a1a] border border-white/10 rounded-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-card border border-white/10 flex items-center justify-center shadow-inner overflow-hidden p-1.5">
                    <Image
                      src={item.icon || "/icons/hello.svg"}
                      alt={item.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-sans font-bold text-white text-xs">
                      {item.name}
                    </div>
                    <div className="font-sans text-[10px] text-[#a3a3a3]">
                      {item.amount} {item.token}
                    </div>
                  </div>
                  <div className="font-mono text-sm font-medium text-white">
                    ${renderFormattedValue(item.usdValue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion summary */}
          <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-sm">
            <div className="w-10 h-10 rounded-full bg-card border border-primary/30 flex items-center justify-center shadow-inner overflow-hidden p-2">
              <Image
                src="/icons/hello.svg"
                alt="HELLO Token"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="font-sans font-bold text-white text-sm">
                You will receive
              </div>
              <div className="font-sans text-xs text-[#a3a3a3]">
                ≈ {estimatedNative.toFixed(2)} HELLO
              </div>
            </div>
            <div className="font-mono text-base font-medium text-primary">
              ${renderFormattedValue(totalRewardValue)}
            </div>
          </div>

          {/* Network fee and estimated time */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs text-[#a3a3a3]">
                Network Fee
              </span>
              <span className="font-sans text-xs text-white">~$2.50</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs text-[#a3a3a3]">
                Estimated Time
              </span>
              <span className="font-sans text-xs text-white">~45 seconds</span>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="h-auto py-2.5 px-[18px] text-sm font-sans font-normal uppercase rounded-full border-white/10 hover:border-primary hover:text-primary hover:bg-primary/5 active:border-primary active:text-primary active:bg-primary/5 bg-transparent whitespace-nowrap"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmConvert}
            disabled={isProcessing}
            className="h-auto py-2.5 px-[18px] text-sm font-sans font-normal uppercase bg-primary text-black border-2 border-primary hover:bg-transparent hover:text-primary active:bg-transparent active:text-primary rounded-full min-w-[140px] transition-all"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Convert & Claim"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
