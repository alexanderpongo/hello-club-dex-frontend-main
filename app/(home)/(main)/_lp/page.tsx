import LPView from "@/components/evm/lp/LPView";
import { Suspense } from "react";

export default function LPPage() {
  return (
    <div className="flex justify-center container">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <LPView />
      </Suspense>
    </div>
  );
}
