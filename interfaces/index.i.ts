export interface TokenType {
  id?: number;
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  balance?: string;
  poolId?: number;
  programId?: string;
  wrappedAddress?: string;
}

export interface TradeTokenType {
  address: string | any;
  decimal: number;
  logoURI: string;
  name: string;
  symbol: string;
}

export interface ChainType {
  id: number;
  name: string;
  image: string;
  chainId: number;
  endpointChainID: number | null;
  sgAdapterAddress: string | null;
}

export interface SuggestedTokenConfigType {
  [chainId: number | string]: TokenType[];
}

export interface ChainConfigItemType {
  chainId: number | null;
  chainName: string | null;
  tokenApi: string | null;
  tokens: TokenType[] | null;
}

export interface ChainConfigType {
  [chainId: number | string]: ChainConfigItemType;
}

export interface ContractConfigItemType {
  v3PositionManagerAddress: string | null;
  v3PositionManagerABI: any | null;
  v3RouterAddress: string | null;
  v3RouterABI: any | null;
  v3FactoryAddress: string | null;
  v3FactoryABI: any | null;
  quoterContractAddress: string | null;
  quoterContractABI: any | null;
  chain: any | null;
  publicClientApi: string | null;
  explorerURL: string | null;
  v3UniversalRouterAddress: string | null;
  v3UniversalABI: any | null;
  subgraphUrl: null | string;
  positionSubgraphUrl: string | null;
  v3LpLockerAddress?: string | null;
  v3LpLockerABI?: any | null;
  v3LpLockerFeeTokenAddress?: string | null;
  lpLockSubgraphUrl?: string | null;
  swapAggregator?: string | null;
  swapAggregatorABI: any | null;
}

export interface ContractConfigType {
  [chainId: number | string]: ContractConfigItemType;
}

interface Dimensions {
  width: number;
  height: number;
}

export interface ChartEntry {
  activeLiquidity: number;
  price0: number;
}

export enum Bound {
  LOWER = "LOWER",
  UPPER = "UPPER",
}

export interface ZoomLevels {
  initialMin: number;
  initialMax: number;
  min: number;
  max: number;
}

interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface LiquidityChartRangeInputProps {
  // to distringuish between multiple charts in the DOM
  id?: string;

  data: {
    series: ChartEntry[];
    current: number;
  };
  ticksAtLimit: { [bound in Bound]?: boolean | undefined };

  styles: {
    area: {
      // color of the ticks in range
      selection: string;
    };

    brush: {
      handle: {
        west: string;
        east: string;
      };
    };
  };

  dimensions: Dimensions;
  margins: Margins;

  interactive?: boolean;

  brushLabels: (d: "w" | "e", x: number) => string;
  brushDomain: [number, number] | undefined;
  onBrushDomainChange: (
    domain: [number, number],
    mode: string | undefined
  ) => void;

  zoomLevels: ZoomLevels;
  showZoomButtons?: boolean;
}

export interface FeeTier {
  fee: number;
  value: number;
  desp: string;
  desp1: string;
}

export interface TickRanges {
  range01: { lower: number; upper: number };
  range05: { lower: number; upper: number };
  range1: { lower: number; upper: number };
  range5: { lower: number; upper: number };
  range10: { lower: number; upper: number };
  range20: { lower: number; upper: number };
  range50: { lower: number; upper: number };
  fullRange: { lower: number; upper: number };
}

export interface PoolDetails {
  poolAddress: string;
  token0: string;
  token1: string;
  fee: number;
  sqrtPriceX96: bigint;
  tick: number;
  liquidity: bigint;
}

// export interface TickData {
//   liquidityGross: bigint;
//   liquidityNet: bigint;
//   feeGrowthOutside0X128: bigint;
//   feeGrowthOutside1X128: bigint;
//   tickCumulativeOutside: bigint;
//   secondsPerLiquidityOutsideX128: bigint;
//   secondsOutside: number;
//   initialized: boolean;
// }

export type TickData = [
  bigint, // liquidityGross
  bigint, // liquidityNet
  bigint, // feeGrowthOutside0X128
  bigint, // feeGrowthOutside1X128
  bigint, // tickCumulativeOutside
  bigint, // secondsPerLiquidityOutsideX128
  number, // secondsOutside
  boolean // initialized
];

export interface BestRouteRequest {
  network: "ethereum" | "bsc" | "base" | undefined;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  isTestnet?: boolean;
  slippage?: number;
}

export interface BestRouteResponse {
  success: boolean;
  data: {
    network: string;
    chainId: number;
    tokenIn: {
      address: string;
      name: string;
      symbol: string;
      decimals: number;
    };
    tokenOut: {
      address: string;
      name: string;
      symbol: string;
      decimals: number;
    };
    bestRoute: {
      dex: string;
      dexName: string;
      feeTier: number;
      feePercentage: string;
      amountOut: string;
      amountOutFormatted: string;
      minAmountOut: string;
      minAmountOutFormatted: string;
      positionManager: string;
      factory: string;
      quoter: string;
      router: string;
    };
    allRoutes: any[];
    timestamp: string;
  };
}

export interface bestRoute {
  dex: string;
  dexName: string;
  feeTier: number;
  feePercentage: string;
  amountOut: string;
  amountOutFormatted: string;
  minAmountOut: string;
  minAmountOutFormatted: string;
  gasEstimate: string;
  positionManager: string;
  poolAddress: string;
  factory: string;
  quoter: string;
  router: string;
  tokenIn: string;
  tokenOut: string;
  sqrtPriceX96After: string;
}

export type DexName = "pancakeswap" | "uniswap" | "sushiswap";
export type DexConfig = {
  routerAbi: any;
  swapAggregatorAddress: string;
};
