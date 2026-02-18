import React from "react";
import { renderFormattedValue } from "./utils";

interface LiquidityProps {
  liquidityUsd: number;
}

const Liquidity: React.FC<LiquidityProps> = (props) => {
  const { liquidityUsd } = props;
  return <div>${renderFormattedValue(liquidityUsd)}</div>;
};

export default Liquidity;
