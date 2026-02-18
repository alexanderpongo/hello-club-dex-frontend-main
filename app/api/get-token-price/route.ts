import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // During static export, we can't use searchParams, so we return empty
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({
      data: {},
      status: {
        timestamp: new Date().toISOString(),
        error_code: 0,
        error_message: "",
        elapsed: 0,
        credit_count: 0
      }
    });
  }

  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_CMC_BASE_API;
  const apiKey = process.env.CMC_API_KEY;

  if (!baseUrl || !apiKey) {
    // Return empty if not configured instead of crashing dev
    return NextResponse.json({ data: {} });
  }

  try {
    const url = new URL("/v1/cryptocurrency/map", baseUrl);
    url.searchParams.set("symbol", symbol);

    const res = await fetch(url.toString(), {
      headers: { "X-CMC_PRO_API_KEY": apiKey },
      cache: "no-store",
    });

    if (!res.ok) return NextResponse.json({ data: {} });

    const body = await res.json();
    const item = body?.data?.[0];
    if (!item) return NextResponse.json({ data: {} });

    const convert = req.nextUrl.searchParams.get("convert") || "USD";
    const quotesUrl = new URL("/v3/cryptocurrency/quotes/latest", baseUrl);
    quotesUrl.searchParams.set("id", String(item.id));
    quotesUrl.searchParams.set("convert", convert);

    const quotesRes = await fetch(quotesUrl.toString(), {
      headers: { "X-CMC_PRO_API_KEY": apiKey },
      cache: "no-store",
    });
    const quotesBody = await quotesRes.json();
    return NextResponse.json(quotesBody);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
