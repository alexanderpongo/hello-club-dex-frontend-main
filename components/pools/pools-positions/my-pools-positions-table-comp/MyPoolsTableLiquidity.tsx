import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";
import React from "react";

interface MyPoolsTableLiquidityProps {
  currentLiquidity: number;
}

const MyPoolsTableLiquidity: React.FC<MyPoolsTableLiquidityProps> = (props) => {
  const { currentLiquidity } = props;
  return <div className="dark:text-white/80 text-black">${renderFormattedValue(currentLiquidity)}</div>;
};

export default MyPoolsTableLiquidity;
