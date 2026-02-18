import { TokenType } from "@/interfaces/index.i";
import { create } from "zustand";

interface NewIncreaseLpStore {
  fromLPToken: TokenType | null;
  setFromLPToken: (token: TokenType | null) => void;
  toLPToken: TokenType | null;
  setToLPToken: (token: TokenType | null) => void;
  toLPTokenBalance: string;
  setToLPTokenBalance: (balance: string) => void;
  toLPTokenInputAmount: string;
  setToLPTokenInputAmount: (amount: string) => void;
  fromLPTokenInputAmount: string;
  setFromLPTokenInputAmount: (amount: string) => void;
  lpCalTop: boolean;
  setLpCalTop: (value: boolean) => void;
  lpCalBottom: boolean;
  setLpCalBottom: (value: boolean) => void;
  fromLPTokenBalance: string;
  setFromLPTokenBalance: (balance: string) => void;
}

export const useNewIncreaseLpStore = create<NewIncreaseLpStore>((set) => ({
  fromLPToken: null,
  setFromLPToken: (token: TokenType | null) => set({ fromLPToken: token }),
  toLPToken: null,
  setToLPToken: (token: TokenType | null) => set({ toLPToken: token }),
  toLPTokenBalance: "0",
  setToLPTokenBalance: (balance: string) => set({ toLPTokenBalance: balance }),
  toLPTokenInputAmount: "0",
  setToLPTokenInputAmount: (amount: string) =>
    set({ toLPTokenInputAmount: amount }),
  fromLPTokenInputAmount: "0",
  setFromLPTokenInputAmount: (amount: string) =>
    set({ fromLPTokenInputAmount: amount }),
  lpCalTop: false,
  setLpCalTop: (value: boolean) => set({ lpCalTop: value }),
  lpCalBottom: false,
  setLpCalBottom: (value: boolean) => set({ lpCalBottom: value }),
  fromLPTokenBalance: "0",
  setFromLPTokenBalance: (balance: string) =>
    set({ fromLPTokenBalance: balance }),
}));
