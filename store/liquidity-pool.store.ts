import { TokenType } from "@/interfaces/index.i";
import { Price, Token } from "@uniswap/sdk-core";
import { create } from "zustand";

interface LiquidityPoolStore {
  lpSlippage: number;
  setlpSlippage: (slippage: number) => void;
  currencyA: TokenType | null;
  currencyB: TokenType | null;
  setCurrencyA: (token: TokenType | null) => void;
  setCurrencyB: (token: TokenType | null) => void;
  activeStep: number;
  setActiveStep: (value: number) => void;
  currencyALPTokenInputAmount: string;
  setCurrencyALPTokenInputAmount: (amount: string) => void;
  currencyBLPTokenInputAmount: string;
  setCurrencyBLPTokenInputAmount: (amount: string) => void;
  feeTier: string;
  setFeeTier: (fee: string) => void;
  activePriceRange: number;
  setActivePriceRange: (value: number) => void;
  tickLowerPrice: string;
  setTickLowerPrice: (amount: string) => void;
  tickUpperPrice: string;
  setTickUpperPrice: (amount: string) => void;
  tickSpace: number;
  setTickSpace: (tickSpace: number) => void;
  lpAddingSuccess: boolean;
  setLpAddingSuccess: (value: boolean) => void;
  currencyATokenBalance: string;
  setCurrencyATokenBalance: (balance: string) => void;
  currencyBBalance: string;
  setCurrencyBTokenBalance: (balance: string) => void;
  poolFee: number;
  setPoolFee: (value: number) => void;
  basePrice: Price<Token, Token> | null;
  setBasePrice: (value: Price<Token, Token> | null) => void;
  invertedBasePrice: Price<Token, Token> | null;
  setInvertedBasePrice: (value: Price<Token, Token> | null) => void;
  poolAddress: string | null;
  setPoolAddress: (value: string | null) => void;
  token0: TokenType | null;
  setToken0: (value: TokenType | null) => void;
  token1: TokenType | null;
  setToken1: (value: TokenType | null) => void;
  rangeSelectMinValue: number;
  rangeSelectMaxValue: number;
  setRangeSelectMinValue: (value: number) => void;
  setRangeSelectMaxValue: (value: number) => void;
  isFullRangeSelected: boolean;
  setIsFullRangeSelected: (value: boolean) => void;
  // true if user-selected currencyA corresponds to pool token1 (i.e. reversed orientation)
  isInverted: boolean;
  setIsInverted: (value: boolean) => void;
  pairSelectLiquidity: bigint | null;
  setPairSelectLiquidity: (value: bigint | null) => void;
  lpCalTop: boolean;
  setLpCalTop: (value: boolean) => void;
  lpCalBottom: boolean;
  setLpCalBottom: (value: boolean) => void;
  setCurrencyATokenInputAmount: (amount: string) => void;
  setCurrencyBTokenInputAmount: (amount: string) => void;
  currencyATokenInputAmount: string;
  currencyBTokenInputAmount: string;
  lowerTick: number | null;
  setLowerTick: (value: number | null) => void;
  upperTick: number | null;
  setUpperTick: (value: number | null) => void;
  canonicalTickLower: number | null;
  canonicalTickUpper: number | null;
  setCanonicalTickLower: (value: number | null) => void;
  setCanonicalTickUpper: (value: number | null) => void;
  priceWhenPoolNotInitialized?: Price<Token, Token> | null;
  setPriceWhenPoolNotInitialized: (
    value: Price<Token, Token> | null | undefined
  ) => void;
  inputAmount: string;
  setInputAmount: (amount: string) => void;
  txHash: string;
  setTxHash: (tx: string) => void;

  // Derived UI state: when price is outside the selected range, deposits become single-sided.
  // These are written by the TokenBalance inputs and can be consumed by parent layouts.
  disableTopInput: boolean;
  disableBottomInput: boolean;
  setDisableTopInput: (value: boolean) => void;
  setDisableBottomInput: (value: boolean) => void;
}

