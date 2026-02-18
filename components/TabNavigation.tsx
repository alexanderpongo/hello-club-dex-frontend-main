"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUrlState, useUrlStateManager } from "@/hooks/useUrlState";
import { useSimpleUrlState } from "@/hooks/useSimpleUrlState";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, memo } from "react";
import { Loader2 } from "lucide-react";
import SwapWidget from "@/components/evm/SwapWidget";
import LPView from "@/components/evm/lp/LPView";
import PoolsView from "@/components/evm/pools/PoolsView";
import { SwapInterface } from "@/components/SwapInterface";
import ClientOnlyWrapper from "@/components/ClientOnlyWrapper";

const VALID_TABS = ["trade", "lp", "pool"];
type TabValue = typeof VALID_TABS[number];

interface TabNavigationProps {
  onTabChange?: (tab: TabValue) => void;
}

// Memoize individual tab content components
const TradeTabContent = memo(() => {
  return (
    <TabsContent value="trade" className="mt-[-1px] py-2">
      <ClientOnlyWrapper>
        <SwapInterface />
      </ClientOnlyWrapper>
    </TabsContent>
  );
});

const LPTabContent = memo(() => {
  return (
    <TabsContent value="lp" className="mt-[-1px] py-2">
      <ClientOnlyWrapper>
        <LPView />
      </ClientOnlyWrapper>
    </TabsContent>
  );
});

const PoolTabContent = memo(() => {
  return (
    <TabsContent value="pool" className="mt-[-1px] py-2">
      <ClientOnlyWrapper>
        <Suspense
          fallback={
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          }
        >
          <PoolsView />
        </Suspense>
      </ClientOnlyWrapper>
    </TabsContent>
  );
});

TradeTabContent.displayName = "TradeTabContent";
LPTabContent.displayName = "LPTabContent";
PoolTabContent.displayName = "PoolTabContent";

export const TabNavigation = memo(({ onTabChange }: TabNavigationProps) => {
  const router = useRouter();
  const { updateMultipleParams, clearParams } = useUrlStateManager();

  // Use simplified URL state to avoid infinite loops
  const [activeTab, setActiveTab] = useSimpleUrlState("tab", "trade");

  const handleTabChange = useCallback((value: string) => {
    // Validate the tab value
    if (!VALID_TABS.includes(value)) {
      console.warn(`Invalid tab value: ${value}`);
      return;
    }

    const newTab = value as TabValue;

    setActiveTab(newTab);
    onTabChange?.(newTab);

    // Handle navigation for pools tab
    if (newTab === "pool") {
      router.push("/pools", { scroll: false });
    } else {
      // Clear swap-specific parameters when switching away from trade tab
      if (newTab !== "trade") {
        clearParams(["from", "to", "amount", "contribute"]);
      }
    }
  }, [setActiveTab, onTabChange, router, clearParams]);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="bg-transparent space-y-5">
      <TabsList className="flex justify-center items-center mx-auto bg-black/10 dark:bg-white/5 w-full md:w-[550px] rounded-xl h-[48px]">
        <TabsTrigger
          value="trade"
          className="w-full font-formula h-[40px] navbar-text uppercase flex justify-center items-center"
        >
          Swap
        </TabsTrigger>
        <TabsTrigger
          value="lp"
          className="w-full font-formula h-[40px] navbar-text uppercase flex justify-center items-center"
        >
          Add Liquidity
        </TabsTrigger>
        <TabsTrigger
          value="pool"
          className="w-full font-formula h-[40px] navbar-text uppercase flex justify-center items-center"
        >
          Pools
        </TabsTrigger>
      </TabsList>

      <TradeTabContent />
      <LPTabContent />
      <PoolTabContent />
    </Tabs>
  );
});

TabNavigation.displayName = "TabNavigation";
