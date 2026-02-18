import { Address } from "viem";

export interface TokenInfo {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logo: string | null;
  price_usd: number;
}

export interface IPool {
  address: Address;
  token0: TokenInfo;
  token1: TokenInfo;
  fee_tier: string;
  current_tick: number;
}

export interface TokenAmountPair {
  token0: number | string;
  token1: number | string;
  token0_usd?: number;
  token1_usd?: number;
  total_usd?: number;
}

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

export interface PriceRange {
  tick_lower: number;
  tick_upper: number;
  tick_current: number;
  in_range: boolean;
  token1_per_token0: TokenPerPriceRanges;
  token0_per_token1: TokenPerPriceRanges;
}

export interface FeesInfo {
  uncollected: TokenAmountPair;
  collected: TokenAmountPair;
  total_earned: TokenAmountPair;
}

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

export type ISODateString = string;

export interface CreatedAt {
  timestamp: number;
  block: number;
  date: ISODateString;
}

export interface Position {
  token_id: string;
  pool: IPool;
  liquidity: LiquidityInfo;
  price_range: PriceRange;
  fees: FeesInfo;
  performance: PerformanceInfo;
  created_at: CreatedAt;
}

export interface MyPositionsData {
  chain: string;
  user_address: string;
  total_positions: number;
  positions: Position[];
}

export interface MyPositionsResponse {
  success: boolean;
  data: MyPositionsData;
}
