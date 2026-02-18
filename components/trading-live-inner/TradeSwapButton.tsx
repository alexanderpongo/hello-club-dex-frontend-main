"use client";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  useAccount,
  useConfig,
  usePublicClient,
  useSendTransaction,
  useWalletClient,
} from "wagmi";
import { getChainProvider } from "@/lib/v3Providers";
import {
  Address,
  concatHex,
  encodeAbiParameters,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  fromHex,
  Hex,
  parseAbiParameters,
  parseEther,
  parseGwei,
  parseUnits,
  toHex,
} from "viem";
import { useSwapStore } from "@/store/useDexStore";
import {
  type SendTransactionParameters,
  sendTransaction,
  signTypedData,
  waitForTransaction,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { contractConfig } from "@/config/blockchain.config";
import {
  ContractConfigItemType,
  TokenType,
  TradeTokenType,
} from "@/interfaces/index.i";
import { BigNumberish, Bytes, BytesLike, ethers } from "ethers";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Loader2 } from "lucide-react";
import { ToastAction } from "../ui/toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  checkApproveAllowance,
  fetchBalance,
} from "@/service/blockchain.service";
import { toast } from "react-toastify";

import { Permit2Signature } from "@pancakeswap/universal-router-sdk";
import { hexValue } from "ethers/lib/utils";
import { BASE_CHAIN_CONFIG } from "../evm/TestSwapButton";

// Utility function to convert number to string without scientific notation
const toFixedWithoutScientific = (num: number, decimals: number = 18): string => {
  return num.toLocaleString('fullwide', { 
    useGrouping: false, 
    maximumFractionDigits: decimals 
  });
};

interface TokenProps {
  tradeFromToken: TradeTokenType | null;
  tradeChainId: number;
  tradeToToken: TradeTokenType | null;
  poolFeeTier: number;
}

