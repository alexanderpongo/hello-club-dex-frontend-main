"use client";
import React, { useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AllPools from "@/components/pools/pools-main/AllPools";
import MyPositions from "@/components/pools/pools-main/MyPositions";
import { useRouter } from "next/navigation";
import { useSimpleUrlState } from "@/hooks/useSimpleUrlState";
import { Plus } from "lucide-react";

const VALID_TABS = ["all-pools", "my-positions"] as const;
type TabValue = (typeof VALID_TABS)[number];

const DEFAULT_TAB: TabValue = "all-pools";

const PoolsView = () => {
  const router = useRouter();

  // Use lightweight URL state hook (history.replace) for performance
  const [urlTab, setUrlTab] = useSimpleUrlState("pools-tab", DEFAULT_TAB);

  // Validate the tab from URL; fall back if invalid
  const currentTab: TabValue = useMemo(() => {
    return VALID_TABS.includes(urlTab as TabValue)
      ? (urlTab as TabValue)
      : DEFAULT_TAB;
  }, [urlTab]);

  const handleTabChange = useCallback(
    (value: string) => {
      if (!VALID_TABS.includes(value as TabValue)) {
        setUrlTab(DEFAULT_TAB);
        return;
      }
      setUrlTab(value);
    },
    [setUrlTab]
  );

  // Navigate to create-pool page preserving current tab in history so user can come back with same tab
  const goToCreatePool = useCallback(() => {
    // Persist tab in URL before navigation so browser back keeps it
    setUrlTab(currentTab);
    router.push(`/lp?pools-tab=${currentTab}`);
  }, [router, currentTab, setUrlTab]);
  return (
    <div className="flex flex-col w-full min-h-screen space-y-6">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="title-large-semi-bold uppercase">
            POOLS
          </h1>
          <p className="text-xs font-lato font-normal dark:text-[#a3a3a3] text-gray-500 tracking-wider">
            Provide liquidity and earn trading fees across multiple chains and asset pairs
          </p>
        </div>
        <div className="sm:flex space-y-4 sm:space-y-0 w-full justify-between items-end">
          <TabsList className="p-1 text-muted-foreground bg-black/10 dark:bg-white/5 w-full md:w-[450px] rounded-xl h-[48px] border-0">
            <TabsTrigger
              value="all-pools"
              className="rounded-sm whitespace-nowrap px-6 py-1 text-[18px] font-formula uppercase flex justify-center items-center w-full h-[40px] transition-all data-[state=active]:bg-[#C2FE0C26] data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-[#C2FE0C2E] data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-white/10 data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#ffffff99]"
            >
              ALL POOLS
            </TabsTrigger>
            <TabsTrigger
              value="my-positions"
              className="rounded-sm whitespace-nowrap px-6 py-1 text-[18px] font-formula uppercase flex justify-center items-center w-full h-[40px] transition-all data-[state=active]:bg-[#C2FE0C26] data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-[#C2FE0C2E] data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-white/10 data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#ffffff99]"
            >
              MY POSITIONS
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-col sm:flex-row sm:gap-4 gap-2">
            <Button
              variant="outline"
              className="rounded-full border-primary/50 text-primary hover:bg-primary hover:text-black font-lato font-normal px-6 h-10"
            >
              CLAIM YIELD
            </Button>
            {/* create pool */}
            <Button
              onClick={goToCreatePool}
              className="rounded-full bg-primary text-black hover:bg-primary/80 font-lato font-normal px-6 h-10"
            >
              <Plus className="w-4 h-4 mr-2" /> CREATE NEW LP
            </Button>
          </div>
        </div>

        <div className="w-full">
          <TabsContent value="all-pools">
            <AllPools />
          </TabsContent>
          <TabsContent value="my-positions">
            <MyPositions />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default PoolsView;
