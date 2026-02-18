import React from "react";
import TokenBalanceTop from "./TokenBalanceTop";
import TokenBalanceBottom from "./TokenBalanceBottom";

const DepositAmount = () => {
  return (
    <div>
      <div className="uppercase text-[#ffffff] text-base !font-formula font-semibold pt-3">
        Deposit Amount
      </div>
      <div className="flex flex-col w-full pt-1">
        <TokenBalanceTop />
        <TokenBalanceBottom />
      </div>
    </div>
  );
};

export default DepositAmount;
