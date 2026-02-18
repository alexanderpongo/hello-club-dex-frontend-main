"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { Loader2, Plus, Minus, ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chains } from "@/config/chains";
import { MyPositionsResponse, Position } from "@/types/my-positions.types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import IncreaseLpModel from "@/components/pools/models/IncreaseLPModel";
import RemoveLpDialog from "@/components/pools/models/RemoveLPModel";
import TokenPair from "@/components/pools/pools-main/table/positions-table/TokenPair";
import FeeTier from "@/components/pools/pools-main/table/FeeTier";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";
import { useNewIncreaseLpStore } from "@/store/new-increase-lp.store";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info, Layers, Zap } from "lucide-react";

const LPActionButtons = ({ pos, chainId, chainName }: { pos: Position, chainId: number, chainName: string }) => {
    const { setFromLPToken, setToLPToken } = useNewIncreaseLpStore();
    const router = useRouter();

    // Prepare full pool data for models
    const fullPoolData = {
        ...pos.pool,
        chain: { id: chainName }
    } as any;

    const handleActionClick = () => {
        setFromLPToken({
            address: pos.pool.token0.address,
            chainId: chainId,
            decimals: pos.pool.token0.decimals,
            logoURI: pos.pool.token0.logo || "",
            symbol: pos.pool.token0.symbol,
            name: pos.pool.token0.name,
        });

        setToLPToken({
            address: pos.pool.token1.address,
            chainId: chainId,
            decimals: pos.pool.token1.decimals,
            logoURI: pos.pool.token1.logo || "",
            symbol: pos.pool.token1.symbol,
            name: pos.pool.token1.name,
        });
    };

    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto md:ml-auto mt-6 md:mt-0" onClick={handleActionClick}>
            <div className="flex items-center bg-black/40 dark:bg-white/[0.04] rounded-full p-1 border border-white/5 w-full sm:w-auto shadow-inner">
                <IncreaseLpModel
                    id={pos.token_id}
                    poolData={fullPoolData}
                    positionData={pos as any}
                    className="h-10 sm:h-9 px-5 rounded-full bg-primary text-black hover:bg-primary/90 border-0 text-[11px] font-bold flex-1 sm:flex-none uppercase transition-all shadow-lg shadow-primary/10"
                />
                <RemoveLpDialog
                    positionData={pos as any}
                    className="h-10 sm:h-9 px-5 rounded-full bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border-0 text-[11px] font-bold flex-1 sm:flex-none uppercase transition-all"
                />
            </div>

            <div className="h-6 w-[1px] bg-white/10 mx-1 hidden md:block" />

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/earn/bonds?tab=buy-bond`)}
                    className="h-10 sm:h-9 px-6 rounded-full border-primary/30 text-primary hover:bg-primary hover:text-black font-lato text-[11px] font-normal uppercase flex-1 sm:flex-none transition-all shadow-sm"
                >
                    BOND <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-10 sm:h-9 px-6 rounded-full bg-white/[0.04] border-white/10 text-gray-300 hover:bg-white/10 hover:text-white font-lato text-[11px] uppercase font-normal transition-all flex-1 sm:flex-none"
                >
                    CLAIM
                </Button>
            </div>
        </div>
    );
};

const AddingLPToBond = () => {
    const baseURL = process.env.NEXT_PUBLIC_TRADING_LIVE_BASE_API;
    const { address } = useAccount();
    const { openConnectModal } = useConnectModal();
    const router = useRouter();
    const [chain, setChain] = useState<string>("bsc");

    const handleFetchData = async (): Promise<MyPositionsResponse | null> => {
        if (!address) return null;
        const url = `${baseURL}/positions/${chain}/user/${address}`;
        try {
            const res = await axios.get(url);
            return res.data;
        } catch (error) {
            console.error("Error fetching data:", error);
            return null;
        }
    };

    const { data, isLoading } = useQuery<MyPositionsResponse | null>({
        queryKey: ["user-positions-bonds", chain, address],
        queryFn: handleFetchData,
        placeholderData: keepPreviousData,
        staleTime: 300000,
        enabled: !!address,
    });

    const chainImage = (chainId: number) => {
        const chainInfo = chains.find((c) => c.chainId === Number(chainId));
        return chainInfo?.image || "";
    };

    const getChainId = (c: string) => {
        if (c === "bsc") return 56;
        if (c === "ethereum") return 1;
        if (c === "base") return 8453;
        return 56;
    };

    // Mock data for display when not connected
    const mockPositions: Position[] = [
        {
            token_id: "740213",
            pool: {
                address: "0x123...456" as `0x${string}`,
                token0: { symbol: "HELLO", name: "HELLO Labs", decimals: 18, logo: "/icons/hello.svg", address: "0x..." as `0x${string}`, price_usd: 0.05 },
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
                token1_per_token0: { price_lower: 0, price_upper: 999999, current_price: 1, format: "HELLO/WBNB", token0: "HELLO", token1: "WBNB" },
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
    ];

    const activePositions = address ? (data?.data.positions || []) : mockPositions;

    return (
        <div className="flex flex-col w-full space-y-6">
            {/* Header Actions */}
            <div className="flex flex-row flex-wrap items-center gap-2 md:gap-4">
                <Select value={chain} onValueChange={setChain}>
                    <SelectTrigger className="w-fit min-w-[130px] rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 h-9 md:h-10 px-4 md:px-6 font-lato text-xs md:text-sm">
                        <SelectValue placeholder="Select Chain" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[#1A1A1A] bg-white border-white/10">
                        <SelectItem value="bsc">
                            <div className="flex items-center gap-2">
                                <Image src={chainImage(56)} alt="BNB" width={16} height={16} />
                                <span>BNB Chain</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="ethereum">
                            <div className="flex items-center gap-2">
                                <Image src={chainImage(1)} alt="ETH" width={16} height={16} />
                                <span>Ethereum</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="base">
                            <div className="flex items-center gap-2">
                                <Image src={chainImage(8453)} alt="Base" width={16} height={16} />
                                <span>Base</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    onClick={() => router.push("/lp")}
                    className="flex-1 sm:flex-none rounded-full bg-primary text-black hover:bg-primary/80 font-lato font-normal px-4 md:px-6 h-9 md:h-10 text-xs md:text-sm shadow-[0_2px_10px_rgba(194,254,12,0.2)] active:scale-95 transition-all"
                >
                    <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> NEW LP
                </Button>
            </div>

            {/* Positions List */}
            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : activePositions.length > 0 ? (
                    activePositions.map((pos, index) => {
                        const isFeatured = pos.pool.token0.symbol === 'HELLO';
                        const chainId = getChainId(chain);

                        return (
                            <div
                                key={pos.token_id}
                                className={`relative flex flex-col md:flex-row md:items-center dark:bg-[#121212] bg-white rounded-xl border border-black/10 dark:border-white/[0.08] transition-all duration-300 group ${isFeatured
                                        ? 'bg-primary/[0.01]'
                                        : ''
                                    } hover:border-primary/60 hover:shadow-[inset_0_0_30px_rgba(194,254,12,0.08)] p-5 md:px-8 md:py-7 gap-6 md:gap-16 my-4 shadow-sm`}
                            >
                                <div className="flex items-center justify-between md:justify-start gap-8 min-w-[240px]">
                                    <div className="flex items-center gap-3">
                                        <TokenPair chain={chain} pool={pos.pool} hideChain />
                                        {isFeatured && (
                                            <TooltipProvider delayDuration={0}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button className="focus:outline-none">
                                                            <Zap className="w-5 h-5 text-primary fill-current shrink-0 animate-pulse" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-black text-white border-white/10 text-[11px] font-lato">
                                                        Synthetic Bonds
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 md:hidden">
                                        <div className="px-2 py-0.5 bg-white/[0.03] rounded text-[10px] font-formula border border-white/10 text-gray-500 uppercase">
                                            #{pos.token_id}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 md:flex md:items-center md:gap-20 w-full md:w-auto border-t border-white/[0.05] md:border-0 pt-6 md:pt-0">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] md:text-[11px] text-gray-400 uppercase font-medium tracking-wider font-lato">Value</span>
                                        <span className={`text-xl md:text-[22px] font-formula tracking-tight leading-none text-white/90`}>
                                            ${renderFormattedValue(pos.liquidity.current_amounts.total_usd!)}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] md:text-[11px] text-gray-400 uppercase font-medium tracking-wider font-lato">Bond Rewards</span>
                                            <TooltipProvider delayDuration={0}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button className="focus:outline-none">
                                                            <HelpCircle className="w-3.5 h-3.5 text-gray-600 hover:text-primary transition-colors cursor-help" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[280px] bg-black text-white p-4 text-[12px] rounded-xl border border-white/10 shadow-2xl font-lato leading-relaxed">
                                                        Bond rewards are additional incentives earned by participating in the Synthetic Bond program which is a collaboration between HELLO Labs and ApeBond, providing extra yield beyond standard LP fees.
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl md:text-[22px] font-formula tracking-tight leading-none text-primary">15%</span>
                                            <span className="text-[14px] text-primary font-bold opacity-80">+</span>
                                        </div>
                                    </div>
                                </div>

                                <LPActionButtons pos={pos} chainId={chainId} chainName={chain} />
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 md:py-24 bg-black/5 dark:bg-[#121212] rounded-2xl border border-black/10 dark:border-white/5">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                            <Layers className="w-8 h-8 text-primary opacity-60" />
                        </div>
                        <h3 className="text-lg font-formula text-primary uppercase mb-2">No Active Positions</h3>
                        <span className="text-gray-500 font-lato mb-8 text-sm max-w-[280px] text-center">Start providing liquidity on {chain.toUpperCase()} to participate in the bond program.</span>
                        <Button
                            onClick={() => router.push("/lp")}
                            className="rounded-full bg-primary text-black hover:bg-primary/80 h-11 px-10 font-formula uppercase tracking-tight shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                            START PROVIDING LIQUIDITY
                        </Button>
                    </div>
                )}
            </div>

            {/* Education Section - Redesigned for digestibility */}
            <div className="mt-8 p-1 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
                    {/* Step 1 */}
                    <div className="dark:bg-[#121212] bg-slate-100 border-black/10 dark:border-white/[0.03] rounded-2xl p-7 relative overflow-hidden group hover:border-primary/20 transition-all border">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <span className="font-formula text-primary text-sm">01</span>
                                </div>
                                <h3 className="text-lg font-formula text-primary uppercase tracking-wide">Provide Liquidity</h3>
                            </div>
                            <p className="text-sm dark:text-gray-400 text-gray-600 font-lato leading-relaxed flex-1">
                                Create a V3 Liquidity Provider (LP) position on the DEX to start earning trading fees.
                            </p>
                            <div className="mt-6 flex items-center w-fit text-[11px] text-primary font-lato font-bold uppercase tracking-[0.1em]">
                                <Layers className="w-4 h-4 mr-2" /> ACTIVE POSITION REQUIRED
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="dark:bg-[#121212] bg-slate-100 border-black/10 dark:border-white/[0.03] rounded-2xl p-7 relative overflow-hidden group hover:border-primary/20 transition-all border">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <span className="font-formula text-primary text-sm">02</span>
                                </div>
                                <h3 className="text-lg font-formula text-primary uppercase tracking-wide">Synthetic Bond Extraction</h3>
                            </div>
                            <p className="text-sm dark:text-gray-400 text-gray-600 font-lato leading-relaxed flex-1">
                                Visit the "BUY BOND" tab to sell your LP to the protocol. In return, you receive tokens at a discount plus an extra yield via the Synthetic Bond.
                            </p>
                            <div className="mt-6 flex items-center w-fit text-[11px] text-primary font-lato font-bold uppercase tracking-[0.1em]">
                                <Zap className="w-4 h-4 mr-2" /> GET BONDS REWARDS
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddingLPToBond;
