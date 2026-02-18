import { TokenType } from "@/interfaces/index.i";
import { suggestedToken } from "@/config/suggest-tokens";

// Cache for token lookup maps to avoid recreating them
const tokenLookupCache = new Map<
  string,
  {
    byAddress: Map<string, TokenType>;
    bySymbolAndChain: Map<string, TokenType>;
    byNativeSymbol: Map<string, TokenType>;
  }
>();

/**
 * Creates optimized lookup maps for token data
 * This function creates O(1) lookup maps instead of using O(n) array searches
 */
const createTokenLookupMaps = (
  chainId: number,
  testTokens: TokenType[] = []
) => {
  const cacheKey = `${chainId}-${testTokens.length}`;

  // Return cached maps if available
  if (tokenLookupCache.has(cacheKey)) {
    return tokenLookupCache.get(cacheKey)!;
  }

  const suggestedTokens = suggestedToken[chainId] || [];
  const allTokens = [...suggestedTokens, ...testTokens];

  // Create lookup maps for O(1) access
  const byAddress = new Map<string, TokenType>();
  const bySymbolAndChain = new Map<string, TokenType>();
  const byNativeSymbol = new Map<string, TokenType>();

  // Process tokens in batches to avoid blocking the main thread
  const processTokens = (tokens: TokenType[]) => {
    tokens.forEach((token) => {
      // Map by address (case insensitive)
      byAddress.set(token.address.toLowerCase(), token);

      // Map by symbol and chain combination
      const symbolChainKey = `${token.symbol}-${token.chainId}`;
      bySymbolAndChain.set(symbolChainKey, token);

      // Map native tokens by symbol for quick lookup
      if (
        token.address === "native" ||
        token.address.toLowerCase() === "native"
      ) {
        byNativeSymbol.set(token.symbol, token);
      }
    });
  };

  // Process tokens in smaller batches for large datasets
  if (allTokens.length > 10000) {
    const batchSize = 1000;
    for (let i = 0; i < allTokens.length; i += batchSize) {
      const batch = allTokens.slice(i, i + batchSize);
      processTokens(batch);
    }
  } else {
    processTokens(allTokens);
  }

  const lookupMaps = {
    byAddress,
    bySymbolAndChain,
    byNativeSymbol,
  };

  // Cache the maps
  tokenLookupCache.set(cacheKey, lookupMaps);

  return lookupMaps;
};

/**
 * Optimized function to get correct logo URI based on adjusted symbol
 * Uses O(1) lookups instead of O(n) array searches for better performance
 *
 * @param originalAddress - The original token address
 * @param originalSymbol - The original token symbol (e.g., "WETH")
 * @param adjustedSymbol - The adjusted symbol (e.g., "ETH")
 * @param chainId - The chain ID
 * @param testTokens - Array of tokens to search through
 * @returns The correct logo URI for the token
 */
export const getCorrectLogoURI = (
  originalAddress: string,
  originalSymbol: string,
  adjustedSymbol: string,
  chainId: number,
  testTokens: TokenType[] = []
): string => {
  // Create optimized lookup maps
  const { byAddress, byNativeSymbol } = createTokenLookupMaps(
    chainId,
    testTokens
  );

  // If symbol was adjusted, look for the native token instead of wrapped
  if (originalSymbol !== adjustedSymbol) {
    // O(1) lookup for native token by symbol
    const nativeToken = byNativeSymbol.get(adjustedSymbol);
    if (nativeToken) {
      return nativeToken.logoURI;
    }
  }

  // O(1) lookup for token by address
  const fallbackToken = byAddress.get(originalAddress.toLowerCase());
  if (fallbackToken) {
    return fallbackToken.logoURI;
  }

  // Final fallback - return empty string if no token found
  return "";
};

/**
 * Helper function to adjust token symbols based on chain ID
 * Converts wrapped tokens to their native equivalents for display
 *
 * @param symbol - The original token symbol
 * @param chainId - The chain ID
 * @returns The adjusted symbol
 */
