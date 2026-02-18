"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { suggestedToken } from "@/config/suggest-tokens";
import { TokenType } from "@/interfaces/index.i";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";
import { useTokenPricesStore } from "@/store/token-prices.store";

interface TokenReward {
  tokenAddress: string;
  amount: string;
  amountUSD: string;
  currentPrice: string;
}

interface ReferralUser {
  walletAddress: string;
  referralCode?: string;
  referredAt?: string;
  totalSwaps?: number;
  status?: string;
  earningsByToken?: Record<string, {
    amount: string;
    amountUSD: string;
    currentPrice: string;
  }>;
  totalEarnedUSD?: string;
  isActive?: boolean;
}

interface ReferralDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  referralData: ReferralUser | null;
}


const getTokenByAddress = (address: string): TokenType | undefined => {
  const normalizedAddress = address.toLowerCase();

  for (const chainTokens of Object.values(suggestedToken)) {
    const token = chainTokens.find(
      (t: TokenType) => t.address.toLowerCase() === normalizedAddress
    );
    if (token) return token;
  }

  return undefined;
};

export default function ReferralDetailsModal({
  isOpen,
  onOpenChange,
  referralData,
}: ReferralDetailsModalProps) {
  const fetchPrice = useTokenPricesStore((state) => state.fetchPrice);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});

  // Parse token rewards from earningsByToken
  const tokenRewards: TokenReward[] = referralData?.earningsByToken
    ? Object.entries(referralData.earningsByToken).map(([tokenAddress, data]) => ({
      tokenAddress,
      amount: data.amount || "0",
      amountUSD: data.amountUSD || "0.00",
      currentPrice: data.currentPrice || "0.0000",
    })).filter(reward => parseFloat(reward.amount) > 0)
    : [];

  // Fetch prices for all tokens when modal opens
  useEffect(() => {
    if (!isOpen || tokenRewards.length === 0) return;

    const fetchPrices = async () => {
      const prices: Record<string, number> = {};

      for (const reward of tokenRewards) {
        const tokenInfo = getTokenByAddress(reward.tokenAddress);
        if (tokenInfo) {
          try {
            const price = await fetchPrice(tokenInfo.symbol);
            if (price !== null) {
              prices[reward.tokenAddress] = price;
            }
          } catch (error) {
            console.error(`Error fetching price for ${tokenInfo.symbol}:`, error);
          }
        }
      }

      setTokenPrices(prices);
    };

    fetchPrices();
  }, [isOpen, tokenRewards.length, fetchPrice]);

  // Calculate USD values with fetched prices
  const tokenRewardsWithUSD = useMemo(() => {
    return tokenRewards.map(reward => {
      const price = tokenPrices[reward.tokenAddress];
      const amount = parseFloat(reward.amount);

      // Only calculate USD if we have a valid price (> 0)
      // This filters out testnet tokens that don't have real market prices
      const calculatedUSD = price && price > 0 && amount ? amount * price : 0;

      return {
        ...reward,
        amountUSD: calculatedUSD > 0 ? calculatedUSD.toString() : "0",
      };
    });
  }, [tokenRewards, tokenPrices]);

  // Calculate total earnings USD (only from tokens with valid prices)
  const totalEarningsUSD = tokenRewardsWithUSD.reduce((sum, reward) => {
    const usdValue = parseFloat(reward.amountUSD || "0");
    return usdValue > 0 ? sum + usdValue : sum;
  }, 0);

  if (!referralData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="card-primary border-black/10 dark:border-white/10 sm:max-w-md rounded-xl p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="font-formula font-normal uppercase text-2xl text-primary tracking-wider">
            Referral Details
          </DialogTitle>
          <p className="font-sans text-xs text-[#a3a3a3]">
            Token rewards earned from this referral
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Status Info */}
          <Card className="dark:bg-[#121212] bg-slate-100 p-3 border-black/10 dark:border-[rgba(255,255,255,0.03)] rounded-[0.625rem] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs uppercase tracking-wider text-[#a3a3a3]">
                Status
              </span>
              <span className="font-sans text-sm font-medium text-primary">
                {referralData.isActive !== undefined
                  ? (referralData.isActive ? "Active" : "Inactive")
                  : (referralData.status || "Active")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs uppercase tracking-wider text-[#a3a3a3]">
                Referred At
              </span>
              <span className="font-sans text-sm">
                {referralData.referredAt
                  ? formatDistanceToNow(new Date(referralData.referredAt), { addSuffix: true })
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs uppercase tracking-wider text-[#a3a3a3]">
                Total Transactions
              </span>
              <span className="font-sans text-sm">
                {referralData.totalSwaps || 0}
              </span>
            </div>
          </Card>

          {/* Token Rewards Section */}
          <div className="space-y-3 pt-2">
            <h3 className="font-sans text-xs uppercase tracking-wider text-[#a3a3a3]">
              Token Rewards
            </h3>
            <div className="space-y-2">
              {tokenRewardsWithUSD.length === 0 ? (
                <Card className="card-primary border border-white/10 rounded-[0.625rem] p-4 text-center">
                  <p className="text-[#a3a3a3] font-sans text-sm">No rewards yet</p>
                </Card>
              ) : (
                tokenRewardsWithUSD.map((reward) => {
                  const tokenInfo = getTokenByAddress(reward.tokenAddress);
                  return (
                    <Card
                      key={reward.tokenAddress}
                      className="dark:bg-[#121212] bg-slate-100 flex items-center justify-between p-3 border-black/10 dark:border-[rgba(255,255,255,0.03)] rounded-[0.625rem]"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={tokenInfo?.logoURI || "/icons/hello.svg"}
                          alt={tokenInfo?.name || "Token"}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full border border-white/10"
                        />
                        <div className="flex flex-col">
                          <span className="font-sans font-bold text-sm">
                            {tokenInfo?.symbol || "Unknown"}
                          </span>
                          <span className="font-sans text-xs text-[#a3a3a3]">
                            {tokenInfo?.name || "Unknown Token"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-medium">
                          {renderFormattedValue(parseFloat(reward.amount))}
                        </div>
                        <div className="font-sans text-xs text-[#a3a3a3]">
                          {parseFloat(reward.amountUSD) > 0 ? (
                            <>${renderFormattedValue(parseFloat(reward.amountUSD))}</>
                          ) : (
                            "-"
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Total Earnings */}
          <Card className="card-primary border border-primary/30 rounded-[0.625rem] p-4 !bg-primary/5">
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm uppercase tracking-wider text-[#a3a3a3]">
                Total Earnings
              </span>
              <span className="font-mono text-xl font-bold text-primary">
                {totalEarningsUSD > 0 ? (
                  <>${renderFormattedValue(totalEarningsUSD)}</>
                ) : (
                  "-"
                )}
              </span>
            </div>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-auto py-2.5 px-[18px] text-sm font-sans font-normal uppercase rounded-full dark:border-white/10 border-black/10 hover:border-primary hover:text-primary hover:bg-primary/5 active:border-primary active:text-primary active:bg-primary/5 bg-transparent whitespace-nowrap"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
