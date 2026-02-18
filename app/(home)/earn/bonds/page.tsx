import dynamic from "next/dynamic";
import { Suspense } from "react";

const BondsView = dynamic(
  () => import("@/components/ape-bonds/BondsView"),
  { ssr: false }
);

export default function BondsPage() {
  return (
    <div className="container mx-auto mt-32 md:mt-24 xl:mt-28 w-full">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <BondsView />
      </Suspense>
    </div>
  );
}
