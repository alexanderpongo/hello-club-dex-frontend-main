"use client";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChartColumn,
  DollarSign,
  Plus,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import {
  SinglePoolData,
  SingleTokenInfo,
} from "@/types/trading-live-table.types";
import { adjustTokenSymbol } from "@/lib/token-utils";
import CommonCard from "../CommonCard";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";
import MyPoolsPositionsTable from "@/components/pools/pools-positions/MyPoolsPositionsTable";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import {
  AdjustedPosition,
  LiquidityPositionResponse,
} from "@/types/lp-page.types";
import { useRouter } from "next/navigation";
import AddLpModels from "@/components/pools/models/AddLpModels";
import SwapModel from "@/components/pools/models/SwapModel";
import {
  getPositionOneOftheTokenPair,
  getPositionTwoOftheTokenPair,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PoolPositionInnerViewProps {
  poolData: SinglePoolData;
}

export interface BasePriceObj {
  tick: number;
  decimalsCanonical0: number;
  decimalsCanonical1: number;
  priceCanonical: number;
  inversePriceCanonical: number;
}

const PoolPositionInnerView: React.FC<PoolPositionInnerViewProps> = (props) => {
  const { poolData } = props;
  const { address: userWalletAddress } = useAccount();
  const router = useRouter();

  const [adjustedToken0Price, setAdjustedToken0Price] =
    useState<ReactNode>("0");
  const [adjustedTotalLiquidity, setAdjustedTotalLiquidity] =
    useState<ReactNode>("0");
  const [adjustedMarketCap, setAdjustedMarketCap] = useState<ReactNode>("0");
  const [adjustedH24Change, setAdjustedH24Change] = useState<ReactNode>(
    <div className="text-xl text-[#22C55E]">0 %</div>
  );

  useEffect(() => {
    if (poolData) {
      const token0Price = renderFormattedValue(poolData.token0.price_usd);
      setAdjustedToken0Price(token0Price);

      const totalLiquidity = renderFormattedValue(
        poolData.pool_liquidity.total_value_usd
      );
      setAdjustedTotalLiquidity(totalLiquidity);
      const marketCap = renderFormattedValue(poolData.token0.market_cap);
      setAdjustedMarketCap(marketCap);
      const h24VolumeChange = poolData.volume.volume_24h_change;
      const h24ChangeElement =
        h24VolumeChange === 0 ? (
          <div className="text-xl text-[#22C55E]">{h24VolumeChange} %</div>
        ) : h24VolumeChange > 0 ? (
          <div className="text-xl text-[#22C55E]">
            +{h24VolumeChange.toFixed(2)} %
          </div>
        ) : (
          <div className="text-xl text-[#F87171]">
            {h24VolumeChange.toFixed(2)} %
          </div>
        );
      setAdjustedH24Change(h24ChangeElement);
    }
  }, [poolData]);

  const chainId =
    poolData.chain.id === "bsc"
      ? 56
      : poolData.chain.id === "ethereum"
        ? 1
        : poolData.chain.id === "base"
          ? 8453
          : 56;

  const chainContractConfig: ContractConfigItemType =
    contractConfig[chainId ?? "default"];

  const chainImageSrc =
    poolData.chain.id === "bsc"
      ? "/chain-icons/bnb.svg"
      : poolData.chain.id === "ethereum"
        ? "/chain-icons/ethereum-eth.svg"
        : poolData.chain.id === "base"
          ? "/chain-icons/base-logo.png"
          : "";

  const token0Initial = (
    poolData.token0.symbol?.trim()?.charAt(0) ?? ""
  ).toUpperCase();
  const token1Initial = (
    poolData.token1.symbol?.trim()?.charAt(0) ?? ""
  ).toUpperCase();

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

  const getDexToolLink = (poolAddress: string, chainId: number) => {
    switch (chainId) {
      case 1:
        return `https://www.dextools.io/app/ether/pair-explorer/${poolAddress}`;
      case 56:
        return `https://www.dextools.io/app/bnb/pair-explorer/${poolAddress}`;
      case 8453:
        return `https://www.dextools.io/app/base/pair-explorer/${poolAddress}`;
      default:
        return "#";
    }
  };

  const getDexScreenerLink = (poolAddress: string, chainId: number) => {
    switch (chainId) {
      case 1:
        return `https://dexscreener.com/ethereum/${poolAddress}`;
      case 56:
        return `https://dexscreener.com/bsc/${poolAddress}`;
      case 8453:
        return `https://dexscreener.com/base/${poolAddress}`;
      default:
        return "#";
    }
  };

  const getScannerImage = (chainId: number) => {
    switch (chainId) {
      case 1:
        return "/chain-icons/chain-tools/etherscan.svg";
      case 56:
        return "/chain-icons/chain-tools/bscscan.svg";
      case 8453:
        return "/chain-icons/chain-tools/basescan.svg";
      default:
        return "";
    }
  };

  const fetchUserPoolsPositions = async (
    userAddress: string,
    poolAddress: string,
    chain: string
  ): Promise<LiquidityPositionResponse | null> => {
    try {
      const response = await fetch("/api/get-positions-by-pool-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: userAddress,
          poolAddress: poolAddress,
          chain: chain,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user pools positions:", error);
      return null;
    }
  };

  const { data: myLpPositions, isLoading: myLpPositionsLoading } =
    useQuery<LiquidityPositionResponse | null>({
      queryKey: [
        "user-pools-positions",
        userWalletAddress,
        poolData.pool_address,
        chainId,
      ],
      queryFn: () =>
        fetchUserPoolsPositions(
          userWalletAddress as string,
          poolData.pool_address,
          poolData.chain.id
        ),
      enabled:
        !!userWalletAddress && !!poolData.chain.id && !!poolData.pool_address,
    });

  const adjustedPositionArray: AdjustedPosition[] = useMemo(() => {
    const positions = myLpPositions?.data?.positions ?? [];
    return positions.map((pos: any) => ({ ...pos, poolData }));
  }, [myLpPositions, poolData]);

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <Button
          variant={"ghost"}
          className="flex gap-2 items-center text-sm font-lato dark:text-[#adff2f] text-[#9fcd0a] cursor-pointer hover:text-[#8FDD00] px-0"
          onClick={() => router.push(`/pools`)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pools
        </Button>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex items-center flex-shrink-0">
            <Avatar className="w-14 h-14 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2 ">
              <AvatarImage
                src={positionOneOfTheTokenPair.logo!}
                alt={positionOneOfTheTokenPair.symbol!}
                width={56}
                height={56}
              />
              <AvatarFallback>
                {poolData.token0.price_source === "calculated"
                  ? token0Initial
                  : token1Initial}
              </AvatarFallback>
            </Avatar>
            <Avatar className="w-12 h-12 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2 ">
              <AvatarImage
                src={positionTwoOfTheTokenPair.logo!}
                alt={positionTwoOfTheTokenPair.symbol!}
                width={48}
                height={48}
              />
              <AvatarFallback>
                {poolData.token0.price_source === "native"
                  ? token0Initial
                  : token1Initial}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-0.5">
              <h1 className="text-3xl md:text-[2.5rem] dark:text-white text-black uppercase leading-tight font-formula font-normal tracking-tight">
                {`${adjustedToken0Symbol} / ${adjustedToken1Symbol}`}
              </h1>
              <div className="flex items-center gap-1.5">
                <Link
                  href={getDexToolLink(poolData.pool_address, chainId)}
                  target="_blank"
                  className="w-8 h-8 dark:bg-[#1A1A1A] bg-slate-200 dark:hover:bg-[#252525] hover:bg-slate-200 border border-[rgba(255,255,255,0.1)] rounded-sm flex items-center justify-center transition-all group"
                >
                  <Image
                    src={"/chain-icons/chain-tools/dextools.svg"}
                    width={16}
                    height={16}
                    alt="Dextools"
                  />
                </Link>
                <Link
                  href={getDexScreenerLink(poolData.pool_address, chainId)}
                  target="_blank"
                  className="w-8 h-8 dark:bg-[#1A1A1A] bg-slate-200 dark:hover:bg-[#252525] hover:bg-slate-200 border border-[rgba(255,255,255,0.1)] rounded-sm flex items-center justify-center transition-all group"
                >
                  <Image
                    src={"/chain-icons/chain-tools/dexscreener.svg"}
                    width={16}
                    height={16}
                    alt="Dextools"
                  />
                </Link>
                <Link
                  href={poolData.chain.explorerLink}
                  target="_blank"
                  className="w-8 h-8 dark:bg-[#1A1A1A] bg-slate-200 dark:hover:bg-[#252525] hover:bg-slate-200 border border-[rgba(255,255,255,0.1)] rounded-sm flex items-center justify-center transition-all group"
                >
                  <Image
                    src={getScannerImage(chainId)}
                    width={16}
                    height={16}
                    alt="Dextools"
                  />
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <div className="flex items-center gap-1.5">
                <Image
                  src={chainImageSrc}
                  alt="bsc"
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-full"
                />
                <span className="text-xs text-gray-400 font-lato uppercase">
                  {poolData.chain.name}
                </span>
              </div>
              <div className="inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/80 bg-[rgba(173,255,47,0.1)] dark:text-[#ADFF2F] text-[#9fcd0a]  border border-[rgba(173,255,47,0.3)] text-xs px-2 py-0.5 font-lato">
                V3
              </div>
              <div className="inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/80 bg-[#1A1A1A] text-white border border-[rgba(255,255,255,0.2)] text-xs px-2 py-0.5 font-lato">
                {poolData.fee_tier}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <SwapModel
            poolData={poolData}
            liquidityAmount={poolData.pool_liquidity.total_value_usd}
          />

          {(() => {
            const priceCanonical = poolData.token0.price_in_paired_token || 0;
            const basePrice: BasePriceObj = {
              tick: 0,
              decimalsCanonical0: poolData.token0.decimals,
              decimalsCanonical1: poolData.token1.decimals,
              priceCanonical,
              inversePriceCanonical: priceCanonical ? 1 / priceCanonical : 0,
            };
            return <AddLpModels poolData={poolData} basePrice={basePrice} />;
          })()}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-4 grid-cols-1">
        <CommonCard
          icon={
            <DollarSign className="h-4 w-4 dark:text-[#ADFF2F] text-[#9fcd0a]" />
          }
          title={`${adjustedToken0Symbol} PRICE`}
          value={
            <>
              <span>$</span> {adjustedToken0Price}
            </>
          }
        />

        <CommonCard
          icon={<Zap className="h-4 w-4 dark:text-[#ADFF2F] text-[#9fcd0a]" />}
          title={"TOTAL LIQUIDITY"}
          value={
            <>
              <span>$</span> {adjustedTotalLiquidity}
            </>
          }
        />

        <CommonCard
          icon={
            <ChartColumn className="h-4 w-4 dark:text-[#ADFF2F] text-[#9fcd0a]" />
          }
          title={"MARKET CAP"}
          value={
            <>
              <span>$</span> {adjustedMarketCap}
            </>
          }
        />

        <CommonCard
          icon={
            <TrendingUp className="h-4 w-4 dark:text-[#ADFF2F] text-[#9fcd0a] " />
          }
          title={"24H CHANGE"}
          value={adjustedH24Change}
        />
      </div>

      <div>
        <h2 className="text-xl md:text-2xl font-formula font-normal uppercase text-primary">
          My Positions
        </h2>
      </div>

      <div className="">
        <MyPoolsPositionsTable
          tableData={adjustedPositionArray}
          tableLoading={myLpPositionsLoading}
        />
      </div>
    </div>
  );
};

export default PoolPositionInnerView;
