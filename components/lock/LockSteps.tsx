import React from "react";
import { Stepper } from "../ui/stepper";
import ConnectWalletStep from "./ConnectWalletStep";
import SelectAssetStep from "./SelectAssetStep";
import LockDetailsStep from "./LockDetailsStep";
import LockDetailsReviewStep from "./LockDetailsReviewStep";
import ResponseStep from "./ResponseStep";

interface LockStepsProps {
  initialStep?: number;
}

function LockSteps({ initialStep }: LockStepsProps) {
  const [currentStep, setCurrentStep] = React.useState(initialStep || 1);
  const steps = [
    { id: 1, label: "Connect" },
    { id: 2, label: "Select Asset" },
    { id: 3, label: "Lock Details" },
    { id: 4, label: "Review" },
  ];
  return (
    <div className="flex flex-col py-2 w-full">
      {currentStep != 5 && (
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />
      )}

      {currentStep === 1 && <ConnectWalletStep onStepChange={setCurrentStep} />}
      {currentStep === 2 && <SelectAssetStep onStepChange={setCurrentStep} />}
      {currentStep === 3 && <LockDetailsStep onStepChange={setCurrentStep} />}
      {currentStep === 4 && (
        <LockDetailsReviewStep onStepChange={setCurrentStep} />
      )}
      {currentStep === 5 && <ResponseStep onStepChange={setCurrentStep} />}
    </div>
  );
}

export default LockSteps;
