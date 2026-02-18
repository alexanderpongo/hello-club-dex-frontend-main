import { TickRanges, TokenType, TradeTokenType } from "@/interfaces/index.i";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SwapState {
  resetting: boolean;
  setResetting: (resetting: boolean) => void;
  fromToken: TokenType | null;
  setFromToken: (token: TokenType | null) => void;
  toToken: TokenType | null;
  setToToken: (token: TokenType | null) => void;
  fromTokenBalance: string;
  setFromTokenBalance: (balance: string) => void;
  toTokenBalance: string;
  setToTokenBalance: (balance: string) => void;
  fromTokenInputAmount: string;
  setFromTokenInputAmount: (amount: string) => void;
  toTokenInputAmount: string;
  setToTokenInputAmount: (amount: string) => void;
  debounceFromTokenInputAmount: string;
  setDebounceFromTokenInputAmount: (amount: string) => void;
  debounceToTokenInputAmount: string;
  setDebounceToTokenInputAmount: (amount: string) => void;
  fromTokenApprovedAmount: string;
  setFromTokenApprovedAmount: (amount: string) => void;
  toTokenApprovedAmount: string;
  setToTokenApprovedAmount: (amount: string) => void;
  isLoadingTopQuote: boolean;
  setIsLoadingTopQuote: (loading: boolean) => void;
  isLoadingBottomQuote: boolean;
  setIsLoadingBottomQuote: (loading: boolean) => void;
  toInputQuote: boolean;
  setToInputQuote: (load: boolean) => void;
  fromInputQuote: boolean;
  setFromInputQuote: (load: boolean) => void;
  isLoadingApprove: boolean;
  setIsLoadingApprove: (isLoading: boolean) => void;
  isLoadingSwap: boolean;
  setIsLoadingSwap: (isLoading: boolean) => void;
  feeTier: null | number;
  setFeeTier: (value: number | null) => void;
  updateBalance: boolean;
  setUpdateBalance: (updateBalance: boolean) => void;
  slippage: number | null;
  setSlippage: (value: number) => void;
  dataRow: any;
  setDataRow: (value: any) => void;
  defaultTab: string;
  setDefaultTab: (value: string) => void;
  pairFromToken: TokenType | any;
  setPairFromToken: (token: TokenType | any) => void;
  pairToToken: TokenType | any;
  setPairToToken: (token: TokenType | any) => void;
  singleDataRow: any;
  setSingleDataRow: (value: any) => void;
  swapSqrtPriceX96: string | null;
  setSwapSqrtPriceX96: (value: string) => void;
  swapPairAddress: string;
  setSwapPairAddress: (amount: string) => void;
  swapPairAddresses: string[];
  setSwapPairAddresses: (addresses: string[]) => void;
  isLoadingQ1: boolean;
  setIsLoadingQ1: (isLoadingQ1: boolean) => void;
  isLoadingQ2: boolean;
  setIsLoadingQ2: (isLoadingQ2: boolean) => void;
  onboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  isAggregating: boolean;
  setIsAggregating: (isAggregsting: boolean) => void;
  aggregatorResult: any;
  setAggregatorResult: (aggregatorResult: any) => void;
  tradeFromTokenInputAmount: string;
  setTradeFromTokenInputAmount: (amount: string) => void;
  tradeToTokenInputAmount: string;
  setTradeToTokenInputAmount: (amount: string) => void;
  tradeToInputQuote: boolean;
  setTradeToInputQuote: (load: boolean) => void;
  tradeFromInputQuote: boolean;
  setTradeFromInputQuote: (load: boolean) => void;
}

