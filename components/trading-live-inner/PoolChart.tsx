"use client";

import React, { useEffect, useRef, memo } from "react";
import TradingViewWidget from "@/components/evm/EmbedChart";
import { useSwapStore } from "@/store/useDexStore";
import { Loader2 } from "lucide-react";
import DexChart from "./DexChart";

type PoolChartProps = {
  poolAddress?: string | null;
  height?: number;
  chainId: number;
};

// Drives the existing TradingViewWidget by setting swapPairAddresses in the store
// so the widget renders the chart for the provided pool address.
const PoolChart: React.FC<PoolChartProps> = ({
  poolAddress,
  height = 490,
  chainId,
}) => {
  const { swapPairAddresses, setSwapPairAddresses } = useSwapStore();
  const prevAddressesRef = useRef<string[]>(swapPairAddresses);

  useEffect(() => {
    // Save the previous addresses only on first mount
    if (!prevAddressesRef.current) {
      prevAddressesRef.current = swapPairAddresses;
    }

    if (poolAddress && poolAddress.length > 0) {
      setSwapPairAddresses([poolAddress]);
    }

    // On unmount, restore previous addresses to avoid side effects
    return () => {
      setSwapPairAddresses(prevAddressesRef.current || []);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolAddress, setSwapPairAddresses]);

  if (!poolAddress) {
    return (
      <div className="flex justify-center items-center w-full min-h-[200px]">
        <Loader2 size={24} className="animate-spin h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* TradingViewWidget reads addresses from the store */}
      <DexChart chainId={chainId} />
    </div>
  );
};

export default memo(PoolChart);
