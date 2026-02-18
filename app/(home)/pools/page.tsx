import PoolsView from "@/components/pools/pools-main/PoolsView";
import { Suspense } from "react";

export default function PoolsPage() {
  return (
    <div className="container mx-auto mt-32 md:mt-24 xl:mt-28 w-full">
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
