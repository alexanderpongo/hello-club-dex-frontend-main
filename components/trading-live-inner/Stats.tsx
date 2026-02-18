import React from "react";
import { Card } from "../ui/card";
import { BarChart3, Droplets, TrendingUp, Users } from "lucide-react";
import {
  CreatedAtInfo,
  SingleTokenInfo,
} from "@/types/trading-live-table.types";
import { renderFormattedValue } from "../trading-live/coin-table-new/utils";
import Age from "../trading-live/coin-table-new/Age";
import { useTopHolders } from "@/hooks/useTopHolders";

interface StatsProps {
  mcp: number;
  volume24h: number;
  liquidity: number;
  poolDeployedDate: CreatedAtInfo;
  fdv: number;
  token0: SingleTokenInfo;
  token1: SingleTokenInfo;
  tokenAddress: string;
  chainId: number;
}

const Stats: React.FC<StatsProps> = (props) => {
  const {
    mcp,
    volume24h,
    liquidity,
    poolDeployedDate,
    fdv,
    token0,
    token1,
    tokenAddress,
    chainId,
  } = props;

  const { holders, isLoading, error, hasMore, loadMore, totalHolders } =
    useTopHolders({
      tokenAddress,
      chainId,
      limit: 10,
      enabled: !!tokenAddress && !!chainId,
    });

  return (
    <Card className="w-full bg-white card-primary border-none flex flex-col items-center justify-center p-5 space-y-3">
      <div className="flex w-full p-3">
        <div className="text-primary text-[32px] font-formula leading-7 font-light uppercase text-left">
          Stats
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 w-full">
        {/* Market Cap */}
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-gray-100 dark:bg-zinc-900 p-2">
            <TrendingUp className="sm:h-7 sm:w-7 h-5 w-5 text-gray-500 dark:text-zinc-400" />
          </div>
          <div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-zinc-500">
              MARKET CAP
            </div>
            <div className="text-sm font-semibold text-gray-800 dark:text-white">
              ${renderFormattedValue(mcp)}
            </div>
            {/* <div className="text-xs font-medium text-green-500 dark:text-lime-400">
              +231.4%
            </div> */}
          </div>
        </div>

        {/* 24H Volume */}
        <div className="flex items-start gap-3 w-full">
          <div className="rounded-lg bg-gray-100 dark:bg-zinc-900 p-2">
            <BarChart3 className="sm:h-7 sm:w-7 h-5 w-5 text-gray-500 dark:text-zinc-400" />
          </div>
          <div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-zinc-500">
              24H VOLUME
            </div>
            <div className="text-sm font-semibold text-gray-800 dark:text-white">
              {renderFormattedValue(volume24h)}
            </div>
          </div>
        </div>

        {/* Liquidity */}
        <div className="flex items-start gap-3 w-full">
          <div className="rounded-lg bg-gray-100 dark:bg-zinc-900 p-2">
            <Droplets className="sm:h-7 sm:w-7 h-5 w-5 text-gray-500 dark:text-zinc-400" />
          </div>
          <div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-zinc-500">
              LIQUIDITY
            </div>
            <div className="text-sm font-semibold text-gray-800 dark:text-white">
              ${renderFormattedValue(liquidity)}
            </div>
          </div>
        </div>

        {/* Holders */}
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-gray-100 dark:bg-zinc-900 p-2">
            <Users className="sm:h-7 sm:w-7 h-5 w-5 text-gray-500 dark:text-zinc-400" />
          </div>
          <div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-zinc-500">
              HOLDERS
            </div>
            <div className="text-sm font-semibold text-gray-800 dark:text-white">
              {totalHolders}
            </div>
          </div>
        </div>
      </div>

      {/* Key-Value Pairs */}
      <div className="space-y-3 border-t border-gray-200 dark:border-zinc-800 pt-4 w-full">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-zinc-400">Age</span>
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            <Age created_at={poolDeployedDate} />
          </span>
        </div>
        {/* <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-zinc-400">
            Txns 24h
          </span>
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            31K
          </span>
        </div> */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-zinc-400">FDV</span>
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            ${renderFormattedValue(fdv)}
          </span>
        </div>
      </div>

      {/* Pool Section */}
      <div className="mt-6 space-y-3 border-t border-gray-200 dark:border-zinc-800 pt-4 w-full">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500">
          Pool
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-zinc-400">
            {token0.symbol}
          </span>
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {renderFormattedValue(token0.balance_in_pool)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-zinc-400">
            {token1.symbol}
          </span>
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {renderFormattedValue(token1.balance_in_pool)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default Stats;
