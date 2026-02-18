import { create } from "zustand";
import { TokenType } from "@/interfaces/index.i";
import { Price, Token } from "@uniswap/sdk-core";

interface TradingLivePoolStore {
  activePriceRange: number;
  setActivePriceRange: (value: number) => void;
  rangeSelectMinValue: number;
  rangeSelectMaxValue: number;
  setRangeSelectMinValue: (value: number) => void;
  setRangeSelectMaxValue: (value: number) => void;
  isFullRangeSelected: boolean;
  setIsFullRangeSelected: (value: boolean) => void;
  currencyA: TokenType | null;
  currencyB: TokenType | null;
  setCurrencyA: (token: TokenType | null) => void;
  setCurrencyB: (token: TokenType | null) => void;
  tickLowerPrice: string;
  setTickLowerPrice: (amount: string) => void;
  tickUpperPrice: string;
  setTickUpperPrice: (amount: string) => void;
  tickSpace: number;
  setTickSpace: (tickSpace: number) => void;
  basePrice: Price<Token, Token> | null;
  setBasePrice: (value: Price<Token, Token> | null) => void;
  lpCalTop: boolean;
  setLpCalTop: (value: boolean) => void;
  lpCalBottom: boolean;
  setLpCalBottom: (value: boolean) => void;
  setCurrencyATokenInputAmount: (amount: string) => void;
  setCurrencyBTokenInputAmount: (amount: string) => void;
  currencyATokenInputAmount: string;
  currencyBTokenInputAmount: string;
  currencyATokenBalance: string;
  setCurrencyATokenBalance: (balance: string) => void;
  currencyBBalance: string;
  setCurrencyBTokenBalance: (balance: string) => void;
  canonicalTickLower: number | null;
  canonicalTickUpper: number | null;
  setCanonicalTickLower: (value: number | null) => void;
  setCanonicalTickUpper: (value: number | null) => void;
  lowerTick: number | null;
  setLowerTick: (value: number | null) => void;
  upperTick: number | null;
  setUpperTick: (value: number | null) => void;
  lpSlippage: number;
  setlpSlippage: (slippage: number) => void;
}

export const useTradingLivePoolStore = create<TradingLivePoolStore>((set) => ({
  activePriceRange: 0,
  setActivePriceRange: (value: number) =>
    set(() => ({
      activePriceRange: value,
    })),
  rangeSelectMinValue: 0,
  rangeSelectMaxValue: 0,
  setRangeSelectMinValue: (value) => set({ rangeSelectMinValue: value }),
  setRangeSelectMaxValue: (value) => set({ rangeSelectMaxValue: value }),
  isFullRangeSelected: false,
  setIsFullRangeSelected: (value) => set({ isFullRangeSelected: value }),
  currencyA: null,
  currencyB: null,
  setCurrencyA: (token) => set({ currencyA: token }),
  setCurrencyB: (token) => set({ currencyB: token }),
  tickLowerPrice: "",
  setTickLowerPrice: (amount) => set({ tickLowerPrice: amount }),
  tickUpperPrice: "",
  setTickUpperPrice: (amount) => set({ tickUpperPrice: amount }),
  tickSpace: 60,
  setTickSpace: (value) => set({ tickSpace: value }),
  basePrice: null,
  setBasePrice: (value) => set({ basePrice: value }),
  lpCalTop: false,
  setLpCalTop: (value) => set({ lpCalTop: value }),
  lpCalBottom: false,
  setLpCalBottom: (value) => set({ lpCalBottom: value }),
  currencyATokenInputAmount: "",
  currencyBTokenInputAmount: "",
  setCurrencyATokenInputAmount: (amount) =>
    set({ currencyATokenInputAmount: amount }),
  setCurrencyBTokenInputAmount: (amount) =>
    set({ currencyBTokenInputAmount: amount }),
  currencyATokenBalance: "0",
  setCurrencyATokenBalance: (balance) =>
    set({ currencyATokenBalance: balance }),
  currencyBBalance: "0",
  setCurrencyBTokenBalance: (balance) => set({ currencyBBalance: balance }),
  canonicalTickLower: null,
  canonicalTickUpper: null,
  setCanonicalTickLower: (value) => set({ canonicalTickLower: value }),
  setCanonicalTickUpper: (value) => set({ canonicalTickUpper: value }),
  lowerTick: null,
  setLowerTick: (value) => set({ lowerTick: value }),
  upperTick: null,
  setUpperTick: (value) => set({ upperTick: value }),
  lpSlippage: 50,
  setlpSlippage: (slippage) => set({ lpSlippage: slippage }),
}));
