"use client";
import { MyPositionsResponse, Position } from "@/types/my-positions.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { useAccount } from "wagmi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { chains } from "@/config/chains";
import PositionsTable from "@/components/pools/pools-main/table/positions-table/PositionsTable";
import CommonCard from "../CommonCard";
import { TrendingUp, Zap, Users, Flame } from "lucide-react";
import PortfolioYieldGrowth from "./PortfolioYieldGrowth";

const MyPositions = () => {
  const baseURL = process.env.NEXT_PUBLIC_TRADING_LIVE_BASE_API;

  const { address } = useAccount();

  const [chain, setChain] = useState<string>("bsc");

  const handleFetchData = async (): Promise<MyPositionsResponse | null> => {
    const url = `${baseURL}/positions/${chain}/user/${address}`;
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };

  const { isPending, data, isLoading } = useQuery<MyPositionsResponse | null>({
    queryKey: ["user-positions", chain, address],
    queryFn: handleFetchData,
    placeholderData: keepPreviousData,
    staleTime: 300000,
    enabled: true, // Always enabled to support mock data fallback
  });

  const chainImage = (chainId: number) => {
    const chainInfo = chains.find((c) => c.chainId === Number(chainId));
    return chainInfo?.image || "";
  };

  // Mock data for display when not connected
  const mockPositions: Position[] = [
    {
      token_id: "740213",
      pool: {
        address: "0x123...456" as `0x${string}`,
        token0: { symbol: "HELLO", name: "HELLO Labs", decimals: 18, logo: "https://assets.coingecko.com/coins/images/28394/small/hello.png", address: "0x..." as `0x${string}`, price_usd: 0.05 },
        token1: { symbol: "WBNB", name: "Wrapped BNB", decimals: 18, logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png", address: "0x..." as `0x${string}`, price_usd: 300 },
        fee_tier: "0.05%",
        current_tick: 0
      },
      liquidity: {
        current: "1000000",
        original_deposited: { total_usd: 5000, token0: 50000, token1: 8.3 },
        current_amounts: { total_usd: 5240.50, token0: 52405, token1: 8.7 },
        withdrawn: { total_usd: 0, token0: 0, token1: 0 }
      },
      price_range: {
        tick_lower: -887200,
        tick_upper: 887200,
        tick_current: 0,
        in_range: true,
        token1_per_token0: { price_lower: 0.04, price_upper: 0.06, current_price: 0.05, format: "HELLO/WBNB", token0: "HELLO", token1: "WBNB" },
        token0_per_token1: { price_lower: 0, price_upper: 999999, current_price: 1, format: "WBNB/HELLO", token0: "WBNB", token1: "HELLO" }
      },
      fees: {
        uncollected: { total_usd: 125.40, token0: 1250, token1: 0.2 },
        collected: { total_usd: 500.20, token0: 5000, token1: 0.8 },
        total_earned: { total_usd: 625.60, token0: 6250, token1: 1.0 }
      },
      performance: {
        apr: 18.25,
        roi: 5.4,
        is_profitable: true,
        pnl: { net_pnl_usd: 240.50, fees_earned_usd: 625.60, impermanent_loss_usd: -385.10 },
        value_comparison: { current_usd: 5240.50, deposited_usd: 5000, if_held_usd: 5100, withdrawn_usd: 0 }
      },
      created_at: { timestamp: 1700000000, block: 18000000, date: "2024-01-01" }
    },
    {
      token_id: "852104",
      pool: {
        address: "0x789...012" as `0x${string}`,
        token0: { symbol: "ETH", name: "Ethereum", decimals: 18, logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png", address: "0x..." as `0x${string}`, price_usd: 2400 },
        token1: { symbol: "USDT", name: "Tether", decimals: 6, logo: "https://assets.coingecko.com/coins/images/325/small/tether.png", address: "0x..." as `0x${string}`, price_usd: 1 },
        fee_tier: "0.3%",
        current_tick: 0
      },
      liquidity: {
        current: "500000",
        original_deposited: { total_usd: 2000, token0: 0.4, token1: 1000 },
        current_amounts: { total_usd: 1960.20, token0: 0.38, token1: 1050 },
        withdrawn: { total_usd: 0, token0: 0, token1: 0 }
      },
      price_range: {
        tick_lower: -887200,
        tick_upper: 887200,
        tick_current: 0,
        in_range: false,
        token1_per_token0: { price_lower: 2000, price_upper: 3000, current_price: 2400, format: "ETH/USDT", token0: "ETH", token1: "USDT" },
        token0_per_token1: { price_lower: 0.0003, price_upper: 0.0005, current_price: 0.0004, format: "USDT/ETH", token0: "USDT", token1: "ETH" }
      },
      fees: {
        uncollected: { total_usd: 45.10, token0: 0.01, token1: 21 },
        collected: { total_usd: 120.50, token0: 0.03, token1: 48.5 },
        total_earned: { total_usd: 165.60, token0: 0.04, token1: 69.5 }
      },
      performance: {
        apr: 12.10,
        roi: -2.0,
        is_profitable: false,
        pnl: { net_pnl_usd: -39.80, fees_earned_usd: 165.60, impermanent_loss_usd: -205.40 },
        value_comparison: { current_usd: 1960.20, deposited_usd: 2000, if_held_usd: 2150, withdrawn_usd: 0 }
      },
      created_at: { timestamp: 1705000000, block: 18500000, date: "2024-01-15" }
    },
    {
      token_id: "963258",
      pool: {
        address: "0xabc...def" as `0x${string}`,
        token0: { symbol: "BNB", name: "Build N Build", decimals: 18, logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png", address: "0x..." as `0x${string}`, price_usd: 310 },
        token1: { symbol: "BUSD", name: "Binance USD", decimals: 18, logo: "https://assets.coingecko.com/coins/images/9576/small/BUSD.png", address: "0x..." as `0x${string}`, price_usd: 1 },
        fee_tier: "0.01%",
        current_tick: 0
      },
      liquidity: {
        current: "2000000",
        original_deposited: { total_usd: 10000, token0: 16.1, token1: 5000 },
        current_amounts: { total_usd: 10250.00, token0: 16.5, token1: 5125 },
        withdrawn: { total_usd: 0, token0: 0, token1: 0 }
      },
      price_range: {
        tick_lower: -887200,
        tick_upper: 887200,
        tick_current: 0,
        in_range: true,
        token1_per_token0: { price_lower: 300, price_upper: 330, current_price: 310, format: "BNB/BUSD", token0: "BNB", token1: "BUSD" },
        token0_per_token1: { price_lower: 0.0030, price_upper: 0.0033, current_price: 0.0032, format: "BUSD/BNB", token0: "BUSD", token1: "BNB" }
      },
      fees: {
        uncollected: { total_usd: 340.50, token0: 0.55, token1: 170 },
        collected: { total_usd: 850.00, token0: 1.37, token1: 425 },
        total_earned: { total_usd: 1190.50, token0: 1.92, token1: 595 }
      },
      performance: {
        apr: 24.50,
        roi: 11.9,
        is_profitable: true,
        pnl: { net_pnl_usd: 250.00, fees_earned_usd: 1190.50, impermanent_loss_usd: -940.50 },
        value_comparison: { current_usd: 10250.00, deposited_usd: 10000, if_held_usd: 10100, withdrawn_usd: 0 }
      },
      created_at: { timestamp: 1708000000, block: 19000000, date: "2024-02-15" }
    }
  ];

  const positions = address ? (data?.data.positions || []) : mockPositions;

  const personalTVL = positions.reduce((acc, p) => acc + (p.liquidity.current_amounts.total_usd || 0), 0);
  const claimableYield = positions.reduce((acc, p) => acc + (p.fees.uncollected.total_usd || 0), 0);
  const averageAPR = positions.length > 0
    ? positions.reduce((acc, p) => acc + (p.performance.apr || 0), 0) / positions.length
    : 0;
  const personal24hVolume = 0; // Placeholder as it's not directly in the positions data

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="grid gap-6 sm:grid-cols-4 grid-cols-2">
        <CommonCard
          icon={
            <TrendingUp className="h-4 w-4 dark:text-[#ADFF2F] text-[#9fcd0a]" />
          }
          title={"PERSONAL TVL"}
          value={`$${personalTVL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />

        <CommonCard
          icon={<Zap className="h-4 w-4 dark:text-[#ADFF2F] text-[#9fcd0a]" />}
          title={"PERSONAL 24H VOLUME"}
          value={`$${personal24hVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />

        <CommonCard
          icon={
            <Users className="h-4 w-4 dark:text-[#ADFF2F] text-[#9fcd0a]" />
          }
          title={"MY AVERAGE APR"}
          value={`${averageAPR.toFixed(2)} %`}
        />

        <CommonCard
          icon={
            <Flame className="h-4 w-4 dark:text-[#ADFF2F] text-[#9fcd0a]" />
          }
          title={"CLAIMABLE YIELD"}
          value={`$${claimableYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
      </div>

      <PortfolioYieldGrowth />

      <div className="dark:bg-[#121212] bg-slate-100  border border-[rgba(255,255,255,0.03)] rounded-xl overflow-hidden">
        {/* Spacer to match AllPools filter bar height and spacing */}
        <div className="">
          <PositionsTable
            positionsTableData={positions}
            chain={chain}
            tableLoading={isLoading && !!address}
          />
        </div>
      </div>
    </div>
  );
};

export default MyPositions;