export const useLiquidityPoolStore = create<LiquidityPoolStore>((set) => ({
  lpSlippage: 50,
  setlpSlippage: (slippage) => set({ lpSlippage: slippage }),
  currencyA: null,
  currencyB: null,
  setCurrencyA: (token) => set({ currencyA: token }),
  setCurrencyB: (token) => set({ currencyB: token }),
  activeStep: 1,
  setActiveStep: (value) => set({ activeStep: value }),
  currencyALPTokenInputAmount: "",
  setCurrencyALPTokenInputAmount: (amount) =>
    set({ currencyALPTokenInputAmount: amount }),
  currencyBLPTokenInputAmount: "",
  setCurrencyBLPTokenInputAmount: (amount) =>
    set({ currencyBLPTokenInputAmount: amount }),
  feeTier: "0.3",
  setFeeTier: (fee) => set({ feeTier: fee }),
  activePriceRange: 0,
  setActivePriceRange: (value) => set({ activePriceRange: value }),
  tickLowerPrice: "",
  setTickLowerPrice: (amount) => set({ tickLowerPrice: amount }),
  tickUpperPrice: "",
  setTickUpperPrice: (amount) => set({ tickUpperPrice: amount }),
  tickSpace: 60,
  setTickSpace: (value) => set({ tickSpace: value }),
  lpAddingSuccess: false,
  setLpAddingSuccess: (value) => set({ lpAddingSuccess: value }),
  currencyATokenBalance: "0",
  setCurrencyATokenBalance: (balance) =>
    set({ currencyATokenBalance: balance }),
  currencyBBalance: "0",
  setCurrencyBTokenBalance: (balance) => set({ currencyBBalance: balance }),
  poolFee: 3000,
  setPoolFee: (value) => set({ poolFee: value }),
  basePrice: null,
  setBasePrice: (value) => set({ basePrice: value }),
  poolAddress: null,
  setPoolAddress: (value) => set({ poolAddress: value }),
  token0: null,
  setToken0: (value) => set({ token0: value }),
  token1: null,
  setToken1: (value) => set({ token1: value }),
  isInverted: false,
  setIsInverted: (value) => set({ isInverted: value }),
  invertedBasePrice: null,
  setInvertedBasePrice: (value) => set({ invertedBasePrice: value }),
  rangeSelectMinValue: 0,
  rangeSelectMaxValue: 0,
  setRangeSelectMinValue: (value) => set({ rangeSelectMinValue: value }),
  setRangeSelectMaxValue: (value) => set({ rangeSelectMaxValue: value }),
  isFullRangeSelected: false,
  setIsFullRangeSelected: (value) => set({ isFullRangeSelected: value }),
  // duplicate removed above; single source of truth
  pairSelectLiquidity: null,
  setPairSelectLiquidity: (value) => set({ pairSelectLiquidity: value }),
  lpCalTop: false,
  setLpCalTop: (value) => set({ lpCalTop: value }),
  lpCalBottom: false,
  setLpCalBottom: (value) => set({ lpCalBottom: value }),
  setCurrencyATokenInputAmount: (amount) =>
    set({ currencyATokenInputAmount: amount }),
  setCurrencyBTokenInputAmount: (amount) =>
    set({ currencyBTokenInputAmount: amount }),
  currencyATokenInputAmount: "",
  currencyBTokenInputAmount: "",
  lowerTick: null,
  setLowerTick: (value) => set({ lowerTick: value }),
  upperTick: null,
  setUpperTick: (value) => set({ upperTick: value }),
  canonicalTickLower: null,
  canonicalTickUpper: null,
  setCanonicalTickLower: (value) => set({ canonicalTickLower: value }),
  setCanonicalTickUpper: (value) => set({ canonicalTickUpper: value }),
  priceWhenPoolNotInitialized: null,
  setPriceWhenPoolNotInitialized: (value) =>
    set({ priceWhenPoolNotInitialized: value }),
  inputAmount: "",
  setInputAmount: (amount) => set({ inputAmount: amount }),
  txHash: "",
  setTxHash: (tx) => set({ txHash: tx }),

  disableTopInput: false,
  disableBottomInput: false,
  setDisableTopInput: (value) => set({ disableTopInput: value }),
  setDisableBottomInput: (value) => set({ disableBottomInput: value }),
}));
