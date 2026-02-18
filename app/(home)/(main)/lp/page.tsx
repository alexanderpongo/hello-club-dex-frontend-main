import LiquidityPoolView from "@/components/lp-revamp/LiquidityPoolView";
import { Suspense } from "react";

export default function LPPage() {
  return (
    <div className="container mx-auto w-full">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <LiquidityPoolView />
      </Suspense>
    </div>
  );
}
