import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url, request } = (await req.json()) as {
    url: string;
    request: any;
  };

  if (!url || !request) {
    return NextResponse.json(
      { message: "Missing request params or url" },
      { status: 400 }
    );
  }

  try {
    // const response = await axios.post(url, request);
    const response = await axios.post(url, request, {
      headers: { "Content-Type": "application/json" },
    });
    const bestRoute = response?.data.bestRoute;
    console.log("route data", response.data);
    console.log("bestRoute", bestRoute);

    if (!bestRoute) {
      return NextResponse.json(
        { message: "No best route data found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "success", data: bestRoute });
  } catch (error: any) {
    console.error("Axios Error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      // url: url,
    });
    return NextResponse.json(
      { message: "Failed to fetch or process data", error: error.message },
      { status: 500 }
    );
  }
}
