import React from "react";
import { renderFormattedValue } from "./utils";

interface TVLProps {
  tvl: number;
}

const TVL: React.FC<TVLProps> = (props) => {
  const { tvl } = props;
  return <div>${renderFormattedValue(tvl)}</div>;
};

export default TVL;
