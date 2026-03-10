"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  writeContract,
  simulateContract,
  waitForTransactionReceipt,
  readContract,
} from "@wagmi/core";
import { useAccount, useConfig } from "wagmi";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { erc20Abi, formatUnits, Hex, parseUnits } from "viem";
import SlippageSettingModel from "./SlippageSettingModel";
import { SinglePoolData } from "@/types/trading-live-table.types";
import { Position } from "@/types/lp-page.types";
import IncreaseTokenBalanceBottom from "@/components/pools/models/IncreaseTokenBalanceBottom";
import IncreaseTokenBalanceTop from "@/components/pools/models/IncreaseTokenBalanceTop";
import { useNewIncreaseLpStore } from "@/store/new-increase-lp.store";
import { toast } from "react-toastify";
import Link from "next/link";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/utils";

interface IncreaseLpModelProps {
  id: string;
  poolData: SinglePoolData;
  positionData: Position;
  className?: string;
}

const IncreaseLpModel: React.FC<IncreaseLpModelProps> = (props) => {
  const { id, poolData, positionData, className } = props;

  const { openConnectModal } = useConnectModal();

  const { chainId, address } = useAccount();
  const {
    fromLPTokenInputAmount,
    fromLPToken,
    toLPToken,
    toLPTokenInputAmount,
    setFromLPTokenInputAmount,
    setToLPTokenInputAmount,
    fromLPTokenBalance,
    toLPTokenBalance,
  } = useNewIncreaseLpStore();

  // const { pairFromToken, pairToToken } = useSwapStore();
  const [isSingleSided, setIsSingleSided] = useState(false);
  const [singleSidedToken, setSingleSidedToken] = useState<
    "token0" | "token1" | null
  >(null);

  const config = useConfig();
  const [isLoadingLpRemove, setIsLoadingLpRemove] = useState(false);
  const [open, setOpen] = useState(false);
  const [slippageBps, setSlippageBps] = useState(50);

  const [preventClose, setPreventClose] = useState(true);

  const [fromLPTokenAllowance, setFromLPTokenAllowance] = useState<
    number | null
  >(null);
  const [toLPTokenAllowance, setToLPTokenAllowance] = useState<number | null>(
    null
  );
  const [isApprovingTokens, setIsApprovingTokens] = useState(false);

  const amount0 = parseUnits(
    fromLPTokenInputAmount || "0",
    fromLPToken?.decimals!
  );
  const amount1 = parseUnits(toLPTokenInputAmount || "0", toLPToken?.decimals!);

  // Compute min amounts using slippage in basis points (bps)
  const slippageMultiplierBps = BigInt(10000) - BigInt(slippageBps ?? 0);
  const token0AmountMinMulticall =
    (amount0 * slippageMultiplierBps) / BigInt(10000);
  const token1AmountMinMulticall =
    (amount1 * slippageMultiplierBps) / BigInt(10000);

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

  // ---- Check allowance of the tokens ----
  const getAllowance = async (
    tokenAddress: Hex,
    owner: Hex,
    spender: Hex,
    chainId: number,
    decimals: number
  ): Promise<number> => {
    const readAllowance = await readContract(config, {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "allowance",
      args: [owner, spender],
      chainId,
    });

    const allowanceNumber = formatUnits(readAllowance, decimals);
    return parseFloat(allowanceNumber);
  };

  const getTokensAllowance = async () => {
    if (!chainId) return;

    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId!] || contractConfig["default"];

    const spender = chainContractConfig.v3PositionManagerAddress as Hex;
    const owner = address as Hex;

    // Check fromLPToken allowance (skip if native)
    if (
      fromLPToken?.address &&
      fromLPToken.address.toLowerCase() !== "native" &&
      fromLPToken.address.toLowerCase() !== wrappedNativeAddress.toLowerCase()
    ) {
      try {
        const allowance = await getAllowance(
          fromLPToken.address as Hex,
          owner,
          spender,
          chainId,
          fromLPToken.decimals ?? 18
        );

        setFromLPTokenAllowance(allowance);
      } catch (error) {
        console.error("Error fetching fromLPToken allowance:", error);
        setFromLPTokenAllowance(null);
      }
    } else {
      // Native token doesn't need allowance
      setFromLPTokenAllowance(null);
    }

    // Check toLPToken allowance (skip if native)
    if (
      toLPToken?.address &&
      toLPToken.address.toLowerCase() !== "native" &&
      toLPToken.address.toLowerCase() !== wrappedNativeAddress.toLowerCase()
    ) {
      try {
        const allowance = await getAllowance(
          toLPToken.address as Hex,
          owner,
          spender,
          chainId,
          toLPToken.decimals ?? 18
        );

        console.log("toLPToken allowance", allowance);
        setToLPTokenAllowance(allowance);
      } catch (error) {
        console.error("Error fetching toLPToken allowance:", error);
        setToLPTokenAllowance(null);
      }
    } else {
      // Native token doesn't need allowance
      setToLPTokenAllowance(null);
    }
  };

  // Fetch allowances when dialog opens and tokens change
  useEffect(() => {
    if (open && address && chainId && (fromLPToken || toLPToken)) {
      getTokensAllowance();
    }
  }, [open, address, chainId, fromLPToken, toLPToken]);

  const checkSingleSided = (position: any) => {
    const tickCurrent = position.price_range.tick_current;
    const tickLower = position.price_range.tick_lower;
    const tickUpper = position.price_range.tick_upper;
    const inRange = position.price_range.in_range;

    if (!inRange || tickCurrent <= tickLower) {
      setIsSingleSided(true);
      setSingleSidedToken("token0"); // token0 will not be used

      return true;
    } else if (tickCurrent >= tickUpper) {
      setIsSingleSided(true);
      setSingleSidedToken("token1"); // token1 will not be used

      return true;
    } else {
      setIsSingleSided(false);
      setSingleSidedToken(null);
      return false;
    }
  };

  useEffect(() => {
    checkSingleSided(positionData);
  }, [positionData]);

  // ---- Insufficient balance validation ----
  const toNumber = (v?: string) => {
    if (!v) return 0;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const enteredAmount0 = toNumber(fromLPTokenInputAmount);
  const enteredAmount1 = toNumber(toLPTokenInputAmount);
  const balance0 = toNumber(fromLPTokenBalance);
  const balance1 = toNumber(toLPTokenBalance);

  const hasInsufficient0 = enteredAmount0 > balance0;
  const hasInsufficient1 = enteredAmount1 > balance1;
  const isInsufficientBalance = hasInsufficient0 || hasInsufficient1;

  // ---- Allowance comparison logic ----
  // Check if approval is needed for non-native tokens
  const needsApproval0 =
    fromLPToken &&
    fromLPToken.address.toLowerCase() !== "native" &&
    fromLPToken.address.toLowerCase() !== wrappedNativeAddress.toLowerCase() &&
    enteredAmount0 > 0 &&
    (fromLPTokenAllowance === null || enteredAmount0 > fromLPTokenAllowance);

  const needsApproval1 =
    toLPToken &&
    toLPToken.address.toLowerCase() !== "native" &&
    toLPToken.address.toLowerCase() !== wrappedNativeAddress.toLowerCase() &&
    enteredAmount1 > 0 &&
    (toLPTokenAllowance === null || enteredAmount1 > toLPTokenAllowance);

  const needsApproval = needsApproval0 || needsApproval1;

  const approveTokensHandler = async () => {
    setIsApprovingTokens(true);

    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId!] || contractConfig["default"];

    const spender = chainContractConfig.v3PositionManagerAddress as Hex;

    try {
      // Approve fromLPToken if needed
      if (needsApproval0) {
        const approveAmount = parseUnits(
          fromLPTokenInputAmount || "0",
          fromLPToken?.decimals ?? 18
        );

        const hash = await writeContract(config, {
          address: fromLPToken!.address as Hex,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, approveAmount],
          chainId,
        });

        toast.info(`Approving ${fromLPToken?.symbol}...`, {
          toastId: "approve-token0",
        });

        await waitForTransactionReceipt(config, { hash });

        toast.success(`${fromLPToken?.symbol} approved!`, {
          toastId: "approve-token0-success",
        });
      }

      // Approve toLPToken if needed
      if (needsApproval1) {
        const approveAmount = parseUnits(
          toLPTokenInputAmount || "0",
          toLPToken?.decimals ?? 18
        );

        const hash = await writeContract(config, {
          address: toLPToken!.address as Hex,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, approveAmount],
          chainId,
        });

        toast.info(`Approving ${toLPToken?.symbol}...`, {
          toastId: "approve-token1",
        });

        await waitForTransactionReceipt(config, { hash });

        toast.success(`${toLPToken?.symbol} approved!`, {
          toastId: "approve-token1-success",
        });
      }

      // Refresh allowances after approval
      await getTokensAllowance();
    } catch (error: any) {
      console.error("Token approval error:", error);
      toast.error(error?.shortMessage || "Approval failed", {
        toastId: "approve-error",
      });
    } finally {
      setIsApprovingTokens(false);
    }
  };

  const increaseLiquidityHandler = async () => {
    setIsLoadingLpRemove(true);

    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId!] || contractConfig["default"];

    // check if toToken is wrapped native token
    let toTokenIsWrappedNative = false;
    let fromTokenIsWrappedNative = false;

    if (
      fromLPToken!.address.toLowerCase() === wrappedNativeAddress.toLowerCase()
    ) {
      fromTokenIsWrappedNative = true;
    }

    if (
      toLPToken!.address.toLowerCase() === wrappedNativeAddress.toLowerCase()
    ) {
      toTokenIsWrappedNative = true;
    }

    if (fromTokenIsWrappedNative || toTokenIsWrappedNative) {
      try {
        const { request } = await simulateContract(config, {
          address: chainContractConfig.v3PositionManagerAddress as Hex,
          abi: chainContractConfig.v3PositionManagerABI,
          functionName: "increaseLiquidity",
          args: [
            {
              tokenId: id!,
              amount0Desired: amount0,
              amount1Desired: amount1,
              amount0Min: token0AmountMinMulticall,
              amount1Min: token1AmountMinMulticall,
              deadline: Math.floor(Date.now() / 1000) + 60 * 10,
            },
          ],
          value: fromTokenIsWrappedNative ? amount0 : amount1,
          chainId,
        });

        const hash = await writeContract(config, request);

        const transactionReceipt = await waitForTransactionReceipt(config, {
          hash,
        });

        console.log("transactionReceipt", transactionReceipt);
        if (transactionReceipt.status === "success") {
          console.log("transactionReceipt:", transactionReceipt);

          toast.success(
            <div>
              <p>Successfully added liquidity </p>
              <Link
                href={`${chainContractConfig.explorerURL
                  }/tx/${transactionReceipt?.transactionHash!}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate text-sm underline"
              >
                View Transaction
              </Link>
            </div>,
            {
              toastId: "swap-success-toast",
            }
          );
        }
      } catch (error: any) {
        console.error("add liquidity error", error);
        toast.error(error?.shortMessage, {
          toastId: "LP-added-error-toast",
        });
        if (error.details) console.error("Error Details:", error.details);
      } finally {
        setIsLoadingLpRemove(false);
      }
    } else {
      try {
        const { request, result } = await simulateContract(config, {
          address: chainContractConfig.v3PositionManagerAddress as Hex,
          abi: chainContractConfig.v3PositionManagerABI,
          functionName: "increaseLiquidity",
          args: [
            {
              tokenId: id!,
              amount0Desired: amount0,
              amount1Desired: amount1,
              amount0Min: token0AmountMinMulticall,
              amount1Min: token1AmountMinMulticall,
              deadline: Math.floor(Date.now() / 1000) + 60 * 10,
            },
          ],
          chainId,
        });

        console.log("simulate increaseLiquidity result", result);
        console.log("simulate increaseLiquidity request", request);

        const hash = await writeContract(config, request);

        const transactionReceipt = await waitForTransactionReceipt(config, {
          hash,
        });

        toast.success(
          <div>
            <p>Liquidity Added Successfully</p>
            <Link
              href={`${chainContractConfig.explorerURL}/tx/${transactionReceipt.transactionHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate text-sm underline"
            >
              View Transaction
            </Link>
          </div>,
          {
            toastId: "LP-added-success-toast",
          }
        );

        console.log("transactionReceipt", transactionReceipt);
      } catch (error: any) {
        console.error("add liquidity error", error);
        toast.error(error?.shortMessage, {
          toastId: "LP-added-error-toast",
        });
        if (error.details) console.error("Error Details:", error.details);
      } finally {
        setIsLoadingLpRemove(false);
      }
    }
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setFromLPTokenInputAmount("");
      setToLPTokenInputAmount("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className={cn(
            "rounded-full bg-primary text-black hover:bg-primary/80 font-lato text-xs h-9 px-4 font-normal shadow-sm transition-all",
            className
          )}
        >
          <Plus className="w-3 h-3 mr-1" /> ADD LIQUIDITY
        </Button>
      </DialogTrigger>

      <DialogContent
        onInteractOutside={(event) => {
          if (preventClose) {
            event.preventDefault();
          }
        }}
        className="card-primary  border-[2px] right-0  px-1 sm:p-6 "
      >
        <DialogHeader className="flex flex-row justify-between items-center ">
          <DialogTitle>
            <div className="text-xl font-formula font-normal text-left uppercase text-primary">
              Add liquidity
            </div>
          </DialogTitle>
          <SlippageSettingModel
            slippageInBPS={slippageBps}
            changeSlippageInBps={setSlippageBps}
          />
        </DialogHeader>
        <div className="flex flex-col">
          <div className="flex flex-col w-full ">
            <div className="flex flex-col justify-start">
              <div className="uppercase text-primary text-base font-formula font-normal mt-2">
                Deposit Amount
              </div>
              <p className="text-sm text-neutral-400 font-lato font-normal">
                Specify the token amounts for your liquidity contribution.
              </p>
            </div>

            <div className="flex flex-col w-full pt-1">
              <IncreaseTokenBalanceTop />
              <IncreaseTokenBalanceBottom
                pool_address={poolData.pool_address as Hex}
                tickRanges={{
                  tickLower: positionData.price_range.tick_lower,
                  tickUpper: positionData.price_range.tick_upper,
                }}
                poolData={poolData}
              />
              <div className="pt-3">
                {isSingleSided && (
                  <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-300 border-l-4 border-yellow-500 dark:border-yellow-400 p-3 mb-3 rounded-md text-sm text-center">
                    {`⚠️ You are adding single-sided liquidity. The ${singleSidedToken === "token0"
                      ? fromLPToken?.symbol
                      : toLPToken?.symbol
                      } you provide will be used to mint both sides of the liquidity position.`}
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
                  ) : needsApproval ? (
                    <Button
                      onClick={approveTokensHandler}
                      className="flex button-primary uppercase w-full h-10"
                      disabled={isApprovingTokens || isInsufficientBalance}
                    >
                      {isApprovingTokens && (
                        <Loader2 size={20} className="animate-spin" />
                      )}
                      {isInsufficientBalance
                        ? "Insufficient balance"
                        : "Approve Tokens"}
                    </Button>
                  ) : (
                    <Button
                      onClick={increaseLiquidityHandler}
                      className="flex button-primary uppercase w-full h-10"
                      disabled={isInsufficientBalance || isLoadingLpRemove}
                    >
                      {isLoadingLpRemove && (
                        <Loader2 size={20} className="animate-spin" />
                      )}
                      {isInsufficientBalance
                        ? "Insufficient balance"
                        : "Add Liquidity"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncreaseLpModel;
