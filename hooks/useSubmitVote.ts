
import { useState } from 'react';
import { useConfig, useAccount } from 'wagmi';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { parseUnits, Hex } from 'viem';
import { erc20Abi } from 'viem';
import { VoteOption, DEFAULT_CHAIN_ID, PREDICTION_CONTRACT_ADDRESS, PREDICTION_MARKET_ABI } from '@/service/prediction.service';
import { VoteAmountSchema } from '@/lib/validation';
import { toast } from '@/hooks/use-toast';


interface UseSubmitVoteParams {
  predictionId: string | number;
  onSuccess?: (transactionHash: string) => void;
  onError?: (error: string) => void;
  tokenDecimals?: number;
  tokenAddress?: string;
  userBalance?: string; 
}


type SubmissionStep = 'idle' | 'approving' | 'voting' | 'success' | 'error';


interface UseSubmitVoteReturn {
  submitYesVote: (amount: string) => Promise<void>;
  submitNoVote: (amount: string) => Promise<void>;
  isSubmitting: boolean;
  isApproving: boolean;
  submissionStep: SubmissionStep;
  statusMessage: string;
  error: string | null;
  transactionHash: string | null;
  resetState: () => void;
}


export function useSubmitVote({
  predictionId,
  onSuccess,
  onError,
  tokenDecimals = 18,
  tokenAddress = "0x3B86588F12B3C9b7D1B62ea78480C6fb3477C63A", // HELLO token address
  userBalance,
}: UseSubmitVoteParams): UseSubmitVoteReturn {
  const config = useConfig();
  const { address, chainId, isConnected } = useAccount();
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [submissionStep, setSubmissionStep] = useState<SubmissionStep>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

 
  const resetState = () => {
    setError(null);
    setTransactionHash(null);
    setIsSubmitting(false);
    setIsApproving(false);
    setSubmissionStep('idle');
    setStatusMessage('');
  };

  const handleVoteSubmission = async (amount: string, voteOption: boolean) => {
  
    if (!isConnected || !address) {
      const errorMsg = "Please connect your wallet to vote";
      setError(errorMsg);
      toast({
        title: "Wallet Not Connected",
        description: errorMsg,
        variant: "destructive",
      });
      onError?.(errorMsg);
      return;
    }

    // Validate amount using Zod schema
    const validationResult = VoteAmountSchema.safeParse({
      amount,
      balance: userBalance,
    });

    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors[0]?.message || "Invalid amount";
      setError(errorMsg);
      toast({
        title: "Invalid Amount",
        description: errorMsg,
        variant: "destructive",
      });
      onError?.(errorMsg);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setTransactionHash(null);

      const effectiveChainId = chainId || DEFAULT_CHAIN_ID;
      const voteAmountInWei = parseUnits(amount, tokenDecimals);
      const predictionIdBigInt = BigInt(predictionId);

      console.log('📝 Preparing vote:', {
        predictionId: predictionId.toString(),
        amount,
        voteOption: voteOption ? 'YES' : 'NO',
        address,
        chainId: effectiveChainId,
      });

      // Step 1: Approve tokens
      setSubmissionStep('approving');
      setStatusMessage('Approving tokens...');
      setIsApproving(true);

      console.log('🔓 Approving tokens...');
      
      const approveHash = await writeContract(config, {
        address: tokenAddress as Hex,
        abi: erc20Abi,
        functionName: 'approve',
        args: [PREDICTION_CONTRACT_ADDRESS, voteAmountInWei],
        chainId: effectiveChainId,
      });

      console.log('⏳ Approval transaction submitted:', approveHash);

      await waitForTransactionReceipt(config, { 
        hash: approveHash,
        confirmations: 1,
      });

      console.log('Tokens approved');

      toast({
        title: "Success",
        description: "Tokens approved!",
        variant: "default",
      });

      setIsApproving(false);

      // Step 2: Submit vote
      setSubmissionStep('voting');
      setStatusMessage(`Voting ${voteOption ? 'YES' : 'NO'}...`);

      console.log('🗳️ Submitting vote...');

      const voteHash = await writeContract(config, {
        address: PREDICTION_CONTRACT_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'vote',
        args: [predictionIdBigInt, voteOption, voteAmountInWei],
        chainId: effectiveChainId,
      });

      console.log('Vote transaction submitted:', voteHash);

      const receipt = await waitForTransactionReceipt(config, {
        hash: voteHash,
        confirmations: 1,
      });

      console.log('Vote confirmed:', {
        hash: voteHash,
        status: receipt.status,
        blockNumber: receipt.blockNumber,
      });

      if (receipt.status === 'success') {
        setTransactionHash(voteHash);
        setSubmissionStep('success');
        setStatusMessage('Vote submitted successfully!');

        toast({
          title: "Vote Successful! ",
          description: `Your ${voteOption ? 'YES' : 'NO'} vote has been recorded!`,
          variant: "default",
        });

        onSuccess?.(voteHash);
      } else {
        throw new Error('Transaction failed');
      }

    } catch (err: any) {
      console.error('Vote submission failed:', err);
      
      const errorMsg = err?.shortMessage || err?.message || "An error occurred during submission.";
      setError(errorMsg);
      setSubmissionStep('error');
      setStatusMessage('Submission failed');

      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });

      onError?.(errorMsg);
    } finally {
      setIsSubmitting(false);
      setIsApproving(false);
    }
  };


  const submitYesVote = async (amount: string) => {
    await handleVoteSubmission(amount, VoteOption.YES);
  };

 
  const submitNoVote = async (amount: string) => {
    await handleVoteSubmission(amount, VoteOption.NO);
  };

  return {
    submitYesVote,
    submitNoVote,
    isSubmitting,
    isApproving,
    submissionStep,
    statusMessage,
    error,
    transactionHash,
    resetState,
  };
}
