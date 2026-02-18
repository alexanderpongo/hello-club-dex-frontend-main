import PositionsInnerView from "@/components/pools/positions/PositionsInnerView";
import { SinglePositionResponse } from "@/types/lp-page.types";
import { SinglePoolApiResponse } from "@/types/trading-live-table.types";
import axios from "axios";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return [{ chainid: '56', pooladdress: '0x0', positionid: '0' }];
}

export const dynamicParams = false;

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

    const positionData = await axios.get<SinglePositionResponse>(
      `${process.env.NEXT_PUBLIC_TRADING_LIVE_BASE_API}/positions/${chainid}/${positionid}`
    );

    const position = positionData.data.data;

    // Check if position data is valid
    if (!position || !position.position_id) {
      notFound();
    }

    return (
      <div className="mt-12 md:mt-24 xl:mt-28  container">
        <PositionsInnerView poolData={original} positionData={position} />
      </div>
    );
  } catch (error) {

    console.error("Error fetching position data:", error);
    notFound();
  }
}
