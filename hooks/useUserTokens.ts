import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { TokenType } from "@/interfaces/index.i";

const fetchUserTokens = async (
  address: string | undefined,
  chainId: number | undefined
): Promise<TokenType[]> => {
  if (!address || !chainId) {
    return [];
  }

  const response = await fetch("/api/get-user-tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, chainId }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user tokens");
  }

  return response.json();
};

export function useUserTokens() {
  const { address, chainId } = useAccount();

  return useQuery<TokenType[], Error>({
    queryKey: ["userTokens", address, chainId],
    queryFn: () => fetchUserTokens(address, chainId),
    enabled: !!address && !!chainId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1, // Retry only once on failure
  });
}
