import TradingLiveInnerComp from "@/components/trading-live-inner/TradingLiveInner";
import { SinglePoolApiResponse } from "@/types/trading-live-table.types";
import axios from "axios";

export async function generateStaticParams() {
  return [{ chain: '56', pooladdress: '0x0' }];
}

export const dynamicParams = false;

export default async function TradingLiveInner({
  params,
}: {
  params: { pooladdress: string; chain: string };
}) {
  const { pooladdress, chain } = params;

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
      `${apiBase}/pools/${chain}/${pooladdress}`
    );

    const poolData = poolDataRes.data;

    return (
      <div className="container  mx-auto mt-12 md:mt-24 xl:mt-28 w-full">
        <TradingLiveInnerComp poolData={poolData.data} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching pool data:", error);
    return <div>Pool not found or API error</div>;
  }
}
