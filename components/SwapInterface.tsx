"use client";

import { useEffect, useState, memo, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useSwapStore } from "@/store/useDexStore";
import SwapWidget from "@/components/evm/SwapWidget";
import EmbedChart from "@/components/evm/EmbedChart";

// Memoize chart component to prevent unnecessary re-renders
const ChartSection = memo(({ isLoading }: { isLoading: boolean }) => {
  return (
    <div className="order-2 md:order-1 !w-full md:min-w-[550px] h-full flex justify-center">
      {isLoading ? (
        <div className="flex justify-center items-center my-auto mx-auto">
          <Loader2 size={24} className="animate-spin h-10 w-10" />
        </div>
      ) : (
        <EmbedChart />
      )}
    </div>
  );
});

ChartSection.displayName = "ChartSection";

// Memoize swap widget section
const SwapWidgetSection = memo(({ shouldShowChart }: { shouldShowChart: boolean }) => {
  return (
    <div
      className={`order-1 md:order-2 ${shouldShowChart ? "w-full" : "w-full md:w-[550px]"
        }`}
    >
      <SwapWidget />
    </div>
  );
});

SwapWidgetSection.displayName = "SwapWidgetSection";

export const SwapInterface = memo(() => {
  const { fromToken, toToken, swapPairAddress } = useSwapStore();
  const [isLoading, setIsLoading] = useState(false);

  // Memoize chart visibility calculation
  const shouldShowChart = useMemo(() => {
    return Boolean(fromToken &&
      toToken &&
      swapPairAddress !== "" &&
      swapPairAddress !== "0x0000000000000000000000000000000000000000");
  }, [fromToken, toToken, swapPairAddress]);

  useEffect(() => {
    if (fromToken && toToken) {
      setIsLoading(true);

      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      return () => clearTimeout(timeout);
    } else {
      setIsLoading(false);
    }
  }, [fromToken, toToken]);

  // Memoize container class
  const containerClass = useMemo(() => {
    return `flex flex-col md:flex-row min-w-[360px] !w-full gap-4 ${!shouldShowChart ? "md:justify-center md:items-center" : ""
      }`;
  }, [shouldShowChart]);

  return (
    <div className={containerClass}>
      {/* Chart Section */}
      {shouldShowChart && <ChartSection isLoading={isLoading} />}

      {/* Swap Widget Section */}
      <SwapWidgetSection shouldShowChart={shouldShowChart} />
    </div>
  );
});

SwapInterface.displayName = "SwapInterface";
