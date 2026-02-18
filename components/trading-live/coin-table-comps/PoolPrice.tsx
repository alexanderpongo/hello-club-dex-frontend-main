import React from "react";
import { renderFormattedValue } from "../coin-table-new/utils";

interface PoolPriceProps {
  poolPrice: number;
}

const PoolPrice: React.FC<PoolPriceProps> = (props) => {
  const { poolPrice } = props;

  console.log("PoolPrice render with price:", poolPrice);

  return <div>${renderFormattedValue(poolPrice)}</div>;
};

export default PoolPrice;
