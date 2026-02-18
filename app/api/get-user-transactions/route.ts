import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, url } = body;

  try {
    const QUERY = `
    query MyQuery {
      pool(id: "${id}"){
        id
        amount0
        amount1
        liquidity
        owner
        blockTimestamp
      }
    }
  `;
    const response = await axios.post(url, {
      query: QUERY,
    });

    // console.log("table data:", response.data.data.pool);

    if (response && response.data.data.pool) {
      return NextResponse.json({
        status: 200,
        message: "success",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          data: response.data.data.pool,
        },
      });
    } else {
      return NextResponse.json({
        status: 404,
        message: "Pool not found",
        body: {
          data: null,
        },
      });
    }
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { message: "Failed to save data" },
      { status: 500 }
    );
  }
}
