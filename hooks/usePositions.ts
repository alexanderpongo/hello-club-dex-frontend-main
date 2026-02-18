"use client";

import { useQuery } from "@tanstack/react-query";
import { Position } from "@/types/lp-page.types";
import axios from "axios";

// Map chain IDs to API chain names
const getChainName = (chainId: number): string => {
  const chainMap: Record<number, string> = {
    1: "ethereum",
    56: "bsc",
    8453: "base",
    97: "bsc-testnet",
  };
  return chainMap[chainId] || "bsc"; // default to bsc
};

// API base URL - using the provided URL or environment variable
const getApiBaseUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_TRADING_LIVE_BASE_API ||
    "https://uzqupkdi7w.us-east-1.awsapprunner.com"
  );
};

interface PositionResponse {
  success: boolean;
  data: Position;
}

export function usePosition(
  chainId: number | undefined,
  positionId: string | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number | false;
  }
) {
  const enabled =
    (options?.enabled ?? true) && !!chainId && !!positionId;

  const query = useQuery<Position, Error>({
    queryKey: ["position", chainId, positionId],
    queryFn: async () => {
      if (!chainId || !positionId) {
        throw new Error("Chain ID and Position ID are required");
      }

      const chainName = getChainName(chainId);
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/positions/${chainName}/${positionId}`;

      const response = await axios.get<PositionResponse>(url);

      if (!response.data.success) {
        throw new Error("Failed to fetch position data");
      }

      return response.data.data;
    },
    enabled,
    staleTime: options?.staleTime ?? 60_000, // 1 minute
    refetchInterval: options?.refetchInterval ?? false,
    refetchOnWindowFocus: false,
  });

  return query;
}

