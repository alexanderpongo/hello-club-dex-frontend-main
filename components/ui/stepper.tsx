"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  steps: {
    id: number;
    label: string;
  }[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

export const Stepper = ({
  steps,
  currentStep = 1,
  onStepChange,
}: StepperProps) => {
  const totalSteps = steps.length;
  const progress = Math.max(
    0,
    Math.min(100, ((currentStep - 1) / (totalSteps - 1)) * 100)
  );

  return (
    <div className="w-full dark:bg-black text-white p-4">
      <div className="flex items-center justify-between w-full mb-2">
        <div className="text-sm font-formula text-primary dark:text-[primary">
          STEP {currentStep} OF {totalSteps}
        </div>
        <div className="text-sm font-formula text-gray-400">
          {/* {Math.min(100, ((currentStep - 1) / totalSteps) * 100)}%  */}

           {currentStep-1==0?"":`STEP ${currentStep-1}`} COMPLETE
        </div>
      </div>

      <div className="relative flex justify-between items-center">
        <div className="absolute h-0.5 bg-gray-700 left-0 right-0 top-1/4 transform -translate-y-1/4 z-0" />

        <div
          className="absolute h-[3px] bg-primary dark:bg-primary left-0 top-1/4 transform -translate-y-1/4 z-0 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />

        {steps.map((step) => (
          <div
            key={step.id}
            className="relative z-10 flex flex-col items-center"
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors text-[12px] font-semibold",
                step.id === currentStep
                  ? "bg-gray-900 dark:bg-black text-primary dark:text-primary border-2 border-primary dark:border-primary"
                  : step.id < currentStep
                  ? "bg-primary dark:bg-primary text-black"
                  : "bg-gray-900 dark:bg-black dark:text-[#6b7280] border-2 border-gray-700"
              )}
            >
              {step.id < currentStep ? (
                <Check className="w-3 h-3 text-black" />
              ) : (
                step.id
              )}
            </div>
            <div
              className={cn(
                "mt-2 uppercase font-formula !text-[12px] tracking-wider",
                step.id === currentStep
                  ? "text-primary dark:text-primary"
                  : step.id < currentStep
                  ? "text-primary dark:text-primary"
                  : "text-gray-400"
              )}
            >
              {step.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
