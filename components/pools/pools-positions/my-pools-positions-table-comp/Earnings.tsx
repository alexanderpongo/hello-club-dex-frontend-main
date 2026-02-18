import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";
import React from "react";

interface EarningsProps {
  earningsAmount: number;
}

const Earnings: React.FC<EarningsProps> = (props) => {
  const { earningsAmount } = props;
  return <div>${renderFormattedValue(earningsAmount)}</div>;
};

export default Earnings;
