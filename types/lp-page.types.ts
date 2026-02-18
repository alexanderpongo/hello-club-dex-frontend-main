import { SinglePoolData } from "./trading-live-table.types";

interface APRInterface {
  average: number;
  weighted_average: number;
  highest: number;
  lowest: number;
}

interface ChainInterface {
  chain: string;
  name: string;
  fullName: string;
  nativeToken: string;
  nativeTokenPrice: number;
  nativeTokenMarketCap: number;
  total_pools: number;
  active_pools: number;
  inactive_pools: number;
  total_tvl_usd: number;
  total_volume_24h_usd: number;
  total_transactions: number;
  apr: APRInterface;
}

interface OverallInterface {
  total_pools: number;
  active_pools: number;
  inactive_pools: number;
  total_tvl_usd: number;
  total_volume_24h_usd: number;
  total_transactions: number;
  apr: APRInterface;
}

export interface LpPageStatsResponse {
  data: {
    by_chain: ChainInterface[];
    overall: OverallInterface;
  };
  success: boolean;
}

// Types for the position JSON you provided

export type Address = string;
export type Symbol = string;
export type ISODateString = string;

// Token info
export interface TokenInfo {
  address: Address;
  symbol: Symbol;
  name: string;
  decimals: number;
  logo?: string;
  // price in USD (your sample uses a number)
  price_usd?: number;
}

// Pool info
export interface PoolInfo {
  address: Address;
  token0: TokenInfo;
  token1: TokenInfo;
  fee_tier: string; // e.g. "1%"
  current_tick: number;
  // current_price in your sample is a number (floating)
  current_price: number;
}

// Generic amount pair (token0 / token1) where values may be numbers or strings
export interface TokenAmountPair {
  token0: number | string;
  token1: number | string;
  token0_usd?: number;
  token1_usd?: number;
  total_usd?: number;
}

// Liquidity detail: note some fields are strings in the JSON (big ints)
export interface LiquidityInfo {
  current: string; // sample "0"
  original_deposited: TokenAmountPair;
  current_amounts: TokenAmountPair;
  withdrawn: TokenAmountPair;
}

export interface TokenPerPriceRanges {
  price_lower: number;
  price_upper: number;
  current_price: number;
  format: string;
  token0: string;
  token1: string;
}

// Price range / ticks
export interface PriceRange {
  tick_lower: number;
  tick_upper: number;
  tick_current: number;
  in_range: boolean;
  token1_per_token0: TokenPerPriceRanges;
  token0_per_token1: TokenPerPriceRanges;
}

// Fees structure
export interface FeesInfo {
  uncollected: TokenAmountPair;
  collected: TokenAmountPair;
  total_earned: TokenAmountPair;
}

// Performance / PnL
export interface PnL {
  fees_earned_usd: number;
  impermanent_loss_usd: number;
  net_pnl_usd: number;
}

export interface ValueComparison {
  deposited_usd: number;
  current_usd: number;
  if_held_usd: number;
  withdrawn_usd: number;
}

export interface PerformanceInfo {
  apr: number;
  roi: number;
  is_profitable: boolean;
  pnl: PnL;
  value_comparison: ValueComparison;
}

// Transaction amount object (some txs include liquidity, some don't)
export interface TxAmounts {
  token0?: number | string;
  token1?: number | string;
  liquidity?: string;
}

// Transaction variants (you can extend the 'type' union if other types exist)
export type TxType =
  | "collect_fees"
  | "decrease_liquidity"
  | "increase_liquidity"
  | string;

export interface TransactionBase {
  type: TxType;
  hash: string;
  timestamp: number;
  block: number;
  from: Address;
  // some transactions have a 'recipient', some may not
  recipient?: Address;
  amounts?: TxAmounts;
}

export type PositionTransaction = TransactionBase;

// Created at / metadata
export interface CreatedAt {
  timestamp: number;
  block: number;
  date: ISODateString;
}

// Root Position type
export interface Position {
  position_id: string;
  owner: Address;
  pool: PoolInfo;
  liquidity: LiquidityInfo;
  price_range: PriceRange;
  fees: FeesInfo;
  performance: PerformanceInfo;
  transactions: PositionTransaction[];
  created_at: CreatedAt;
}

export interface LiquidityData {
  chain: string;
  user_address: string;
  pool_address: string;
  total_positions: number;
  positions: Position[];
}

export interface LiquidityPositionResponse {
  data: LiquidityData;
  success: boolean;
}

export interface AdjustedPosition extends Position {
  poolData: SinglePoolData;
}

export interface SinglePositionResponse {
  data: Position;
  success: boolean;
}
