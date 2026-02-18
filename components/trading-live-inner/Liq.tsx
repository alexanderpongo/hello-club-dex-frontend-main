import React from "react";
import { renderFormattedValue } from "../trading-live/coin-table-new/utils";

interface LiqProps {
  poolLiquidityUSD: number;
}

const Liq: React.FC<LiqProps> = (props) => {
  const { poolLiquidityUSD } = props;

  return <>{renderFormattedValue(Number(poolLiquidityUSD))}</>;
};

export default Liq;
