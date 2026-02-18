
import { Address, parseUnits } from "viem";
import { writeContract, waitForTransactionReceipt, readContract } from "@wagmi/core";
import type { Config } from "wagmi";
import { contractAddresses, contractAbis } from "@/blockchain/web3.config";


export const PREDICTION_CONTRACT_ADDRESS = contractAddresses.predictionMarketContractAddress as Address;

export const PREDICTION_MARKET_ABI = JSON.parse(contractAbis.predictionMarketAbi);


export const DEFAULT_CHAIN_ID = 56; 



export interface PredictionVoteStats {
  isResolved: boolean;
  outcome: boolean;
  totalYesVotes: string;
  totalNoVotes: string;
  yesPercentage: number;
  noPercentage: number;
  feesCollected: string;
}
export const VoteOption = {
  YES: true,  
  NO: false,  
} as const;

export type VoteOptionType = typeof VoteOption[keyof typeof VoteOption];

export interface VoteParams {
  predictionId: string | number;
  amount: string; 
  voteOption: boolean; 
  tokenDecimals?: number;
}

export interface VoteResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}



export async function getPredictionVoteStats(
  config: Config,
  predictionId: string | number,
  chainId?: number,
  tokenDecimals: number = 18
): Promise<PredictionVoteStats | null> {
  try {
 
    const effectiveChainId = DEFAULT_CHAIN_ID;
    const predictionIdBigInt = BigInt(predictionId);

    const result = await readContract(config, {
      address: PREDICTION_CONTRACT_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "getPredictionVoteStats",
      args: [predictionIdBigInt],
      chainId: effectiveChainId,
    });
    const [isResolved, outcome, totalYesVotes, totalNoVotes, yesPercentage, noPercentage, feesCollected] = result as [
      boolean,
      boolean,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint
    ];

    const formattedStats = {
      isResolved,
      outcome,
      totalYesVotes: (Number(totalYesVotes) / Math.pow(10, tokenDecimals)).toString(),
      totalNoVotes: (Number(totalNoVotes) / Math.pow(10, tokenDecimals)).toString(),
      yesPercentage: Number(yesPercentage),
      noPercentage: Number(noPercentage),
      feesCollected: (Number(feesCollected) / Math.pow(10, tokenDecimals)).toString(),
    };
    return formattedStats;
  } catch (error: any) {
    return null;
  }
}
