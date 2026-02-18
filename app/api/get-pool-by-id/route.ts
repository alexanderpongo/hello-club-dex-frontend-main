import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, url } = body;

  console.log("Fetching pool by ID:", id, "from URL:", url);

  if (!id || !url) {
    return NextResponse.json({ message: "Missing id or url" }, { status: 400 });
  }

  try {
    const QUERY = `
      query PoolByTokenId($id: BigInt!) {
        pools(where: { tokenId: $id }, first: 1) {
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

    const response = await axios.post(url, {
      query: QUERY,
      variables: { id },
    });

    // console.log("user pools:", response.data.data.pools);

    const userPools = response.data?.data?.pools as any[] | undefined;

    if (userPools && Array.isArray(userPools) && userPools.length > 0) {
      const pool = userPools[0];
      return NextResponse.json(
        {
          status: 200,
          message: "success",
          data: pool,
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
        { message: "No pool found for given id" },
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
