import React from "react";
import TokenBalanceTop from "@/components/lp-revamp/TokenBalanceTop";
import TokenBalanceBottom from "@/components/lp-revamp/TokenBalanceBottom";
import AddLPButton from "@/components/lp-revamp/AddLPButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLiquidityPoolStore } from "@/store/liquidity-pool.store";

const LPAmountDeposit = () => {
  const { disableTopInput, disableBottomInput, currencyA, currencyB } =
    useLiquidityPoolStore();

  const showSingleSidedWarning = disableTopInput || disableBottomInput;
  const allowedSymbol = disableTopInput
    ? currencyB?.symbol
    : disableBottomInput
    ? currencyA?.symbol
    : undefined;

  return (
    <div className="flex flex-col w-full ">
      <div className="flex flex-col justify-start">
        <div className="uppercase text-primary font-formula text-lg">
          Deposit Amount
        </div>
        <p className="text-sm text-neutral-400 font-lato font-normal">
          Specify the token amounts for your liquidity contribution.
        </p>
      </div>

      <div className="flex flex-col w-full pt-1">
        <TokenBalanceTop />
        <TokenBalanceBottom />
        {showSingleSidedWarning && (
          <div className="pt-3">
            <Alert className="border-none text-center">
              <AlertDescription className="text-xs text-[#ffac2f] font-lato font-normal">
                {allowedSymbol
                  ? `Only ${allowedSymbol} can be deposited at the current price.`
                  : "Only one token can be deposited at the current price."}
              </AlertDescription>
            </Alert>
          </div>
        )}
        <div className="pt-3">
          <AddLPButton />
        </div>
      </div>
    </div>
  );
};

export default LPAmountDeposit;