interface LPState {
  handleContribute: boolean;
  setHandleContribute: (handleContribute: boolean) => void;
  fromLPToken: TokenType | null;
  setFromLPToken: (token: TokenType | null) => void;
  toLPToken: TokenType | null;
  setToLPToken: (token: TokenType | null) => void;
  feeTier: string;
  setFeeTier: (fee: string) => void;
  tickSpace: number;
  setTickSpace: (tickSpace: number) => void;
  fromLPTokenBalance: string;
  setFromLPTokenBalance: (balance: string) => void;
  toLPTokenBalance: string;
  setToLPTokenBalance: (balance: string) => void;
  fromLPTokenInputAmount: string;
  setFromLPTokenInputAmount: (amount: string) => void;
  toLPTokenInputAmount: string;
  setToLPTokenInputAmount: (amount: string) => void;
  tickLowerPrice: string;
  setTickLowerPrice: (amount: string) => void;
  tickCalculateValue: string;
  setTickCalculateValue: (amount: string) => void;
  tickUpperPrice: string;
  setTickUpperPrice: (amount: string) => void;
  inverseTickLowerPrice: string;
  setInverseTickLowerPrice: (amount: string) => void;
  inverseTickUpperPrice: string;
  setInverseTickUpperPrice: (amount: string) => void;
  activeStep: number;
  setActiveStep: (value: number) => void;
  activePriceRange: number;
  setActivePriceRange: (value: number) => void;
  basePrice: string;
  setBasePrice: (value: string) => void;
  pairSelectLiquidity: bigint | null;
  setPairSelectLiquidity: (value: bigint | null) => void;
  inverseBasePrice: string;
  setInverseBasePrice: (value: string) => void;
  baseTick: number | null;
  setBaseTick: (value: number) => void;
  tickRanges: TickRanges | null;
  setTickRanges: (values: TickRanges) => void;
  inverseTickRanges: TickRanges | null;
  setInverseTickRanges: (values: TickRanges) => void;
  tickLower: number | null | undefined;
  setTickLower: (value: number | undefined) => void;
  initialTick: number | null | undefined;
  setInitialTick: (value: number | undefined) => void;
  initialBP: number | null | undefined;
  setInitialBP: (value: number | undefined) => void;
  inverseTickLower: number | null | undefined;
  setInverseTickLower: (value: number | undefined) => void;
  tickUpper: number | null | undefined;
  setTickUpper: (value: number | undefined) => void;
  inverseTickUpper: number | null | undefined;
  setInverseTickUpper: (value: number | undefined) => void;
  lpSlippage: number | null;
  setlpSlippage: (value: number) => void;
  sqrtPriceX96: string | null;
  setSqrtPriceX96: (value: string) => void;
  inverseSqrtPriceX96: string | null;
  setInverseSqrtPriceX96: (value: string) => void;
  poolAddress: string;
  setPoolAddress: (value: string) => void;
  token0Address: string;
  setToken0Address: (value: string) => void;
  token1Address: string;
  setToken1Address: (value: string) => void;
  poolFee: number;
  setPoolFee: (value: number) => void;
  fromLpTokenApprovedAmount: string;
  setFromLpTokenApprovedAmount: (amount: string) => void;
  toLpTokenApprovedAmount: string;
  setToLpTokenApprovedAmount: (amount: string) => void;
  pendingFee0: string;
  setPendingFee0: (value: string) => void;
  pendingFee1: string;
  setPendingFee1: (value: string) => void;
  lpDetailsTokenA: TokenType | null;
  setLpDetailsTokenA: (token: TokenType | null) => void;
  lpDetailsTokenB: TokenType | null;
  setLpDetailsTokenB: (token: TokenType | null) => void;
  removeLpSuccess: boolean;
  setRemoveLpSuccess: (value: boolean) => void;
  collectFeeSuccess: boolean;
  setCollectFeeSuccess: (value: boolean) => void;
  lpAddingSuccess: boolean;
  setLpAddingSuccess: (value: boolean) => void;
  txHash: string;
  setTxHash: (tx: string) => void;
  lpCalTop: boolean;
  setLpCalTop: (value: boolean) => void;
  lpCalBottom: boolean;
  setLpCalBottom: (value: boolean) => void;
  increasePairRatio: number;
  setIncreasePairRatio: (value: number) => void;
  isInversePriceView: boolean;
  setIsInversePriceView: (value: boolean) => void;
  tradeFromLPToken: TradeTokenType | null;
  setTradeFromLPToken: (token: TradeTokenType | null) => void;
  tradeToLPToken: TradeTokenType | null;
  setTradeToLPToken: (token: TradeTokenType | null) => void;
}

