import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json({ message: "Missing url" }, { status: 400 });
  }

  try {
    const QUERY = `
     query MyQuery {
        pools (skip: ${0},  
        orderBy: blockTimestamp,
        orderDirection: desc, 
        first: ${1000})  {
            id
            owner
            tokenId
            transactionHash
            liquidity
            blockNumber
            blockTimestamp
            amount0
            amount1
        }
    }
    `;

    const response = await axios.post(url, { query: QUERY });

    // console.log("user pools:", response.data.data.pools);

    const allPools = response.data?.data?.pools;

    if (allPools && Array.isArray(allPools)) {
      return NextResponse.json(
        {
          status: 200,
          message: "success",
          data: allPools,
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      return NextResponse.json(
        { message: "No collects data found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { message: "Failed to fetch or process data" },
      { status: 500 }
    );
  }
}
