import PoolsView from "@/components/evm/pools/PoolsView";
import React, { Suspense } from "react";

export default function PoolPage() {
  return (
    <div className="flex justify-center">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <PoolsView />
      </Suspense>
    </div>
  );
}