// export const useSwapStore = create<SwapState>()((set) => ({
//   fromToken: null,
//   setFromToken: (fromToken) => set({ fromToken: fromToken }),
//   toToken: null,
//   setToToken: (toToken) => set({ toToken: toToken }),
//   fromTokenBalance: "0.00",
//   setFromTokenBalance: (balance) => set({ fromTokenBalance: balance }),
//   toTokenBalance: "0.00",
//   setToTokenBalance: (balance) => set({ toTokenBalance: balance }),
//   fromTokenInputAmount: "",
//   setFromTokenInputAmount: (amount) => set({ fromTokenInputAmount: amount }),
//   toTokenInputAmount: "",
//   setToTokenInputAmount: (amount) => set({ toTokenInputAmount: amount }),
//   debounceFromTokenInputAmount: "",
//   setDebounceFromTokenInputAmount: (amount) =>
//     set({ debounceFromTokenInputAmount: amount }),
//   debounceToTokenInputAmount: "0.0",
//   setDebounceToTokenInputAmount: (amount) =>
//     set({ debounceToTokenInputAmount: amount }),
//   fromTokenApprovedAmount: "0.0",
//   setFromTokenApprovedAmount: (amount) =>
//     set({ fromTokenApprovedAmount: amount }),
//   toTokenApprovedAmount: "0.0",
//   setToTokenApprovedAmount: (amount) => set({ toTokenApprovedAmount: amount }),
//   isLoadingTopQuote: false,
//   setIsLoadingTopQuote: (loading) => set({ isLoadingTopQuote: loading }),
//   isLoadingBottomQuote: false,
//   setIsLoadingBottomQuote: (loading) => set({ isLoadingBottomQuote: loading }),
//   toInputQuote: false,
//   setToInputQuote: (loading) => set({ toInputQuote: loading }),
//   fromInputQuote: false,
//   setFromInputQuote: (load) => set({ fromInputQuote: load }),
//   isLoadingApprove: false,
//   setIsLoadingApprove: (isLoading) => set({ isLoadingApprove: isLoading }),
//   isLoadingSwap: false,
//   setIsLoadingSwap: (isLoading) => set({ isLoadingSwap: isLoading }),
//   feeTier: null,
//   setFeeTier: (value) => set({ feeTier: value }),
//   updateBalance: false,
//   setUpdateBalance: (value) => set({ updateBalance: value }),
//   slippage: 0.3,
//   setSlippage: (value) => set({ slippage: value }),
//   dataRow: null,
//   setDataRow: (values) => set({ dataRow: values }),
//   defaultTab: "trade",
//   setDefaultTab: (value) => set({ defaultTab: value }),
//   pairFromToken: null,
//   setPairFromToken: (value) => set({ pairFromToken: value }),
//   pairToToken: null,
//   setPairToToken: (value) => set({ pairToToken: value }),
//   singleDataRow: null,
//   setSingleDataRow: (values) => set({ singleDataRow: values }),
// }));

