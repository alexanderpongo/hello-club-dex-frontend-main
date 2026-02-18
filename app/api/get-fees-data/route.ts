import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, url } = body;

  if (!id || !url) {
    return NextResponse.json({ message: "Missing id or url" }, { status: 400 });
  }

  try {
    const QUERY = `
  query MyQuery {
  collects(orderBy: blockTimestamp, orderDirection: desc, first: 1000) {
    amount0
    amount1
    tokenId
    recipient
    id
    blockTimestamp
      }
    }
    `;

    const response = await axios.post(url, { query: QUERY });

    // console.log("fees table data:", response.data.data.collects);

    const collects = response.data?.data?.collects;

    if (collects && Array.isArray(collects)) {
      return NextResponse.json(
        {
          status: 200,
          message: "success",
          data: collects,
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
