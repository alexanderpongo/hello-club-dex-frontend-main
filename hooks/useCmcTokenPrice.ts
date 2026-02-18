"use client";

import { useQuery } from "@tanstack/react-query";

// Typed structures based on the provided API sample
export type CmcTag = {
  slug: string;
  name: string;
  category: string;
};

export type CmcPlatform = {
  id: number;
  slug: string;
  name: string;
  symbol: string;
  token_address?: string | null;
} | null;

export type CmcQuote = {
  id: number;
  symbol: string;
  price: number;
  volume_24h: number;
  volume_change_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
  percent_change_60d: number;
  percent_change_90d: number;
  market_cap: number;
  market_cap_dominance: number;
  fully_diluted_market_cap: number;
  tvl: number | null;
  last_updated: string;
};

export type CmcTokenData = {
  tags: CmcTag[];
  id: number;
  name: string;
  symbol: string;
  slug: string;
  is_active: number;
  infinite_supply: boolean;
  is_fiat: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  date_added: string;
  num_market_pairs: number;
  cmc_rank: number;
  last_updated: string;
  tvl_ratio: number | null;
  platform: CmcPlatform;
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  quote: CmcQuote[];
};

export type CmcStatus = {
  timestamp: string;
  error_code: string | number;
  error_message: string;
  elapsed: number;
  credit_count: number;
};

export type CmcQuotesResponse = {
  data: CmcTokenData[];
  status: CmcStatus;
};

export function useCmcTokenPrice(
  symbol?: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number | false;
  }
) {
  const enabled = (options?.enabled ?? true) && !!symbol;

  const query = useQuery<CmcQuotesResponse, Error>({
    queryKey: ["cmc-token-price", symbol?.toUpperCase?.() ?? symbol],
    queryFn: async () => {
      const res = await fetch(
        `/api/get-token-price?symbol=${encodeURIComponent(symbol as string)}`
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to load token price");
      }
      const json = (await res.json()) as CmcQuotesResponse;
      return json;
    },
    enabled,
    staleTime: options?.staleTime ?? 60_000, // 1 minute
    refetchInterval: options?.refetchInterval ?? false,
    refetchOnWindowFocus: false,
  });

  return query;
}
