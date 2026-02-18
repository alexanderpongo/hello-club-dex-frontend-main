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
  parseUnits,
} from "viem";
import { useAccount, useConfig, usePublicClient, useWalletClient } from "wagmi";

import { contractConfig } from "@/config/blockchain.config";
import { ContractConfigItemType, TokenType } from "@/interfaces/index.i";
import { checkLpApproveAllowance } from "@/service/blockchain.service";
import { useLPStore } from "@/store/useDexStore";
import { waitForTransaction, writeContract } from "@wagmi/core";

import { Button } from "../ui/button";

const AddLPButton = () => {
  const config = useConfig();
  const {
    fromLPToken,
    toLPToken,
    fromLPTokenInputAmount,
    toLPTokenInputAmount,
    tickLower,
    tickUpper,
    inverseTickLower,
    inverseTickUpper,
    feeTier,
    sqrtPriceX96,
    inverseSqrtPriceX96,
    poolAddress,
    token0Address,
    token1Address,
    poolFee,
    setFromLpTokenApprovedAmount,
    fromLpTokenApprovedAmount,
    setToLpTokenApprovedAmount,
    toLpTokenApprovedAmount,
    fromLPTokenBalance,
    toLPTokenBalance,
    tickSpace,
    activePriceRange,
    setFromLPTokenInputAmount,
    setToLPTokenInputAmount,
    setFromLPTokenBalance,
    setToLPTokenBalance,
    setLpAddingSuccess,
    setTxHash,
  } = useLPStore();
  const { address, chainId } = useAccount();
  const { data: signer } = useWalletClient();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingFetchApprovedAmount, setIsLoadingFetchApprovedAmount] =
    useState(false);

  const addLiquidity = async () => {
    setIsLoading(true);
    if (!signer || !address) {
      console.error("Wallet not connected");
      return;
    }
    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId!] || contractConfig["default"];

    const positionManager = chainContractConfig.v3PositionManagerAddress;

    // Check if position manager address is undefined
    if (!positionManager) {
      console.error(
        "Position Manager Address is undefined for chainId:",
        chainId
      );
      toast.error("Position Manager contract not configured for this network");
      setIsLoading(false);
      return;
    }
    const slippageBuffer = (value: number) => {
      return value * 0.1; // 10% slippage tolerance
    };

    let inputToken =
      fromLPToken?.address! === "native"
        ? chainId === 56
          ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
          : chainId === 1
          ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          : chainId === 97
          ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
          : "0x4200000000000000000000000000000000000006"
        : fromLPToken?.address;

    let outputToken =
      toLPToken?.address! === "native"
        ? chainId === 56
          ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
          : chainId === 1
          ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          : chainId === 97
          ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
          : "0x4200000000000000000000000000000000000006"
        : toLPToken?.address;

    const token0 =
      inputToken?.toLowerCase() === token0Address?.toLowerCase()
        ? inputToken
        : outputToken;

    const token00 = token0 as Address;

    const token1 =
      inputToken?.toLowerCase() === token0Address?.toLowerCase()
        ? outputToken
        : inputToken;

    const token11 = token1 as Address;

    const [token0Multicall, token1Multicall] =
      inputToken?.toLowerCase()! < outputToken?.toLowerCase()!
        ? [inputToken, outputToken]
        : [outputToken, inputToken];

    const token0AmountMulticall =
      token0Multicall?.toLowerCase() === inputToken?.toLowerCase()!
        ? parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!)
        : parseUnits(toLPTokenInputAmount, toLPToken?.decimals!);

    const token1AmountMulticall =
      token1Multicall?.toLowerCase() === outputToken?.toLowerCase()!
        ? parseUnits(toLPTokenInputAmount, toLPToken?.decimals!)
        : parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!);

    function toFixedString(value: number, decimals: number) {
      // This converts even very small numbers to normal decimal string
      return value.toFixed(decimals);
    }

    // Map amounts to token0 and token1 based on token order
    // Use correct decimals - ETH is 18, most ERC-20 tokens are 18
    const fromDecimals =
      fromLPToken?.address === "native" ? 18 : fromLPToken?.decimals || 18;
    const toDecimals =
      toLPToken?.address === "native" ? 18 : toLPToken?.decimals || 18;

    // Ensure input amounts are valid decimal strings
    const fromAmountStr = fromLPTokenInputAmount || "0";
    const toAmountStr = toLPTokenInputAmount || "0";

    // Check if amounts are valid numbers
    if (isNaN(parseFloat(fromAmountStr)) || isNaN(parseFloat(toAmountStr))) {
      throw new Error("Invalid input amounts");
    }

    const fromAmount = parseUnits(fromAmountStr, fromDecimals);
    const toAmount = parseUnits(toAmountStr, toDecimals);

    // Additional validation: check if amounts are reasonable
    const fromAmountFloat = parseFloat(fromAmountStr);
    const toAmountFloat = parseFloat(toAmountStr);

    if (fromAmountFloat <= 0 || toAmountFloat <= 0) {
      throw new Error("Amounts must be greater than 0");
    }

    // Determine which token is token0 and which is token1
    // Handle native token comparison - native token address should match token1Multicall (WETH)
    const isFromToken0 =
      fromLPToken?.address === "native"
        ? false // ETH is always token1 (WETH)
        : fromLPToken?.address?.toLowerCase() ===
          token0Multicall?.toLowerCase();

    // Map amounts correctly based on token order
    // For native tokens, find which token is the wrapped native token dynamically
    let fromTokenAddress;
    if (fromLPToken?.address === "native") {
      // Get the wrapped native token address for current chain
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

      // Check if token0Multicall is the wrapped native token
      if (
        token0Multicall?.toLowerCase() === wrappedNativeAddress.toLowerCase()
      ) {
        fromTokenAddress = token0Multicall?.toLowerCase();
      } else {
        // Otherwise, it must be token1Multicall
        fromTokenAddress = token1Multicall?.toLowerCase();
      }
    } else {
      fromTokenAddress = fromLPToken?.address?.toLowerCase();
    }

    const amount0 =
      token0Multicall?.toLowerCase() === fromTokenAddress
        ? fromAmount
        : toAmount;

    const amount1 =
      token1Multicall?.toLowerCase() === fromTokenAddress
        ? fromAmount
        : toAmount;

    const token0AmountMinMulticall = (amount0 * BigInt(5)) / BigInt(10); // 50% of amount0
    const token1AmountMinMulticall = (amount1 * BigInt(5)) / BigInt(10); // 50% of amount1

    const fee = parseFloat(feeTier) * 10000;

    const deadline = Math.floor(Date.now() / 1000) + 1200; // 10 min deadline

    function alignToTickSpacing(tick: number, tickSpacing: number) {
      return Math.round(tick / tickSpacing) * tickSpacing;
    }

    function priceToTick(price: number) {
      if (price < 1e-20) {
        return (
          Math.floor(Math.log(price * 1e20) / Math.log(1.0001)) -
          Math.floor(Math.log(1e20) / Math.log(1.0001))
        );
      }
      return Math.floor(Math.log(price) / Math.log(1.0001));
    }

    // Use the calculated tick values directly
    let tl: number;
    let tu: number;

    if (inputToken && outputToken) {
      if (inputToken.toLowerCase() < outputToken.toLowerCase()) {
        tl = tickLower!;
        tu = tickUpper!;
      } else {
        tl = inverseTickLower!;
        tu = inverseTickUpper!;
      }
    } else {
      console.warn("Input or output token is undefined. Using 0 as fallback");
      tl = -887220!;
      tu = 887220!;
    }

    // console.log("MintParams preparation with:", {
    //   token0,
    //   token1,
    //   fee,
    //   tickLower: tl,
    //   tickUpper: tu,
    //   amount0Desired: fromAmount,
    //   amount1Desired: toAmount,
    //   amount0Min: token0AmountMinMulticall,
    //   amount1Min: token1AmountMinMulticall,
    //   recipient: address,
    //   deadline,
    // });

    const MintParams = encodeFunctionData({
      abi: chainContractConfig.v3PositionManagerABI,
      functionName: "mint",
      args: [
        {
          token0: token0Multicall,
          token1: token1Multicall,
          fee,
          tickLower: tl,
          tickUpper: tu,
          amount0Desired: amount0,
          amount1Desired: amount1,
          amount0Min: token0AmountMinMulticall, // 50% slippage protection
          amount1Min: token1AmountMinMulticall, // 50% slippage protection
          recipient: address,
          deadline,
        },
      ],
    });

    // Encode mint function call
    const MulticallMintLiquidity = encodeFunctionData({
      abi: chainContractConfig.v3PositionManagerABI,
      functionName: "mint",
      args: [
        {
          token0: token0Multicall as Address,
          token1: token1Multicall as Address,
          fee,
          tickLower: tl,
          tickUpper: tu,
          amount0Desired: amount0,
          amount1Desired: amount1,
          amount0Min: token0AmountMinMulticall, // 50% slippage protection
          amount1Min: token1AmountMinMulticall, // 50% slippage protection
          recipient: address,
          deadline,
        },
      ],
    });

    console.log("MulticallMintLiquidity Params : ", {
      token0: token0Multicall as Address,
      token1: token1Multicall as Address,
      fee,
      tickLower: tl,
      tickUpper: tu,
      amount0Desired: amount0,
      amount1Desired: amount1,
      amount0Min: token0AmountMinMulticall, // 50% slippage protection
      amount1Min: token1AmountMinMulticall, // 50% slippage protection
      recipient: address,
      deadline,
    });

    // Calculate the correct price from the amounts
    // Price = amount1 / amount0 (ETH per other token)
    const currentPrice = Number(amount1) / Number(amount0);
    console.log("Current Price Calculation : ", currentPrice );
    const sqrtPrice = Math.sqrt(currentPrice);
    const sqrtPriceX96BN = BigInt(Math.floor(sqrtPrice * 2 ** 96));
    const inverseSqrtPriceX96BN = BigInt(Math.floor((1 / sqrtPrice) * 2 ** 96));

    // Decide which sqrtX96 to use based on token order
    let sqrtx96: bigint;

    if (inputToken && outputToken) {
      if (inputToken.toLowerCase() < outputToken.toLowerCase()) {
        sqrtx96 = sqrtPriceX96BN;
      } else {
        sqrtx96 = sqrtPriceX96BN; // Use normal sqrtPriceX96 for both cases
      }
    } else {
      console.warn("Input or output token is undefined. Using 0 as fallback.");
      sqrtx96 = BigInt(0);
    }

    // Debug price calculation
    const priceFromSqrt = (Number(sqrtx96) / 2 ** 96) ** 2;

    const initialsPoolsNecessary = encodeFunctionData({
      abi: chainContractConfig.v3PositionManagerABI,
      functionName: "createAndInitializePoolIfNecessary",
      args: [token0Multicall, token1Multicall, fee, sqrtx96],
    });

    console.log("createAndInitializePoolIfNecessary : ", {
      token0Multicall,
      token1Multicall,
      fee,
      sqrtx96,
    });

    // Prepare multicall - add refundETH for native tokens
    let multicallArgs = [initialsPoolsNecessary, MulticallMintLiquidity];

    let mintArgs = [MintParams];

    // Add refundETH call if using native tokens
    if (fromLPToken?.address === "native" || toLPToken?.address === "native") {
      const refundETHCall = encodeFunctionData({
        abi: chainContractConfig.v3PositionManagerABI,
        functionName: "refundETH",
        args: [],
      });
      mintArgs.push(refundETHCall);
    }

    // Add refundETH call if using native tokens
    if (fromLPToken?.address === "native" || toLPToken?.address === "native") {
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

    const mintData = encodeFunctionData({
      abi: chainContractConfig.v3PositionManagerABI,
      functionName: "multicall",
      args: [mintArgs],
    });

    if (poolAddress && fee === poolFee) {
      try {
        let tx;

        // Try gas estimation first
        let gasEstimate;
        try {
          gasEstimate = await publicClient!.estimateGas({
            account: address as Address,
            to: positionManager as Address,
            data: mintData,
            value:
              fromLPToken?.address === "native" ||
              toLPToken?.address === "native"
                ? fromLPToken?.address === "native"
                  ? parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!)
                  : parseUnits(toLPTokenInputAmount, toLPToken?.decimals!)
                : BigInt(0),
          });

          gasEstimate =
            (gasEstimate * (chainId === 8453 ? BigInt(150) : BigInt(120))) /
            BigInt(100);
        } catch (error: any) {
          toast.error(error?.shortMessage || "Transaction failed", {
            toastId: "lp-gas-estimation-toast",
          });
          gasEstimate = chainId === 8453 ? BigInt(8000000) : BigInt(5000000); // Fallback to high gas limit
        }

        const block = await publicClient!.getBlock();
        if (gasEstimate > block.gasLimit) {
          toast.error(
            `Gas limit (${gasEstimate.toString()}) exceeds block limit (${block.gasLimit.toString()}). ` +
              `Reduce amount or split into smaller transactions.`,
            { toastId: "gas-over-block-limit" }
          );
          // return; // stop before sending
        }

        if (
          fromLPToken?.address === "native" ||
          toLPToken?.address === "native"
        ) {
          tx = await signer.sendTransaction({
            to: positionManager as Address,
            data: mintData,
            value:
              fromLPToken?.address === "native"
                ? parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!)
                : parseUnits(toLPTokenInputAmount, toLPToken?.decimals!),
            gas: gasEstimate,
            chainId,
          });
        } else {
          tx = await signer.sendTransaction({
            to: positionManager as Address,
            data: mintData,
            gas:
              (gasEstimate * (chainId === 8453 ? BigInt(150) : BigInt(120))) /
              BigInt(100),
            chainId,
          });
        }

        const transactionReceipt =
          await publicClient!.waitForTransactionReceipt({
            hash: tx,
          });

        // if (transactionReceipt.status === "fail") {
        //   return transactionReceipt.
        // }

        if (!transactionReceipt || transactionReceipt.status === "reverted") {
          toast.error("Transaction reverted");
          return;
        }
        if (transactionReceipt.status === "success") {
          setTxHash(transactionReceipt?.transactionHash);
          // Show success notification
          toast.success(
            <div>
              {/* <p>
                  Successfully added liquidity{" "}
                  {getTrimmedResult(fromLPTokenInputAmount)} {fromLPToken?.symbol}{" "}
                  and {getTrimmedResult(toLPTokenInputAmount)} {toLPToken?.symbol}
                  .
                </p> */}
              <p>
                Successfully added liquidity{" "}
                {getTrimmedResult(fromLPTokenInputAmount)} {fromLPToken?.symbol}{" "}
                and {getTrimmedResult(toLPTokenInputAmount)} {toLPToken?.symbol}
                .
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
          setFromLPTokenInputAmount("");
          setToLPTokenInputAmount("");
          setLpAddingSuccess(true);
          let newBalanceFrom =
            parseFloat(fromLPTokenBalance) - parseFloat(fromLPTokenInputAmount);
          let newBalanceTo =
            parseFloat(toLPTokenBalance) - parseFloat(toLPTokenInputAmount);
          setFromLPTokenBalance(newBalanceFrom.toString());
          setToLPTokenBalance(newBalanceTo.toString());
        }
      } catch (error: any) {
        console.error("Error adding liquidity:", error);

        toast.error(error?.shortMessage || "Transaction failed", {
          toastId: "lp-error-toast",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        let tx;

        // Try gas estimation first
        let gasEstimate;
        try {
          gasEstimate = await publicClient!.estimateGas({
            account: address as Address,
            to: positionManager as Address,
            data: multicallData,
            value:
              fromLPToken?.address === "native" ||
              toLPToken?.address === "native"
                ? fromLPToken?.address === "native"
                  ? parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!)
                  : parseUnits(toLPTokenInputAmount, toLPToken?.decimals!)
                : BigInt(0),
          });

          gasEstimate =
            (gasEstimate * (chainId === 8453 ? BigInt(150) : BigInt(120))) /
            BigInt(100);
        } catch (error: any) {
          toast.error(error?.shortMessage || "Transaction failed", {
            toastId: "lp-gas-estimation-toast",
          });
          gasEstimate = chainId === 8453 ? BigInt(8000000) : BigInt(5000000); // Fallback to high gas limit
        }

        const block = await publicClient!.getBlock();
        if (gasEstimate > block.gasLimit) {
          toast.error(
            `Gas limit (${gasEstimate.toString()}) exceeds block limit (${block.gasLimit.toString()}). ` +
              `Reduce amount or split into smaller transactions.`,
            { toastId: "gas-over-block-limit" }
          );
          // return; // stop before sending
        }

        if (
          fromLPToken?.address === "native" ||
          toLPToken?.address === "native"
        ) {
          tx = await signer.sendTransaction({
            to: positionManager as Address,
            data: multicallData,
            value:
              fromLPToken?.address === "native"
                ? parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!)
                : parseUnits(toLPTokenInputAmount, toLPToken?.decimals!),
            gas: gasEstimate,
          });
        } else {
          tx = await signer.sendTransaction({
            to: positionManager as Address,
            data: multicallData,
            gas: gasEstimate,
          });
        }

        const transactionReceipt =
          await publicClient!.waitForTransactionReceipt({
            hash: tx,
          });

        if (!transactionReceipt || transactionReceipt.status === "reverted") {
          toast.error("Transaction reverted");
          return;
        }

        if (transactionReceipt.status === "success") {
          setTxHash(transactionReceipt?.transactionHash);
          // Show success notification
          toast.success(
            <div>
              <p>
                Successfully added liquidity{" "}
                {getTrimmedResult(fromLPTokenInputAmount)} {fromLPToken?.symbol}{" "}
                and {getTrimmedResult(toLPTokenInputAmount)} {toLPToken?.symbol}
                .
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
          setFromLPTokenInputAmount("");
          setToLPTokenInputAmount("");
          setLpAddingSuccess(true);
          let newBalanceFrom =
            parseFloat(fromLPTokenBalance) - parseFloat(fromLPTokenInputAmount);
          let newBalanceTo =
            parseFloat(toLPTokenBalance) - parseFloat(toLPTokenInputAmount);
          setFromLPTokenBalance(newBalanceFrom.toString());
          setToLPTokenBalance(newBalanceTo.toString());
        }
      } catch (error: any) {
        console.error("Error adding liquidity:", error);
        toast.error(error?.shortMessage || "Transaction failed", {
          toastId: "lp-error-toast",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

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

  const handleApprove = async (token: TokenType, amount: string) => {
    setIsLoadingApprove(true);
    try {
      let tokenAmountFormated =
        amount.toString().split(".")[1]?.length > (token?.decimals ?? 18)
          ? parseFloat(amount)
              .toFixed(token?.decimals ?? 18)
              .toString()
          : amount.toString();

      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId || "default"];

      const approvalAmount = parseUnits(tokenAmountFormated, token?.decimals);

      const hash = await writeContract(config, {
        address: token.address as Address,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          chainContractConfig?.v3PositionManagerAddress as Address,
          approvalAmount,
        ],
        chainId: chainId,
      });

      const data = await waitForTransaction(config, {
        hash: hash,
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (data?.status == "success") {
        // setIsApprovedSuccess(true);
        toast.success(
          <div className="card-primary">
            <p>
              Successfully approved {getTrimmedResult(amount)} {token?.symbol}
            </p>
            <Link
              href={`${chainContractConfig?.explorerURL}/tx/${data?.transactionHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate text-sm underline"
            >
              See Transaction
            </Link>
          </div>,
          {
            toastId: "approve-swap-token",
          }
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
      // Retry fetching allowance after successful approval
      await retryFetchAllowances(token, amount);
    } catch (error: any) {
      console.error("Error while approving", error);
      toast.error(error?.shortMessage, {
        toastId: "approve-swap-token",
      });
    } finally {
      setIsLoadingApprove(false);
    }
  };

  // Helper function to retry fetching allowances with amount validation
  const retryFetchAllowances = async (
    approvedToken: TokenType,
    approvedAmount: string
  ) => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second delay between retries

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Wait before retrying (except for the first attempt)
        if (attempt > 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }

        // Determine which token was approved and fetch its allowance
        let fetchedAllowance = "0";

        if (fromLPToken && fromLPToken.address === approvedToken.address) {
          fetchedAllowance = await fetchFromLpTokenApprovedAmount();
          // fetchedAllowance = fromLpTokenApprovedAmount;
        }
        if (toLPToken && toLPToken.address === approvedToken.address) {
          fetchedAllowance = await fetchToLpTokenApprovedAmount();
          // fetchedAllowance = toLpTokenApprovedAmount;
        }

        // Check if the fetched allowance is greater than or equal to approved amount
        const approvedAmountBigInt = parseUnits(
          approvedAmount,
          approvedToken.decimals
        );
        const fetchedAllowanceBigInt = parseUnits(
          fetchedAllowance,
          approvedToken.decimals
        );

        if (fetchedAllowanceBigInt >= approvedAmountBigInt) {
          break; // Allowance is sufficient, exit the retry loop
        } else {
          toast.error(
            `⚠️ Allowance insufficient: ${fetchedAllowance} < ${approvedAmount}, retrying...`,
            {
              toastId: "allowance-toast-attempt1",
            }
          );
          // If this was the last attempt and allowance is still insufficient
          if (attempt === maxRetries) {
            console.error(
              `❌ Final attempt: Allowance ${fetchedAllowance} is still less than approved amount ${approvedAmount}`
            );
            toast.error(
              `❌ Final attempt: Allowance ${fetchedAllowance} is still less than approved amount ${approvedAmount}`,
              {
                toastId: "allowance-toast-attempt",
              }
            );
          }
        }
      } catch (error: any) {
        console.error(`Allowance fetch attempt ${attempt} failed:`, error);
        toast.error(error?.shortMessage || "Transaction failed", {
          toastId: "allowance-toast",
        });
        // If this was the last attempt, log the final failure
        if (attempt === maxRetries) {
          console.error("All allowance fetch attempts failed");
        }
      }
    }
  };

  const fetchFromLpTokenApprovedAmount = async (): Promise<string> => {
    if (!chainId) {
      return "0";
    } // Early return if chainId is not available

    let inputToken =
      fromLPToken?.address! === "native"
        ? chainId === 56
          ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
          : chainId === 1
          ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          : chainId === 97
          ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
          : "0x4200000000000000000000000000000000000006"
        : fromLPToken?.address;
    if (fromLPToken) {
      const fromTokenAllowance = await checkLpApproveAllowance(
        address,
        inputToken as Address,
        chainId, // Use current chainId instead of token's chainId
        setIsLoadingFetchApprovedAmount,
        config
      );

      setFromLpTokenApprovedAmount(
        formatUnits(BigInt(fromTokenAllowance ?? "0"), fromLPToken?.decimals)
      );
      return formatUnits(
        BigInt(fromTokenAllowance ?? "0"),
        fromLPToken?.decimals
      );
    }
    return "0";
  };

  const fetchToLpTokenApprovedAmount = async (): Promise<string> => {
    if (!chainId) {
      return "0";
    }
    let outputToken =
      toLPToken?.address! === "native"
        ? chainId === 56
          ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
          : chainId === 1
          ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          : chainId === 97
          ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
          : "0x4200000000000000000000000000000000000006"
        : toLPToken?.address;
    if (toLPToken) {
      const toTokenAllowance = await checkLpApproveAllowance(
        address,
        outputToken as Address,
        chainId!, // Use current chainId instead of token's chainId
        setIsLoadingFetchApprovedAmount,
        config
      );

      const convertedTokenAmount: string = formatUnits(
        BigInt(toTokenAllowance ?? "0"),
        toLPToken?.decimals
      );

      setToLpTokenApprovedAmount(
        formatUnits(BigInt(toTokenAllowance ?? "0"), toLPToken?.decimals)
      );

      return convertedTokenAmount;
    }
    return "0";
  };

  useEffect(() => {
    if (fromLPToken) {
      fetchFromLpTokenApprovedAmount();
    }
  }, [fromLPToken, address, fromLPTokenInputAmount, isLoadingApprove, chainId]);

  useEffect(() => {
    if (toLPToken) {
      fetchToLpTokenApprovedAmount();
    }
  }, [toLPToken, address, toLpTokenApprovedAmount, isLoadingApprove, chainId]);
  return (
    <div className="py-2">
      {(() => {
        const fromInput = parseFloat(fromLPTokenInputAmount || "0");
        const toInput = parseFloat(toLPTokenInputAmount || "0");
        const fromBalance = parseFloat(fromLPTokenBalance || "0");
        const toBalance = parseFloat(toLPTokenBalance || "0");
        const fromApproved = parseFloat(fromLpTokenApprovedAmount || "0");
        const toApproved = parseFloat(toLpTokenApprovedAmount || "0");

        const isFromInsufficient = fromInput > fromBalance || fromBalance === 0;
        const isToInsufficient = toInput > toBalance || toBalance === 0;
        const isFromApprovalNeeded =
          fromInput > fromApproved && fromLPToken?.address !== "native";
        const isToApprovalNeeded =
          toInput > toApproved && toLPToken?.address !== "native";

        const commonButtonClass = "w-full flex button-primary uppercase h-10";

        if (isFromInsufficient) {
          return (
            <Button className={commonButtonClass} disabled>
              Insufficient funds ({fromLPToken?.symbol})
            </Button>
          );
        }

        if (isToInsufficient) {
          return (
            <Button className={commonButtonClass} disabled>
              Insufficient funds ({toLPToken?.symbol})
            </Button>
          );
        }

        if (isFromApprovalNeeded) {
          return (
            <Button
              className={commonButtonClass}
              onClick={() =>
                handleApprove(fromLPToken!, fromLPTokenInputAmount.toString())
              }
              disabled={
                isLoadingApprove ||
                fromLPToken?.address === toLPToken?.address ||
                isFromInsufficient
              }
            >
              {isLoadingApprove && (
                <Loader2 size={20} className="animate-spin" />
              )}{" "}
              Approve ({fromLPToken?.symbol})
            </Button>
          );
        }

        if (isToApprovalNeeded) {
          return (
            <Button
              className={commonButtonClass}
              onClick={() =>
                handleApprove(toLPToken!, toLPTokenInputAmount.toString())
              }
              disabled={
                isLoadingApprove ||
                fromLPToken?.address === toLPToken?.address ||
                isToInsufficient
              }
            >
              {isLoadingApprove ? (
                <>
                  {" "}
                  <Loader2 size={20} className="animate-spin" /> Please wait
                </>
              ) : (
                <> Approve ({toLPToken?.symbol})</>
              )}{" "}
            </Button>
          );
        }

        return (
          <>
            <Button
              className={commonButtonClass}
              onClick={addLiquidity}
              disabled={
                !fromInput ||
                !toInput ||
                isFromInsufficient ||
                isToInsufficient ||
                isLoading
              }
            >
              {isLoading && <Loader2 size={20} className="animate-spin" />}
              {isFromInsufficient || isToInsufficient
                ? `Insufficient funds (${
                    isToInsufficient ? toLPToken?.symbol : fromLPToken?.symbol
                  })`
                : "Add Liquidity"}
            </Button>
            {/* <Button onClick={addLiquidity}>add 2</Button> */}
          </>
        );
      })()}
    </div>
  );
};

export default AddLPButton;
