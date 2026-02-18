import { VolumeInfo } from "@/types/trading-live-table.types";
import React from "react";
import { renderFormattedValue } from "./utils";

interface VolumeProps {
  volume: VolumeInfo;
}

const Volume: React.FC<VolumeProps> = (props) => {
  const { volume } = props;
  return <div>${renderFormattedValue(volume.total_usd)}</div>;
};

export default Volume;
