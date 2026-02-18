"use client";

import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import Image from "next/image";
import ConvertModal from "./modals/ConvertModal";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";

interface EarningItem {
  token: string;
  name: string;
  amount: string;
  usdValue: number;
  icon?: string;
}

interface ConvertRewardsProps {
  totalRewardValue?: number;
  estimatedNative?: number;
  earnings?: EarningItem[];
  onConvert?: () => void | Promise<void>;
}

// Dummy earnings data
const DUMMY_EARNINGS: EarningItem[] = [
  { token: "ETH", name: "Ethereum", amount: "0.5", usdValue: 1250.0, icon: "/icons/hello.svg" },
  { token: "USDC", name: "USD Coin", amount: "500", usdValue: 500.0, icon: "/icons/hello.svg" },
  { token: "USDT", name: "Tether", amount: "300", usdValue: 300.0, icon: "/icons/hello.svg" },
  { token: "USDT", name: "Tether", amount: "300", usdValue: 300.0, icon: "/icons/hello.svg" },
];

export default function ConvertRewards({
  totalRewardValue = 0,
  estimatedNative = 0,
  earnings = DUMMY_EARNINGS,
  onConvert,
}: ConvertRewardsProps) {
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  const handleConvertClick = () => {
    setIsConvertModalOpen(true);
  };

  return (
    <div className="space-y-2 mb-3">
      <h2 className="text-3xl font-formula font-light uppercase text-primary px-1">
        Convert Rewards
      </h2>

      <Card className="card-primary border-white/10 p-3 relative overflow-hidden rounded-[16px]">
        {/* Decorative blur effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
        
        {/* Watermark logo */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 pointer-events-none rotate-12">
          <Image
            src="/icons/hello.svg"
            alt="HELLO Token Watermark"
            width={96}
            height={96}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-sans text-[#a3a3a3]">
                Consolidate all earnings to HELLO token
              </p>
            </div>
            <div className="w-8 h-8 flex-shrink-0 rounded-full border border-white overflow-hidden">
              <Image
                src="/icons/hello.svg"
                alt="HELLO Token"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="flex items-end gap-2 mt-0.5">
            <div className="text-xl font-display font-light ">
              ${renderFormattedValue(totalRewardValue)}
            </div>
            <div className="font-sans text-sm text-[#a3a3a3] mb-0.5">
              ≈ {estimatedNative.toFixed(2)} HELLO
            </div>
          </div>

          <Button
            className="w-full h-auto py-2.5 px-[18px] text-sm font-sans font-normal uppercase bg-primary text-black border-2 border-primary hover:bg-transparent hover:text-primary active:bg-transparent active:text-primary rounded-full mt-1 transition-all"
            onClick={handleConvertClick}
          >
            Convert All to HELLO
          </Button>

          <a
            href="https://club.hello.one/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-sans text-[#a3a3a3] hover:text-primary active:text-primary transition-colors text-center mt-1 block"
          >
            Join HELLO Club and earn rewards by holding HELLO tokens
          </a>
        </div>
      </Card>

      {/* Convert Modal */}
      <ConvertModal
        isOpen={isConvertModalOpen}
        onOpenChange={setIsConvertModalOpen}
        earnings={earnings}
        totalRewardValue={totalRewardValue}
        estimatedNative={estimatedNative}
        onConfirm={onConvert}
      />
    </div>
  );
}
