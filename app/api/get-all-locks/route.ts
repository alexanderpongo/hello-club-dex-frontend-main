import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { address, url } = body;

  if (!url) {
    return NextResponse.json({ message: "Missing url" }, { status: 400 });
  }

  try {
    const QUERY = `
      query MyQuery {
        lpLocks(orderBy: blockTimestamp, orderDirection: desc, first: 1000) {
          id
          owner
          tokenId
          unlockTime
          blockNumber
          blockTimestamp
          transactionHash
        }
      }
    `;

    const response = await axios.post(
      url,
      { query: QUERY },
      { headers: { "Content-Type": "application/json" } }
    );

    // console.log("GraphQL Response:", response.data);

    const userLocks = response.data?.data?.lpLocks;

    if (userLocks && Array.isArray(userLocks)) {
      return NextResponse.json(
        {
          status: 200,
          message: "success",
          data: userLocks,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "No lock data found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Failed to fetch or process data" },
      { status: 500 }
    );
  }
}
