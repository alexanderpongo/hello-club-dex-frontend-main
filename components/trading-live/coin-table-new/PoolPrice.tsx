import { TokenInfo } from "@/types/trading-live-table.types";
import React from "react";
import { renderFormattedValue } from "./utils";

interface PoolPriceProps {
  token0: TokenInfo;
}

const PoolPrice: React.FC<PoolPriceProps> = (props) => {
  const { token0 } = props;

  return <div>${renderFormattedValue(token0.price_usd)}</div>;
};

export default PoolPrice;