export const adjustTokenSymbol = (symbol: string, chainId: number): string => {
  if (chainId === 56) {
    // BSC
    if (symbol === "WBNB") return "BNB";
  } else if (chainId === 1) {
    // Ethereum
    if (symbol === "WETH") return "ETH";
  } else if (chainId === 97) {
    // BSC Testnet
    if (symbol === "WBNB") return "TBNB";
  } else if (chainId === 8453) {
    // Base
    if (symbol === "WETH") return "ETH";
  } else {
    // Other chains
    if (symbol === "WETH") return "ETH";
  }

  return symbol;
};

/**
 * Helper function to get the correct logo URI for a token with symbol adjustment
 * This is a convenience function that combines symbol adjustment and logo URI lookup
 *
 * @param token - The token object
 * @param chainId - The chain ID
 * @param testTokens - Array of tokens to search through
 * @returns Object with adjusted symbol and correct logo URI
 */
export const getTokenDisplayInfo = (
  token: TokenType,
  chainId: number,
  testTokens: TokenType[] = []
): { symbol: string; logoURI: string } => {
  const adjustedSymbol = adjustTokenSymbol(token.symbol, chainId);
  const logoURI = getCorrectLogoURI(
    token.address,
    token.symbol,
    adjustedSymbol,
    chainId,
    testTokens
  );

  return {
    symbol: adjustedSymbol,
    logoURI,
  };
};

/**
 * Helper function to get all available tokens for a chain
 * Combines API tokens with suggested tokens configuration
 * Uses caching for better performance
 *
 * @param chainId - The chain ID
 * @param testTokens - Array of tokens from API (optional)
 * @returns Combined array of tokens
 */
export const getAllTokensForChain = (
  chainId: number,
  testTokens: TokenType[] = []
): TokenType[] => {
  const suggestedTokens = suggestedToken[chainId] || [];

  // Use Set for O(1) duplicate checking instead of O(n) array.some()
  const seenAddresses = new Set<string>();
  const combinedTokens: TokenType[] = [];

  // Add suggested tokens first
  suggestedTokens.forEach((token) => {
    const addressKey = `${token.address.toLowerCase()}-${token.chainId}`;
    if (!seenAddresses.has(addressKey)) {
      seenAddresses.add(addressKey);
      combinedTokens.push(token);
    }
  });

  // Add API tokens, avoiding duplicates
  testTokens.forEach((apiToken) => {
    const addressKey = `${apiToken.address.toLowerCase()}-${apiToken.chainId}`;
    if (!seenAddresses.has(addressKey)) {
      seenAddresses.add(addressKey);
      combinedTokens.push(apiToken);
    }
  });

  return combinedTokens;
};

/**
 * Clears the token lookup cache
 * Call this when token data changes to ensure fresh lookups
 */
export const clearTokenLookupCache = (): void => {
  tokenLookupCache.clear();
};

/**
 * Gets cache statistics for debugging
 * @returns Object with cache statistics
 */
export const getTokenLookupCacheStats = () => {
  return {
    cacheSize: tokenLookupCache.size,
    cacheKeys: Array.from(tokenLookupCache.keys()),
  };
};

/**
 * Performance monitoring utility for token lookups
 * Use this to measure the performance improvement
 */
export const measureTokenLookupPerformance = (
  originalAddress: string,
  originalSymbol: string,
  adjustedSymbol: string,
  chainId: number,
  testTokens: TokenType[] = []
) => {
  const startTime = performance.now();
  const result = getCorrectLogoURI(
    originalAddress,
    originalSymbol,
    adjustedSymbol,
    chainId,
    testTokens
  );
  const endTime = performance.now();

  return {
    result,
    executionTime: endTime - startTime,
    tokenCount: testTokens.length,
  };
};

