"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";
import { ChevronDown, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { suggestedToken } from "@/config/suggest-tokens";
import { TokenType } from "@/interfaces/index.i";
import { getClaimHistory } from "@/lib/actions/referrals.actions";
import { formatUnits } from "viem";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";
import { useTokenPricesStore } from "@/store/token-prices.store";

interface ClaimHistoryItem {
  tokenAddress: string;
  token: string;
  name: string;
  amount: string;
  amountUSD: string;
  usdValue: number;
  claimedAt: string;
  icon?: string;
  txHash: string;
  blockNumber: number;
}

interface ClaimData {
  amount: string;
  amountUSD: string;
  txHash: string;
  claimedAt: string;
  blockNumber: number;
  gasUsed: string;
  nonce: number;
}

interface TokenClaimData {
  tokenAddress: string;
  totalClaimed: string;
  totalClaimedUSD: string;
  claimCount: number;
  claims: ClaimData[];
  currentPrice: number;
}

interface ClaimHistoryResponse {
  success: boolean;
  walletAddress: string;
  totalClaims: number;
  totalClaimedUSD: string;
  claimsByToken: Record<string, TokenClaimData>;
}

// Helper function to find token by address across all chains
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

interface ClaimHistoryCardProps {
  onTotalUSDChange?: (totalUSD: number) => void;
}

export default function ClaimHistoryCard({ onTotalUSDChange }: ClaimHistoryCardProps) {
  const { address } = useAccount();
  const [currentPage, setCurrentPage] = useState(1);
  const [allLoadedClaims, setAllLoadedClaims] = useState<ClaimHistoryItem[]>([]);
  const [claimsWithUSD, setClaimsWithUSD] = useState<ClaimHistoryItem[]>([]);
  const fetchPrice = useTokenPricesStore((state) => state.fetchPrice);
  const itemsPerPage = 5;

  // Fetch claim history data 
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['claimHistory', address, currentPage],
    refetchOnMount: 'always',
    queryFn: async () => {
      if (!address) return null;

      console.log("🔄 Fetching claim history for page:", currentPage);

      const data: ClaimHistoryResponse = await getClaimHistory({
        walletAddress: address,
        page: currentPage,
        limit: itemsPerPage
      });

      console.log("API Response:", data);
      console.log("Current Page:", currentPage);
      console.log("claimsByToken:", data.claimsByToken);
      console.log("claimsByToken keys:", Object.keys(data.claimsByToken || {}));

      if (data.success && data.claimsByToken) {
        // Transform the API response 
        const allClaims: ClaimHistoryItem[] = [];

        Object.entries(data.claimsByToken).forEach(([tokenAddress, tokenData]) => {
          console.log("Processing token:", tokenAddress, "with data:", tokenData);
          const token = getTokenByAddress(tokenAddress);

          tokenData.claims.forEach((claim) => {
            allClaims.push({
              tokenAddress: tokenData.tokenAddress,
              token: token?.symbol || "UNKNOWN",
              name: token?.name || "Unknown Token",
              amount: claim.amount,
              amountUSD: claim.amountUSD || "0",
              usdValue: parseFloat(claim.amountUSD) || 0,
              claimedAt: claim.claimedAt,
              icon: token?.logoURI,
              txHash: claim.txHash,
              blockNumber: claim.blockNumber,
            });
          });
        });

        // Sort by claimedAt date 
        allClaims.sort((a, b) =>
          new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime()
        );

        console.log("✅ Transformed claims:", allClaims.length, allClaims);

        return {
          claims: allClaims,
          totalClaims: data.totalClaims,
          currentPage
        };
      }

      return {
        claims: [],
        totalClaims: 0,
        currentPage
      };
    },
    enabled: !!address,
    staleTime: 0,
  });

  // Update accumulated claims when new data arrives
  React.useEffect(() => {
    console.log("📊 Data changed at:", dataUpdatedAt, "Data:", data);
    if (data) {
      if (currentPage === 1) {
        console.log("📝 Setting fresh claims for page 1:", data.claims.length, data.claims);
        setAllLoadedClaims(data.claims);
      } else {
        setAllLoadedClaims((prev) => {
          // Prevent duplicates by txHash
          const existingHashes = new Set(prev.map(c => c.txHash));
          const newClaims = data.claims.filter(c => !existingHashes.has(c.txHash));
          console.log("➕ Adding claims for page", currentPage, ":", newClaims.length);
          return [...prev, ...newClaims];
        });
      }
    } else {
      console.log("❌ No data received");
    }
  }, [dataUpdatedAt]);

  // Reset page and claims when address changes
  React.useEffect(() => {
    console.log("🔄 Address changed, resetting page");
    setCurrentPage(1);
    setAllLoadedClaims([]);
  }, [address]);

  // Fetch USD prices for all tokens in claim history
  React.useEffect(() => {
    const calculateUSDValues = async () => {
      if (!allLoadedClaims.length) {
        setClaimsWithUSD([]);
        return;
      }

      // Get unique token symbols from claims
      const uniqueSymbols = new Set<string>();
      allLoadedClaims.forEach((claim) => {
        const token = getTokenByAddress(claim.tokenAddress);
        if (token) {
          uniqueSymbols.add(token.symbol);
        }
      });

      // Fetch prices for all unique tokens
      const pricePromises = Array.from(uniqueSymbols).map((symbol) =>
        fetchPrice(symbol)
      );
      await Promise.all(pricePromises);

      // Calculate USD values for each claim
      const claimsWithCalculatedUSD = allLoadedClaims.map((claim) => {
        const token = getTokenByAddress(claim.tokenAddress);
        if (!token) return claim;

        const price = useTokenPricesStore.getState().getPrice(token.symbol);

        // Only calculate USD if we have a valid price (> 0)
        // This filters out testnet tokens that don't have real market prices
        if (price && price > 0) {
          const usdValue = parseFloat(claim.amount) * price;
          return {
            ...claim,
            amountUSD: usdValue.toString(),
          };
        }

        // For tokens without valid prices (testnet tokens), set USD to "0"
        return {
          ...claim,
          amountUSD: "0",
        };
      });

      setClaimsWithUSD(claimsWithCalculatedUSD);
    };

    calculateUSDValues();
  }, [allLoadedClaims, fetchPrice]);

  // Report total USD to parent component
  React.useEffect(() => {
    const totalUSD = claimsWithUSD.reduce((sum, claim) => {
      const usdValue = parseFloat(claim.amountUSD);
      return usdValue > 0 ? sum + usdValue : sum;
    }, 0);
    onTotalUSDChange?.(totalUSD);
  }, [claimsWithUSD, onTotalUSDChange]);

  // Use claimsWithUSD for display, fallback to allLoadedClaims if prices not yet calculated
  const claimHistory = claimsWithUSD.length > 0 ? claimsWithUSD : allLoadedClaims;
  const totalClaims = data?.totalClaims || 0;
  const hasMore = allLoadedClaims.length < totalClaims;

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  // Helper to get block explorer URL
  const getBlockExplorerUrl = (txHash: string) => {
    return `${process.env.NEXT_PUBLIC_SCANNER_URL}/tx/${txHash}`;
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-formula font-normal uppercase text-primary">
        Claim History
      </h2>

      <Card className="dark:bg-[#121212] bg-slate-100 border-black/10 dark:border-[rgba(255,255,255,0.03)] overflow-hidden p-0 rounded-xl border">
        <div className="p-0">
          <Table>
            <TableBody>
              {isLoading && claimHistory.length === 0 ? (

                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className="border-b border-white/5 h-14">
                    <TableCell className="py-2 pl-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 pr-4 text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : claimHistory.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 dark:text-[#a3a3a3] text-gray-500 font-sans">
                    No claim history yet
                  </TableCell>
                </TableRow>
              ) : (
                claimHistory.map((item, index) => (
                  <TableRow
                    key={`${item.txHash}-${index}`}
                    className="border-b border-black/10 dark:border-[rgba(255,255,255,0.03)] dark:hover:bg-white/[0.04] transition-colors h-14"
                  >
                    <TableCell className="py-2 pl-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={item.icon || "/icons/hello.svg"}
                          alt={item.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full border border-white/10"
                        />
                        <div className="flex flex-col items-start">
                          <div className="font-sans font-bold text-sm">
                            {renderFormattedValue(parseFloat(item.amount))} {item.token}
                          </div>
                          <div className="font-sans text-xs dark:text-[#a3a3a3] text-gray-500 flex items-center gap-1">
                            {format(new Date(item.claimedAt), "dd MMM yyyy 'at' HH:mm")}
                            <a
                              href={getBlockExplorerUrl(item.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center hover:text-primary transition-colors"
                              title="View on block explorer"
                            >
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-sans text-right font-medium text-sm py-2 pr-4">
                      {parseFloat(item.amountUSD) > 0 ? (
                        <>${renderFormattedValue(parseFloat(item.amountUSD))}</>
                      ) : (
                        <span className="dark:text-[#a3a3a3] text-gray-500">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {hasMore && !isLoading && (
          <div className="border-t dark:border-white/10 border-black/10">
            <button
              onClick={handleLoadMore}
              className="w-full h-8 flex items-center justify-center gap-2 font-sans text-[10px] font-bold uppercase tracking-wider dark:text-[#a3a3a3] text-gray-500 hover:text-primary hover:bg-primary/5 active:text-primary active:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Load More
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        )}
        {isLoading && claimHistory.length > 0 && (
          <div className="border-t border-white/10 py-2 flex justify-center">
            <div className="text-xs dark:text-[#a3a3a3] text-gray-500 font-sans">Loading more...</div>
          </div>
        )}
      </Card>
    </div>
  );
}
