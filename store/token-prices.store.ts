import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TokenPrice {
  price: number;
  timestamp: number;
}

interface TokenPricesState {
  prices: Record<string, TokenPrice>;
  setPrice: (symbol: string, price: number) => void;
  getPrice: (symbol: string) => number | null;
  fetchPrice: (symbol: string) => Promise<number | null>;
  isStale: (symbol: string, maxAgeMs?: number) => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes 

export const useTokenPricesStore = create<TokenPricesState>()(
  persist(
    (set, get) => ({
      prices: {},

      setPrice: (symbol: string, price: number) => {
        set((state) => ({
          prices: {
            ...state.prices,
            [symbol.toUpperCase()]: {
              price,
              timestamp: Date.now(),
            },
          },
        }));
      },

      getPrice: (symbol: string) => {
        const tokenPrice = get().prices[symbol.toUpperCase()];
        if (!tokenPrice) return null;
        
        // Check if price is stale (older than cache duration)
        if (Date.now() - tokenPrice.timestamp > CACHE_DURATION) {
          return null;
        }
        
        return tokenPrice.price;
      },

      isStale: (symbol: string, maxAgeMs: number = CACHE_DURATION) => {
        const tokenPrice = get().prices[symbol.toUpperCase()];
        if (!tokenPrice) return true;
        return Date.now() - tokenPrice.timestamp > maxAgeMs;
      },

      fetchPrice: async (symbol: string) => {
        const upperSymbol = symbol.toUpperCase();
        
        // Check if we have a fresh price
        const cachedPrice = get().getPrice(upperSymbol);
        if (cachedPrice !== null) {
          console.log(`✅ Using cached price for ${upperSymbol}: $${cachedPrice}`);
          return cachedPrice;
        }

        // Fetch new price from API
        try {
          console.log(`🔄 Fetching fresh price for ${upperSymbol}`);
          const response = await fetch(
            `/api/get-token-price?symbol=${encodeURIComponent(upperSymbol)}`
          );

          if (response.ok) {
            const data = await response.json();

            if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
              const tokenData = data.data[0];

              if (
                tokenData?.quote &&
                Array.isArray(tokenData.quote) &&
                tokenData.quote.length > 0
              ) {
                const quoteData = tokenData.quote[0];
                if (quoteData?.price) {
                  get().setPrice(upperSymbol, quoteData.price);
                  console.log(`✅ ${upperSymbol} price fetched: $${quoteData.price}`);
                  return quoteData.price;
                }
              }
            }
          } else {
            console.warn(`⚠ Could not fetch price for ${upperSymbol}`);
          }
        } catch (error) {
          console.error(`Error fetching price for ${upperSymbol}:`, error);
        }

        return null;
      },
    }),
    {
      name: "token-prices-storage",
      partialize: (state) => ({ prices: state.prices }),
    }
  )
);
