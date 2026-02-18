"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import ReferralStatCard from "@/components/referrals/ReferralStatCard";
import ReferralLinkCard from "./ReferralLinkCard";
import ReferralListTable from "./ReferralListTable";
import ConvertRewards from "./ConvertRewards";
import EarningsManagement from "./EarningsManagement";
import { generateReferralCode, getReferralStats } from "@/lib/actions/referrals.actions";
import { toast } from "../ui/use-toast";
import { getTradeUrl } from "@/lib/url-utils";
import RewardDetails from "./RewardDetails";
import ClaimHistoryCard from "./ClaimHistoryCard";
import FAQSection from "./FAQSection";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";

export const ReferralView = () => {
  const { address } = useAccount();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReferralCode, setIsLoadingReferralCode] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [pendingEarningsUSD, setPendingEarningsUSD] = useState<number>(0);
  const [claimHistoryUSD, setClaimHistoryUSD] = useState<number>(0);

  useEffect(() => {
    if (!address) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const data = await getReferralStats({ walletAddress: address });
        setStats(data);
      } catch (error) {
        console.error("Error fetching referral stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [address]);

  useEffect(() => {
    if (!address) return;


    const fetchReferralCode = async () => {
      setIsLoadingReferralCode(true);

      const result = await generateReferralCode({ walletAddress: address });

      if (result.success) {
        console.log("Referral code created successfully", result.data);
        setReferralCode(result.data.referralCode);
        console.log("Referral code ", result.data.referralCode);

      } else {
        console.log("Error creating referral code:", result.message);
      }
      setIsLoadingReferralCode(false);
    };
    fetchReferralCode();
  }, [address]);


  useEffect(() => {
    console.log("Referral Stats:", stats);
  }, [stats]);

  // Calculate total earnings USD from both pending and claimed
  const totalEarningsUSD = pendingEarningsUSD + claimHistoryUSD;

  // Calculate total earnings from all tokens (legacy )
  const totalEarnings = stats?.stats?.earnings
    ? Object.values(stats.stats.earnings).reduce((sum: number, entry: any) => {
      try {
        return sum + Number(BigInt(entry.total || "0")) / 1e18;
      } catch {
        return sum;
      }
    }, 0)
    : 0;

  return (
    <div className="space-y-6 max-w-[1332px] mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="title-large-semi-bold uppercase">
          referral dashboard
        </h1>
        <p className="text-xs font-lato font-normal dark:text-[#a3a3a3] text-gray-500 tracking-wider">
          Track your referrals, manage earnings, and claim rewards directly to your wallet.
        </p>
      </div>

      {/* Stats Section - Moved to top for better alignment */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
        <ReferralStatCard
          value={String(Math.floor(stats?.stats?.totalReferred || 0))}
          label="Total Referrals"
          isLoading={isLoading}
        />
        <ReferralStatCard
          value={<>${renderFormattedValue(totalEarningsUSD)}</>}
          label="Total Earnings"
          variant="earnings"
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6">
        {/* Left Column: Actions & List */}
        <div className="space-y-6">
          <ReferralLinkCard
            referralLink={referralCode ? `${getTradeUrl()}?ref=${referralCode}` : getTradeUrl()}
            isLoading={isLoadingReferralCode}
          />
          <RewardDetails />
          <ReferralListTable />
        </div>

        {/* Right Column: Earnings Management & FAQ */}
        <div className="space-y-6">
          <EarningsManagement onTotalUSDChange={setPendingEarningsUSD} />
          <ClaimHistoryCard onTotalUSDChange={setClaimHistoryUSD} />
          <FAQSection />
        </div>
      </div>
    </div>
  );
};

export default ReferralView;