"use client";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { useAccount, useConfig } from "wagmi";
import { Address, erc20Abi, formatUnits, parseUnits } from "viem";
import { useSwapStore } from "@/store/useDexStore";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { contractConfig } from "@/config/blockchain.config";
import { ContractConfigItemType, TokenType } from "@/interfaces/index.i";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { checkApproveAllowance } from "@/service/blockchain.service";
import { toast } from "react-toastify";

import { Permit2Signature } from "@pancakeswap/universal-router-sdk";
import { BASE_CHAIN_CONFIG } from "./TestSwapButton";
import { Loader2 } from "lucide-react";

function SwapButton() {
  const { chainId, address } = useAccount();
  const config = useConfig();

  const {
    fromToken,
    toToken,
    fromTokenInputAmount,
    setFromTokenInputAmount,
    toTokenInputAmount,
    setToTokenInputAmount,
    fromTokenBalance,
    isLoadingApprove,
    setIsLoadingApprove,
    setFromTokenApprovedAmount,
    fromTokenApprovedAmount,
    setToTokenApprovedAmount,
    setIsLoadingSwap,
    isLoadingSwap,
    feeTier,
    setUpdateBalance,
    slippage,
  } = useSwapStore();

  const { openConnectModal } = useConnectModal();

  const [isLoadingFetchApprovedAmount, setIsLoadingFetchApprovedAmount] =
    useState(false);
  const [permit2Signature, setPermit2Signature] = useState<
    Permit2Signature | undefined
  >(undefined);

  const clearTokenDetails = () => {
    // setFromToken(fromToken);
    // setFromTokenBalance("0.00");
    setFromTokenInputAmount("");
    // setToToken(toToken);
    setToTokenInputAmount("");
    // setToTokenBalance("0.00");
    // setIsApprovedSuccess(false);
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

  const swapHandler = async () => {
    setIsLoadingSwap(true);

    let inputToken =
      fromToken?.address === "native"
        ? chainId === 56
          ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
          : chainId === 1
          ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          : chainId === 97
          ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
          : "0x4200000000000000000000000000000000000006"
        : fromToken?.address!;

    let outputToken =
      toToken?.address! === "native"
        ? chainId === 56
          ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
          : chainId === 1
          ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          : chainId === 97
          ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
          : "0x4200000000000000000000000000000000000006"
        : toToken?.address!;

    try {
      if (
        !chainId ||
        !address ||
        !fromToken ||
        !toToken ||
        !fromTokenInputAmount
      ) {
        toast.error("Missing required input parameters.");
        return;
      }

      // Get base configuration and merge with hardcoded Base chain config if needed
      let chainContractConfig: ContractConfigItemType =
        contractConfig[chainId] || contractConfig["default"];

      // If on Base chain and eth chain merge the hardcoded abi
      if (chainId !== 56 && chainId !== 97) {
        console.log("Merging with hardcoded abi");

        chainContractConfig = {
          ...chainContractConfig,
          v3RouterABI: BASE_CHAIN_CONFIG.v3RouterABI,
        };
      }

      let slip = (parseFloat(toTokenInputAmount) * slippage!)!;

      const amountOutMin = (
        parseFloat(toTokenInputAmount) -
        slip / 100
      ).toString();

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      let amount = fromTokenInputAmount;
      let tokenAmountFormated =
        amount.toString().split(".")[1]?.length > (fromToken?.decimals ?? 18)
          ? parseFloat(amount)
              .toFixed(fromToken?.decimals ?? 18)
              .toString()
          : amount.toString();

      let parseValue: bigint;

      if (fromToken?.address === "native") {
        parseValue = parseUnits(fromTokenInputAmount, fromToken?.decimals!);
      } else if (toToken?.address === "native") {
        parseValue = BigInt("0");
      } else {
        parseValue = BigInt("0");
      }

      function safeToString(num: string | number, decimals: number): string {
        if (typeof num === "string") {
          // Check if string is already in scientific notation
          if (num.includes("e") || num.includes("E")) {
            const numValue = parseFloat(num);
            if (Math.abs(numValue) < Math.pow(10, -decimals)) {
              return "0";
            }
            return numValue.toFixed(decimals);
          }
          return num;
        }

        // Handle very small numbers that become scientific notation
        if (Math.abs(num) < Math.pow(10, -decimals)) {
          return "0"; // Treat as zero if smaller than token precision
        }

        // Always use toFixed to avoid scientific notation entirely
        return num.toFixed(decimals);
      }

      // Usage
      const amountInput = parseUnits(
        safeToString(fromTokenInputAmount, fromToken?.decimals!),
        fromToken?.decimals!
      );

      const amountOutMinimum = parseUnits(
        safeToString(amountOutMin, toToken?.decimals!),
        toToken?.decimals!
      );

      const swapParams = {
        tokenIn: inputToken! as Address,
        tokenOut: outputToken! as Address,
        fee: feeTier!,
        recipient: address as Address,
        deadline,
        amountIn: amountInput, //parseUnits(fromTokenInputAmount, fromToken?.decimals!),
        amountOutMinimum: amountOutMinimum, //parseUnits(amountOutMin, toToken?.decimals!),
        sqrtPriceLimitX96: BigInt("0"),
      };

      const { request } = await simulateContract(config, {
        address: chainContractConfig.v3RouterAddress as Address,
        abi: chainContractConfig.v3RouterABI,
        functionName: "exactInputSingle",
        args: [swapParams],
        chainId,
        value: parseValue,
      });

      const hash = await writeContract(config, request);

      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash,
      });

      if (transactionReceipt.status === "success") {
        // Show success notification
        toast.success(
          <div>
            <p>
              Successfully swapped {getTrimmedResult(fromTokenInputAmount)}{" "}
              {fromToken.symbol} to {getTrimmedResult(toTokenInputAmount)}{" "}
              {toToken.symbol}.
            </p>
            <Link
              href={`${chainContractConfig.explorerURL}/tx/${transactionReceipt.transactionHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-white dark:text-slate text-sm underline"
            >
              View Transaction
            </Link>
          </div>,
          {
            toastId: "swap-success-toast",
          }
        );
        clearTokenDetails();
        setUpdateBalance(true);
      }
    } catch (error: any) {
      console.error("SwapHandler Error:", error);
      toast.error(error?.shortMessage, {
        toastId: "swap-error-toast",
      });
    } finally {
      setIsLoadingSwap(false);
    }
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
      // Get base configuration and merge with hardcoded Base chain config if needed
      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId || "default"];

      const { request } = await simulateContract(config, {
        address: token.address as Address,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          chainContractConfig?.v3RouterAddress as Address,
          parseUnits(tokenAmountFormated, token?.decimals),
        ],
        chainId: chainId,
      });

      const hash = await writeContract(config, request);

      const data = await waitForTransactionReceipt(config, {
        hash: hash,
      });

      // console.log("wish approve data", data);
      if (data?.status == "success") {
        // setIsApprovedSuccess(true);
        toast.success(
          <div>
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
    } catch (error: any) {
      console.error("Error while approving", error);
      toast.error(error?.shortMessage, {
        toastId: "approve-swap-token",
      });
    } finally {
      setIsLoadingApprove(false);
    }
  };

  const fetchFromTokenApprovedAmount = async () => {
    console.log("fetchFromTokenApprovedAmount fromToken : ", fromToken);
    if (fromToken) {
      const fromTokenAllowance = await checkApproveAllowance(
        address,
        fromToken?.address as Address,
        fromToken?.chainId,
        setIsLoadingFetchApprovedAmount,
        config
      );
      // console.log("wish fromTokenAllowance", fromTokenAllowance);

      setFromTokenApprovedAmount(
        formatUnits(
          BigInt(fromTokenAllowance ?? "0"),
          fromToken?.decimals ?? 18
        )
      );

      console.log(
        "fromTokenAllowance : ",
        formatUnits(
          BigInt(fromTokenAllowance ?? "0"),
          fromToken?.decimals ?? 18
        )
      );
    }
  };

  const fetchToTokenApprovedAmount = async () => {
    console.log("fetchToTokenApprovedAmount toToken : ", toToken);
    if (toToken && toToken.address !== "native") {
      const toTokenAllowance = await checkApproveAllowance(
        address,
        toToken?.address as Address,
        toToken?.chainId,
        setIsLoadingFetchApprovedAmount,
        config
      );

      setToTokenApprovedAmount(
        formatUnits(BigInt(toTokenAllowance ?? "0"), toToken?.decimals ?? 18)
      );
    }
  };

  useEffect(() => {
    console.log("fromToken : ", fromToken);
    if (fromToken && fromToken.address !== "native") {
      fetchFromTokenApprovedAmount();
    }
    // console.log("wish fromTokenApprovedAmount", fromTokenApprovedAmount);
  }, [fromToken, address, isLoadingApprove]);

  useEffect(() => {
    if (toToken) {
      fetchToTokenApprovedAmount();
    }
    // console.log("wish toTokenApprovedAmount", toTokenApprovedAmount);
  }, [toToken, address, isLoadingApprove]);

  return (
    <div className="space-y-2">
      {/* Regular swap button */}
      {!address ? (
        <Button
          className="w-full button-primary uppercase h-10 font-lato"
          onClick={openConnectModal}
        >
          Connect Wallet
        </Button>
      ) : fromToken &&
        toToken &&
        ![100, 500, 2500, 3000, 10000, 25000].includes(feeTier!) ? (
        <Button
          className="w-full button-primary uppercase h-10 font-lato text-sm"
          disabled={true}
        >
          Swap
        </Button>
      ) : parseFloat(fromTokenInputAmount) >
          parseFloat(fromTokenApprovedAmount) &&
        fromToken &&
        fromToken.address != "native" ? (
        <Button
          className="w-full button-primary uppercase h-10 font-lato"
          onClick={() =>
            handleApprove(fromToken, fromTokenInputAmount.toString())
          }
          disabled={
            isLoadingApprove ||
            fromToken?.address == toToken?.address ||
            parseFloat(fromTokenBalance) < parseFloat(fromTokenInputAmount)
          }
        >
          {isLoadingApprove && <Loader2 size={20} className="animate-spin" />}{" "}
          {parseFloat(fromTokenBalance) < parseFloat(fromTokenInputAmount)
            ? "Insufficient funds"
            : `Approve`}{" "}
          ({fromToken?.symbol})
        </Button>
      ) : fromToken &&
        fromToken.address === "native" &&
        parseFloat(fromTokenInputAmount) > 0 &&
        parseFloat(fromTokenBalance) < parseFloat(fromTokenInputAmount) ? (
        <Button
          className="w-full button-primary uppercase h-10 font-lato"
          onClick={() =>
            handleApprove(fromToken, fromTokenInputAmount.toString())
          }
          disabled={
            isLoadingApprove ||
            fromToken?.address == toToken?.address ||
            parseFloat(fromTokenBalance) < parseFloat(fromTokenInputAmount)
          }
        >
          Insufficient funds ({fromToken?.symbol})
        </Button>
      ) : (
        <Button
          onClick={swapHandler}
          className="w-full flex button-primary uppercase h-10 font-lato text-sm"
          disabled={
            fromToken?.address === toToken?.address ||
            parseFloat(fromTokenBalance) <= parseFloat("0") ||
            parseFloat(fromTokenInputAmount) <= parseFloat("0") ||
            parseFloat(fromTokenInputAmount) <= parseFloat("0.0") ||
            parseFloat(toTokenInputAmount) <= parseFloat("0") ||
            parseFloat(toTokenInputAmount) <= parseFloat("0.0") ||
            toTokenInputAmount === "0.0" ||
            fromTokenInputAmount === "0.0" ||
            fromTokenInputAmount === "" ||
            toTokenInputAmount === "" ||
            parseFloat(fromTokenBalance) < parseFloat(fromTokenInputAmount) ||
            isLoadingFetchApprovedAmount ||
            isLoadingSwap
          }
        >
          {isLoadingSwap && <Loader2 size={20} className="animate-spin" />} Swap
        </Button>
      )}
    </div>
  );
}

export default SwapButton;
