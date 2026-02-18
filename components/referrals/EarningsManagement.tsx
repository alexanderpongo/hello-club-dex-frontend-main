"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Card } from "../ui/card";
import Image from "next/image";
import ClaimModal from "./modals/ClaimModal";
import { getUserEarnings } from "@/lib/actions/referrals.actions";
import { suggestedToken } from "@/config/suggest-tokens";
import { TokenType } from "@/interfaces/index.i";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";
import { useTokenPricesStore } from "@/store/token-prices.store";
interface TokenEarning {
  tokenAddress: string;
  total: string;
  claimed: string;
  pending: string;
  swapCount: number;
}

interface EarningItem {
  token: string;
  name: string;
  amount: string;
  rawAmount: string;
  decimals: number;
  usdValue: number;
  icon?: string;
  tokenAddress: string;
  total: string;
  claimed: string;
  pending: string;
  swapCount: number;
  symbol: string;
}

interface EarningsManagementProps {
  onClaim?: (item: EarningItem) => void | Promise<void>;
  onTotalUSDChange?: (totalUSD: number) => void;
}

// Helper function to find token by address across all chains
const getTokenByAddress = (address: string): TokenType | undefined => {
  const normalizedAddress = address.toLowerCase();

  // Search through all chain tokens
  for (const chainTokens of Object.values(suggestedToken)) {
    const token = chainTokens.find(
      (t: TokenType) => t.address.toLowerCase() === normalizedAddress
    );
    if (token) return token;
  }

  return undefined;
};

