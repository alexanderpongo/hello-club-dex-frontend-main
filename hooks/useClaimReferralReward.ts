import { useState } from "react";
import { useConfig, useAccount } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { Hex, parseUnits } from "viem";
import { toast } from "react-toastify";
import { generateClaimSignature } from "@/lib/actions/referrals.actions";
import { contractAddresses, referralSystemAbi } from "@/blockchain/web3.config";

interface UseClaimReferralRewardParams {
  onSuccess?: (transactionHash: string) => void;
  onError?: (error: string) => void;
}

type ClaimStep = "idle" | "generating-signature" | "claiming" | "success" | "error";

interface UseClaimReferralRewardReturn {
  claimReward: (tokenAddress: Hex, amount: string, decimals: number) => Promise<void>;
  isClaiming: boolean;
  claimStep: ClaimStep;
  statusMessage: string;
  error: string | null;
  transactionHash: string | null;
  resetState: () => void;
}

export function useClaimReferralReward({
  onSuccess,
  onError,
}: UseClaimReferralRewardParams = {}): UseClaimReferralRewardReturn {
  const config = useConfig();
  const { address, chainId, isConnected } = useAccount();

  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [claimStep, setClaimStep] = useState<ClaimStep>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const resetState = () => {
    setError(null);
    setTransactionHash(null);
    setIsClaiming(false);
    setClaimStep("idle");
    setStatusMessage("");
  };

  const claimReward = async (tokenAddress: Hex, amount: string, decimals: number) => {
    // Reset previous state
    resetState();

    // Validate wallet connection
    if (!isConnected || !address) {
      const errorMsg = "Please connect your wallet to claim rewards";
      setError(errorMsg);
      setClaimStep("error");
      toast.error(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Validate contract address
    if (!contractAddresses.referralSystemContractAddress) {
      const errorMsg = "Referral system contract address not configured";
      setError(errorMsg);
      setClaimStep("error");
      toast.error(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsClaiming(true);

    try {
      // Convert amount to wei using token decimals
      const amountWei = parseUnits(amount, decimals).toString();
      
      // Step 1: Generate claim signature from backend
      setClaimStep("generating-signature");
      setStatusMessage("Generating claim signature...");

      const signatureResponse = await generateClaimSignature({
        walletAddress: address,
        tokenAddress,
        amount: amountWei, 
      });

      if (!signatureResponse.success) {
        const errorMsg = signatureResponse.message || "Failed to generate claim signature";
        console.error("Backend signature generation failed:", errorMsg);
        throw new Error(
          `Backend Error: ${errorMsg}. Please contact support if this issue persists.`
        );
      }

      
      const responseData = signatureResponse.data.data;
      const { amount: backendAmount, nonce, deadline, signature } = responseData;

      // Validate that all required parameters are present
      if (!backendAmount || nonce === undefined || nonce === null || !deadline || !signature) {
        console.error("Validation failed! Missing parameters:", { 
          backendAmount, 
          nonce,
          deadline,
          signature,
          fullResponse: signatureResponse
        });
        throw new Error("Invalid response from backend: missing required parameters");
      }

      console.log("Claim signature generated:", {
        user: address,
        token: tokenAddress,
        amountDecimal: amount,
        amountWeiSent: amountWei,
        amountWeiFromBackend: backendAmount,
        decimals,
        nonce,
        deadline,
        signature,
      });

      // Step 2: Call claimReferralReward on contract
      setClaimStep("claiming");
      setStatusMessage("Claiming rewards...");

      toast.info("Please confirm the transaction in your wallet");

      const claimHash = await writeContract(config, {
        address: contractAddresses.referralSystemContractAddress,
        abi: referralSystemAbi,
        functionName: "claimReferralReward",
        args: [
          tokenAddress, 
          BigInt(backendAmount), 
          BigInt(nonce), 
          BigInt(deadline), 
          signature as Hex
        ],
        chainId,
      });

      console.log("Claim transaction submitted:", claimHash);
      setStatusMessage("Waiting for transaction confirmation...");

      // Wait for transaction confirmation
      const receipt = await waitForTransactionReceipt(config, {
        hash: claimHash,
        confirmations: 1,
      });

      console.log("Claim transaction confirmed:", receipt);

      if (receipt.status === "success") {
        setClaimStep("success");
        setTransactionHash(claimHash);
        setStatusMessage("Rewards claimed successfully!");

        toast.success("Your referral rewards have been claimed successfully!");

        onSuccess?.(claimHash);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (err: any) {
      console.error("Error claiming referral reward:", err);

      let errorMessage = "Failed to claim rewards";

      if (err.message) {
        if (err.message.includes("User rejected") || err.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user";
        } else if (err.message.includes("Insufficient reserved funds")) {
          errorMessage = "Insufficient reserved funds in the contract. Please contact support.";
        } else if (err.message.includes("insufficient funds") && !err.message.includes("reserved")) {
          errorMessage = "Insufficient funds for gas fees";
        } else if (err.message.includes("nonce") && err.message.includes("already")) {
          errorMessage = "This reward has already been claimed";
        } else if (err.message.includes("deadline") || err.message.includes("expired")) {
          errorMessage = "Claim signature has expired. Please try again";
        } else if (err.message.includes("Invalid signature")) {
          errorMessage = "Invalid signature. Please try again";
        } else {
          // Extract the actual error message from contract revert if available
          const match = err.message.match(/execution reverted: ([^:]+)/i);
          if (match && match[1]) {
            errorMessage = match[1].trim();
          } else {
            errorMessage = err.message;
          }
        }
      }

      setError(errorMessage);
      setClaimStep("error");
      setStatusMessage(errorMessage);

      toast.error(errorMessage);

      onError?.(errorMessage);
    } finally {
      setIsClaiming(false);
    }
  };

  return {
    claimReward,
    isClaiming,
    claimStep,
    statusMessage,
    error,
    transactionHash,
    resetState,
  };
}
