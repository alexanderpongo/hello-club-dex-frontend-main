import PoolPositionInnerView from "@/components/pools/pools-positions/PoolPositionInnerView";
import { SinglePoolApiResponse } from "@/types/trading-live-table.types";
import axios from "axios";

export async function generateStaticParams() {
  return [{ chainid: '56', pooladdress: '0x0' }];
}

export const dynamicParams = false;

export default async function PoolInnerPage({
  params,
}: {
  params: { chainid: string; pooladdress: string };
}) {
  const { chainid, pooladdress } = params;

  try {
    const apiBase = process.env.NEXT_PUBLIC_TRADING_LIVE_BASE_API;
    if (!apiBase) {
      return (
        <div className="container mx-auto mt-12 md:mt-24 xl:mt-28 w-full text-center py-20">
          <h2 className="text-2xl font-formula text-primary">API Configuration Missing</h2>
          <p className="text-gray-400 mt-2">Design Demo: Please check environment variables if this is unintentional.</p>
        </div>
      );
    }
    const poolDataRes = await axios.get<SinglePoolApiResponse>(
      `${apiBase}/pools/${chainid}/${pooladdress}`
    );

    const poolData = poolDataRes.data;
    const original = poolData.data;

    return (
      <div className="container mx-auto mt-12 md:mt-24 xl:mt-28 w-full">
        <PoolPositionInnerView poolData={original} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching pool data:", error);
    return <div>Pool not found or API error</div>;
  }
}
