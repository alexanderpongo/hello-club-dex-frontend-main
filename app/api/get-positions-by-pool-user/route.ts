import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { poolAddress, userAddress, chain } = body;
    console.log("body:", body);

    if (!poolAddress || !userAddress || !chain) {
      return NextResponse.json(
        { message: "Missing poolAddress or chain or userAddress" },
        { status: 400 }
      );
    }

    const url = `${process.env.NEXT_PUBLIC_TRADING_LIVE_BASE_API}/positions/${chain}/user/${userAddress}/pool/${poolAddress}`;

    const response = await axios.get(url);
    const data = response.data;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const axiosError = error as AxiosError;

    console.error("Error fetching positions:", axiosError.message);
    return NextResponse.json(
      {
        message: "Failed to fetch or process data",
        error: axiosError?.message,
      },
      { status: 500 }
    );
  }
}
