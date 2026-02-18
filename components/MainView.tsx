"use client";
import SwapWidget from "@/components/evm/SwapWidget";
import EmbedChart from "@/components/evm/EmbedChart";
import { OnboardingModal } from "@/components/evm/OnboardingModal";
import { ReferralWalletConnectModal } from "@/components/evm/ReferralWalletConnectModal";
import { useSwapStore } from "@/store/useDexStore";
import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useReferralRegistration } from "@/hooks/useReferralRegistration";

// Wrapper component for referral registration
function ReferralHandler() {
  useReferralRegistration();
  return null;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const { fromToken, toToken, swapPairAddress } = useSwapStore();

  useEffect(() => {
    if (fromToken && toToken) {
      setIsLoading(true);

      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [fromToken, toToken]);

  return (
    <div>

      <Suspense fallback={null}>
        <ReferralHandler />
      </Suspense>

      <div className="container mx-auto  ">
        <div className="pt-0.5">
          <div className="flex justify-center items-center my-2 w-full ">
            <div className="flex flex-row justify-center w-full p-3 py-5 rounded-xl ">
              <Suspense
                fallback={
                  <div className="flex justify-center items-center">
                    <Loader2 className="animate-spin h-6 w-6" />
                  </div>
                }
              >
                <div
                  className={`flex flex-col md:flex-row min-w-[360px] !w-full gap-4 ${!fromToken ||
                    !toToken ||
                    swapPairAddress === "" ||
                    swapPairAddress ===
                    "0x0000000000000000000000000000000000000000"
                    ? "md:justify-center md:items-center"
                    : ""
                    }`}
                >
                  {fromToken &&
                    toToken &&
                    swapPairAddress !== "" &&
                    swapPairAddress !==
                    "0x0000000000000000000000000000000000000000" ? (
                    <div className="order-2 md:order-1 !w-full md:min-w-[550px] h-full flex justify-center">
                      {isLoading ? (
                        <div className="flex justify-center items-center my-auto mx-auto">
                          <Loader2
                            size={24}
                            className="animate-spin h-10 w-10"
                          />
                        </div>
                      ) : (
                        <EmbedChart />
                      )}
                    </div>
                  ) : null}

                  <div
                    className={`order-1 md:order-2 ${!fromToken ||
                      !toToken ||
                      swapPairAddress === "" ||
                      swapPairAddress ===
                      "0x0000000000000000000000000000000000000000"
                      ? "w-full md:w-[550px]"
                      : "w-full"
                      }`}
                  >
                    <SwapWidget />
                  </div>
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <OnboardingModal />
        <ReferralWalletConnectModal />
      </Suspense>
    </div>
  );
}
