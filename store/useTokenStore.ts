"use client";

import { create } from "zustand";
import { TokenType } from "@/interfaces/index.i";

interface TokenStore {
  suggestedTokens: TokenType[];
  testTokens: TokenType[];
  walletTokens: TokenType[];
  combinedTokens: TokenType[];
  setSuggestedTokens: (tokens: TokenType[]) => void;
  setTestTokens: (tokens: TokenType[]) => void;
  setWalletTokens: (tokens: TokenType[]) => void;
  updateCombinedTokens: () => void;
  resetTokens: () => void;
}

export const useTokenStore = create<TokenStore>((set, get) => ({
  suggestedTokens: [],
  testTokens: [],
  walletTokens: [],
  combinedTokens: [],
  
  setSuggestedTokens: (tokens) => {
    set({ suggestedTokens: tokens });
    get().updateCombinedTokens();
  },
  
  setTestTokens: (tokens) => {
    set({ testTokens: tokens });
    get().updateCombinedTokens();
  },
  
  setWalletTokens: (tokens) => {
    set({ walletTokens: tokens });
    get().updateCombinedTokens();
  },
  
  updateCombinedTokens: () => {
    const { suggestedTokens, testTokens, walletTokens } = get();
    const tokens = [...suggestedTokens, ...testTokens, ...walletTokens];
    
    // Remove duplicates based on address
    const uniqueTokens = tokens.filter(
      (token, index, self) =>
        index ===
        self.findIndex(
          (t) => t.address.toLowerCase() === token.address.toLowerCase()
        )
    );
    
    set({ combinedTokens: uniqueTokens });
  },
  
  resetTokens: () => {
    set({
      suggestedTokens: [],
      testTokens: [],
      walletTokens: [],
      combinedTokens: [],
    });
  },
}));
