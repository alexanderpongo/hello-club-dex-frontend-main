import { NextResponse } from "next/server";

export async function GET() {
  const moralisApiKey = process.env.MORALIS_API_KEY;

  if (!moralisApiKey) {
    return NextResponse.json(
      { error: "MORALIS_API_KEY is not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({ apiKey: moralisApiKey });
}
