import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { address, url } = body;

  if (!address || !url) {
    return NextResponse.json({ message: "Missing id or url" }, { status: 400 });
  }

  try {
    const QUERY = `
           query MyQuery {
              pools (skip: ${0}, first: ${1000},where: {owner: "${address}",liquidity_gt:"0"})  {
                  id
                  tokenId
                  owner
                  liquidity
                  amount0
                  amount1
                  blockNumber
                  blockTimestamp
                  transactionHash
              }
          }
          `;

    const response = await axios.post(url, { query: QUERY });

    // console.log("user pools:", response.data.data.pools);

    const userPools = response.data?.data?.pools;

    if (userPools && Array.isArray(userPools)) {
      return NextResponse.json(
        {
          status: 200,
          message: "success",
          data: userPools,
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
