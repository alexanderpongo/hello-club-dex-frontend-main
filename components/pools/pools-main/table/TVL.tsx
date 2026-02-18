import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";
import React from "react";

interface TVLProps {
  tvl: number;
}

const TVL: React.FC<TVLProps> = (props) => {
  const { tvl } = props;
  return <div className="dark:text-white/80 text-black">${renderFormattedValue(tvl)}</div>;
};

export default TVL;
