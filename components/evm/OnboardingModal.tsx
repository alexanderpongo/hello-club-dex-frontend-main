"use client";

import { useEffect, useState, Suspense } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import { useSwapStore } from "@/store/useDexStore";

const steps = [
  {
    title: "Welcome to DeFi Platform",
    content:
      "Your all-in-one platform for swapping tokens, providing liquidity, and managing your crypto assets across multiple blockchains.",
  },
  {
    title: "Swap Tokens Seamlessly",
    content:
      "Exchange tokens across multiple blockchains with competitive rates and minimal fees. Select your tokens, set your amount, and trade instantly with our intuitive interface.",
  },
  {
    title: "Lock Your Liquidity",
    content:
      "Build trust with your community by locking your liquidity provider tokens. Create time-locked contracts that automatically release at predetermined dates to demonstrate your long-term commitment.",
  },
  // {
  //   title: "Track Your Portfolio",
  //   content:
  //     "Monitor your assets, view transaction history, and analyze your DeFi performance all in one dashboard. Connect your wallet to get started and gain insights into your investments.",
  // },
];

// 👇 Array of video URLs (one per step)
// const videoUrls = [
//   "https://www.youtube.com/watch?v=LsT6LE52cu0",
//   "https://www.youtube.com/watch?v=qtR4a4bMblA",
//   "https://www.youtube.com/watch?v=lAkJi5J49MU",
//   "https://www.youtube.com/watch?v=LsT6LE52cu0",
// ];

const videoUrls = [
  process.env.NEXT_PUBLIC_VIDEO_URL_PROMO ||
    "https://www.youtube.com/watch?v=LsT6LE52cu0",
  process.env.NEXT_PUBLIC_VIDEO_URL_SWAP ||
    "https://www.youtube.com/watch?v=qtR4a4bMblA",
  process.env.NEXT_PUBLIC_VIDEO_URL_LP ||
    "https://www.youtube.com/watch?v=lAkJi5J49MU",
];

// Helper to convert YouTube URLs to embed URLs with API enabled
function getYouTubeEmbedUrl(url: string, autoplay = false) {
  const match = url.match(/(?:youtu\.be\/|v=)([^&]+)/);
  const videoId = match ? match[1] : "";
  if (!videoId) return url;

  const params = new URLSearchParams();
  if (autoplay) params.append("autoplay", "1");
  params.append("rel", "0");
  params.append("enablejsapi", "1"); // 👈 important for detecting video end

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function OnboardingModalInternal() {
  const { onboardingOpen, closeOnboarding, openOnboarding } = useSwapStore();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const autoplay = process.env.NEXT_PUBLIC_VIDEO_AUTOPLAY === "true";
  const videoUrl = getYouTubeEmbedUrl(videoUrls[step], autoplay);

  // Reset step when reopening
  useEffect(() => {
    if (onboardingOpen) setStep(0);
  }, [onboardingOpen]);

  // Auto-open onboarding on first visit
  useEffect(() => {
    if (shouldShowOnboarding(searchParams)) {
      openOnboarding();
    }
  }, [searchParams, openOnboarding]);

  // ✅ Listen for YouTube events (detect video end)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        typeof event.data === "object" &&
        event.data?.event === "onStateChange" &&
        event.data?.info === 0 // 0 = ended
      ) {
        if (step < steps.length - 1) {
          handleStepChange(step + 1);
        } else {
          finishOnboarding();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [step]);

  // ✅ Initialize iframe listener
  useEffect(() => {
    const iframe = document.getElementById(
      "onboarding-video"
    ) as HTMLIFrameElement;
    if (!iframe) return;

    iframe.onload = () => {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: "onboarding-video" }),
        "*"
      );
    };
  }, [step]);

  const handleStepChange = (newStep: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setStep(newStep);
      setTransitioning(false);
    }, 500);
  };

  const handleNext = () => {
    if (step < steps.length - 1) handleStepChange(step + 1);
    else finishOnboarding();
  };

  const handleBack = () => {
    if (step > 0) handleStepChange(step - 1);
  };

  const handleSkip = () => finishOnboarding();

  const finishOnboarding = () => {
    localStorage.setItem("dex_onboarding_done", "true");
    closeOnboarding();
  };

  return (
    <Dialog open={onboardingOpen} onOpenChange={closeOnboarding}>
      <DialogContent className="w-full bg-white dark:bg-dark max-w-2xl overflow-hidden border !border-white/10 dark:!border-white/10 p-0 !top-[42%]">
        <div className="dark:bg-black bg-black">
          {/* ✅ Video iframe */}
          {/* <iframe
            id="onboarding-video"
            className="rounded-md w-full h-80 object-cover"
            src={videoUrl}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups"
          /> */}
          <iframe
            id="onboarding-video"
            className="rounded-md w-full h-80 object-cover"
            src={videoUrl}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>

        <div className="w-full dark:bg-[#1A1A1A] flex flex-col h-[220px]">
          <div className="p-6 flex flex-col h-[220px] w-full">
            <div className="relative h-[140px] overflow-hidden">
              <div
                key={step}
                className="absolute inset-0 overflow-y-auto pr-2 transition-all duration-500 ease-in-out"
                style={{
                  opacity: transitioning ? 0 : 1,
                  transform: `translateY(${transitioning ? "10px" : "0px"})`,
                }}
              >
                <h2 className="text-2xl font-formula mb-3 text-black dark:text-white uppercase tracking-wider">
                  {steps[step].title}
                </h2>
                <p className="dark:text-gray-400 text-gray-600 text-sm leading-relaxed">
                  {steps[step].content}
                </p>
              </div>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between">
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleStepChange(index)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      step === index ? "w-6 bg-primary" : "w-1.5 bg-[#333333]"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                {step > 0 && (
                  <button
                    onClick={handleBack}
                    className="transparent-button !font-lato h-9 px-4 flex items-center justify-center uppercase hover:border-primary dark:hover:border-primary border border-black/10 dark:border-white/10  hover:text-primary rounded-full font-normal"
                  >
                    BACK
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="cyan-button !font-lato h-9 px-4 flex items-center justify-center uppercase bg-primary hover:bg-[#c2fe0ca0] text-black !rounded-full font-normal"
                >
                  {step === steps.length - 1 ? "Get Started" : "Next"}
                </button>

                {step !== steps.length - 1 && (
                  <button
                    onClick={handleSkip}
                    className="transparent-button !font-lato h-9 px-4 flex items-center justify-center uppercase hover:border-primary dark:hover:border-primary border border-black/10 dark:border-white/10  hover:text-primary rounded-full font-normal"
                  >
                    SKIP
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function OnboardingModal() {
  return (
    <Suspense fallback={null}>
      <OnboardingModalInternal />
    </Suspense>
  );
}

// Only show onboarding if first visit and no URL search params
function shouldShowOnboarding(searchParams: URLSearchParams) {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem("dex_onboarding_done") === "true") return false;
  if (searchParams.toString().length > 0) return false;
  return true;
}
