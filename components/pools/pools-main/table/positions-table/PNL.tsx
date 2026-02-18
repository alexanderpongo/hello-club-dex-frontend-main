import React from "react";

interface PNLProps {
  pnlAmount: number;
//   pnlPercentage: number;
}

const PNL: React.FC<PNLProps> = (props) => {
  const { pnlAmount } = props;
  return (
    <div className="">
      {pnlAmount === 0 ? (
        <span className="">$0</span>
      ) : pnlAmount > 0 ? (
        <span className="text-primary">${pnlAmount.toFixed(2)}</span>
      ) : (
        <span className="text-[#f87171]">${pnlAmount.toFixed(2)}</span>
      )}
      {/* {pnlPercentage === 0 ? (
        <span className="">0%</span>
      ) : pnlAmount > 0 ? (
        <span className="text-primary"> ({pnlPercentage.toFixed(2)}%)</span>
      ) : (
        <span className="text-[#f87171]"> ({pnlPercentage.toFixed(2)}%)</span>
      )} */}
    </div>
  );
};

export default PNL;
