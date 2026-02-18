import { getTransactions } from "@/service/api/transactions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // During static export, we can't use request.url
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ result: [] });
  }

  const { searchParams } = new URL(req.url);
  const tokenAddress = searchParams.get("tokenAddress");
  const poolAddress = searchParams.get("poolAddress");
  const chainId = searchParams.get("chainId");
  const offset = searchParams.get("offset");
  const filter = searchParams.get("filter");
  const walletAddress = searchParams.get("walletAddress");
  const cursor = searchParams.get("cursor");
  const token0PriceInUSD = searchParams.get("token0PriceInUSD");

  if (!tokenAddress || !poolAddress || !chainId) {
    return NextResponse.json(
      { message: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const data = await getTransactions(
      tokenAddress,
      poolAddress,
      Number(chainId),
      offset ? Number(offset) : 10,
      filter as "All" | "BUY" | "SELL" | undefined,
      walletAddress || undefined,
      cursor || undefined,
      token0PriceInUSD ? Number(token0PriceInUSD) : undefined
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { message: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
