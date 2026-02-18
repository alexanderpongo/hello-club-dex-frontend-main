"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import LockDashboardHeader from "@/components/lock/LockDashboardHeader";
import LockDetailsSection from "@/components/lock/LockDetailsSection";
import LockHeader from "@/components/lock/LockHeader";
import LockSteps from "@/components/lock/LockSteps";
import LockTabsSection from "@/components/lock/LockTabsSection";
import PublicLocks from "@/components/lock/PublicLocks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Component that uses search params - needs to be wrapped in Suspense
function LockPageContent() {
  const searchParams = useSearchParams();
  const [tabValue, setTabValue] = useState<string>("dashboard");

  // Read step from URL parameter
  const stepParam = searchParams.get("step");
  const initialStep = stepParam ? parseInt(stepParam, 10) : undefined;

  // Set tab to "new" if step parameter is present and remove step param from URL
  useEffect(() => {
    if (initialStep && initialStep >= 3) {
      setTabValue("new");
    }

    // Remove step parameter from URL after reading it (only on client-side)
    if (stepParam && typeof window !== "undefined") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("step");
      const queryString = params.toString();
      const newUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;

      // Use browser History API directly to avoid triggering re-renders
      try {
        window.history.replaceState(null, "", newUrl);
      } catch (error) {
        console.warn("Failed to update URL:", error);
      }
    }
  }, [initialStep, stepParam, searchParams]);
  return (
    <div className="w-full">
      <div className="fixed top-0 left-0 right-0 z-20 bg-dark dark:bg-black">
        <div className="container mx-auto">
          <Navbar />
        </div>
      </div>

      <div className="container mx-auto mt-24 md:mt-24 xl:mt-28 w-full">
        <div className="w-full space-y-4 md:space-y-6">
          <Tabs
            defaultValue={"dashboard"}
            value={tabValue}
            className="space-y-4 md:space-y-6"
          >
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl md:text-[2.5rem] font-formula font-normal uppercase text-primary leading-tight">
                {tabValue === "dashboard" ? "My LOCKS" :
                  tabValue === "public" ? "Public LOCKS" :
                    "Create LIQUIDITY LOCK"}
              </h1>
              <p className="text-[9px] md:text-xs font-lato font-normal dark:text-[#a3a3a3] text-gray-500 tracking-wider uppercase">
                {tabValue === "dashboard" ? "Manage your locked liquidity and team tokens" :
                  tabValue === "public" ? "Browse and explore public liquidity locks across different protocols" :
                    "Lock your liquidity tokens to build trust with your community"}
              </p>
            </div>

            <div className="flex w-full justify-start overflow-x-auto pb-1 scrollbar-hide">
              <TabsList className="p-1 items-center bg-black/10 dark:bg-white/5 w-full md:w-[550px] rounded-xl h-[44px] md:h-[48px] border-0 shrink-0">
                <TabsTrigger
                  value="dashboard"
                  className="w-full font-formula h-[36px] md:h-[40px] text-[14px] md:text-[18px] uppercase flex justify-center items-center transition-all data-[state=active]:bg-[#C2FE0C26] data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-[#C2FE0C2E] data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-white/10 data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#ffffff99]"
                  onClick={() => setTabValue("dashboard")}
                >
                  Dashboard
                </TabsTrigger>

                <TabsTrigger
                  value="public"
                  className="w-full font-formula h-[36px] md:h-[40px] text-[14px] md:text-[18px] uppercase flex justify-center items-center transition-all data-[state=active]:bg-[#C2FE0C26] data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-[#C2FE0C2E] data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-white/10 data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#ffffff99]"
                  onClick={() => setTabValue("public")}
                >
                  Public
                </TabsTrigger>

                <TabsTrigger
                  value="new"
                  className="w-full font-formula h-[36px] md:h-[40px] text-[14px] md:text-[18px] uppercase flex justify-center items-center transition-all data-[state=active]:bg-[#C2FE0C26] data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-[#C2FE0C2E] data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-white/10 data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#ffffff99]"
                  onClick={() => setTabValue("new")}
                >
                  New Lock
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="w-full">
              <TabsContent
                value="dashboard"
                className="w-full !m-0"
              >
                <div className="space-y-6">
                  <LockDetailsSection />
                  <LockTabsSection setTabValue={setTabValue} />
                </div>
              </TabsContent>

              <TabsContent
                value="new"
                className="w-full !m-0"
              >
                <LockSteps initialStep={initialStep} />
              </TabsContent>

              <TabsContent
                value="public"
                className="w-full !m-0"
              >
                <PublicLocks />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <div className="dark:bg-black mt-20">
        <div className="container mx-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <LockPageContent />
    </Suspense>
  );
}
