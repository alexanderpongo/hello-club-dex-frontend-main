import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";
import React from "react";

interface VolumeProps {
  volume_24h: number;
}

const Volume: React.FC<VolumeProps> = (props) => {
  const { volume_24h } = props;
  return <div className="dark:text-white/80 text-black">${renderFormattedValue(volume_24h)}</div>;
};

export default Volume;
