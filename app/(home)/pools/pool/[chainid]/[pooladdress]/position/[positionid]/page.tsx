import PositionsInnerView from "@/components/pools/positions/PositionsInnerView";
import { SinglePositionResponse } from "@/types/lp-page.types";
import { SinglePoolApiResponse } from "@/types/trading-live-table.types";
import axios from "axios";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return [{ chainid: '56', pooladdress: '0x0', positionid: '0' }];
}

export const dynamicParams = true;

const MOCK_POOL: any = {
  pool_address: "0x123...456",
  chain: { id: 56, name: "BSC", explorer: "https://bscscan.com", explorerLink: "https://bscscan.com" },
  token0: { address: "0x0000000000000000000000000000000000000000", symbol: "HELLO", name: "HELLO Labs", logo: "", decimals: 18, price_usd: 0.05 },
  token1: { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", symbol: "WBNB", name: "Wrapped BNB", logo: "", decimals: 18, price_usd: 600 },
  pool_liquidity: { total_value_usd: 500000 },
  volume: { volume_24h_change: 12.5 },
  fee_tier: "0.05%"
};

const MOCK_POSITION: any = {
  position_id: "demo",
  owner: "0x0",
  pool: MOCK_POOL,
  poolData: MOCK_POOL,
  price_range: {
    tick_current: 0,
    tick_lower: -100,
    tick_upper: 100,
    in_range: true,
    token1_per_token0: { price_lower: 0.04, price_upper: 0.06, current_price: 0.05, format: "HELLO/WBNB" },
    token0_per_token1: { price_lower: 16, price_upper: 25, current_price: 20, format: "WBNB/HELLO" }
  },
  liquidity: {
    current_amounts: { total_usd: 5240, token0: 50000, token1: 8.5 },
    original_deposited: { total_usd: 5000, token0: 48000, token1: 8.0 }
  },
  performance: { apr: 24.5, pnl: { net_pnl_usd: 240 } },
  fees: { total_earned: { total_usd: 625 }, uncollected: { total_usd: 125 } },
  transactions: []
};

export default async function PoolPositionPage({
  params,
}: {
  params: { chainid: string; pooladdress: string; positionid: string };
}) {
  const { chainid, pooladdress, positionid } = params;

  try {
    const apiBase = process.env.NEXT_PUBLIC_TRADING_LIVE_BASE_API;
    if (!apiBase) {
      return (
        <div className="container mx-auto mt-12 md:mt-24 xl:mt-28 w-full">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6 text-sm text-center text-yellow-500 font-lato">
            Preview Mode: API Unavailable. Viewing UI Template for {pooladdress}.
          </div>
          <PositionsInnerView poolData={MOCK_POOL} positionData={MOCK_POSITION} />
        </div>
      );
    }
    const poolDataRes = await axios.get<SinglePoolApiResponse>(
      `${apiBase}/pools/${chainid}/${pooladdress}`
    );
    const original = poolDataRes.data.data;

    const positionData = await axios.get<SinglePositionResponse>(
      `${apiBase}/positions/${chainid}/${positionid}`
    );
    const position = positionData.data.data;

    if (!position || !position.position_id) {
      return (
        <div className="container mx-auto mt-12 md:mt-24 xl:mt-28 w-full">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6 text-sm text-center text-blue-500 font-lato">
            Position Info not found. Showing Demo Template.
          </div>
          <PositionsInnerView poolData={MOCK_POOL} positionData={MOCK_POSITION} />
        </div>
      );
    }

    return (
      <div className="mt-12 md:mt-24 xl:mt-28 container">
        <PositionsInnerView poolData={original} positionData={position} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching position data, showing demo mode:", error);
    return (
      <div className="mt-12 md:mt-24 xl:mt-28 container">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-6 text-sm text-center text-orange-500 font-lato">
          Network Error. Displaying UI Demo.
        </div>
        <PositionsInnerView poolData={MOCK_POOL} positionData={MOCK_POSITION} />
      </div>
    );
  }
}
