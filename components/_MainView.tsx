"use client";
// import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SwapWidget from "@/components/evm/SwapWidget";
import LPView from "@/components/evm/lp/LPView";
import PoolsView from "@/components/evm/pools/PoolsView";
import HomeBg from "@/components/HomeBg";
import EmbedChart from "@/components/evm/EmbedChart";
import { OnboardingModal } from "@/components/evm/OnboardingModal";
import { useSwapStore } from "@/store/useDexStore";
import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
// import { SimpleOnboardingModal } from "./evm/SimpleOnboardingModal";
import { ReferralWalletConnectModal } from "./evm/ReferralWalletConnectModal";

// export const metadata: Metadata = {
//   description:
//     "This is your exclusive invitation to Hello Club—where you gain direct access to Killer Whales, premium investment opportunities, and a thriving Web3 community. Together, we’re shaping the future of decentralized wealth—for holders, founders, and projects alike. Sign up, lock your tokens, and start earning from our reward pool.",
//   twitter: {
//     description:
//       "This is your exclusive invitation to Hello Club—where you gain direct access to Killer Whales, premium investment opportunities, and a thriving Web3 community. Together, we’re shaping the future of decentralized wealth—for holders, founders, and projects alike. Sign up, lock your tokens, and start earning from our reward pool.",
//   },
//   openGraph: {
//     description:
//       "This is your exclusive invitation to Hello Club—where you gain direct access to Killer Whales, premium investment opportunities, and a thriving Web3 community. Together, we’re shaping the future of decentralized wealth—for holders, founders, and projects alike. Sign up, lock your tokens, and start earning from our reward pool.",
//   },
// };

// Component that uses search params - needs to be wrapped in Suspense
function TabsWithSearchParams() {
  const { chainId } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const { fromToken, toToken, swapPairAddress } = useSwapStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get initial tab from URL or default to "trade"
  const getInitialTab = (): string => {
    const tabParam = searchParams.get("tab");
    const validTabs = ["trade", "lp", "pool"];
    return validTabs.includes(tabParam || "") ? (tabParam as string) : "trade";
  };

  const [activeTab, setActiveTab] = useState(() => getInitialTab());

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    console.log("value", value);
    setActiveTab(value);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("tab", value);

    // Only delete swap-specific parameters when switching away from trade tab
    if (value !== "trade") {
      newSearchParams.delete("from");
      newSearchParams.delete("to");
      newSearchParams.delete("amount");
      newSearchParams.delete("contribute");
    }

    // For pools tab, redirect to a general pools page
    if (value === "pool") {
      router.push("/pools", { scroll: false });
    } else {
      // Keep other tabs on main page
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    }
  };

  // Initialize tab from URL on component mount and handle URL changes
  useEffect(() => {
    const currentTab = getInitialTab();
    setActiveTab(currentTab);

    // If no tab parameter in URL, ensure it's set to "trade" in the URL
    if (!searchParams.get("tab")) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("tab", "trade");
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (fromToken && toToken) {
      setIsLoading(true);

      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [fromToken, toToken]);

  return (
    <>
      <Suspense fallback={null}>
        {/* Using one step for now TODO */}
        <OnboardingModal />
        {/* <SimpleOnboardingModal /> */}
        <ReferralWalletConnectModal />
      </Suspense>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="bg-transparent space-y-5"
      >
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
        <TabsContent value="trade" className="mt-[-1px]  py-2">
          {/* <div className="flex flex-col md:flex-row min-w-[360px] !w-full gap-4">
            <div
              className="
                order-2 md:order-1 !w-full md:min-w-[550px] h-full flex justify-center"
            >
              {
                fromToken &&
                toToken &&
                swapPairAddress !== "" &&
                swapPairAddress !==
                  "0x0000000000000000000000000000000000000000" ? (
                  isLoading ? (
                    <div className="flex justify-center items-center my-auto mx-auto">
                      <Loader2 size={24} className="animate-spin h-10 w-10" />
                    </div>
                  ) : (
                    <EmbedChart />
                  )
                ) : null
                // shadcn Skeleton as placeholder
                // <Skeleton className="w-full h-[455px] md:min-w-[550px] bg-gray-200 dark:bg-[#1a1d21] rounded-md" />
              }
            </div>

            <div className="order-1 md:order-2 w-full">
              <SwapWidget />
            </div>
          </div> */}
          <div
            className={`flex flex-col md:flex-row min-w-[360px] !w-full gap-4 ${
              !fromToken ||
              !toToken ||
              swapPairAddress === "" ||
              swapPairAddress === "0x0000000000000000000000000000000000000000"
                ? "md:justify-center md:items-center"
                : ""
            }`}
          >
            {/* Chart Section */}
            {fromToken &&
            toToken &&
            swapPairAddress !== "" &&
            swapPairAddress !== "0x0000000000000000000000000000000000000000" ? (
              <div className="order-2 md:order-1 !w-full md:min-w-[550px] h-full flex justify-center">
                {isLoading ? (
                  <div className="flex justify-center items-center my-auto mx-auto">
                    <Loader2 size={24} className="animate-spin h-10 w-10" />
                  </div>
                ) : (
                  <EmbedChart />
                )}
              </div>
            ) : null}

            {/* Swap Widget Section */}
            <div
              className={`order-1 md:order-2 ${
                !fromToken ||
                !toToken ||
                swapPairAddress === "" ||
                swapPairAddress === "0x0000000000000000000000000000000000000000"
                  ? "w-full md:w-[550px]"
                  : "w-full"
              }`}
            >
              <SwapWidget />
            </div>
          </div>

          {/* <div className="flex flex-col md:flex-row w-full gap-4">
            {fromToken &&
              toToken &&
              swapPairAddress !== "" &&
              swapPairAddress !==
                "0x0000000000000000000000000000000000000000" &&
              (isLoading ? (
                <div className="flex justify-center items-center my-auto mx-auto">
                  <div className="flex w-full md:min-w-[550px] h-full justify-center">
                    <Loader2 size={24} className="animate-spin h-10 w-10" />
                  </div>
                </div>
              ) : (
                <EmbedChart />
              ))}
            <SwapWidget />

          </div> */}
        </TabsContent>
        <TabsContent value="lp" className="mt-[-1px] py-2">
          <LPView />
        </TabsContent>
        <TabsContent value="pool" className="mt-[-1px] py-2">
          <Suspense
            fallback={
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            }
          >
            <PoolsView />
          </Suspense>
        </TabsContent>
      </Tabs>
    </>
  );
}

export default function Home() {
  return (
    <div>
      {/* <HomeBg /> */}
      <div className="container mx-auto mt-10 xl:mt-20">
        <div className="pt-0.5">
          <div className="flex justify-center items-center my-2 w-full ">
            <div className="flex flex-row justify-center w-full p-3 py-5 rounded-xl ">
              <Suspense
                fallback={
                  <div className="flex justify-center items-center">
                    <Loader2 className="animate-spin h-6 w-6" />
                  </div>
                }
              >
                <TabsWithSearchParams />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
