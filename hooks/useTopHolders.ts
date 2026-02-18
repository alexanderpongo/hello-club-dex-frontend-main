import { useState, useEffect } from 'react';
import axios from 'axios';

interface TokenHolder {
  owner_address: string;
  balance: string;
  balance_formatted: string;
  percentage_relative_to_total_supply: number;
}

interface TopHoldersResponse {
  cursor: string | null;
  page: number;
  page_size: number;
  result: TokenHolder[];
}

interface UseTopHoldersParams {
  tokenAddress: string;
  chainId: number;
  limit?: number;
  enabled?: boolean;
}

const CHAIN_MAP: Record<number, string> = {
  1: 'eth',
  56: 'bsc',
  8453: 'base',
  97: 'bsc testnet',
};

export function useTopHolders({
  tokenAddress,
  chainId,
  limit = 10,
  enabled = true,
}: UseTopHoldersParams) {
  const [holders, setHolders] = useState<TokenHolder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalHolders, setTotalHolders] = useState<number | null>(null);

  const fetchTotalHolders = async (apiKey: string, chain: string) => {
    try {
      const holdersUrl = `https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/holders`;
     
      
      const holdersResponse = await axios.get(holdersUrl, {
        params: { chain },
        headers: {
          'Accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });
    
      
      if (holdersResponse.data?.totalHolders) {
       
        setTotalHolders(holdersResponse.data.totalHolders);
      }
    } catch (err) {
      console.error('Error fetching total holders:', err);
    }
  };

  const fetchHolders = async (appendResults = false) => {
    if (!enabled || !tokenAddress || !chainId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get Moralis API key from our API route
      const apiKeyResponse = await axios.get('/api/moralis-key');
      const { apiKey } = apiKeyResponse.data;

      if (!apiKey) {
        throw new Error('Moralis API key not configured');
      }

      const chain = CHAIN_MAP[chainId] || 'bsc';
      
      
      if (!appendResults) {
        await fetchTotalHolders(apiKey, chain);
      }
      
      
      const params: Record<string, string> = {
        chain,
        limit: limit.toString(),
        order: 'DESC',
      };

      if (cursor && appendResults) {
        params.cursor = cursor;
      }

      const url = `https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/owners`;

      const response = await axios.get<TopHoldersResponse>(url, {
        params,
        headers: {
          'Accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });

      const data = response.data;

      if (appendResults) {
        setHolders((prev) => [...prev, ...data.result]);
      } else {
        setHolders(data.result);
      }

      setCursor(data.cursor);
      setHasMore(!!data.cursor);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch token holders';
      setError(errorMessage);
      console.error('Error fetching top holders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchHolders(true);
    }
  };

  useEffect(() => {
    setHolders([]);
    setCursor(null);
    setHasMore(true);
    fetchHolders(false);
  }, [tokenAddress, chainId, limit, enabled]);

  return {
    holders,
    isLoading,
    error,
    hasMore,
    loadMore,
    totalHolders,
    refetch: () => fetchHolders(false),
  };
}
