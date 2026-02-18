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
];

// Helper to convert YouTube URLs to embed URLs
function getYouTubeEmbedUrl(url: string, autoplay = false) {
  const match = url.match(/(?:youtu\.be\/|v=)([^&]+)/);
  const videoId = match ? match[1] : "";
  if (!videoId) return url;

  const params = new URLSearchParams();
  if (autoplay) params.append("autoplay", "1");
  params.append("rel", "0"); // No related videos

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function SimpleOnboardingModalInternal() {
  const { onboardingOpen, closeOnboarding, openOnboarding } = useSwapStore();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const rawVideoUrl = process.env.NEXT_PUBLIC_VIDEO_URL ?? "";
  const autoplay = process.env.NEXT_PUBLIC_VIDEO_AUTOPLAY === "true";
  const videoUrl = getYouTubeEmbedUrl(rawVideoUrl, autoplay);

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

  // Auto-step every 5 seconds
  useEffect(() => {
    if (!onboardingOpen) return;

    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setStep((prevStep) => {
          if (prevStep === steps.length - 1) {
            clearInterval(interval);
            return prevStep;
          }
          return prevStep + 1;
        });
        setTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [onboardingOpen]);

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
          <iframe
            className="rounded-md w-full h-80 object-cover"
            src={videoUrl}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>

        <div className="w-full dark:bg-[#1A1A1A] flex flex-col h-[220px]">
          <div className="p-6 flex flex-col h-[220px]">
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
              {/* Dots */}
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      step === index ? "w-6 bg-primary" : "w-1.5 bg-[#333333]"
                    }`}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-center">
                <button
                  onClick={handleNext}
                  className="cyan-button !font-formula h-9 px-8 flex items-center justify-center uppercase bg-primary hover:bg-[#c2fe0ca0] text-black rounded-xl"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SimpleOnboardingModal() {
  return (
    <Suspense fallback={null}>
      <SimpleOnboardingModalInternal />
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
