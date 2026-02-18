import { Suspense } from "react";
import TradingLiveView from "@/components/trading-live/TradingLiveView";

export default function Page() {
  return (
    <div className="mx-auto mt-32 md:mt-24 xl:mt-28 w-full container">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <TradingLiveView />
      </Suspense>
    </div>
  );
}
