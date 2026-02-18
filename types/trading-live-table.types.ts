export interface ChainInfo {
  id: string; // e.g., "bsc"
  name: string; // e.g., "BSC"
  fullName: string; // e.g., "BNB Smart Chain"
  explorer: string; // e.g., "https://bscscan.com"
  explorerLink: string; // address link
}

export type PriceSource = "calculated" | "native" | string;

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo: string | null;
  price_usd: number;
  price_in_paired_token: number;
  paired_token_symbol: string;
  price_source: PriceSource;
  market_cap: number;
  fdv: number;
}

export interface PriceInfo {
  native_token: string; // e.g., "BNB"
  native_token_price_usd: number;
  sqrt_price: string; // Q64.96 sqrtPrice as string
}

export interface PoolLiquidityBreakdown {
  token0_value_usd: number;
  token1_value_usd: number;
  total_value_usd: number;
}

export interface VolumeInfo {
  token0: number;
  token1: number;
  total_usd: number;
  volume_1h_usd: number;
  volume_1h_change: number;
  volume_6h_usd: number;
  volume_6h_change: number;
  volume_24h_usd: number;
  volume_24h_change: number;
}

export interface CreatedAtInfo {
  timestamp: number; // unix seconds
  block: number;
  date: string; // ISO string
}

export interface APR {
  value: number;
  daily_fees: number;
  avg_daily_volume_30d: number;
}

export interface TradingLiveTableItem {
  pool_address: string;
  pool_id: string;
  chain: ChainInfo;
  token0: TokenInfo;
  token1: TokenInfo;
  fee_tier: string; // e.g., "0.05%"
  fee_tier_raw: number; // e.g., 500
  liquidity: string; // big integer as string
  price_info: PriceInfo;
  pool_liquidity: PoolLiquidityBreakdown;
  volume: VolumeInfo;
  apr: APR;
  tvl_usd: number;
  tx_count: number;
  created_at: CreatedAtInfo;
  is_active: boolean;
  last_synced: string; // ISO string
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface FiltersApplied {
  is_active: "true" | "false";
  chain: string;
  search: string | null;
  sort_by: string;
  sort_order: "asc" | "desc";
}

export interface PoolApiResponse {
  data: TradingLiveTableItem[];
  pagination: Pagination;
  filters_applied: FiltersApplied;
}

export interface PoolLiquidity {
  token0_balance: number;
  token1_balance: number;
  token0_value_usd: number;
  token1_value_usd: number;
  total_value_usd: number;
}

export interface SingleTokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo: string | null;
  price_usd: number;
  price_in_paired_token: number;
  paired_token_symbol: string;
  price_source: string;
  market_cap: number;
  total_supply: string;
  balance_in_pool: number;
  value_in_pool_usd: number;
  fdv: number;
}

export interface SinglePoolData {
  pool_address: string;
  pool_id: string;
  chain: ChainInfo;
  token0: SingleTokenInfo;
  token1: SingleTokenInfo;
  fee_tier: string;
  fee_tier_raw: number;
  liquidity: string;
  sqrt_price: string;
  price_info: PriceInfo;
  pool_liquidity: PoolLiquidity;
  volume: VolumeInfo;
  tvl_usd: number;
  tx_count: number;
  created_at: CreatedAtInfo;
  is_active: boolean;
  last_synced: string;
}

export interface SinglePoolApiResponse {
  success: boolean;
  data: SinglePoolData;
}