/**
 * Token classification and display-order utilities
 */

// Known wrapped native addresses per supported chains (fallbacks if not found in suggestedToken)
// Note: all addresses stored in lowercase for comparisons
const WRAPPED_NATIVE_FALLBACK: Record<number, string> = {
  1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
  56: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", // WBNB
  97: "0xae13d989dac2f0debff460ac112a837c89baa7cd", // WBNB testnet
  8453: "0x4200000000000000000000000000000000000006", // WETH (Base)
};

// Symbols that represent wrapped natives per chain
const WRAPPED_NATIVE_SYMBOLS: Record<number, string[]> = {
  1: ["WETH"],
  56: ["WBNB"],
  97: ["WBNB"],
  8453: ["WETH"],
};

// Common stablecoin symbols
const COMMON_STABLE_SYMBOLS = new Set([
  "USDT",
  "USDC",
  "DAI",
  "BUSD",
  "USDS",
  "USDb",
  "USDe",
  "sUSDb",
]);

/**
 * Attempts to resolve the wrapped native token address from suggested tokens, otherwise uses known fallbacks.
 */
export const getWrappedNativeAddress = (chainId: number): string | null => {
  const tokens = suggestedToken[chainId] || [];
  const symCandidates = WRAPPED_NATIVE_SYMBOLS[chainId] || ["WETH", "WBNB"];

  for (const sym of symCandidates) {
    const t = tokens.find((tk) => tk.symbol === sym);
    if (t?.address && t.address !== "native") return t.address.toLowerCase();
  }

  const fb = WRAPPED_NATIVE_FALLBACK[chainId];
  return fb ? fb.toLowerCase() : null;
};

/**
 * Builds a Set of stable token addresses for the given chain using suggested tokens.
 */
export const getStableTokenAddresses = (chainId: number): Set<string> => {
  const tokens = suggestedToken[chainId] || [];
  const out = new Set<string>();
  for (const t of tokens) {
    if (
      t.address &&
      t.address !== "native" &&
      COMMON_STABLE_SYMBOLS.has(t.symbol)
    ) {
      out.add(t.address.toLowerCase());
    }
  }
  return out;
};

export const isNativeWrappedToken = (
  address: string,
  chainId: number
): boolean => {
  if (!address) return false;
  const wrapped = getWrappedNativeAddress(chainId);
  return !!wrapped && wrapped === address.toLowerCase();
};

export const isStableToken = (address: string, chainId: number): boolean => {
  if (!address) return false;
  const stables = getStableTokenAddresses(chainId);
  return stables.has(address.toLowerCase());
};

/**
 * Resolve display order for two token addresses according to the rule:
 * - If one is wrapped native, it becomes display token1
 * - Else if one is stable, it becomes display token1
 * - Else keep token1 as original second address
 * Tie-breakers:
 * - If both are wrapped native/stable: prefer wrapped native as token1; if still ambiguous, keep original
 */
export const resolveDisplayTokenOrder = (
  tokenA: string,
  tokenB: string,
  chainId: number
): [string, string] => {
  const a = tokenA?.toLowerCase?.() ?? "";
  const b = tokenB?.toLowerCase?.() ?? "";

  const aIsWrapped = isNativeWrappedToken(a, chainId);
  const bIsWrapped = isNativeWrappedToken(b, chainId);
  if (aIsWrapped && !bIsWrapped) return [b, a];
  if (bIsWrapped && !aIsWrapped) return [a, b];
  if (aIsWrapped && bIsWrapped) {
    // ambiguous, keep original order
    return [a, b];
  }

  const aIsStable = isStableToken(a, chainId);
  const bIsStable = isStableToken(b, chainId);
  if (aIsStable && !bIsStable) return [b, a];
  if (bIsStable && !aIsStable) return [a, b];

  // If both stable, keep original; if neither, keep original with token1 as original B
  return [a, b];
};