function TradeSwapButton({
  tradeFromToken,
  tradeChainId,
  tradeToToken,
  poolFeeTier,
}: TokenProps) {
  const { chainId, address } = useAccount();
  const publicClient = usePublicClient();
  const { data: signer } = useWalletClient();
  const config = useConfig();
  const { sendTransactionAsync } = useSendTransaction();

  function getChainProvider(): any {
    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId!] || contractConfig["default"];

    const provider = new ethers.providers.JsonRpcProvider(
      chainContractConfig.publicClientApi!,
      chainId
    );

    return provider;
  }

  const {
    tradeFromTokenInputAmount,
    setTradeFromTokenInputAmount,
    tradeToTokenInputAmount,
    setTradeToTokenInputAmount,
    fromTokenBalance,
    isLoadingApprove,
    setIsLoadingApprove,
    setFromTokenApprovedAmount,
    fromTokenApprovedAmount,
    setToTokenApprovedAmount,
    toTokenApprovedAmount,
    setIsLoadingSwap,
    isLoadingSwap,
    setFromTokenBalance,
    setToTokenBalance,
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
    setTradeFromTokenInputAmount("");
    // setToToken(toToken);
    setTradeToTokenInputAmount("");
    // setToTokenBalance("0.00");
    // setIsApprovedSuccess(false);
  };

  async function fetchGasEstimates() {
    if (!chainId) {
      throw new Error("Chain ID is required to fetch gas estimates.");
    }

    // Fetch latest block and gas price
    const block = await publicClient?.getBlock({ blockTag: "latest" });
    const gasPrice = await publicClient?.getGasPrice();

    if (chainId === 1) {
      // Ethereum Mainnet
      const baseFeePerGas = block?.baseFeePerGas || BigInt(0);
      const maxPriorityFeePerGas = parseUnits("1", 9); // 1 gwei tip
      const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas;

      return {
        chain: "Ethereum",
        baseFeePerGas: formatUnits(baseFeePerGas, 9),
        maxPriorityFeePerGas: formatUnits(maxPriorityFeePerGas, 9),
        maxFeePerGas: formatUnits(maxFeePerGas, 9),
      };
    } else if (chainId === 8453) {
      // Base Mainnet
      const baseFeePerGas = block?.baseFeePerGas || BigInt(0);
      const maxPriorityFeePerGas = parseUnits("0.5", 9); // ~0.5 gwei is typical for Base
      const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas;

      return {
        chain: "Base Mainnet",
        baseFeePerGas: formatUnits(baseFeePerGas, 9),
        maxPriorityFeePerGas: formatUnits(maxPriorityFeePerGas, 9),
        maxFeePerGas: formatUnits(maxFeePerGas, 9),
      };
    } else if (chainId === 56) {
      // BSC Mainnet
      return {
        chain: "Binance Smart Chain",
        gasPrice: formatUnits(gasPrice!, 9),
        maxPriorityFeePerGas: formatUnits(BigInt(0), 9),
        maxFeePerGas: formatUnits(gasPrice!, 9),
      };
    } else if (chainId === 97) {
      // BSC Testnet
      return {
        chain: "Binance Testnet",
        gasPrice: formatUnits(gasPrice!, 9),
        maxPriorityFeePerGas: formatUnits(BigInt(0), 9),
        maxFeePerGas: formatUnits(gasPrice!, 9),
      };
    } else {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }

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

  let inputToken1 =
    tradeFromToken?.address === "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" &&
    chainId === 56
      ? "native"
      : chainId === 1 &&
        tradeFromToken?.address === "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      ? "native"
      : chainId === 97 &&
        tradeFromToken?.address === "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
      ? "native"
      : chainId === 8453 &&
        tradeFromToken?.address === "0x4200000000000000000000000000000000000006"
      ? "native"
      : tradeFromToken?.address!;

  let outputToken1 =
    tradeToToken?.address === "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" &&
    chainId === 56
      ? "native"
      : chainId === 1 &&
        tradeToToken?.address === "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      ? "native"
      : chainId === 97 &&
        tradeToToken?.address === "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
      ? "native"
      : chainId === 8453 &&
        tradeToToken?.address === "0x4200000000000000000000000000000000000006"
      ? "native"
      : tradeToToken?.address!;

  const swapHandler = async () => {
    setIsLoadingSwap(true);

    let inputToken =
      tradeFromToken?.address === "native"
        ? chainId === 56
          ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
          : chainId === 1
          ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          : chainId === 97
          ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
          : "0x4200000000000000000000000000000000000006"
        : tradeFromToken?.address!;

    let outputToken =
      tradeToToken?.address! === "native"
        ? chainId === 56
          ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
          : chainId === 1
          ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          : chainId === 97
          ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
          : "0x4200000000000000000000000000000000000006"
        : tradeToToken?.address!;

    try {
      if (
        !chainId ||
        !address ||
        !tradeFromToken ||
        !tradeToToken ||
        !tradeFromTokenInputAmount
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

      const gasFees = await fetchGasEstimates(); // swapHandler function

      // console.log("wish gasFees", gasFees);

      // console.log(
      //   "wish chainContractConfig",
      //   chainContractConfig.v3FactoryAddress
      // );

      const fee = feeTier;

      const amountIn = parseEther(tradeFromTokenInputAmount); // 1 token (18 decimals)
      // console.log(
      //   " parseFloat(toTokenInputAmount)",
      //   parseFloat(toTokenInputAmount)
      // );

      let slip = (parseFloat(tradeToTokenInputAmount) * slippage!)!;

      const amountOutMin = (
        parseFloat(tradeToTokenInputAmount) -
        slip / 100
      ).toString();

      // console.log(" amountOutMin", amountOutMin, slippage, "slip", slip);
      // console.log(" amountOutMin", amountOutMin, slippage);

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      let amount = tradeFromTokenInputAmount;
      let tokenAmountFormated =
        amount.toString().split(".")[1]?.length >
        (tradeFromToken?.decimal ?? 18)
          ? toFixedWithoutScientific(
              parseFloat(amount),
              tradeFromToken?.decimal ?? 18
            )
          : amount.toString();

      let parseValue: bigint;

      if (inputToken1 === "native") {
        parseValue = parseUnits(
          tradeFromTokenInputAmount,
          tradeFromToken?.decimal!
        );
      } else if (outputToken1 === "native") {
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
            return toFixedWithoutScientific(numValue, decimals);
          }
          return num;
        }

        // Handle very small numbers that become scientific notation
        if (Math.abs(num) < Math.pow(10, -decimals)) {
          return "0"; // Treat as zero if smaller than token precision
        }

        // Always use toFixedWithoutScientific to avoid scientific notation entirely
        return toFixedWithoutScientific(num, decimals);
      }

      // Usage
      const amountInput = parseUnits(
        safeToString(tradeFromTokenInputAmount, tradeFromToken?.decimal!),
        tradeFromToken?.decimal!
      );

      const amountOutMinimum = parseUnits(
        safeToString(amountOutMin, tradeToToken?.decimal!),
        tradeToToken?.decimal!
      );

      const swapParams = {
        tokenIn: inputToken! as Address,
        tokenOut: outputToken! as Address,
        fee: poolFeeTier!,
        recipient: address as Address,
        deadline,
        amountIn: amountInput, //parseUnits(fromTokenInputAmount, fromToken?.decimals!),
        amountOutMinimum: BigInt("0"), //amountOutMinimum, //parseUnits(amountOutMin, toToken?.decimals!),
        sqrtPriceLimitX96: BigInt("0"),
      };

      console.log("swap params", swapParams);

      const hash = await writeContract(config, {
        address: chainContractConfig.v3RouterAddress as Address,
        abi: chainContractConfig.v3RouterABI,
        functionName: "exactInputSingle",
        args: [swapParams],
        chainId,
        value: parseValue,
      });

      const transactionReceipt = await waitForTransaction(config, {
        hash: hash!,
      });
      if (transactionReceipt.status === "success") {
        // Show success notification
        toast.success(
          <div>
            <p>
              Successfully swapped {getTrimmedResult(tradeFromTokenInputAmount)}{" "}
              {tradeFromToken.symbol} to{" "}
              {getTrimmedResult(tradeToTokenInputAmount)}{" "}
              {tradeToToken?.symbol!}.
            </p>
            <Link
              href={`${chainContractConfig.explorerURL}/tx/${hash}`}
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

  const handleApprove = async (token: TradeTokenType, amount: string) => {
    setIsLoadingApprove(true);
    try {
      let tokenAmountFormated =
        amount.toString().split(".")[1]?.length > (token?.decimal ?? 18)
          ? toFixedWithoutScientific(
              parseFloat(amount),
              token?.decimal ?? 18
            )
          : amount.toString();
      // Get base configuration and merge with hardcoded Base chain config if needed
      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId || "default"];

      const hash = await writeContract(config, {
        address: token.address as Address,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          chainContractConfig?.v3RouterAddress as Address,
          parseUnits(tokenAmountFormated, token?.decimal),
        ],
        chainId: chainId,
      });

      const data = await waitForTransaction(config, {
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
    if (tradeFromToken) {
      const fromTokenAllowance = await checkApproveAllowance(
        address,
        tradeFromToken?.address as Address,
        tradeChainId,
        setIsLoadingFetchApprovedAmount,
        config
      );
      console.log("wish fromTokenAllowance", fromTokenAllowance);

      setFromTokenApprovedAmount(
        formatUnits(
          BigInt(fromTokenAllowance ?? "0"),
          tradeFromToken?.decimal ?? 18
        )
      );
    }
  };

  const fetchToTokenApprovedAmount = async () => {
    if (tradeToToken && tradeToToken.address !== "native") {
      const toTokenAllowance = await checkApproveAllowance(
        address,
        tradeToToken?.address as Address,
        tradeChainId,
        setIsLoadingFetchApprovedAmount,
        config
      );

      setToTokenApprovedAmount(
        formatUnits(
          BigInt(toTokenAllowance ?? "0"),
          tradeToToken?.decimal ?? 18
        )
      );
    }
  };

  useEffect(() => {
    if (tradeFromToken && tradeFromToken.address !== "native") {
      fetchFromTokenApprovedAmount();
    }
    console.log("wish fromTokenApprovedAmount", fromTokenApprovedAmount);
  }, [tradeFromToken, address, isLoadingApprove]);

  useEffect(() => {
    if (tradeToToken) {
      fetchToTokenApprovedAmount();
    }
    // console.log("wish toTokenApprovedAmount", toTokenApprovedAmount);
  }, [tradeToToken, address, isLoadingApprove]);

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
      ) : tradeFromToken &&
        tradeToToken &&
        ![100, 500, 2500, 3000, 10000, 25000].includes(poolFeeTier!) ? (
        <Button
          // className="w-full bg-transparent border-2 border-[#ffffff14] !font-semibold h-10 !text-lg"
          className="w-full button-primary uppercase h-10 font-lato text-sm"
          disabled={true}
        >
          Swap
        </Button>
      ) : parseFloat(tradeFromTokenInputAmount) >
          parseFloat(fromTokenApprovedAmount) &&
        tradeFromToken &&
        inputToken1 != "native" ? (
        // &&
        // !isApprovedSuccess
        <Button
          className="w-full button-primary uppercase h-10 font-lato"
          onClick={() =>
            handleApprove(tradeFromToken, tradeFromTokenInputAmount.toString())
          }
          disabled={
            isLoadingApprove ||
            tradeFromToken?.address == tradeToToken?.address ||
            parseFloat(fromTokenBalance) < parseFloat(tradeFromTokenInputAmount)
          }
        >
          {isLoadingApprove && <Loader2 size={20} className="animate-spin" />}{" "}
          {parseFloat(fromTokenBalance) < parseFloat(tradeFromTokenInputAmount)
            ? "Insufficient funds"
            : `Approve`}{" "}
          ({tradeFromToken?.symbol})
        </Button>
      ) : tradeFromToken &&
        inputToken1 === "native" &&
        parseFloat(tradeFromTokenInputAmount) > 0 &&
        parseFloat(fromTokenBalance) < parseFloat(tradeFromTokenInputAmount) ? (
        // &&
        // !isApprovedSuccess
        <Button
          className="w-full button-primary uppercase h-10 font-lato"
          onClick={() =>
            handleApprove(tradeFromToken, tradeFromTokenInputAmount.toString())
          }
          disabled={
            isLoadingApprove ||
            tradeFromToken?.address == tradeToToken?.address ||
            parseFloat(fromTokenBalance) < parseFloat(tradeFromTokenInputAmount)
          }
        >
          Insufficient funds ({tradeFromToken?.symbol})
        </Button>
      ) : (
        <Button
          onClick={swapHandler}
          className="w-full flex button-primary uppercase h-10 font-lato text-sm"
          disabled={
            tradeFromToken?.address === tradeToToken?.address ||
            parseFloat(fromTokenBalance) <= parseFloat("0") ||
            parseFloat(tradeFromTokenInputAmount) <= parseFloat("0") ||
            parseFloat(tradeFromTokenInputAmount) <= parseFloat("0.0") ||
            parseFloat(tradeToTokenInputAmount) <= parseFloat("0") ||
            parseFloat(tradeToTokenInputAmount) <= parseFloat("0.0") ||
            tradeToTokenInputAmount === "0.0" ||
            tradeFromTokenInputAmount === "0.0" ||
            tradeFromTokenInputAmount === "" ||
            tradeToTokenInputAmount === "" ||
            parseFloat(fromTokenBalance) <
              parseFloat(tradeFromTokenInputAmount) ||
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

export default TradeSwapButton;