export default function EarningsManagement({ onClaim, onTotalUSDChange }: EarningsManagementProps) {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<EarningItem | null>(null);
  const fetchPrice = useTokenPricesStore((state) => state.fetchPrice);
  const getPrice = useTokenPricesStore((state) => state.getPrice);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});

  // Fetch earnings data 
  const { data: earnings = [], isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['userEarnings', address],
    refetchOnMount: 'always',
    staleTime: 0,
    queryFn: async () => {
      if (!address) return [];

      console.log("🔄 Fetching user earnings for:", address);
      const data = await getUserEarnings({ walletAddress: address });
      console.log("📊 Raw API response:", data);

      if (data?.earningsByToken) {
        console.log("📦 Earnings by token:", data.earningsByToken);
        const earningsArray: EarningItem[] = Object.entries(data.earningsByToken).map(
          ([tokenAddress, tokenData]: [string, any]) => {
            const tokenInfo: TokenType | undefined = getTokenByAddress(tokenAddress);

            const metadata = tokenInfo ? {
              name: tokenInfo.name,
              symbol: tokenInfo.symbol,
              icon: tokenInfo.logoURI,
              decimals: tokenInfo.decimals
            } : {
              name: "Unknown Token",
              symbol: tokenAddress.slice(0, 6),
              icon: "/icons/hello.svg",
              decimals: 18
            };

            // The API returns decimal value
            const pendingAmount = parseFloat(tokenData.pending || "0");

            console.log(`💰 Token ${metadata.symbol}: pending=${tokenData.pending}, parsed=${pendingAmount}`);

            return {
              token: metadata.symbol,
              name: metadata.name,
              amount: tokenData.pending || "0",
              rawAmount: tokenData.pending || "0",
              decimals: metadata.decimals,
              usdValue: pendingAmount * 0,
              icon: metadata.icon,
              tokenAddress,
              total: tokenData.total,
              claimed: tokenData.claimed,
              pending: tokenData.pending,
              swapCount: tokenData.swapCount,
              symbol: metadata.symbol
            };
          }
        );

        console.log("📋 All earnings before filter:", earningsArray.map(e => ({ token: e.token, pending: e.pending })));

        const filteredEarnings = earningsArray.filter(item => parseFloat(item.pending) > 0);

        console.log("✅ Filtered earnings array:", filteredEarnings.map(e => ({ token: e.token, pending: e.pending })));
        return filteredEarnings;
      }
      return [];
    },
    enabled: !!address,
  });

  // Log when earnings data updates
  useEffect(() => {
    console.log("💳 Earnings data updated at:", dataUpdatedAt, "Count:", earnings.length, earnings);
  }, [dataUpdatedAt, earnings]);

  // Fetch token prices for all earnings using global store
  useEffect(() => {
    if (earnings.length === 0) return;

    const fetchPrices = async () => {
      const prices: Record<string, number> = {};

      for (const earning of earnings) {
        try {
          const price = await fetchPrice(earning.token);
          if (price !== null) {
            prices[earning.token] = price;
          }
        } catch (error) {
          console.error(`Error fetching price for ${earning.token}:`, error);
        }
      }

      console.log(`💰 Final token prices:`, prices);
      setTokenPrices(prices);
    };

    fetchPrices();
  }, [earnings, fetchPrice]);

  // Calculate USD values for earnings
  const earningsWithUSD = useMemo(() => {
    return earnings.map(earning => {
      const price = tokenPrices[earning.token];
      // Only calculate USD if we have a valid price (> 0)
      // This filters out testnet tokens that don't have real market prices
      const usdValue = price && price > 0 ? parseFloat(earning.amount) * price : 0;

      return {
        ...earning,
        usdValue
      };
    });
  }, [earnings, tokenPrices]);

  // Report total USD to parent component
  useEffect(() => {
    const totalUSD = earningsWithUSD.reduce((sum, earning) => sum + earning.usdValue, 0);
    onTotalUSDChange?.(totalUSD);
  }, [earningsWithUSD, onTotalUSDChange]);

  const handleClaimClick = (item: EarningItem) => {
    setSelectedToken(item);
    setIsClaimModalOpen(true);
  };

  const handleConfirmClaim = async () => {
    if (selectedToken && onClaim) {
      await onClaim(selectedToken);
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-formula font-normal uppercase text-primary">
        Earnings Management
      </h2>

      <div className="space-y-3">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={`skeleton-${index}`}
              className="dark:bg-[#121212] bg-slate-100 border-black/10 dark:border-[rgba(255,255,255,0.03)] rounded-xl p-4 flex items-center justify-between border"
            >
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-20 rounded-full" />
              </div>
            </Card>
          ))
        ) : earnings.length === 0 ? (
          // Empty state
          <Card className="dark:bg-[#121212] bg-slate-100 border-black/10 dark:border-[rgba(255,255,255,0.03)] rounded-xl p-8 text-center border">
            <p className="dark:text-[#a3a3a3] text-gray-500 font-sans">No pending earnings to claim</p>
          </Card>
        ) : (
          // Real data
          earningsWithUSD.map((item) => (
            <Card
              key={item.tokenAddress}
              className="dark:bg-[#121212] bg-slate-100 border-black/10 dark:border-[rgba(255,255,255,0.03)] rounded-xl p-4 flex items-center justify-between transition-all border"
            >
              {/* Token info on the left */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Image
                  src={item.icon || "/icons/hello.svg"}
                  alt={item.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full border border-white/10 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-sm">
                      {item.symbol}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[9px] h-3.5 px-1 bg-white/5 dark:text-[#a3a3a3] text-gray-500 border-0 flex-shrink-0"
                    >
                      {item.token}
                    </Badge>
                  </div>
                  <div className="font-sans text-xs dark:text-[#a3a3a3] text-gray-500 mt-0.5">
                    <div>{renderFormattedValue(parseFloat(item.amount))} {item.token}</div>
                    <div>{item.swapCount} swaps</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="font-mono text-primary font-medium  whitespace-nowrap">
                  {item.usdValue > 0 ? (
                    <>
                      ${renderFormattedValue(item.usdValue)}
                    </>
                  ) : (
                    <>
                      {renderFormattedValue(parseFloat(item.amount))} {item.token}
                    </>
                  )}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-auto py-2.5 px-[18px] text-sm font-sans font-normal uppercase rounded-full dark:border-white/10 border-black/10 hover:border-primary hover:text-primary hover:bg-primary/5 active:border-primary active:text-primary active:bg-primary/5 bg-transparent whitespace-nowrap"
                  onClick={() => handleClaimClick(item)}
                >
                  Claim
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={isClaimModalOpen}
        onOpenChange={setIsClaimModalOpen}
        selectedToken={selectedToken}
        onSuccess={async () => {
          console.log("🔄 Claim successful! Invalidating queries for address:", address);

          // Invalidate and immediately refetch the queries
          const promises = [
            queryClient.invalidateQueries({
              queryKey: ['userEarnings', address],
              refetchType: 'active'
            }),
            queryClient.invalidateQueries({
              queryKey: ['claimHistory', address],
              refetchType: 'active'
            })
          ];

          await Promise.all(promises);
          console.log("✅ All queries invalidated and refetching");

          // Force refetch to ensure data updates
          await queryClient.refetchQueries({
            queryKey: ['userEarnings', address],
            type: 'active'
          });
        }}
      />
    </div>
  );
}