export const useSwapStore = create<SwapState>()(
  persist(
    (set) => ({
      resetting: false,
      setResetting: (resetting) => set({ resetting }),
      fromToken: null,
      setFromToken: (fromToken) => set({ fromToken }),
      toToken: null,
      setToToken: (toToken) => set({ toToken }),
      fromTokenBalance: "0.0",
      setFromTokenBalance: (balance) => set({ fromTokenBalance: balance }),
      toTokenBalance: "0.0",
      setToTokenBalance: (balance) => set({ toTokenBalance: balance }),
      fromTokenInputAmount: "",
      setFromTokenInputAmount: (amount) =>
        set({ fromTokenInputAmount: amount }),
      toTokenInputAmount: "",
      setToTokenInputAmount: (amount) => set({ toTokenInputAmount: amount }),
      debounceFromTokenInputAmount: "",
      setDebounceFromTokenInputAmount: (amount) =>
        set({ debounceFromTokenInputAmount: amount }),
      debounceToTokenInputAmount: "0.0",
      setDebounceToTokenInputAmount: (amount) =>
        set({ debounceToTokenInputAmount: amount }),
      fromTokenApprovedAmount: "0.0",
      setFromTokenApprovedAmount: (amount) =>
        set({ fromTokenApprovedAmount: amount }),
      toTokenApprovedAmount: "0.0",
      setToTokenApprovedAmount: (amount) =>
        set({ toTokenApprovedAmount: amount }),
      isLoadingTopQuote: false,
      setIsLoadingTopQuote: (loading) => set({ isLoadingTopQuote: loading }),
      isLoadingBottomQuote: false,
      setIsLoadingBottomQuote: (loading) =>
        set({ isLoadingBottomQuote: loading }),
      toInputQuote: false,
      setToInputQuote: (loading) => set({ toInputQuote: loading }),
      fromInputQuote: false,
      setFromInputQuote: (load) => set({ fromInputQuote: load }),
      isLoadingApprove: false,
      setIsLoadingApprove: (isLoading) => set({ isLoadingApprove: isLoading }),
      isLoadingSwap: false,
      setIsLoadingSwap: (isLoading) => set({ isLoadingSwap: isLoading }),
      feeTier: null,
      setFeeTier: (value) => set({ feeTier: value }),
      updateBalance: false,
      setUpdateBalance: (value) => set({ updateBalance: value }),
      swapPairAddress: "",
      setSwapPairAddress: (value) => set({ swapPairAddress: value }),
      swapPairAddresses: [] as string[],
      onboardingOpen: false,
      openOnboarding: () => set({ onboardingOpen: true }),
      closeOnboarding: () => set({ onboardingOpen: false }),
      setSwapPairAddresses: (value: string[]) =>
        set({ swapPairAddresses: value }),
      slippage: 2,
      setSlippage: (value) => set({ slippage: value }),
      dataRow: null,
      // setDataRow: (values) => set({ dataRow: values }),
      setDataRow: (values) => {
        const serialized = JSON.parse(
          JSON.stringify(values, (_key, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        );
        set({ dataRow: serialized });
      },
      defaultTab: "trade",
      setDefaultTab: (value) => set({ defaultTab: value }),
      pairFromToken: null,
      setPairFromToken: (value) => set({ pairFromToken: value }),
      pairToToken: null,
      setPairToToken: (value) => set({ pairToToken: value }),
      singleDataRow: null,
      setSingleDataRow: (values) => set({ singleDataRow: values }),
      swapSqrtPriceX96: null,
      setSwapSqrtPriceX96: (value) => set({ swapSqrtPriceX96: value }),
      isLoadingQ1: false,
      setIsLoadingQ1: (load) => set({ isLoadingQ1: load }),
      isLoadingQ2: false,
      setIsLoadingQ2: (load) => set({ isLoadingQ2: load }),
      isAggregating: false,
      setIsAggregating: (value) => set({ isAggregating: value }),
      aggregatorResult: null,
      setAggregatorResult: (value) => set({ aggregatorResult: value }),
      tradeFromTokenInputAmount: "",
      setTradeFromTokenInputAmount: (amount) =>
        set({ tradeFromTokenInputAmount: amount }),
      tradeToTokenInputAmount: "",
      setTradeToTokenInputAmount: (amount) =>
        set({ tradeToTokenInputAmount: amount }),
      tradeToInputQuote: false,
      setTradeToInputQuote: (loading) => set({ tradeToInputQuote: loading }),
      tradeFromInputQuote: false,
      setTradeFromInputQuote: (load) => set({ tradeFromInputQuote: load }),
    }),
    {
      name: "swap-persist", // Storage key
      partialize: (state) => ({
        defaultTab: state.defaultTab,
        dataRow: state.dataRow,
        pairFromToken: state.pairFromToken,
        pairToToken: state.pairToToken,
        singleDataRow: state.singleDataRow,
      }),
    }
  )
);

export const useLPStore = create<LPState>()((set) => ({
  handleContribute: false,
  setHandleContribute: (handleContribute) => set({ handleContribute }),
  fromLPToken: null,
  setFromLPToken: (token) => set({ fromLPToken: token }),
  toLPToken: null,
  setToLPToken: (token) => set({ toLPToken: token }),
  feeTier: "0.3",
  setFeeTier: (fee) => set({ feeTier: fee }),
  tickSpace: 60,
  setTickSpace: (value) => set({ tickSpace: value }),
  fromLPTokenBalance: "0.0",
  setFromLPTokenBalance: (balance) => set({ fromLPTokenBalance: balance }),
  toLPTokenBalance: "0.0",
  setToLPTokenBalance: (balance) => set({ toLPTokenBalance: balance }),
  fromLPTokenInputAmount: "",
  setFromLPTokenInputAmount: (amount) =>
    set({ fromLPTokenInputAmount: amount }),
  toLPTokenInputAmount: "",
  setToLPTokenInputAmount: (amount) => set({ toLPTokenInputAmount: amount }),
  tickLowerPrice: "",
  setTickLowerPrice: (amount) => set({ tickLowerPrice: amount }),
  tickCalculateValue: "",
  setTickCalculateValue: (amount) => set({ tickCalculateValue: amount }),
  tickUpperPrice: "",
  setTickUpperPrice: (amount) => set({ tickUpperPrice: amount }),
  inverseTickLowerPrice: "",
  setInverseTickLowerPrice: (amount) => set({ inverseTickLowerPrice: amount }),
  inverseTickUpperPrice: "",
  setInverseTickUpperPrice: (amount) => set({ inverseTickUpperPrice: amount }),
  activeStep: 1,
  setActiveStep: (value) => set({ activeStep: value }),
  activePriceRange: 0,
  setActivePriceRange: (value) => set({ activePriceRange: value }),
  basePrice: "",
  setBasePrice: (value) => set({ basePrice: value }),
  pairSelectLiquidity: null,
  setPairSelectLiquidity: (value) => set({ pairSelectLiquidity: value }),
  inverseBasePrice: "",
  setInverseBasePrice: (value) => set({ inverseBasePrice: value }),
  baseTick: null,
  setBaseTick: (value) => set({ baseTick: value }),
  initialTick: null,
  setInitialTick: (value) => set({ initialTick: value }),
  initialBP: null,
  setInitialBP: (value) => set({ initialBP: value }),
  tickRanges: null,
  setTickRanges: (values) => set({ tickRanges: values }),
  inverseTickRanges: null,
  setInverseTickRanges: (values) => set({ inverseTickRanges: values }),
  tickLower: null,
  setTickLower: (value) => set({ tickLower: value }),
  inverseTickLower: null,
  setInverseTickLower: (value) => set({ inverseTickLower: value }),
  tickUpper: null,
  setTickUpper: (value) => set({ tickUpper: value }),
  inverseTickUpper: null,
  setInverseTickUpper: (value) => set({ inverseTickUpper: value }),
  lpSlippage: null,
  setlpSlippage: (value) => set({ lpSlippage: value }),
  sqrtPriceX96: null,
  setSqrtPriceX96: (value) => set({ sqrtPriceX96: value }),
  inverseSqrtPriceX96: null,
  setInverseSqrtPriceX96: (value) => set({ inverseSqrtPriceX96: value }),
  poolAddress: "",
  setPoolAddress: (value) => set({ poolAddress: value }),
  token0Address: "",
  setToken0Address: (value) => set({ token0Address: value }),
  token1Address: "",
  setToken1Address: (value) => set({ token1Address: value }),
  poolFee: 3000,
  setPoolFee: (value) => set({ poolFee: value }),
  lpCalTop: false,
  setLpCalTop: (value) => set({ lpCalTop: value }),
  lpCalBottom: false,
  setLpCalBottom: (value) => set({ lpCalBottom: value }),
  fromLpTokenApprovedAmount: "0.0",
  setFromLpTokenApprovedAmount: (value) =>
    set({ fromLpTokenApprovedAmount: value }),
  toLpTokenApprovedAmount: "0.0",
  setToLpTokenApprovedAmount: (value) =>
    set({ toLpTokenApprovedAmount: value }),
  pendingFee0: "0.0",
  setPendingFee0: (value) => set({ pendingFee0: value }),
  pendingFee1: "0.0",
  setPendingFee1: (value) => set({ pendingFee1: value }),
  lpDetailsTokenA: null,
  setLpDetailsTokenA: (token) => set({ lpDetailsTokenA: token }),
  lpDetailsTokenB: null,
  setLpDetailsTokenB: (token) => set({ lpDetailsTokenB: token }),
  removeLpSuccess: false,
  setRemoveLpSuccess: (value) => set({ removeLpSuccess: value }),
  collectFeeSuccess: false,
  setCollectFeeSuccess: (value) => set({ collectFeeSuccess: value }),
  lpAddingSuccess: false,
  setLpAddingSuccess: (value) => set({ lpAddingSuccess: value }),
  txHash: "",
  setTxHash: (tx: string) => set({ txHash: tx }),
  increasePairRatio: 1,
  setIncreasePairRatio: (value) => set({ increasePairRatio: value }),
  isInversePriceView: false,
  setIsInversePriceView: (value) => set({ isInversePriceView: value }),
  tradeFromLPToken: null,
  setTradeFromLPToken: (token) => set({ tradeFromLPToken: token }),
  tradeToLPToken: null,
  setTradeToLPToken: (token) => set({ tradeToLPToken: token }),
}));
