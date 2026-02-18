"use client";

import Navbar from "@/components/layout/Navbar";
import LockDashboardHeader from "@/components/lock/LockDashboardHeader";
import LockDetailsSection from "@/components/lock/LockDetailsSection";
import LockTabsSection from "@/components/lock/LockTabsSection";

export default function Home() {
  return (
    <div>
      <div className="container top-0 ">
        <Navbar />
      </div>

      <div className="container mx-auto mt-10 xl:mt-20 max-w-6xl">
        <div className="flex flex-col justify-center items-center my-2 mx-auto">
          <LockDashboardHeader />
          <LockDetailsSection />
          <LockTabsSection />
        </div>
      </div>
    </div>
  );
}
