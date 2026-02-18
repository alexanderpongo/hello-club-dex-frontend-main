"use client";

import React, { useEffect, useState, useRef, memo, useMemo } from "react";
import { useSwapStore } from "@/store/useDexStore";
import { useTheme } from "next-themes";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";

// type DexPair = {
//   pairAddress: string;
//   priceUsd?: number;
//   liquidity?: { usd?: number };
// };

// type CheckResult = {
//   existsForAddr: boolean; // does THIS pairAddr exist & have price?
//   matchingPair: DexPair | null; // the exact pair if found
//   highestLiquidityPair: DexPair | null; // best among returned pairs
// };

// async function checkPairHasData(
//   chain: string,
//   addr: string
// ): Promise<CheckResult> {
//   const url = `https://api.dexscreener.com/latest/dex/pairs/${chain}/${addr}`;

//   try {
//     const res = await fetch(url);
//     if (!res.ok) {
//       return {
//         existsForAddr: false,
//         matchingPair: null,
//         highestLiquidityPair: null,
//       };
//     }

//     const data = await res.json();
//     const pair: DexPair | null = data?.pair || (data?.pairs?.[0] ?? null);

//     if (!pair || pair.priceUsd === undefined) {
//       return {
//         existsForAddr: false,
//         matchingPair: null,
//         highestLiquidityPair: null,
//       };
//     }

//     return {
//       existsForAddr: true,
//       matchingPair: pair,
//       highestLiquidityPair: pair,
//     };
//   } catch (e) {
//     console.error("DexScreener fetch error:", e);
//     return {
//       existsForAddr: false,
//       matchingPair: null,
//       highestLiquidityPair: null,
//     };
//   }
// }

interface DexChartProps {
  chainId: number;
}

function DexChart({ chainId }: DexChartProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { swapPairAddresses } = useSwapStore();
  const [validPairAddress, setValidPairAddress] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  const pairSymbol = useMemo(() => {
    switch (chainId) {
      case 56:
        return `bnb`;
      case 1:
        return `ether`;
      case 8453:
        return `base`;
      default:
        return "bnb";
    }
  }, [chainId]);

  // implementation that fetches liquidity data to find best pair
  // useEffect(() => {
  //   if (swapPairAddresses.length === 0) {
  //     setValidPairAddress(null);
  //     return;
  //   }

  //   (async () => {
  //     let best: { addr: string; usd: number } | null = null;

  //     // Optional: track all results for debugging
  //     const allPairs: { addr: string; liquidity: number }[] = [];

  //     for (const addr of swapPairAddresses) {
  //       const { highestLiquidityPair } = await checkPairHasData(
  //         pairSymbol,
  //         addr
  //       );

  //       const hlUsd = Number(highestLiquidityPair?.liquidity?.usd ?? 0);
  //       const hlAddr = highestLiquidityPair?.pairAddress ?? addr;

  //       allPairs.push({ addr: hlAddr, liquidity: hlUsd });

  //       if (!best || hlUsd > best.usd) {
  //         best = { addr: hlAddr, usd: hlUsd };
  //       }
  //     }

  //     setValidPairAddress(best?.addr ?? null);
  //   })();
  // }, [swapPairAddresses, pairSymbol]);

  // Simplified: Just use the first available pair address
  // DEXTools widget will handle displaying the chart data
  useEffect(() => {
    setValidPairAddress(swapPairAddresses[0] || null);
  }, [swapPairAddresses]);

  // Force iframe recreation on theme change to prevent browser history changes
  useEffect(() => {
    if (validPairAddress) {
      // Capture the current history length
      const currentLength = window.history.length;
      
      // Increment key to force iframe remount
      setIframeKey(prev => prev + 1);
      
      // After a short delay, check if history length increased and go back if it did
      setTimeout(() => {
        if (window.history.length > currentLength) {
          // History was added, go back to remove it
          window.history.go(-(window.history.length - currentLength));
        }
      }, 50);
    }
  }, [theme, validPairAddress]);

  // console.log("theme", theme);

  // https://dexscreener.com/bsc/0xE3fa57fbfD5430171eA06146DcB2404490BDee7D?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15
  const url = validPairAddress
    ?`https://www.dextools.io/widget-chart/en/${pairSymbol}/pe-light/${validPairAddress}?theme=${theme!}&chartType=1&chartResolution=30&drawingToolbars=false`
   : null;
   console.log("DexChart URL:", url);

  return (
    <div className="relative min-h-[490px]">
      {!validPairAddress && (
        <div className="flex justify-center items-center w-full  min-w-[380px] md:min-w-[550px] h-full">
          <Loader2 size={24} className="animate-spin h-10 w-10" />
        </div>
      )}
      {validPairAddress && (
        <div
          className="tradingview-widget-container !w-full  min-w-[380px] md:min-w-[550px] h-fit overflow-hidden"
          ref={containerRef}
          id="tradingview-chart"
        >
          {/* <iframe
            src={url!}
            width="100%"
            height="400"
            className="rounded-xl !w-full min-w-[380px] md:min-w-[550px] h-[490px]"
            style={{ border: "none" }}
            allowFullScreen
          ></iframe> */}
          <iframe 
            key={iframeKey}
            ref={iframeRef}
            id="dextools-widget"
            title="DEXTools Trading Chart"
            width="100%" 
            height="400"
            src={url!}
            className="!w-full min-w-[380px] md:min-w-[550px] h-[490px]"
            style={{ border: "none" }}
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

export default memo(DexChart);
