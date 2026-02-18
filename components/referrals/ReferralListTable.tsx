"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, ChevronDown } from "lucide-react";
import { getReferredUsers } from "@/lib/actions/referrals.actions";
import { formatDistanceToNow } from "date-fns";
import ReferralDetailsModal from "./modals/ReferralDetailsModal";
import { suggestedToken } from "@/config/suggest-tokens";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";
import { useTokenPricesStore } from "@/store/token-prices.store";
import { TokenType } from "@/interfaces/index.i";

// Helper function to find token by address
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

export default function ReferralListTable() {
  const { address } = useAccount();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [referredUsers, setReferredUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const fetchPrice = useTokenPricesStore((state) => state.fetchPrice);
  const [usersWithUSD, setUsersWithUSD] = useState<any[]>([]);
  const itemsPerPage = 5;

  // Fetch referred users data with server-side pagination
  useEffect(() => {
    if (!address) return;

    const fetchReferredUsers = async () => {
      setIsLoading(true);
      try {
        const data = await getReferredUsers({
          walletAddress: address,
          page: currentPage,
          limit: itemsPerPage
        });

        console.log("API Response:", data);
        console.log("Current Page:", currentPage);

        if (data?.referredUsers) {
          // Append new data to existing users or replace if page 1
          let updatedUsers: any[];
          if (currentPage === 1) {
            updatedUsers = data.referredUsers;
            setReferredUsers(data.referredUsers);
          } else {
            // Filter out duplicates by walletAddress before appending
            const existingAddresses = new Set(referredUsers.map(user => user.walletAddress.toLowerCase()));
            const newUsers = data.referredUsers.filter((user: any) =>
              !existingAddresses.has(user.walletAddress.toLowerCase())
            );

            if (newUsers.length === 0) {
              // No new users, we've reached the end
              console.log("No new referred users found, all are duplicates");
              setHasMore(false);
              setIsLoading(false);
              return;
            }

            updatedUsers = [...referredUsers, ...newUsers];
            setReferredUsers(updatedUsers);
          }

          // Get total from pagination object or fallback to totalReferrals or array length
          const total = data.pagination?.total || data.totalReferrals || data.referredUsers.length;
          setTotalReferrals(total);

          // Check if there are more items to load
          setHasMore(updatedUsers.length < total);


        } else {
          if (currentPage === 1) {
            setReferredUsers([]);
          }
          setTotalReferrals(0);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching referred users:", error);
        if (currentPage === 1) {
          setReferredUsers([]);
        }
        setTotalReferrals(0);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferredUsers();
  }, [address, currentPage]);

  // Fetch prices and calculate USD values for all users
  useEffect(() => {
    if (referredUsers.length === 0) {
      setUsersWithUSD([]);
      return;
    }

    const calculateUSDValues = async () => {
      const updatedUsers = await Promise.all(
        referredUsers.map(async (user) => {
          if (!user.earningsByToken) {
            return { ...user, calculatedTotalUSD: 0 };
          }

          let totalUSD = 0;

          for (const [tokenAddress, tokenData] of Object.entries(user.earningsByToken)) {
            const tokenInfo = getTokenByAddress(tokenAddress);
            if (tokenInfo && tokenData) {
              const price = await fetchPrice(tokenInfo.symbol);
              const amount = parseFloat((tokenData as any).amount || "0");

              // Only add to total if we have a valid price (> 0)
              // This filters out testnet tokens that don't have real market prices
              if (price && price > 0 && amount) {
                totalUSD += amount * price;
              }
            }
          }

          return { ...user, calculatedTotalUSD: totalUSD };
        })
      );

      setUsersWithUSD(updatedUsers);
    };

    calculateUSDValues();
  }, [referredUsers, fetchPrice]);

  const handleCopy = async (address: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // Prevent row click when copying
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleRowClick = (user: any) => {
    setSelectedReferral(user);
    setIsDetailsModalOpen(true);
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleExportCSV = () => {
    // Collect all unique token addresses across all users
    const allTokenAddresses = new Set<string>();
    referredUsers.forEach(user => {
      if (user.earningsByToken) {
        Object.keys(user.earningsByToken).forEach(addr => allTokenAddresses.add(addr));
      }
    });

    const tokenAddressList = Array.from(allTokenAddresses);

    // Helper to get token symbol
    const getTokenSymbol = (address: string) => {
      const normalizedAddress = address.toLowerCase();
      for (const chainTokens of Object.values(suggestedToken)) {
        const token = chainTokens.find(
          (t: any) => t.address.toLowerCase() === normalizedAddress
        );
        if (token) return token.symbol;
      }
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Build header with token columns
    const headers = [
      "#",
      "Referral Address",
      "Referred At",
      "Total Swaps",
      ...tokenAddressList.map(addr => `${getTokenSymbol(addr)} Amount`),
      ...tokenAddressList.map(addr => `${getTokenSymbol(addr)} USD`),
      "Total Earned (USD)",
      "Status"
    ];

    // Build rows with token data
    const rows = referredUsers.map((user, idx) => {
      const tokenAmounts = tokenAddressList.map(addr => {
        const tokenData = user.earningsByToken?.[addr];
        return tokenData ? parseFloat(tokenData.amount || "0").toFixed(6) : "0.000000";
      });

      const tokenUSDValues = tokenAddressList.map(addr => {
        const tokenData = user.earningsByToken?.[addr];
        return tokenData ? parseFloat(tokenData.amountUSD || "0").toFixed(2) : "0.00";
      });

      return [
        idx + 1,
        user.walletAddress,
        user.referredAt ? formatDistanceToNow(new Date(user.referredAt), { addSuffix: true }) : "N/A",
        user.totalSwaps || 0,
        ...tokenAmounts,
        ...tokenUSDValues,
        parseFloat(user.totalEarnedUSD || "0").toFixed(2),
        user.isActive ? "Active" : "Inactive"
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "referrals.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-formula font-normal uppercase text-primary">
          Referral List
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="h-auto py-2.5 px-[18px] text-sm font-sans font-normal uppercase rounded-full border-black/10 dark:border-white/10 hover:bg-primary/10 hover:text-primary hover:border-primary/50 active:bg-primary/10 active:text-primary active:border-primary/50 bg-transparent"
          onClick={handleExportCSV}
        >
          Export CSV
        </Button>
      </div>

      <Card className="dark:bg-[#121212] bg-slate-100 border-black/10 dark:border-[rgba(255,255,255,0.03)] overflow-hidden p-0 rounded-xl border">
        <div className="p-0">
          <Table>
            <TableHeader className="dark:bg-[#121212] bg-gray-50">
              <TableRow className="border-b border-black/10 dark:border-[rgba(255,255,255,0.08)] hover:bg-transparent">
                <TableHead className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] h-10 pl-4 w-[40px]">
                  #
                </TableHead>
                <TableHead className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] h-10 w-[240px]">
                  Referral Address
                </TableHead>
                <TableHead className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] h-10 w-[120px] text-right">
                  Referred At
                </TableHead>
                <TableHead className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] h-10 text-right pr-4">
                  Earnings (USD)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className="border-b border-white/5 h-12">
                    <TableCell className="py-1 pl-4">
                      <Skeleton className="h-4 w-6" />
                    </TableCell>
                    <TableCell className="py-1">
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="py-1 text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                    <TableCell className="py-1 pr-4 text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : usersWithUSD.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 dark:text-[#a3a3a3] text-gray-500">
                    No referrals yet
                  </TableCell>
                </TableRow>
              ) : (
                usersWithUSD.map((user, index) => {
                  const displayUSD = user.calculatedTotalUSD > 0
                    ? user.calculatedTotalUSD
                    : parseFloat(user.totalEarnedUSD || "0");

                  return (
                    <TableRow
                      key={user.walletAddress}
                      onClick={() => handleRowClick(user)}
                      className="border-b border-black/10 dark:border-[rgba(255,255,255,0.03)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] group transition-colors h-12 cursor-pointer"
                    >
                      <TableCell className="font-sans font-mono text-xs dark:text-[#a3a3a3] text-gray-500 py-1 pl-4">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-sans font-mono text-sm dark:text-gray-300 text-gray-500 py-1">
                        <div className="flex items-center gap-2">
                          {`${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                          <button
                            onClick={(e) => handleCopy(user.walletAddress, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity dark:text-[#a3a3a3] text-gray-500 hover:text-white active:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="font-sans text-xs dark:text-[#a3a3a3] text-gray-500 py-1 text-right">
                        {user.referredAt
                          ? formatDistanceToNow(new Date(user.referredAt), { addSuffix: true })
                          : "N/A"}
                      </TableCell>
                      <TableCell className="font-sans text-right font-medium text-sm py-1 pr-4">
                        {displayUSD > 0 ? (
                          <>${renderFormattedValue(displayUSD)}</>
                        ) : (
                          <span className="dark:text-[#a3a3a3] text-gray-500">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {hasMore && !isLoading && (
          <div className="border-t border-white/10">
            <button
              onClick={handleLoadMore}
              className="w-full h-8 flex items-center justify-center gap-2 font-sans text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3] hover:text-primary hover:bg-primary/5 active:text-primary active:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Load More
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        )}
        {isLoading && referredUsers.length > 0 && (
          <div className="border-t border-white/10 py-2 flex justify-center">
            <div className="text-xs text-[#a3a3a3] font-sans">Loading more...</div>
          </div>
        )}
      </Card>

      {/* Referral Details Modal */}
      <ReferralDetailsModal
        isOpen={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        referralData={selectedReferral}
      />
    </div>
  );
}
