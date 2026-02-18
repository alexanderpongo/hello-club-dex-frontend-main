
import { useState, useEffect } from 'react';
import { useConfig, useAccount } from 'wagmi';
import { getPredictionVoteStats, PredictionVoteStats, DEFAULT_CHAIN_ID } from '@/service/prediction.service';


interface UsePredictionVoteStatsParams {
  predictionId: string | number | null | undefined;
  enabled?: boolean; 
  tokenDecimals?: number;
  refetchInterval?: number; 
}


interface UsePredictionVoteStatsReturn {
  voteStats: PredictionVoteStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}


export function usePredictionVoteStats({
  predictionId,
  enabled = true,
  tokenDecimals = 18,
  refetchInterval,
}: UsePredictionVoteStatsParams): UsePredictionVoteStatsReturn {
  const config = useConfig();
  const { chainId } = useAccount();
  
  const [voteStats, setVoteStats] = useState<PredictionVoteStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const fetchVoteStats = async () => {
    if (!enabled || !predictionId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const effectiveChainId = DEFAULT_CHAIN_ID;

      console.log('prediction id:', predictionId);

      const stats = await getPredictionVoteStats(
        config,
        predictionId,
        effectiveChainId,
        tokenDecimals
      );

      if (stats) {
        console.log('Vote stats fetched successfully:', {
          predictionId,
          stats: {
            isResolved: stats.isResolved,
            outcome: stats.outcome,
            totalYesVotes: stats.totalYesVotes,
            totalNoVotes: stats.totalNoVotes,
            yesPercentage: stats.yesPercentage,
            noPercentage: stats.noPercentage,
            feesCollected: stats.feesCollected,
          }
        });
        setVoteStats(stats);
      } else {
        const errorMsg = 'Failed to fetch vote statistics';
        console.error( errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'An error occurred while fetching vote statistics';
      console.error(' Error fetching vote stats:', {
        predictionId,
        error: err,
        message: errorMsg,
      });
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch when dependencies change
  useEffect(() => {
    fetchVoteStats();
  }, [predictionId, chainId, enabled, tokenDecimals]);
  return {
    voteStats,
    isLoading,
    error,
    refetch: fetchVoteStats,
  };
}

/**
 * Helper function to format vote stats for display
 */
export function formatVoteStats(stats: PredictionVoteStats | null): string {
  if (!stats) return 'No data available';

  return `
Prediction Vote Statistics:
---------------------------
Status: ${stats.isResolved ? 'Resolved' : 'Active'}
${stats.isResolved ? `Outcome: ${stats.outcome ? 'YES Won' : 'NO Won'}` : ''}
Total YES Votes: ${parseFloat(stats.totalYesVotes).toLocaleString()} tokens
Total NO Votes: ${parseFloat(stats.totalNoVotes).toLocaleString()} tokens
YES Percentage: ${stats.yesPercentage}%
NO Percentage: ${stats.noPercentage}%
Fees Collected: ${parseFloat(stats.feesCollected).toLocaleString()} tokens
  `.trim();
}
