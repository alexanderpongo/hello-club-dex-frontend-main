"use client";
import { SinglePoolData } from "@/types/trading-live-table.types";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowLeft,
  CircleCheck,
  CircleX,
  Lock,
  Minus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { adjustTokenSymbol } from "@/lib/token-utils";
import { Position } from "@/types/lp-page.types";
import { Toggle } from "@/components/ui/toggle";
import TransactionsTable from "@/components/pools/positions/TransactionsTable";
import IncreaseLpModel from "@/components/pools/models/IncreaseLPModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";
import {
  getPositionOneOftheTokenPair,
  getPositionTwoOftheTokenPair,
} from "@/lib/utils";
import RemoveLpDialog from "@/components/pools/models/RemoveLPModel";
import CollectRewardDialog from "@/components/pools/models/CollectRewardDialog";
import { useNewIncreaseLpStore } from "@/store/new-increase-lp.store";
import { useAccount } from "wagmi";
import { useLockStore } from "@/store/useLockStore";
import SwitchNetworkButton from "@/components/trading-live-inner/SwitchNetworkButton";

interface RangeData {
  minPrice: number;
  maxPrice: number;
  currentPrice: number;
  label: string;
}

interface PositionsInnerViewProps {
  poolData: SinglePoolData;
  positionData: Position;
}

const MINTICK = -887200;
const MAXTICK = 887200;

