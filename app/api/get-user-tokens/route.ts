import { NextRequest, NextResponse } from "next/server";
import { Address } from "viem";

const chainIdToNetwork: { [key: number]: string } = {
  1: "eth-mainnet",
  56: "bnb-mainnet",
  8453: "base-mainnet",
  97: "bnb-testnet",
};

interface CoinGeckoToken {
  id: string;
  symbol: string;
  name: string;
}

let coinGeckoTokenListCache: CoinGeckoToken[] | null = null;

async function getCoinGeckoTokenList(): Promise<CoinGeckoToken[]> {
  if (coinGeckoTokenListCache) {
    return coinGeckoTokenListCache;
  }

  try {
    const response = await fetch("https://api.coingecko.com/api/v3/coins/list");
    if (!response.ok) {
      console.error(
        "Failed to fetch CoinGecko token list:",
        response.statusText
      );
      return [];
    }
    const tokenList = await response.json();
    coinGeckoTokenListCache = tokenList;
    return tokenList;
  } catch (error) {
    console.error("Error fetching CoinGecko token list:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, chainId } = await request.json();

    if (!address || !chainId) {
      return NextResponse.json(
        { error: "Address and chainId are required" },
        { status: 400 }
      );
    }

    const alchemyApiUrl = process.env.ALCHEMY_PORTFOLIO_API_URL;
    if (!alchemyApiUrl) {
      console.error(
        "ALCHEMY_PORTFOLIO_API_URL is not set in environment variables."
      );
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const networkName = chainIdToNetwork[chainId];
    if (!networkName) {
      return NextResponse.json(
        { error: `Unsupported chainId: ${chainId}` },
        { status: 400 }
      );
    }

    // Fetch user's tokens from Alchemy Portfolio API
    const alchemyResponse = await fetch(alchemyApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        addresses: [
          {
            address: address,
            networks: [networkName],
          },
        ],
      }),
    });

    if (!alchemyResponse.ok) {
      const errorData = await alchemyResponse.text();
      console.error("Alchemy API request failed:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch token balances from Alchemy" },
        { status: alchemyResponse.status }
      );
    }

    const alchemyData = await alchemyResponse.json();
    let userTokens = alchemyData.data.tokens;

    if (!Array.isArray(userTokens)) {
      console.error("userTokens is not an array:", userTokens);
      return NextResponse.json(
        { error: "Invalid data structure from Alchemy API" },
        { status: 500 }
      );
    }

    // console.log(
    //   "Fetched user tokens from Alchemy (before de-duplication):",
    //   JSON.stringify(userTokens, null, 2)
    // );

    // De-duplicate tokens based on tokenAddress
    const uniqueTokensMap = userTokens.reduce((acc, current) => {
      if (!acc.has(current.tokenAddress)) {
        acc.set(current.tokenAddress, current);
      }
      return acc;
    }, new Map<string, any>());
    userTokens = Array.from(uniqueTokensMap.values());

    // console.log(
    //   "User tokens after de-duplication:",
    //   JSON.stringify(userTokens, null, 2)
    // );

    // Fetch CoinGecko token list for validation
    const coinGeckoTokenList = await getCoinGeckoTokenList();
    const validTokenSymbols = new Set(
      coinGeckoTokenList
        .map((t) => (t.symbol ? t.symbol.toLowerCase() : null))
        .filter((s) => s !== null)
    );

    // Filter out scam tokens
    const filteredTokens = userTokens.filter((token: any) => {
      return (
        token.tokenMetadata &&
        typeof token.tokenMetadata.symbol === "string" &&
        validTokenSymbols.has(token.tokenMetadata.symbol.toLowerCase())
      );
    });

    // Extract symbols to fetch logos
    const symbols = filteredTokens.map(
      (token: any) => token.tokenMetadata.symbol
    );

    let logoMap: { [symbol: string]: string } = {};
    if (symbols.length > 0) {
      try {
        const logoResponse = await fetch(
          new URL("/api/cmc/get-token-metadata", request.url),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ symbols }),
          }
        );
        if (logoResponse.ok) {
          logoMap = await logoResponse.json();
        }
      } catch (error) {
        console.error("Failed to fetch logos from CMC route:", error);
      }
    }

    // Format the response
    const formattedTokens = filteredTokens.map((token: any) => ({
      chainId: parseInt(chainId),
      address: token.tokenAddress as Address,
      name: token.tokenMetadata.name,
      symbol: token.tokenMetadata.symbol,
      decimals: token.tokenMetadata.decimals,
      logoURI: logoMap[token.tokenMetadata.symbol] || token.tokenMetadata.logo,
      balance: token.tokenBalance,
    }));

    // console.log(
    //   "Final formatted tokens being sent to frontend:",
    //   JSON.stringify(formattedTokens, null, 2)
    // );

    return NextResponse.json(formattedTokens);
  } catch (error) {
    console.error("Error in get-user-tokens route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
