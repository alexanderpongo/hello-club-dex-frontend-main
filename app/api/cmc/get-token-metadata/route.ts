import { NextRequest, NextResponse } from "next/server";

// In-memory cache for token logos
const logoCache = new Map<string, string>();

export async function POST(request: NextRequest) {
  try {
    const { symbols } = await request.json();

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        { error: "Symbols are required and must be a non-empty array" },
        { status: 400 }
      );
    }

    const cmcApiKey = process.env.CMC_API_KEY;
    if (!cmcApiKey) {
      console.error("CMC_API_KEY is not set in environment variables.");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const logoMap: { [symbol: string]: string } = {};
    const symbolsToFetch: string[] = [];

    // Check cache first
    for (const symbol of symbols) {
      if (logoCache.has(symbol)) {
        logoMap[symbol] = logoCache.get(symbol)!;
      } else {
        symbolsToFetch.push(symbol);
      }
    }

    if (symbolsToFetch.length > 0) {
      // console.log(
      //   `Fetching logos for symbols from cache: ${symbolsToFetch.join(",")}`
      // );

      const response = await fetch(
        `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?symbol=${symbolsToFetch.join(
          ","
        )}&aux=logo&skip_invalid=true`,
        {
          headers: {
            "X-CMC_PRO_API_KEY": cmcApiKey,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // console.log(
        //   "Received data from CMC API:",
        //   JSON.stringify(data, null, 2)
        // );
        if (data.data) {
          for (const symbol in data.data) {
            // The data object can contain arrays of tokens for a single symbol key
            const tokenData = data.data[symbol];
            const tokenInfo = Array.isArray(tokenData)
              ? tokenData[0]
              : tokenData;

            if (tokenInfo && tokenInfo.logo) {
              logoMap[tokenInfo.symbol] = tokenInfo.logo;
              logoCache.set(tokenInfo.symbol, tokenInfo.logo);
            }
          }
        }
      } else {
        const errorText = await response.text();
        console.error(
          `Failed to fetch from CMC API after retry: ${response.status} ${errorText}`
        );
      }
    }

    // console.log(
    //   "Final logoMap being sent from get-token-metadata:",
    //   JSON.stringify(logoMap, null, 2)
    // );
    return NextResponse.json(logoMap);
  } catch (error) {
    console.error("Error in get-token-metadata route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
