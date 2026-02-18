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
import { checkLpApproveAllowance } from "@/service/blockchain.service";
import { useLiquidityPoolStore } from "@/store/liquidity-pool.store";
import { ContractConfigItemType, TokenType } from "@/interfaces/index.i";
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { Button } from "../ui/button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { priceToClosestTick, TickMath } from "@uniswap/v3-sdk";

const AddLPButton = () => {
  const {
    currencyA,
    currencyB,
    token0,
    token1,
    currencyATokenInputAmount,
    currencyBTokenInputAmount,
    isInverted,
    currencyATokenBalance,
    currencyBBalance,
    lpSlippage,
    poolFee,
    canonicalTickLower,
    canonicalTickUpper,
    poolAddress,
    priceWhenPoolNotInitialized,
    setLpAddingSuccess,
    setTxHash,
  } = useLiquidityPoolStore();
  const { address, chainId } = useAccount();
  const { data: signer } = useWalletClient();
  const publicClient = usePublicClient();
  const config = useConfig();
  const [fromLPTokenAllowance, setFromLPTokenAllowance] = useState<
    number | null
  >(null);
  const [toLPTokenAllowance, setToLPTokenAllowance] = useState<number | null>(
    null
  );
  const [isApprovingTokens, setIsApprovingTokens] = useState(false);
  const [addLiquidityLoading, setAddLiquidityLoading] = useState(false);
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
      token0 &&
      token0.address.toLowerCase() !== "native" &&
      token0.address.toLowerCase() !== wrappedNativeAddress.toLowerCase()
    ) {
      try {
        const allowance = await getAllowance(
          token0.address as Hex,
          owner,
          spender,
          chainId,
          token0.decimals ?? 18
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
      token1 &&
      token1.address.toLowerCase() !== "native" &&
      token1.address.toLowerCase() !== wrappedNativeAddress.toLowerCase()
    ) {
      try {
        const allowance = await getAllowance(
          token1.address as Hex,
          owner,
          spender,
          chainId,
          token1.decimals ?? 18
        );

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

  useEffect(() => {
    if (token0 && token1 && address && chainId) {
      getTokensAllowance();
    }
  }, [token0, token1, address, chainId]);

  const toNumber = (v?: string) => {
    if (!v) return 0;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Determine which input amount belongs to token0 and token1 based on addresses
  // Handle "native" address case by comparing with wrappedNativeAddress
  const isCurrencyAToken0 =
    (currencyA?.address?.toLowerCase() === "native"
      ? wrappedNativeAddress.toLowerCase()
      : currencyA?.address?.toLowerCase()) === token0?.address?.toLowerCase();

  const enteredAmount0 = toNumber(
    isCurrencyAToken0 ? currencyATokenInputAmount : currencyBTokenInputAmount
  );
  const enteredAmount1 = toNumber(
    isCurrencyAToken0 ? currencyBTokenInputAmount : currencyATokenInputAmount
  );

  const balance0 = toNumber(
    isCurrencyAToken0 ? currencyATokenBalance : currencyBBalance
  );
  const balance1 = toNumber(
    isCurrencyAToken0 ? currencyBBalance : currencyATokenBalance
  );

  const hasInsufficient0 = enteredAmount0 > balance0;
  const hasInsufficient1 = enteredAmount1 > balance1;
  const isInsufficientBalance = hasInsufficient0 || hasInsufficient1;

  const needsApproval0 =
    token0 &&
    token0.address.toLowerCase() !== "native" &&
    token0.address.toLowerCase() !== wrappedNativeAddress.toLowerCase() &&
    enteredAmount0 > 0 &&
    (fromLPTokenAllowance === null || enteredAmount0 > fromLPTokenAllowance);

  const needsApproval1 =
    token1 &&
    token1.address.toLowerCase() !== "native" &&
    token1.address.toLowerCase() !== wrappedNativeAddress.toLowerCase() &&
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
          enteredAmount0.toString() || "0",
          token0?.decimals ?? 18
        );

        const hash = await writeContract(config, {
          address: token0!.address as Hex,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, approveAmount],
          chainId,
        });

        toast.info(`Approving ${token0?.symbol}...`, {
          toastId: "approve-token0",
        });

        await waitForTransactionReceipt(config, { hash });

        toast.success(`${token0?.symbol} approved!`, {
          toastId: "approve-token0-success",
        });
      }

      // Approve toLPToken if needed
      if (needsApproval1) {
        const approveAmount = parseUnits(
          enteredAmount1.toString() || "0",
          token1?.decimals ?? 18
        );

        const hash = await writeContract(config, {
          address: token1!.address as Hex,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, approveAmount],
          chainId,
        });

        toast.info(`Approving ${token1?.symbol}...`, {
          toastId: "approve-token1",
        });

        await waitForTransactionReceipt(config, { hash });

        toast.success(`${token1?.symbol} approved!`, {
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

  const amount0 = enteredAmount0.toString()
    ? parseUnits(enteredAmount0.toString(), token0?.decimals ?? 18)
    : BigInt(0);
  const amount1 = enteredAmount1.toString()
    ? parseUnits(enteredAmount1.toString(), token1?.decimals ?? 18)
    : BigInt(0);

  const slippageMultiplierBps = BigInt(10000) - BigInt(lpSlippage ?? 0);
  const token0AmountMinMulticall =
    (amount0 * slippageMultiplierBps) / BigInt(10000);
  const token1AmountMinMulticall =
    (amount1 * slippageMultiplierBps) / BigInt(10000);

  const addLiquidity = async () => {
    setAddLiquidityLoading(true);
    if (!signer || !address) {
      console.error("Wallet not connected");
      return;
    }

    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId!] || contractConfig["default"];

    const positionManager = chainContractConfig.v3PositionManagerAddress;

    const fee = poolFee;
    const deadline = Math.floor(Date.now() / 1000) + 1200;

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
            token0: token0?.address,
            token1: token1?.address,
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
        token0: token0?.address,
        token1: token1?.address,
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

      const isWrapped0 = token0?.address === wrappedNativeAddress;
      const isWrapped1 = token1?.address === wrappedNativeAddress;

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

      if (poolAddress) {
        let tx;
        let gasEstimate;
        const isWrapped0 = token0?.address === wrappedNativeAddress;
        const isWrapped1 = token1?.address === wrappedNativeAddress;

        try {
          gasEstimate = await publicClient!.estimateGas({
            account: address as Address,
            to: positionManager as Address,
            data: mintData,
            value: isWrapped0
              ? parseUnits(enteredAmount0.toString(), token0?.decimals ?? 18)
              : isWrapped1
              ? parseUnits(enteredAmount1.toString(), token1?.decimals ?? 18)
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
              ? parseUnits(enteredAmount0.toString(), token0?.decimals ?? 18)
              : isWrapped1
              ? parseUnits(enteredAmount1.toString(), token1?.decimals ?? 18)
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
                {getTrimmedResult(enteredAmount0.toString())} {token0?.symbol}{" "}
                and {getTrimmedResult(enteredAmount1.toString())}{" "}
                {token1?.symbol}.
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
          setLpAddingSuccess(true);
        }
      } else {
        console.log("token0: ", token0);
        console.log("token1: ", token1);
        console.log("currencyA: ", currencyA);
        console.log("currencyB: ", currencyB);
        console.log("inverted : ", isInverted);
        console.log("tickUpper: ", canonicalTickUpper);
        console.log("tickLower: ", canonicalTickLower);

        const currantPrice = priceWhenPoolNotInitialized?.toSignificant(6);
        console.log("DEBUG: priceWhenPoolNotInitialized : ", currantPrice);

        const currentTick = priceToClosestTick(
          priceWhenPoolNotInitialized as unknown as any
        );

        const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick);
        console.log("DEBUG currentTick:", currentTick);
        console.log("DEBUG Initial Price:", {
          price: priceWhenPoolNotInitialized?.toSignificant(6),
          tick: currentTick,
          sqrtPriceX96: currentSqrt.toString(),
        });
        const initialsPoolsNecessary = encodeFunctionData({
          abi: chainContractConfig.v3PositionManagerABI,
          functionName: "createAndInitializePoolIfNecessary",
          args: [token0?.address, token1?.address, fee, currentSqrt],
        });
        const multicallArgs = [initialsPoolsNecessary, MintParams];
        if (token0?.address === "native" || token1?.address === "native") {
          const refundETHCall = encodeFunctionData({
            abi: chainContractConfig.v3PositionManagerABI,
            functionName: "refundETH",
            args: [],
          });
          multicallArgs.push(refundETHCall);
        }

        if (
          token0?.address === "native" ||
          token1?.address === "native" ||
          token0?.address === wrappedNativeAddress ||
          token1?.address === wrappedNativeAddress
        ) {
          const refundETHCall = encodeFunctionData({
            abi: chainContractConfig.v3PositionManagerABI,
            functionName: "refundETH",
            args: [],
          });
          multicallArgs.push(refundETHCall);
        }

        const multicallData = encodeFunctionData({
          abi: chainContractConfig.v3PositionManagerABI,
          functionName: "multicall",
          args: [multicallArgs],
        });

        let tx;
        let gasEstimate;

        const isWrapped0 = token0?.address === wrappedNativeAddress;
        const isWrapped1 = token1?.address === wrappedNativeAddress;

        try {
          gasEstimate = await publicClient!.estimateGas({
            account: address as Address,
            to: positionManager as Address,
            data: multicallData,
            value: isWrapped0
              ? parseUnits(enteredAmount0.toString(), token0?.decimals ?? 18)
              : isWrapped1
              ? parseUnits(enteredAmount1.toString(), token1?.decimals ?? 18)
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

        tx = await signer.sendTransaction({
          to: positionManager as Address,
          data: multicallData,
          value: isWrapped0
            ? parseUnits(enteredAmount0.toString(), token0?.decimals ?? 18)
            : isWrapped1
            ? parseUnits(enteredAmount1.toString(), token1?.decimals ?? 18)
            : BigInt(0),
          gasLimit: gasEstimate,
          chainId,
        });

        // else {
        //   tx = await signer.sendTransaction({
        //     to: positionManager as Address,
        //     data: multicallData,
        //     // gasLimit: gasEstimate,
        //     chainId,
        //   });
        // }

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
                {getTrimmedResult(enteredAmount0.toString())} {token0?.symbol}{" "}
                and {getTrimmedResult(enteredAmount1.toString())}{" "}
                {token1?.symbol}.
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
          setLpAddingSuccess(true);
        }
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
      isInverted,
      canonicalTickLower,
      canonicalTickUpper,
      poolAddress,
      priceWhenPoolNotInitialized:
        priceWhenPoolNotInitialized?.toSignificant(6),
      priceWhenPoolNotInitializedInverted: priceWhenPoolNotInitialized
        ?.invert()
        .toSignificant(6),
    });
  }, [
    enteredAmount0,
    enteredAmount1,
    balance0,
    balance1,
    hasInsufficient0,
    hasInsufficient1,
    isInverted,
    currencyA,
    currencyB,
    canonicalTickLower,
    canonicalTickUpper,
    poolAddress,
    priceWhenPoolNotInitialized,
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

export default AddLPButton;
