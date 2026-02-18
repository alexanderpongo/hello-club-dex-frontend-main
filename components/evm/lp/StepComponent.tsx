"use client";

import { useCallback, useMemo } from "react";
import { useLPStore } from "@/store/useDexStore";
import clsx from "clsx";
import { useAccount } from "wagmi";

type Step = {
  id: number;
  title: string;
  description: string;
};

const steps: Step[] = [
  { id: 1, title: "Step 1", description: "Select token pair and fees" },
  { id: 2, title: "Step 2", description: "Set price range" },
  { id: 3, title: "Step 3", description: "Enter deposit amounts" },
];

const nativeAddresses: Record<number, string> = {
  1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  56: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  97: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
  42161: "0x4200000000000000000000000000000000000006",
};

export default function StepComponent() {
  const {
    activeStep,
    setActiveStep,
    setFromLPTokenInputAmount,
    setToLPTokenInputAmount,
    setActivePriceRange,
    setBasePrice,
    setTickLowerPrice,
    setTickUpperPrice,
    setPoolAddress,
    fromLPToken,
    toLPToken,
    initialBP,
  } = useLPStore();

  const { chainId } = useAccount();

  const getTokenAddress = (token?: { address?: string }) => {
    if (!token) return "";
    return token.address === "native"
      ? nativeAddresses[chainId ?? 1]
      : token.address;
  };

  const inputToken = getTokenAddress(fromLPToken!);
  const outputToken = getTokenAddress(toLPToken!);

  const initialBasePrice = useMemo(() => {
    if (!inputToken || !outputToken) return 0;
    return inputToken.toLowerCase().localeCompare(outputToken.toLowerCase()) < 0
      ? initialBP && initialBP > 0
        ? initialBP
        : 0
      : initialBP && initialBP > 0
      ? 1 / initialBP
      : 0;
  }, [inputToken, outputToken, initialBP]);

  const stepsHandler = useCallback(
    (step: number) => {
      if (step >= activeStep) return;

      setActiveStep(step);
      setFromLPTokenInputAmount("");
      setToLPTokenInputAmount("");

      setActivePriceRange(0);
      setTickLowerPrice("0.0");
      setTickUpperPrice("0.0");

      if (step === 1) {
        setBasePrice("0.0");
        setPoolAddress("");
      } else if (step === 2) {
        setBasePrice(initialBasePrice.toString());
      }
    },
    [
      activeStep,
      setActiveStep,
      setFromLPTokenInputAmount,
      setToLPTokenInputAmount,
      setActivePriceRange,
      setBasePrice,
      setTickLowerPrice,
      setTickUpperPrice,
      setPoolAddress,
      initialBasePrice,
    ]
  );

  return (
    <div className="flex flex-col md:flex-col h-fit p-4 rounded-xl min-w-[320px] border dark:border-neutral-800 dark:bg-neutral-900" >
      {/* Mobile: horizontal steps */}
      <div className="flex md:hidden justify-between items-start">
        {steps.map((step) => (
          <div
            key={step.id}
            onClick={() => stepsHandler(step.id)}
            className={clsx(
              "flex flex-col items-center flex-1 w-full cursor-pointer px-1",
              "min-h-[60px]" // ensures same height for all steps
            )}
          >
            <div
              className={clsx(
                "flex h-6 w-6 text-xs items-center justify-center rounded-full font-bold mb-1",
                activeStep === step.id
                  ? "bg-primary text-neutral-900"
                  : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600"
              )}
            >
              {step.id}
            </div>

            <span
              className={clsx(
                "text-[10px] font-medium uppercase text-center",
                activeStep === step.id ? "text-primary" : "text-neutral-600"
              )}
            >
              {step.title}
            </span>

            <span
              className={clsx(
                "font-semibold text-[8px] uppercase text-center",
                activeStep === step.id
                  ? "text-neutral-800 dark:text-neutral-100"
                  : "text-neutral-600"
              )}
            >
              {step.description}
            </span>
          </div>
        ))}
      </div>

      {/* Desktop: vertical steps */}
      <div className="hidden md:flex flex-col">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col">
            <div
              className={clsx(
                "flex items-center gap-4",
                (activeStep === step.id || step.id < activeStep) &&
                  "cursor-pointer"
              )}
              onClick={() => stepsHandler(step.id)}
            >
              <div
                className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-full font-bold",
                  activeStep === step.id
                    ? "bg-primary text-neutral-900"
                    : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600"
                )}
              >
                {step.id}
              </div>
              <div className="flex flex-col">
                <span
                  className={clsx(
                    "font-medium uppercase",
                    activeStep === step.id ? "text-primary" : "text-neutral-700"
                  )}
                >
                  {step.title}
                </span>
                <span
                  className={clsx(
                    "font-semibold",
                    activeStep === step.id
                      ? "text-neutral-800 dark:text-neutral-100"
                      : "text-neutral-600"
                  )}
                >
                  {step.description}
                </span>
              </div>
            </div>
            {index !== steps.length - 1 && (
              <div className="w-[2px] h-10 bg-neutral-300 dark:bg-neutral-700 ml-5 my-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
