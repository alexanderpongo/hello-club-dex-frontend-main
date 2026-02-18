"use client";
import React, { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  Address,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  Hex,
  parseUnits,
} from "viem";
import { useAccount, useConfig, usePublicClient, useWalletClient } from "wagmi";

import { contractConfig } from "@/config/blockchain.config";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { checkLpApproveAllowance } from "@/service/blockchain.service";
import { useLPStore } from "@/store/useDexStore";
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";

import { Button } from "../ui/button";
import { ProcessedPoolType } from "@/types/trading-live.types";
import { SinglePoolData } from "@/types/trading-live-table.types";
import { BasePriceObj } from "./TradingLiveInner";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useTradingLivePoolStore } from "@/store/trading-live-pool-store";

// Utility function to convert number to string without scientific notation
const toFixedWithoutScientific = (num: number, decimals: number = 18): string => {
  return num.toLocaleString('fullwide', { 
    useGrouping: false, 
    maximumFractionDigits: decimals 
  });
};

type AddLpProps = {
  poolData: SinglePoolData | null;
};

const TradeAddLPButton = ({ poolData }: AddLpProps) => {
  const config = useConfig();
  const router = useRouter();
  const {
    currencyA,
    currencyB,
    currencyATokenInputAmount,
    currencyBTokenInputAmount,
    currencyATokenBalance,
    currencyBBalance,
    lpSlippage,
    canonicalTickLower,
    canonicalTickUpper,
  } = useTradingLivePoolStore();

  const { address, chainId } = useAccount();
  const { data: signer } = useWalletClient();
  const publicClient = usePublicClient();

  const [currencyAAllowance, setCurrencyAAllowance] = useState<number | null>(
    null
  );
  const [currencyBAllowance, setCurrencyBAllowance] = useState<number | null>(
    null
  );
  const [isApprovingTokens, setIsApprovingTokens] = useState(false);
  const [addLiquidityLoading, setAddLiquidityLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { openConnectModal } = useConnectModal();

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

  const PoolFee = poolData?.fee_tier_raw;

  const getTrimmedResult = (raw: string) => {
    const [intPart, decimalPart] = raw.split(".");
    if (!decimalPart) return raw;

    if (intPart === "0") {
      const firstNonZeroIndex = decimalPart.search(/[1-9]/);
      if (firstNonZeroIndex === -1) return "0";

      const sliceEnd = Math.min(firstNonZeroIndex + 3, 18);
      const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");

      return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
    }

    // For non-zero intPart, return int with 2–3 decimals
    const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
    return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
  };

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
      currencyA &&
      currencyA.address.toLowerCase() !== "native" &&
      currencyA.address.toLowerCase() !== wrappedNativeAddress.toLowerCase()
    ) {
      try {
        const allowance = await getAllowance(
          currencyA.address as Hex,
          owner,
          spender,
          chainId,
          currencyA.decimals ?? 18
        );

        setCurrencyAAllowance(allowance);
      } catch (error) {
        console.error("Error fetching fromLPToken allowance:", error);
        setCurrencyAAllowance(null);
      }
    } else {
      // Native token doesn't need allowance
      setCurrencyAAllowance(null);
    }

    // Check toLPToken allowance (skip if native)
    if (
      currencyB &&
      currencyB.address.toLowerCase() !== "native" &&
      currencyB.address.toLowerCase() !== wrappedNativeAddress.toLowerCase()
    ) {
      try {
        const allowance = await getAllowance(
          currencyB.address as Hex,
          owner,
          spender,
          chainId,
          currencyB.decimals ?? 18
        );

        setCurrencyBAllowance(allowance);
      } catch (error) {
        console.error("Error fetching toLPToken allowance:", error);
        setCurrencyBAllowance(null);
      }
    } else {
      // Native token doesn't need allowance
      setCurrencyBAllowance(null);
    }
  };

  useEffect(() => {
    if (currencyA && currencyB && address && chainId) {
      getTokensAllowance();
    }
  }, [currencyA, currencyB, address, chainId]);

  const toNumber = (v?: string) => {
    if (!v) return 0;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const enteredAmount0 = toNumber(currencyATokenInputAmount);
  const enteredAmount1 = toNumber(currencyBTokenInputAmount);
  const balance0 = toNumber(currencyATokenBalance);
  const balance1 = toNumber(currencyBBalance);

  const hasInsufficient0 = enteredAmount0 > balance0;
  const hasInsufficient1 = enteredAmount1 > balance1;
  const isInsufficientBalance = hasInsufficient0 || hasInsufficient1;

  const needsApproval0 =
    currencyA &&
    currencyA.address.toLowerCase() !== "native" &&
    currencyA.address.toLowerCase() !== wrappedNativeAddress.toLowerCase() &&
    enteredAmount0 > 0 &&
    (currencyAAllowance === null || enteredAmount0 > currencyAAllowance);

  const needsApproval1 =
    currencyB &&
    currencyB.address.toLowerCase() !== "native" &&
    currencyB.address.toLowerCase() !== wrappedNativeAddress.toLowerCase() &&
    enteredAmount1 > 0 &&
    (currencyBAllowance === null || enteredAmount1 > currencyBAllowance);

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
          toFixedWithoutScientific(enteredAmount0, currencyA?.decimals ?? 18),
          currencyA?.decimals ?? 18
        );

        const hash = await writeContract(config, {
          address: currencyA!.address as Hex,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, approveAmount],
          chainId,
        });

        toast.info(`Approving ${currencyA?.symbol}...`, {
          toastId: "approve-token0",
        });

        await waitForTransactionReceipt(config, { hash });

        toast.success(`${currencyA?.symbol} approved!`, {
          toastId: "approve-token0-success",
        });
      }

      // Approve toLPToken if needed
      if (needsApproval1) {
        const approveAmount = parseUnits(
          toFixedWithoutScientific(enteredAmount1, currencyB?.decimals ?? 18),
          currencyB?.decimals ?? 18
        );

        const hash = await writeContract(config, {
          address: currencyB!.address as Hex,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, approveAmount],
          chainId,
        });

        toast.info(`Approving ${currencyB?.symbol}...`, {
          toastId: "approve-token1",
        });

        await waitForTransactionReceipt(config, { hash });

        toast.success(`${currencyB?.symbol} approved!`, {
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

  function safeParseUnits(value: string | undefined, decimals: number): bigint {
    if (!value) return BigInt(0);
    // Prevent scientific notation
    if (value.includes("e") || value.includes("E")) return BigInt(0);
    // Limit max length
    if (value.length > 30) return BigInt(0);
    try {
      return parseUnits(value, decimals);
    } catch {
      return BigInt(0);
    }
  }

  // Convert number to string safely without scientific notation
  const amount0Str = enteredAmount0 ? toFixedWithoutScientific(enteredAmount0, currencyA?.decimals ?? 18) : "0";
  const amount1Str = enteredAmount1 ? toFixedWithoutScientific(enteredAmount1, currencyB?.decimals ?? 18) : "0";

  const amount0 = amount0Str !== "0"
    ? parseUnits(amount0Str, currencyA?.decimals ?? 18)
    : BigInt(0);
  const amount1 = amount1Str !== "0"
    ? parseUnits(amount1Str, currencyB?.decimals ?? 18)
    : BigInt(0);

  const slippageMultiplierBps = BigInt(10000) - BigInt(lpSlippage ?? 0);
  const token0AmountMinMulticall =
    (amount0 * slippageMultiplierBps) / BigInt(10000);
  const token1AmountMinMulticall =
    (amount1 * slippageMultiplierBps) / BigInt(10000);

  const addLiquidity = async () => {
    setAddLiquidityLoading(true);

    if (currencyATokenInputAmount === "" || currencyBTokenInputAmount === "") {
      return;
    }

    if (!signer || !address) {
      console.error("Wallet not connected");
      return;
    }

    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId!] || contractConfig["default"];

    const positionManager = chainContractConfig.v3PositionManagerAddress;

    const deadline = Math.floor(Date.now() / 1000) + 1200;

    const fee = PoolFee;

    try {
      if (!positionManager) {
        console.error(
          "Position Manager Address is undefined for chainId:",
          chainId
        );
        toast.error(
          "Position Manager contract not configured for this network"
        );
      }

      const MintParams = encodeFunctionData({
        abi: chainContractConfig.v3PositionManagerABI,
        functionName: "mint",
        args: [
          {
            token0: currencyA?.address,
            token1: currencyB?.address,
            fee,
            tickLower: canonicalTickLower,
            tickUpper: canonicalTickUpper,
            amount0Desired: amount0,
            amount1Desired: amount1,
            amount0Min: token0AmountMinMulticall,
            amount1Min: token1AmountMinMulticall,
            recipient: address,
            deadline,
          },
        ],
      });

      console.log("DEBUG MintParams:", {
        token0: currencyA?.address,
        token1: currencyB?.address,
        fee,
        tickLower: canonicalTickLower,
        tickUpper: canonicalTickUpper,
        amount0Desired: amount0,
        amount1Desired: amount1,
        amount0Min: token0AmountMinMulticall,
        amount1Min: token1AmountMinMulticall,
        recipient: address,
        deadline,
      });

      let mintArgs = [MintParams];

      const isWrapped0 = currencyA?.address === wrappedNativeAddress;
      const isWrapped1 = currencyB?.address === wrappedNativeAddress;

      // Add refundETH call if using native tokens
      if (isWrapped0 || isWrapped1) {
        const refundETHCall = encodeFunctionData({
          abi: chainContractConfig.v3PositionManagerABI,
          functionName: "refundETH",
          args: [],
        });
        mintArgs.push(refundETHCall);
      }

      const mintData = encodeFunctionData({
        abi: chainContractConfig.v3PositionManagerABI,
        functionName: "multicall",
        args: [mintArgs],
      });

      let tx;
      let gasEstimate;

      try {
        gasEstimate = await publicClient!.estimateGas({
          account: address as Address,
          to: positionManager as Address,
          data: mintData,
          value: isWrapped0
            ? parseUnits(amount0Str, currencyA?.decimals ?? 18)
            : isWrapped1
            ? parseUnits(amount1Str, currencyB?.decimals ?? 18)
            : BigInt(0),
        });

        gasEstimate =
          (gasEstimate * (chainId === 8453 ? BigInt(150) : BigInt(120))) /
          BigInt(100);
      } catch (error: any) {
        console.log("Gas estimation error:", error);
        toast.error(error?.shortMessage || "Transaction failed", {
          toastId: "lp-gas-estimation-toast",
        });
        gasEstimate = chainId === 8453 ? BigInt(8000000) : BigInt(5000000);
      }

      const block = await publicClient!.getBlock();

      if (gasEstimate > block.gasLimit) {
        toast.error(
          `Gas limit (${gasEstimate.toString()}) exceeds block limit (${block.gasLimit.toString()}). ` +
            `Reduce amount or split into smaller transactions.`,
          { toastId: "gas-over-block-limit" }
        );
      }

      if (isWrapped0 || isWrapped1) {
        tx = await signer.sendTransaction({
          to: positionManager as Address,
          data: mintData,
          value: isWrapped0
            ? parseUnits(amount0Str, currencyA?.decimals ?? 18)
            : isWrapped1
            ? parseUnits(amount1Str, currencyB?.decimals ?? 18)
            : BigInt(0),
          gasLimit: gasEstimate,
          chainId,
        });
      } else {
        tx = await signer.sendTransaction({
          to: positionManager as Address,
          data: mintData,
          // gasLimit: gasEstimate,
          chainId,
        });
      }

      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash: tx,
      });

      if (!transactionReceipt || transactionReceipt.status === "reverted") {
        toast.error("Transaction reverted");
        return;
      }

      if (transactionReceipt.status === "success") {
        console.log("transactionReceipt:", transactionReceipt);
        setTxHash(transactionReceipt?.transactionHash);

        toast.success(
          <div>
            <p>
              Successfully added liquidity{" "}
              {getTrimmedResult(amount0Str)} {currencyA?.symbol}{" "}
              and {getTrimmedResult(amount1Str)}{" "}
              {currencyB?.symbol}.
            </p>
            <Link
              href={`${
                chainContractConfig.explorerURL
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
    } catch (error) {
      console.log("addLiquidity error:", error);
    } finally {
      setAddLiquidityLoading(false);
    }
  };

  useEffect(() => {
    console.log("DEBUG AddLPButton State:", {
      currencyA,
      currencyB,
      enteredAmount0,
      enteredAmount1,
      balance0,
      balance1,
      hasInsufficient0,
      hasInsufficient1,
      poolAddress: poolData?.pool_address,
      canonicalTickLower,
      canonicalTickUpper,
    });
  }, [
    enteredAmount0,
    enteredAmount1,
    balance0,
    balance1,
    hasInsufficient0,
    hasInsufficient1,
    currencyA,
    currencyB,
    canonicalTickLower,
    canonicalTickUpper,
  ]);

  return (
    <div className="py-2">
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
            {isInsufficientBalance ? "Insufficient balance" : "Approve Tokens"}
          </Button>
        ) : (
          <Button
            onClick={addLiquidity}
            className="flex button-primary uppercase w-full h-10"
            disabled={isInsufficientBalance || addLiquidityLoading}
          >
            {addLiquidityLoading && (
              <Loader2 size={20} className="animate-spin" />
            )}
            {isInsufficientBalance ? "Insufficient balance" : "Add Liquidity"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TradeAddLPButton;
