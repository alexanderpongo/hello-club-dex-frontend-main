"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Loader2, Minus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { useAccount, useConfig } from "wagmi";
import { contractConfig } from "@/config/blockchain.config";
import { Address, encodeFunctionData, formatUnits, parseUnits } from "viem";
import { toast } from "react-toastify";
import { Position } from "@/types/lp-page.types";
import SlippageSettingModel from "./SlippageSettingModel";
import { useNewIncreaseLpStore } from "@/store/new-increase-lp.store";
import { getInitials, toDecimalString } from "@/lib/utils";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface RemoveLpDialogProps {
  positionData: Position;
  className?: string;
}

const RemoveLpDialog: React.FC<RemoveLpDialogProps> = (props) => {
  const { positionData, className } = props;
  const { chainId, address } = useAccount();

  const { fromLPToken, toLPToken } = useNewIncreaseLpStore();
  const { openConnectModal } = useConnectModal();

  const config = useConfig();
  const [activeValue, setActiveValue] = useState("");
  const [lp, setLp] = useState("0");
  const [t0, setT0] = useState("");
  const [t1, setT1] = useState("");
  const [t0Receiving, setT0Receiving] = useState("");
  const [t1Receiving, setT1Receiving] = useState("");

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isApprovedSuccess, setIsApprovedSuccess] = useState(false);
  const [isLoadingLpRemove, setIsLoadingLpRemove] = useState(false);
  const [isColectLoading, setIsCollectLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [slippageBps, setSlippageBps] = useState(50);

  const wrappedNativeAddress =
    chainId === 56
      ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" // WBNB on BSC
      : chainId === 1
        ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" // WETH on Ethereum
        : chainId === 97
          ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd" // WBNB on BSC Testnet
          : chainId === 8453
            ? "0x4200000000000000000000000000000000000006" // WETH on Base
            : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // Default to WETH

  const ranges = [25, 50, 75, 100];

  const [preventClose, setPreventClose] = useState(true);

  const simulateRemoval = async (percentageValue: string) => {
    if (!positionData?.liquidity || !percentageValue) return;

    try {
      const chainCfg = contractConfig[chainId!] || contractConfig["default"];
      const percent = parseFloat(percentageValue);
      const val = percent / 100;
      const totalLiquidity = BigInt(positionData?.liquidity.current ?? "0");
      const lpValue = (totalLiquidity * BigInt(Math.floor(val * 100))) / BigInt(100);

      // Simulate decreaseLiquidity to get actual amounts
      const { result } = await simulateContract(config, {
        address: chainCfg.v3PositionManagerAddress as Address,
        abi: chainCfg.v3PositionManagerABI,
        functionName: "decreaseLiquidity",
        args: [{
          tokenId: positionData.position_id,
          liquidity: lpValue,
          amount0Min: BigInt(0),
          amount1Min: BigInt(0),
          deadline: Math.floor(Date.now() / 1000) + 600,
        }],
        chainId,
      });
      console.log("Simulation result:", result);


      const [actualAmount0, actualAmount1] = result as [bigint, bigint];


      const formattedT0 = formatUnits(actualAmount0, positionData.pool.token0.decimals);
      const formattedT1 = formatUnits(actualAmount1, positionData.pool.token1.decimals);



      setT0Receiving(formattedT0);
      setT1Receiving(formattedT1);

    } catch (error) {
      console.error("Simulation error:", error);
    }
  };

  const priceInputHandler = (value: string) => {
    const input = value.toString().replace(/[^0-9.%]/g, "");
    const percent = parseFloat(input);
    const val = percent / 100;

    console.log("Input percent:", percent, "Value:", val);

    if (positionData?.liquidity) {
      const totalLiquidity = BigInt(positionData?.liquidity.current ?? "0");

      const token0decimalString = toDecimalString(positionData.liquidity.current_amounts.token0.toString() ?? "0");

      const totalt0Value = parseUnits(
        token0decimalString,
        positionData.pool.token0.decimals
      );

      const token1decimalString = toDecimalString(positionData.liquidity.current_amounts.token1.toString() ?? "0");

      const totalt1Value = parseUnits(
        token1decimalString,
        positionData.pool.token1.decimals
      );
      const formattedSlippage = BigInt(100 - slippageBps);

      const lpValue =
        (totalLiquidity * BigInt(Math.floor(val * 100) ?? 0)) / BigInt(100);

      // Calculate expected amounts (without slippage)
      const expectedT0 =
        (totalt0Value * BigInt(Math.floor(val * 100))) / BigInt(100);
      const expectedT1 =
        (totalt1Value * BigInt(Math.floor(val * 100))) / BigInt(100);

      // Apply slippage tolerance to get minimum amounts
      const slippageMultiplier = BigInt(10000 - slippageBps); // e.g., 9950 for 0.5% slippage
      const t0Min = (expectedT0 * slippageMultiplier) / BigInt(10000);
      const t1Min = (expectedT1 * slippageMultiplier) / BigInt(10000);

      const t0Value =
        ((totalt0Value * BigInt(Math.floor(val * 100))) / BigInt(100)) *
        formattedSlippage;

      const t1Value =
        ((totalt1Value * BigInt(Math.floor(val * 100))) / BigInt(100)) *
        formattedSlippage;

      simulateRemoval(input);


      setLp(lpValue.toString());
      setT0(
        formatUnits(expectedT0, positionData.pool.token0.decimals).toString()
      );
      setT1(
        formatUnits(expectedT1, positionData.pool.token1.decimals).toString()
      );
      setActiveValue(input);
      // setT0(
      //   formatUnits(
      //     BigInt(t0Value!),
      //     positionData.pool.token0.decimals
      //   ).toString()
      // );
      // setT1(
      //   formatUnits(
      //     BigInt(t1Value!),
      //     positionData.pool.token1.decimals
      //   ).toString()
      // );
      // setActiveValue(input);
    }
  };

  const removeAndCollectHandler = async () => {
    setIsCollectLoading(true);
    setIsLoadingLpRemove(true);

    // Parse the displayed amounts back to BigInt
    const expectedAmount0 = parseUnits(t0, positionData.pool.token0.decimals);
    const expectedAmount1 = parseUnits(t1, positionData.pool.token1.decimals);
    console.log(expectedAmount0, expectedAmount1);

    // Apply slippage protection
    const slippageMultiplier = BigInt(10000 - slippageBps);
    const amount0Min = (expectedAmount0 * slippageMultiplier) / BigInt(10000);
    const amount1Min = (expectedAmount1 * slippageMultiplier) / BigInt(10000);

    try {
      const chainCfg = contractConfig[chainId!] || contractConfig["default"];
      if (!positionData.position_id) throw new Error("Token ID missing");
      if (!lp || parseFloat(lp) <= 0) throw new Error("Invalid liquidity");

      const calls: `0x${string}`[] = [];

      console.log("Removing LP:", {
        lp,
        amount0Min,
        amount1Min,
        positionId: positionData.position_id,
      });

      // ---- decreaseLiquidity
      const decreaseLiquidityData = encodeFunctionData({
        abi: chainCfg.v3PositionManagerABI,
        functionName: "decreaseLiquidity",
        args: [
          {
            tokenId: positionData.position_id,
            liquidity: lp,
            // amount0Min: amount0Min,
            // amount1Min: amount1Min,
            amount0Min: BigInt(0),
            amount1Min: BigInt(0),
            deadline: Math.floor(Date.now() / 1000) + 600,
          },
        ],
      });
      calls.push(decreaseLiquidityData);
      console.log("calls after decreaseLiquidity", calls);

      // ---- collect
      const collectData = encodeFunctionData({
        abi: chainCfg.v3PositionManagerABI,
        functionName: "collect",
        args: [
          {
            tokenId: positionData.position_id,
            recipient: address!,
            amount0Max: BigInt("340282366920938463463374607431768211400"),
            amount1Max: BigInt("340282366920938463463374607431768211400"),
          },
        ],
      });
      calls.push(collectData);
      console.log("calls after collect", calls);

      // ---- sweepToken for non-native tokens
      // Sweep token0 if it's not native or wrapped native
      if (
        fromLPToken &&
        fromLPToken.address.toLowerCase() !== "native" &&
        fromLPToken.address.toLowerCase() !== wrappedNativeAddress.toLowerCase()
      ) {
        const sweepToken0 = encodeFunctionData({
          abi: chainCfg.v3PositionManagerABI,
          functionName: "sweepToken",
          args: [fromLPToken.address as Address, amount0Min, address!],
        });
        calls.push(sweepToken0);
      }

      // Sweep token1 if it's not native or wrapped native
      if (
        toLPToken &&
        toLPToken.address.toLowerCase() !== "native" &&
        toLPToken.address.toLowerCase() !== wrappedNativeAddress.toLowerCase()
      ) {
        const sweepToken1 = encodeFunctionData({
          abi: chainCfg.v3PositionManagerABI,
          functionName: "sweepToken",
          args: [toLPToken.address as Address, amount1Min, address!],
        });
        calls.push(sweepToken1);
      }

      const { request } = await simulateContract(config, {
        address: chainCfg.v3PositionManagerAddress as Address,
        abi: chainCfg.v3PositionManagerABI,
        functionName: "multicall",
        args: [calls],
        chainId,
      });

      const hash = await writeContract(config, request);

      const transactionReceipt = waitForTransactionReceipt(config, {
        hash,
      });

      console.log("transactionReceipt", transactionReceipt);

      toast.success("Successfully removed liquidity.", {
        toastId: "remove-collect-success",
      });
      setT0("0.0");
      setT1("0.0");
    } catch (err: any) {
      console.log("Remove/collect error", err);
      toast.error(err?.shortMessage ?? "Transaction failed", {
        toastId: "remove-collect-error",
      });
    } finally {
      setIsCollectLoading(false);
      setIsLoadingLpRemove(false);
    }
  };



  useEffect(() => {
    if (!isOpen) {
      setActiveValue("");
      setLp("0");
      setT0("");
      setT1("");
      setIsApprovedSuccess(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-full border-primary/50 text-primary hover:bg-primary hover:text-black font-lato text-xs h-9 px-4",
            className
          )}
        >
          <Minus className="w-3 h-3 mr-1" /> REMOVE LIQUIDITY
        </Button>
      </DialogTrigger>

      <DialogContent
        onInteractOutside={(event) => {
          if (preventClose) {
            event.preventDefault();
          }
        }}
        className="card-primary border-[2px] right-0 px-1 sm:p-6 [&>button]:hidden"
      >
        <DialogHeader className="flex flex-row justify-between items-center mb-0">
          <DialogTitle>
            <h2 className="text-primary text-xl font-formula font-normal uppercase">
              Remove liquidity
            </h2>
          </DialogTitle>
          <div className="flex items-center gap-1">
            <SlippageSettingModel
              slippageInBPS={slippageBps}
              changeSlippageInBps={setSlippageBps}
            />
            <DialogClose asChild>
              <button
                className="p-1.5  rounded-lg transition-colors text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </DialogClose>
          </div>
        </DialogHeader>
        <div className="flex flex-col">
          {/* Token Pair Info */}
          <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 dark:bg-[#0F0F0F] border border-black/10 dark:border-white/10 rounded-xl">
            <div className="flex items-center -space-x-1">
              <div className="w-6 h-6 rounded-full bg-white dark:bg-white text-black flex items-center justify-center font-bold text-xs border-2 border-black z-10">
                {getInitials(fromLPToken?.symbol ?? "NA")}
              </div>
              <div className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 border-2 border-black/20 dark:border-white/20 flex items-center justify-center font-bold text-xs text-black dark:text-white">
                {getInitials(toLPToken?.symbol ?? "NA")}
              </div>
            </div>
            <span className="font-sans text-black dark:text-white font-semibold text-xs">
              {fromLPToken?.symbol!} / {toLPToken?.symbol!}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <span className="px-1 py-0.5 bg-pink-500/20 text-pink-400 text-[10px] font-semibold rounded border border-pink-500/30">
                v3
              </span>
              <span className="px-1 py-0.5 bg-primary text-black text-[10px] font-bold rounded">
                {positionData.pool.fee_tier}
              </span>
            </div>
          </div>

          {/* Percentage Selection Box */}
          <div className="mb-1 bg-white/5 dark:bg-[#0F0F0F] border border-black/10 dark:border-white/10 rounded-xl p-4">
            {/* Percentage Display with Manual Input */}
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="0"
                  value={activeValue}
                  onChange={(e) => priceInputHandler(e.target.value)}
                  className="w-24 bg-transparent outline-none text-primary text-5xl font-light text-right pr-1"
                  maxLength={3}
                />
                <span className="text-primary text-5xl font-light">%</span>
              </div>
            </div>

            {/* Slider */}
            <div className="mb-3 px-1">
              <Slider
                value={[parseFloat(activeValue) || 0]}
                onValueChange={(value) => priceInputHandler(value[0].toString())}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* Quick Select Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {ranges.map((range) => (
                <button
                  key={range}
                  onClick={() => priceInputHandler(range.toString())}
                  className={`py-2 text-xs rounded-full transition-all duration-200 ${activeValue === range.toString()
                    ? "bg-primary text-black "
                    : "bg-transparent border border-black/20 dark:border-white/20 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/40 dark:hover:border-white/40 hover:text-black/80 dark:hover:text-white/80"
                    }`}
                >
                  {range === 100 ? "MAX" : `${range}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Liquidity Removal Preview Boxes */}
          {activeValue && parseFloat(activeValue) > 0 && (
            <div className="w-full flex flex-col gap-3 mt-4">
              {/* Removing Liquidity Box */}
              <div className="mb-1 bg-white/5 dark:bg-[#0F0F0F] border border-black/10 dark:border-white/10 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-2 uppercase">Removing Liquidity </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full w-[20px] h-[20px] border flex items-center justify-center bg-[#000] text-white text-[10px] font-bold">
                        {getInitials(fromLPToken?.symbol ?? "NA")}
                      </div>
                      <span className="text-sm">{fromLPToken?.symbol}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {t0Receiving && parseFloat(t0Receiving) > 0
                        ? parseFloat(t0Receiving).toFixed(6)
                        : "0.0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full w-[20px] h-[20px] border flex items-center justify-center bg-gray-200 text-black text-[10px] font-bold">
                        {getInitials(toLPToken?.symbol ?? "NA")}
                      </div>
                      <span className="text-sm">{toLPToken?.symbol}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {t1Receiving && parseFloat(t1Receiving) > 0
                        ? parseFloat(t1Receiving).toFixed(6)
                        : "0.0"}
                    </span>
                  </div>
                </div>

                <div className="w-full h-px dark:bg-white/10 bg-black/10 my-3"></div>


                {/* Uncollected Fees Box */}
                <div className="text-xs text-gray-400 mb-2 uppercase">
                  Uncollected Fees (will be collected)
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full w-[20px] h-[20px] border flex items-center justify-center bg-[#000] text-white text-[10px] font-bold">
                        {getInitials(fromLPToken?.symbol ?? "NA")}
                      </div>
                      <span className="text-sm">{fromLPToken?.symbol}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {positionData?.fees?.uncollected?.token0
                        ? parseFloat(positionData.fees.uncollected.token0.toString()).toFixed(6)
                        : "0.0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full w-[20px] h-[20px] border flex items-center justify-center bg-gray-200 text-black text-[10px] font-bold">
                        {getInitials(toLPToken?.symbol ?? "NA")}
                      </div>
                      <span className="text-sm">{toLPToken?.symbol}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {positionData?.fees?.uncollected?.token1
                        ? parseFloat(positionData.fees.uncollected.token1.toString()).toFixed(6)
                        : "0.0"}
                    </span>
                  </div>
                  <div className="w-full h-px dark:bg-white/10 bg-black/10 my-3"></div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400 uppercase">
                      Total fees
                    </div>
                    {positionData?.fees?.uncollected?.total_usd &&
                      positionData.fees.uncollected.total_usd > 0 && (

                        <div className="text-xs text-gray-400">
                          ≈ ${parseFloat(positionData.fees.uncollected.total_usd.toString()).toFixed(2)} USD
                        </div>

                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="w-full flex flex-row grow gap-1.5 mt-4">
            {!address ? (
              <Button
                onClick={openConnectModal}
                className="flex button-primary uppercase w-full h-10"
              >
                Connect Wallet
              </Button>
            ) : (
              <Button
                onClick={removeAndCollectHandler}
                className="flex button-primary uppercase w-full h-10"
                disabled={
                  parseFloat(lp) <= 0 || isLoadingLpRemove || isColectLoading
                }
              >
                {" "}
                {(isLoadingLpRemove || isColectLoading) && (
                  <Loader2 size={20} className="animate-spin" />
                )}
                Remove{" "}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveLpDialog;
