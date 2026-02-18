"use client";
// import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SwapWidget from "@/components/evm/SwapWidget";
import LPView from "@/components/evm/lp/LPView";
import PoolsView from "@/components/evm/pools/PoolsView";
import HomeBg from "@/components/HomeBg";
import Navbar from "@/components/layout/Navbar";
import { OnboardingModal } from "@/components/evm/OnboardingModal";
import { Suspense } from "react";

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

export default function Home() {
  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-20 bg-gradient-to-b from-black">
        <div className="container ">
          <Navbar />
        </div>
      </div>
      {/* <HomeBg /> */}
      <div className="container mx-auto mt-10 xl:mt-20">
        <div className="pt-0.5">
          <div className="flex justify-center items-center my-2 w-full ">
            <div className="flex flex-row justify-center w-full p-3 py-5 rounded-xl ">
              <Suspense fallback={null}>
                <OnboardingModal />
              </Suspense>
              <Tabs defaultValue="lp" className="  bg-transparent space-y-5">
                <TabsList className="flex justify-center items-center mx-auto bg-black/10 dark:bg-white/5 w-full  md:w-[550px] rounded-xl h-[48px] ">
                  <TabsTrigger
                    value="trade"
                    className="w-full font-formula  h-[40px] navbar-text uppercase flex justify-center items-center"
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
                <TabsContent value="trade" className="mt-[-1px] py-2">
                  <div className="flex flex-row w-full gap-4">
                    {/* <EmbedChart /> */}
                    <Suspense fallback={
                      <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      </div>
                    }>
                      <SwapWidget />
                    </Suspense>
                  </div>
                </TabsContent>
                <TabsContent value="lp" className="mt-[-1px] py-2 ">
                  <Suspense fallback={null}>
                    <LPView />
                  </Suspense>
                </TabsContent>
                <TabsContent value="pool" className="mt-[-1px] py-2 ">
                  {/* <Suspense fallback={
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  }> */}
                  <PoolsView />
                  {/* </Suspense> */}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
