"use client";

import React, { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimpleUrlState } from "@/hooks/useSimpleUrlState";
import dynamic from "next/dynamic";

const ApeBondsComp = dynamic(
    () => import("@/components/ape-bonds/ApeBondsComp"),
    { ssr: false }
);

const AddingLPToBond = dynamic(
    () => import("@/components/ape-bonds/adding-lp/AddingLPToBond"),
    { ssr: false }
);

const VALID_TABS = ["buy-bond", "add-lp"] as const;
type TabValue = (typeof VALID_TABS)[number];
const DEFAULT_TAB: TabValue = "add-lp";

const BondsView = () => {
    const [urlTab, setUrlTab] = useSimpleUrlState("tab", DEFAULT_TAB);

    const currentTab: TabValue = useMemo(() => {
        return VALID_TABS.includes(urlTab as TabValue)
            ? (urlTab as TabValue)
            : DEFAULT_TAB;
    }, [urlTab]);

    const handleTabChange = (value: string) => {
        setUrlTab(value);
    };

    return (
        <div className="flex flex-col w-full min-h-screen space-y-4 md:space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-[2.5rem] font-formula font-normal uppercase text-primary leading-tight">
                    EARN
                </h1>
                <p className="text-[9px] md:text-xs font-lato font-normal dark:text-[#a3a3a3] text-gray-500 tracking-wider">
                    Maximize your yields through strategic bond programs and liquidity provision.
                </p>
            </div>

            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full space-y-4 md:space-y-6">
                <TabsList className="p-1 items-center bg-black/10 dark:bg-white/5 w-full md:w-[450px] rounded-xl h-[44px] md:h-[48px] border-0">
                    <TabsTrigger
                        value="add-lp"
                        className="w-full font-formula h-[36px] md:h-[40px] text-[14px] md:text-[18px] uppercase flex justify-center items-center transition-all data-[state=active]:bg-[#C2FE0C26] data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-[#C2FE0C2E] data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-white/10 data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#ffffff99]"
                    >
                        ADD LP TO BOND
                    </TabsTrigger>
                    <TabsTrigger
                        value="buy-bond"
                        className="w-full font-formula h-[36px] md:h-[40px] text-[14px] md:text-[18px] uppercase flex justify-center items-center transition-all data-[state=active]:bg-[#C2FE0C26] data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-[#C2FE0C2E] data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-white/10 data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#ffffff99]"
                    >
                        BUY BOND
                    </TabsTrigger>
                </TabsList>

                <div className="w-full">
                    <TabsContent value="add-lp" className="mt-0 outline-none">
                        <AddingLPToBond />
                    </TabsContent>
                    <TabsContent value="buy-bond" className="mt-0 outline-none">
                        <ApeBondsComp />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default BondsView;
