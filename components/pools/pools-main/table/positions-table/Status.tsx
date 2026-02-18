import React from "react";

interface StatusProps {
  currentTotalLiquidity: string;
}

const Status: React.FC<StatusProps> = (props) => {
  const { currentTotalLiquidity } = props;

  const liquidityValue = parseFloat(currentTotalLiquidity);

  return (
    <div className="flex items-center justify-end">
      {liquidityValue > 0 ? (
        <div className="text-[#adff2f] bg-[#adff2f]/10 border-[#adff2f] px-2 py-1 rounded-sm font-medium text-xs">
          Active
        </div>
      ) : (
        <div className="text-[#f87171] bg-[#f87171]/10 font-medium text-xs border border-[#f87171] px-2 py-1 rounded-sm">
          Liquidity Removed
        </div>
      )}
    </div>
  );
};

export default Status;