const PositionsInnerView: React.FC<PositionsInnerViewProps> = (props) => {
  const { poolData, positionData } = props;
  const [SelectedRangeToken, setSelectedRangeToken] = useState<
    "token1_per_token0" | "token0_per_token1"
  >("token1_per_token0");

  const [showRangeDates, setShowRangeDates] = useState<RangeData | null>(null);
  const [chainSwitchDialogOpen, setChainSwitchDialogOpen] = useState(false);
  const { setFromLPToken, setToLPToken } = useNewIncreaseLpStore();
  const { address, chainId: userChainId } = useAccount();
  const {
    setWalet,
    setTokenIdInput,
    setSelectedToken,
    setDebounceTokenIdInput,
    setOwnerOfTokenId,
    setIsLoadingOwner,
    setSelectedDex,
    setBlockchain,
    setLpToken,
  } = useLockStore();

  const router = useRouter();

  const chainId =
    poolData.chain.id === "bsc"
      ? 56
      : poolData.chain.id === "ethereum"
        ? 1
        : poolData.chain.id === "base"
          ? 8453
          : 56;

  const positionOneOfTheTokenPair = getPositionOneOftheTokenPair(poolData);
  const positionTwoOfTheTokenPair = getPositionTwoOftheTokenPair(poolData);

  const token0Initial = (
    positionOneOfTheTokenPair.symbol?.trim()?.charAt(0) ?? ""
  ).toUpperCase();
  const token1Initial = (
    positionTwoOfTheTokenPair.symbol?.trim()?.charAt(0) ?? ""
  ).toUpperCase();

  const adjustedToken0Symbol = adjustTokenSymbol(
    positionOneOfTheTokenPair.symbol,
    chainId
  );
  const adjustedToken1Symbol = adjustTokenSymbol(
    positionTwoOfTheTokenPair.symbol,
    chainId
  );

  const isFullRange =
    Math.min(
      positionData.price_range.tick_lower,
      positionData.price_range.tick_upper
    ) === MINTICK &&
    Math.max(
      positionData.price_range.tick_lower,
      positionData.price_range.tick_upper
    ) === MAXTICK;

  useEffect(() => {
    if (SelectedRangeToken === "token1_per_token0") {
      setShowRangeDates({
        minPrice: positionData.price_range.token1_per_token0.price_lower,
        maxPrice: positionData.price_range.token1_per_token0.price_upper,
        currentPrice: positionData.price_range.token1_per_token0.current_price,
        label: positionData.price_range.token1_per_token0.format,
      });
    } else {
      setShowRangeDates({
        minPrice: positionData.price_range.token0_per_token1.price_lower,
        maxPrice: positionData.price_range.token0_per_token1.price_upper,
        currentPrice: positionData.price_range.token0_per_token1.current_price,
        label: positionData.price_range.token0_per_token1.format,
      });
    }
  }, [SelectedRangeToken]);

  const formatLabel = (label: string) => {
    if (!label) return "";
    const [token1, token2] = label.split("/").map((s) => s.trim());

    const adjustToken1Names = adjustTokenSymbol(token1, chainId);
    const adjustToken2Names = adjustTokenSymbol(token2, chainId);

    return `${adjustToken1Names} per ${adjustToken2Names}`;
  };

  const formatLabelForSelect = (label: string) => {
    const [token1, token2] = label.split("/").map((s) => s.trim());
    const adjustToken1Names = adjustTokenSymbol(token1, chainId);
    return `${adjustToken1Names}`;
  };

  const getChainName = (id: number) => {
    switch (id) {
      case 1:
        return "Ethereum";
      case 56:
        return "BSC";
      case 97:
        return "BSC Testnet";
      case 8453:
        return "Base";
      default:
        return "Unknown Network";
    }
  };

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

  // Check if user is on wrong network
  const isWrongNetwork = address && userChainId !== chainId;

  // Handle lock LP button click
  const handleLockLpClick = () => {
    if (!address) return;

    // If on wrong network, open chain switch dialog
    if (isWrongNetwork) {
      setChainSwitchDialogOpen(true);
      return;
    }

    // If on correct network, proceed with lock flow
    proceedWithLockFlow();
  };

  // Proceed with lock flow after chain is correct
  const proceedWithLockFlow = useCallback(() => {
    if (!address) return;

    // Calculate blockchain string based on chainId
    const chainIdNum = Number(chainId);
    const blockchain =
      chainIdNum === 56
        ? "binance"
        : chainIdNum === 1
          ? "ethereum"
          : chainIdNum === 97
            ? "binance-testnet"
            : chainIdNum === 8453
              ? "base"
              : "binance-testnet";

    // Pre-fill Step 1 data (Connect Wallet)
    setWalet(address);

    // Pre-fill Step 2 data (Select Asset)
    setTokenIdInput(positionData.position_id);
    setSelectedToken(positionData.position_id);
    setDebounceTokenIdInput(positionData.position_id);
    setOwnerOfTokenId(address); // User owns their position
    setIsLoadingOwner(false);
    setSelectedDex("1"); // Hello-V3
    setBlockchain(blockchain);
    setLpToken(`${poolData.token0.symbol}/${poolData.token1.symbol}`);

    // Navigate to lock page at step 3
    router.push("/lock?tab=new&step=3");
  }, [
    address,
    chainId,
    positionData.position_id,
    poolData.token0.symbol,
    poolData.token1.symbol,
    router,
    setWalet,
    setTokenIdInput,
    setSelectedToken,
    setDebounceTokenIdInput,
    setOwnerOfTokenId,
    setIsLoadingOwner,
    setSelectedDex,
    setBlockchain,
    setLpToken,
  ]);

  // Monitor chain switch and proceed when correct
  useEffect(() => {
    if (chainSwitchDialogOpen && !isWrongNetwork && address) {
      // Chain switch successful, close dialog and proceed
      setChainSwitchDialogOpen(false);
      proceedWithLockFlow();
    }
  }, [
    userChainId,
    chainSwitchDialogOpen,
    isWrongNetwork,
    address,
    proceedWithLockFlow,
  ]);

  // set top and bottom token
  useEffect(() => {
    if (poolData) {
      setFromLPToken({
        address: poolData.token0.address,
        chainId: chainId,
        decimals: poolData.token0.decimals,
        logoURI: poolData.token0.logo || "",
        symbol: poolData.token0.symbol,
        name: poolData.token0.name,
      });

      setToLPToken({
        address: poolData.token1.address,
        chainId: chainId,
        decimals: poolData.token1.decimals,
        logoURI: poolData.token1.logo || "",
        symbol: poolData.token1.symbol,
        name: poolData.token1.name,
      });
    }
  }, [poolData]);

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <Button
          variant={"ghost"}
          className="flex gap-2 items-center text-sm font-lato dark:text-[#adff2f] text-[#9fcd0a] cursor-pointer hover:text-[#8FDD00] px-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Positions
        </Button>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex items-center flex-shrink-0">
            <Avatar className="w-14 h-14 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2 ">
              <AvatarImage
                src={positionOneOfTheTokenPair.logo || ""}
                alt={positionOneOfTheTokenPair.symbol}
                width={56}
                height={56}
              />
              <AvatarFallback>{token0Initial}</AvatarFallback>
            </Avatar>
            <Avatar className="w-12 h-12 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2 ">
              <AvatarImage
                src={positionTwoOfTheTokenPair.logo || ""}
                alt={positionTwoOfTheTokenPair.symbol}
                width={48}
                height={48}
              />
              <AvatarFallback>{token1Initial}</AvatarFallback>
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
                  className="w-8 h-8 dark:bg-[#1A1A1A] bg-slate-200 dark:hover:bg-[#252525] hover:bg-slate-300 border border-[rgba(255,255,255,0.1)] rounded-sm flex items-center justify-center transition-all group"
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
                  className="w-8 h-8 dark:bg-[#1A1A1A] bg-slate-200 dark:hover:bg-[#252525] hover:bg-slate-300 border border-[rgba(255,255,255,0.1)] rounded-sm flex items-center justify-center transition-all group"
                >
                  <Image
                    src={"/chain-icons/chain-tools/dexscreener.svg"}
                    width={16}
                    height={16}
                    alt="DexScreener"
                  />
                </Link>
                <Link
                  href={poolData.chain.explorerLink}
                  target="_blank"
                  className="w-8 h-8 dark:bg-[#1A1A1A] bg-slate-200 dark:hover:bg-[#252525] hover:bg-slate-300 border border-[rgba(255,255,255,0.1)] rounded-sm flex items-center justify-center transition-all group"
                >
                  <Image
                    src={getScannerImage(chainId)}
                    width={16}
                    height={16}
                    alt="Block Explorer"
                  />
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {positionData.price_range.in_range ? (
                <div className="flex items-center gap-1.5 bg-[rgba(34,197,94,0.1)] px-2.5 py-1 rounded-full border border-[rgba(34,197,94,0.2)] text-[#4ade80] text-xs font-lato font-semibold">
                  <CircleCheck className="w-4 h-4 text-[#4ade80]" /> IN RANGE
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20 text-red-500 text-xs font-lato font-semibold">
                  <CircleX className="w-4 h-4 text-red-500" /> OUT OF RANGE
                </div>
              )}
              <div className="inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/80 bg-[rgba(173,255,47,0.1)] dark:text-[#ADFF2F] text-[#9fcd0a]  border border-[rgba(173,255,47,0.3)] text-xs px-2 py-0.5 font-lato">
                V3
              </div>
              <div className="text-xs text-gray-500 font-lato">
                LP #{positionData.position_id}
              </div>
              <div className="inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/80 bg-[#1A1A1A] text-white border border-[rgba(255,255,255,0.2)] text-xs px-2 py-0.5 font-lato">
                {poolData.fee_tier}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <IncreaseLpModel
            id={positionData.position_id}
            poolData={poolData}
            positionData={positionData}
          />
          {parseFloat(positionData?.liquidity?.current || "0") > 0 && (
            <RemoveLpDialog positionData={positionData} />
          )}

          <Button
            variant={"outline"}
            className="font-lato font-[400] sm:text-sm sm:px-4 sm:h-9 dark:text-[#adff2f] text-xs py-2 px-3 bg-transparent border dark:border-[#adff2f] rounded-full"
            onClick={handleLockLpClick}
            disabled={!address}
          >
            <Lock className="w-4 h-4 mr-1" /> LOCK LP
          </Button>

          {/* Chain Switch Dialog */}
          <Dialog
            open={chainSwitchDialogOpen}
            onOpenChange={setChainSwitchDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px] card-primary">
              <DialogHeader>
                <DialogTitle className="text-primary text-[18px] font-formula leading-7 font-light uppercase">
                  Switch Network And Lock LP
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex justify-center text-center items-center gap-2 text-[#ffac2f] text-sm font-lato font-light">
                  <AlertTriangle size={16} />
                  <span>
                    Please switch your network to{" "}
                    <span className="font-medium">{getChainName(chainId)}</span>{" "}
                    to lock this position.
                  </span>
                </div>
                <SwitchNetworkButton
                  targetChainId={chainId}
                  chainName={getChainName(chainId)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className={`grid gap-6 grid-cols-1 ${address?.toLowerCase() === positionData.owner.toLowerCase() ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {/* liquidity */}
        <div className="dark:bg-[#121212] bg-white border-black/10 dark:border-[rgba(255,255,255,0.03)] rounded-xl p-5 w-full border ">
          <div className="text-xs text-gray-400 uppercase mb-3 tracking-wider font-lato font-medium">
            Liquidity
          </div>
          <div className="text-2xl dark:text-white text-black font-semibold mb-4 font-lato">
            $
            {renderFormattedValue(
              positionData.liquidity.current_amounts.total_usd!
            )}
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-white flex-shrink-0">
                  <Avatar className="w-5 h-5 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2 ">
                    <AvatarImage
                      src={positionData.pool.token0.logo || ""}
                      alt={positionData.pool.token0.symbol}
                      width={20}
                      height={20}
                    // className="w-6 h-6  rounded-full bg-white/10 object-contain"
                    />
                    <AvatarFallback>
                      {positionData.pool.token0.symbol
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-sm dark:text-gray-400 text-gray-800  font-lato">
                  {positionData.pool.token0.symbol}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm dark:text-white text-black font-medium font-lato">
                  {renderFormattedValue(
                    positionData.liquidity.current_amounts.token0 as number
                  )}
                </div>
                <div className="text-xs text-gray-500 font-lato">
                  ~$
                  {renderFormattedValue(
                    positionData.liquidity.current_amounts.token0_usd!
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-white flex-shrink-0">
                  <Avatar className="w-5 h-5 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2 ">
                    <AvatarImage
                      src={positionData.pool.token1.logo || ""}
                      alt={positionData.pool.token1.symbol}
                      width={20}
                      height={20}
                    // className="w-6 h-6  rounded-full bg-white/10 object-contain"
                    />
                    <AvatarFallback>
                      {positionData.pool.token1.symbol
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-sm dark:text-gray-400 text-gray-800 font-lato">
                  {positionData.pool.token1.symbol}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm dark:text-white text-black font-medium font-lato">
                  {renderFormattedValue(
                    positionData.liquidity.current_amounts.token1 as number
                  )}
                </div>
                <div className="text-xs text-gray-500 font-lato">
                  ~$
                  {renderFormattedValue(
                    positionData.liquidity.current_amounts.token1_usd!
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* APR */}
        <div className="dark:bg-[#121212] bg-white border-black/10 dark:border-[rgba(255,255,255,0.03)] rounded-xl p-5 w-full border ">
          <div className="text-xs text-gray-400 uppercase mb-3 tracking-wider font-lato font-medium">
            APR
          </div>
          <div className="flex justify-between">
            <div className="text-2xl dark:text-white text-black font-semibold mb-4 font-lato">
              {positionData.performance.apr.toFixed(2)} %
            </div>
            <div
              className={`${positionData.performance.pnl.net_pnl_usd > 0
                  ? "text-primary"
                  : "text-[#f87171]"
                }`}
            >
              {positionData.performance.pnl.net_pnl_usd > 0 ? "+" : ""}
              {renderFormattedValue(
                positionData.performance.pnl.net_pnl_usd
              )}{" "}
              USD
            </div>
          </div>

          <div className="mt-3 flex flex-col">
            <div className="text-xs text-gray-400 uppercase mb-3 tracking-wider font-lato font-medium">
              Original deposited
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-white flex-shrink-0">
                  <Avatar className="w-5 h-5 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2 ">
                    <AvatarImage
                      src={positionData.pool.token0.logo || ""}
                      alt={positionData.pool.token0.symbol}
                      width={20}
                      height={20}
                    // className="w-6 h-6  rounded-full bg-white/10 object-contain"
                    />
                    <AvatarFallback>
                      {positionData.pool.token0.symbol
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-sm dark:text-gray-400 text-gray-800  font-lato">
                  {positionData.pool.token0.symbol}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm dark:text-white text-black font-medium font-lato">
                  {renderFormattedValue(
                    positionData.liquidity.original_deposited.token0 as number
                  )}
                </div>
                <div className="text-xs text-gray-500 font-lato">
                  ~$
                  {renderFormattedValue(
                    positionData.liquidity.original_deposited.token0_usd!
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-white flex-shrink-0">
                  <Avatar className="w-5 h-5 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2 ">
                    <AvatarImage
                      src={positionData.pool.token1.logo || ""}
                      alt={positionData.pool.token1.symbol}
                      width={20}
                      height={20}
                    // className="w-6 h-6  rounded-full bg-white/10 object-contain"
                    />
                    <AvatarFallback>
                      {positionData.pool.token1.symbol
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-sm dark:text-gray-400 text-gray-800  font-lato">
                  {positionData.pool.token1.symbol}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm dark:text-white text-black font-medium font-lato">
                  {renderFormattedValue(
                    positionData.liquidity.original_deposited.token1 as number
                  )}
                </div>
                <div className="text-xs text-gray-500 font-lato">
                  ~$
                  {renderFormattedValue(
                    positionData.liquidity.original_deposited.token1_usd!
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unclaimed Fee */}
        {address?.toLowerCase() === positionData.owner.toLowerCase() && (
          <div className="dark:bg-[#121212] bg-white border-black/10 dark:border-[rgba(255,255,255,0.03)] rounded-xl p-5 w-full border ">
            <div className="text-xs text-gray-400 uppercase mb-3 tracking-wider font-lato font-medium">
              Unclaimed Fees
            </div>
            <div className="text-2xl dark:text-white text-black font-semibold mb-4 font-lato">
              ${renderFormattedValue(positionData.fees.uncollected.total_usd!)}
            </div>
            <div>
              <CollectRewardDialog
                positionData={positionData}
                isOwner={true}
              />
            </div>
            <div className="space-y-2.5 mt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-white flex-shrink-0">
                    <Avatar className="w-5 h-5 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2 ">
                      <AvatarImage
                        src={positionData.pool.token0.logo || ""}
                        alt={positionData.pool.token0.symbol}
                        width={20}
                        height={20}
                      // className="w-6 h-6  rounded-full bg-white/10 object-contain"
                      />
                      <AvatarFallback>
                        {positionData.pool.token0.symbol
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-sm dark:text-gray-400 text-gray-800 font-lato">
                    {positionData.pool.token0.symbol}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm dark:text-white text-black font-medium font-lato">
                    {renderFormattedValue(
                      positionData.fees.uncollected.token0 as number
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-lato">
                    ~$
                    {renderFormattedValue(
                      positionData.fees.uncollected.token0_usd!
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-white flex-shrink-0">
                    <Avatar className="w-5 h-5 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2 ">
                      <AvatarImage
                        src={positionData.pool.token1.logo || ""}
                        alt={positionData.pool.token1.symbol}
                        width={20}
                        height={20}
                      // className="w-6 h-6  rounded-full bg-white/10 object-contain"
                      />
                      <AvatarFallback>
                        {positionData.pool.token1.symbol
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-sm dark:text-gray-400 text-gray-800  font-lato">
                    {positionData.pool.token1.symbol}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm dark:text-white text-black font-medium font-lato">
                    {renderFormattedValue(
                      positionData.fees.uncollected.token1 as number
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-lato">
                    ~$
                    {renderFormattedValue(
                      positionData.fees.uncollected.token1_usd!
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="dark:bg-[#121212] bg-white border-black/10 dark:border-[rgba(255,255,255,0.03)] rounded-xl p-5 w-full border ">
        <div className="flex justify-between w-full items-center">
          <div className="text-xl dark:text-white text-black uppercase font-formula font-normal">
            Price Range
          </div>
          <Toggle
            aria-label="Toggle Token"
            size="sm"
            variant="outline"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-transparent border dark:border-[rgba(255,255,255,0.2)] border-[rgba(255,255,255)] text-gray-400 dark:hover:text-white hover:bg-[rgba(255,255,255,0.05)] text-xs px-3 py-1.5 rounded-full uppercase h-7"
            pressed={SelectedRangeToken === "token1_per_token0"}
            onPressedChange={(pressed: boolean) =>
              setSelectedRangeToken(
                pressed ? "token1_per_token0" : "token0_per_token1"
              )
            }
          >
            {SelectedRangeToken === "token1_per_token0" ? (
              <>
                {formatLabelForSelect(
                  positionData.price_range.token1_per_token0.format
                )}
              </>
            ) : (
              <>
                {formatLabelForSelect(
                  positionData.price_range.token0_per_token1.format
                )}
              </>
            )}
          </Toggle>
        </div>
        <div className="grid gap-6 sm:grid-cols-3 grid-cols-1 mt-6">
          <div className="flex flex-col space-y-2">
            <div className="text-xs text-gray-400 uppercase  tracking-wider font-medium font-lato">
              Min Price
            </div>
            <div className="text-xl dark:text-white text-black font-semibold font-lato">
              {isFullRange
                ? "0"
                : renderFormattedValue(showRangeDates?.minPrice!)}
            </div>
            <div className="text-xs text-gray-500 font-lato">
              {formatLabel(showRangeDates?.label!)}
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="text-xs text-gray-400 uppercase  tracking-wider font-medium font-lato">
              Max Price
            </div>
            <div className="text-xl dark:text-white text-black font-semibold font-lato">
              {isFullRange ? (
                <span className="text-2xl">∞</span>
              ) : (
                renderFormattedValue(showRangeDates?.maxPrice!)
              )}
            </div>
            <div className="text-xs text-gray-500 font-lato">
              {formatLabel(showRangeDates?.label!)}
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="text-xs text-gray-400 uppercase  tracking-wider font-medium font-lato">
              Current Price
            </div>
            <div className="text-xl dark:text-white text-black font-semibold font-lato">
              {renderFormattedValue(showRangeDates?.currentPrice!)}
            </div>
            <div className="text-xs text-gray-500 font-lato">
              {formatLabel(showRangeDates?.label!)}
            </div>
          </div>
        </div>
      </div>
      {/* transaction table */}
      <div className="dark:bg-[#0F0F0F] bg-slate-100 shadow border border-[rgba(255,255,255,0.08)] rounded-md p-5 w-full mt-3 space-y-4">
        <div className="flex justify-between w-full items-center">
          <div className="text-xl dark:text-white text-black uppercase font-formula">
            Transactions
          </div>
        </div>
        <TransactionsTable
          transactionsData={positionData.transactions}
          token0Symbol={positionData.pool.token0.symbol}
          token1Symbol={positionData.pool.token1.symbol}
          explorerTxBaseUrl={poolData.chain.explorer}
          chainId={chainId}
        />
      </div>
    </div>
  );
};

export default PositionsInnerView;
