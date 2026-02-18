"use client";

import React, { useEffect, useState, useRef, memo, useMemo } from "react";
import { useSwapStore } from "@/store/useDexStore";
import { useTheme } from "next-themes";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";

type DexPair = {
  pairAddress: string;
  priceUsd?: number;
  liquidity?: { usd?: number };
};

type CheckResult = {
  existsForAddr: boolean; // does THIS pairAddr exist & have price?
  matchingPair: DexPair | null; // the exact pair if found
  highestLiquidityPair: DexPair | null; // best among returned pairs
};

async function checkPairHasData(
  chain: string,
  addr: string
): Promise<CheckResult> {
  const url = `https://api.dexscreener.com/latest/dex/pairs/${chain}/${addr}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return {
        existsForAddr: false,
        matchingPair: null,
        highestLiquidityPair: null,
      };
    }

    const data = await res.json();
    const pairs: DexPair[] = Array.isArray(data?.pairs)
      ? data.pairs
      : data?.pair
        ? [data.pair]
        : [];

    if (pairs.length === 0) {
      return {
        existsForAddr: false,
        matchingPair: null,
        highestLiquidityPair: null,
      };
    }

    const matchingPair =
      pairs.find((p) => p.pairAddress?.toLowerCase() === addr.toLowerCase()) ||
      null;

    const highestLiquidityPair = pairs.reduce((max, cur) => {
      const maxUsd = Number(max?.liquidity?.usd ?? 0);
      const curUsd = Number(cur?.liquidity?.usd ?? 0);
      return curUsd > maxUsd ? cur : max;
    });

    const existsForAddr = !!(
      matchingPair && matchingPair.priceUsd !== undefined
    );

    return {
      existsForAddr,
      matchingPair,
      highestLiquidityPair: highestLiquidityPair || null,
    };
  } catch (e) {
    console.error("DexScreener fetch error:", e);
    return {
      existsForAddr: false,
      matchingPair: null,
      highestLiquidityPair: null,
    };
  }
}

function TradingViewWidget() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const { chainId } = useAccount();
  const { swapPairAddresses } = useSwapStore();
  const [validPairAddress, setValidPairAddress] = useState<string | null>(null);

  const pairSymbol = useMemo(() => {
    switch (chainId) {
      case 56:
        return `bsc`;
      case 1:
        return `eth`;
      case 8453:
        return `base`;
      default:
        return "bsc";
    }
  }, [chainId]);

  useEffect(() => {
    console.log("swapPairAddresses", swapPairAddresses);

    if (swapPairAddresses.length === 0) {
      setValidPairAddress(null);
      return;
    }

    (async () => {
      let best: { addr: string; usd: number } | null = null;

      // Optional: track all results for debugging
      const allPairs: { addr: string; liquidity: number }[] = [];

      for (const addr of swapPairAddresses) {
        const { highestLiquidityPair } = await checkPairHasData(
          pairSymbol,
          addr
        );

        const hlUsd = Number(highestLiquidityPair?.liquidity?.usd ?? 0);
        const hlAddr = highestLiquidityPair?.pairAddress ?? addr;

        allPairs.push({ addr: hlAddr, liquidity: hlUsd });

        if (!best || hlUsd > best.usd) {
          best = { addr: hlAddr, usd: hlUsd };
        }
      }

      // Sort for debugging
      // console.log(
      //   "All candidate pairs sorted by liquidity:",
      //   allPairs.sort((a, b) => b.liquidity - a.liquidity)
      // );

      setValidPairAddress(best?.addr ?? null);
    })();
  }, [swapPairAddresses, pairSymbol]);

  // console.log("chart theme", theme);

  // https://dexscreener.com/bsc/0xE3fa57fbfD5430171eA06146DcB2404490BDee7D?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15
  const url = validPairAddress
    ? `https://dexscreener.com/${pairSymbol}/${validPairAddress}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chart=1&chartLeftToolbar=0&chartTheme=${theme!}&theme=${theme!}&chartStyle=0&chartType=usd&interval=15`
    : null;

  return (
    <div className="rounded-xl border !card-primary !p-[1px] shadow border-black/5 dark:border-white/10 relative !min-h-[478px]">
      {!validPairAddress && (
        <div className="flex justify-center items-center w-full  min-w-[380px] md:min-w-[550px] h-full">
          <Loader2 size={24} className="animate-spin h-10 w-10" />
        </div>
      )}
      {validPairAddress && (
        <div
          className="tradingview-widget-container !w-full  min-w-[380px] md:min-w-[550px] h-fit rounded-xl overflow-hidden"
          ref={containerRef}
          id="tradingview-chart"
        >
          <iframe
            src={url!}
            width="100%"
            height="476"
            className="rounded-xl !w-full min-w-[380px] md:min-w-[550px] h-[476px]"
            style={{ border: "none" }}
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
}

export default memo(TradingViewWidget);
