import React from "react";

interface DynamicVolumeProps {
  volumeChange: number;
}

const DynamicVolume: React.FC<DynamicVolumeProps> = (props) => {
  const { volumeChange } = props;

  const value =
    typeof volumeChange === "number" && Number.isFinite(volumeChange)
      ? volumeChange
      : 0;
  const display = value === 0 ? "0" : value.toFixed(2);
  const isNegative = value < 0;
  const colorClass = isNegative ? "text-[#f87171]" : "text-primary";

  return <div className={`font-medium ${colorClass}`}>{display}%</div>;
};

export default DynamicVolume;
