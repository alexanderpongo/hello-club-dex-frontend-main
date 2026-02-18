import { Calculator } from "lucide-react";
import React from "react";

interface APRProps {
  APR: number;
}

const APR: React.FC<APRProps> = (props) => {
  const { APR } = props;
  return (
    <div className="flex items-center justify-start gap-2">
      <div>
        <Calculator className="dark:text-[#ADFF2F] text-[#9fcd0a] w-3.5 h-3.5 " />
      </div>
      <span className="text-sm dark:text-[#ADFF2F] text-[#9fcd0a] font-lato font-bold text-[14px]">
        {APR === 0 ? "0%" : APR.toFixed(2) + "%"}
      </span>
    </div>
  );
};

export default APR;
