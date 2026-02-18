"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Copy } from "lucide-react";
import { Check } from "lucide-react";
import TransactionsTable from "@/components/trading-live-inner/transactions-table/TransactionsTable";
import PoolChart from "@/components/trading-live-inner/PoolChart";
import { toast } from "react-toastify";
import PoolPrice from "@/components/trading-live/coin-table-comps/PoolPrice";
import Liq from "@/components/trading-live-inner/Liq";
import TotalSupplyCal from "@/components/trading-live-inner/TotalSupplyCal";
import { useRouter } from "next/navigation";
import TopHolders from "@/components/trading-live-inner/TopHolders";
import { SinglePoolData } from "@/types/trading-live-table.types";
import Stats from "@/components/trading-live-inner/Stats";
import Trade from "@/components/trading-live-inner/Trade";
import AddLiquidity from "@/components/trading-live-inner/AddLiquidity";
import {
  getPositionOneOftheTokenPair,
  getPositionTwoOftheTokenPair,
} from "@/lib/utils";
import { adjustTokenSymbol } from "@/lib/token-utils";

interface TradingLiveInnerProps {
  poolData: SinglePoolData;
}

export interface BasePriceObj {
  tick: number;
  decimalsCanonical0: number;
  decimalsCanonical1: number;
  priceCanonical: number;
  inversePriceCanonical: number;
}

const TradingLiveInnerComp: React.FC<TradingLiveInnerProps> = (props) => {
  const { poolData } = props;

  const router = useRouter();
  const chainId =
    poolData.chain.id === "bsc"
      ? 56
      : poolData.chain.id === "ethereum"
      ? 1
      : 8453;

  const positionOneOfTheTokenPair = getPositionOneOftheTokenPair(poolData);
  const positionTwoOfTheTokenPair = getPositionTwoOftheTokenPair(poolData);

  const adjustedToken0Symbol = adjustTokenSymbol(
    positionOneOfTheTokenPair.symbol,
    chainId
  );
  const adjustedToken1Symbol = adjustTokenSymbol(
    positionTwoOfTheTokenPair.symbol,
    chainId
  );

  const handlePoolAddressCopy = async () => {
    try {
      const textToCopy = poolData.pool_address;
      if (!textToCopy) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      toast.success(
        <div>
          <p>Pool address copied to clipboard</p>
        </div>,
        {
          toastId: "swap-success-toast",
        }
      );
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div
            className="text-primary font-lato text-sm  flex items-center cursor-pointer"
            onClick={handleGoBack}
          >
            <ArrowLeft size={20} /> Back
          </div>
        </div>
      </div>

      {poolData && (
        <Card className="w-full max-w-[1332px] mx-auto bg-white dark:bg-[#0E0E10] border-white/10 p-6 rounded-2xl">
          <div className="flex items-center gap-6">
            {/* Token Identity */}
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={positionOneOfTheTokenPair?.logo || ""}
                  alt={adjustedToken0Symbol}
                  className="rounded-full object-contain p-2"
                />
                <AvatarFallback className="bg-white/10 border border-white/10 text-primary font-lato text-2xl">
                  {adjustedToken0Symbol.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-formula text-2xl font-light uppercase text-foreground">
                    {adjustedToken0Symbol}
                  </h1>
                  <span className="font-lato text-sm text-[oklch(0.556_0_0)]">
                    {adjustedToken0Symbol} on {adjustedToken1Symbol}
                  </span>
                </div>
                <button
                  onClick={handlePoolAddressCopy}
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors self-start"
                >
                  <span className="font-lato text-xs text-[oklch(0.556_0_0)]">
                    {poolData.pool_address.slice(0, 6) + "..." + poolData.pool_address.slice(-4)}
                  </span>
                  <Copy className="h-3 w-3 text-[oklch(0.556_0_0)]" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="font-lato text-3xl font-light text-foreground">
                <PoolPrice poolPrice={positionOneOfTheTokenPair.price_usd} />
              </div>
            </div>

            <div className="flex items-center gap-6 ml-auto">
              <div className="flex flex-col gap-0.5">
                <div className="font-formula text-sm uppercase text-primary tracking-wider">Liquidity</div>
                <div className="font-lato text-base text-foreground">
                  $<Liq poolLiquidityUSD={poolData.pool_liquidity.total_value_usd} />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="font-formula text-sm uppercase text-primary tracking-wider">Supply</div>
                <div className="font-lato text-base text-foreground">
                  <TotalSupplyCal
                    totalSupply={positionOneOfTheTokenPair.total_supply}
                    tokenDecimals={positionOneOfTheTokenPair.decimals}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="font-formula text-sm uppercase text-primary tracking-wider">Fee</div>
                <div className="font-lato text-base text-foreground">{poolData.fee_tier}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <Card className="w-full bg-white dark:bg-[#0E0E10] border border-white/10 p-0 overflow-hidden">
            <PoolChart poolAddress={poolData.pool_address} chainId={chainId} />
          </Card>
          <Card className="w-full bg-white dark:bg-[#0E0E10]  flex flex-col  items-center justify-center p-5 space-y-2 border border-white/10 ">
            {poolData && (
              <TransactionsTable
                tokenAddress={positionOneOfTheTokenPair.address}
                poolAddress={poolData.pool_address}
                chainId={chainId}
                startblock={poolData.created_at.block}
                endblock="latest"
                token0PriceInUSD={positionOneOfTheTokenPair.price_usd}
              />
            )}
          </Card>
          {poolData && (
            <TopHolders
              tokenAddress={poolData.token0.address}
              chainId={chainId}
            />
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          {poolData && (
            <Trade
              poolData={poolData}
              liquidityAmount={poolData.pool_liquidity.total_value_usd}
            />
          )}
          <Stats
            token0={poolData.token0}
            token1={poolData.token1}
            mcp={positionOneOfTheTokenPair.market_cap}
            liquidity={poolData.pool_liquidity.total_value_usd}
            poolDeployedDate={poolData.created_at}
            volume24h={poolData.volume.volume_24h_usd}
            fdv={positionOneOfTheTokenPair.fdv}
            tokenAddress={positionOneOfTheTokenPair.address}
            chainId={chainId}
          />

          {poolData &&
            (() => {
              const priceCanonical = poolData.token0.price_in_paired_token || 0;
              const basePrice: BasePriceObj = {
                tick: 0,
                decimalsCanonical0: poolData.token0.decimals,
                decimalsCanonical1: poolData.token1.decimals,
                priceCanonical,
                inversePriceCanonical: priceCanonical ? 1 / priceCanonical : 0,
              };
              return <AddLiquidity poolData={poolData} />;
            })()}
        </div>
      </div>
    </div>
  );
};

export default TradingLiveInnerComp;
