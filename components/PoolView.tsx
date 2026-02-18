"use client";
import PairDetails from "@/components/evm/pools/PairDetails";
import React, { Suspense } from "react";
import { useSwapStore } from "@/store/useDexStore";
import { Loader2 } from "lucide-react";

interface PoolPageProps {
  params: {
    id: string;
  };
}

function MainView({ params }: PoolPageProps) {
  const { id } = params;
  const { dataRow } = useSwapStore();

  // Show loading state if dataRow is being cleared
  if (!dataRow && id) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto mt-10 ">
        <div className="pt-0.5">
          <div className="flex justify-center items-center my-2 w-full">
            <div className="flex flex-row justify-center w-full p-3 py-5 rounded-xl">
              <Suspense
                fallback={
                  <div className="flex justify-center items-center">
                    <Loader2 className="animate-spin h-6 w-6" />
                  </div>
                }
              >
                <div>
                  <PairDetails id={id} />
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainView;
