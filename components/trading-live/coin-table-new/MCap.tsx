import React from "react";
import { renderFormattedValue } from "./utils";

interface MCapProps {
  mcap: number;
}

const MCap: React.FC<MCapProps> = (props) => {
  const { mcap } = props;
  return <div>${renderFormattedValue(mcap)}</div>;
};

export default MCap;
