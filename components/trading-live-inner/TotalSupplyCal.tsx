import React from "react";

interface TotalSupplyCalProps {
  totalSupply: string;
  tokenDecimals: number;
}

const TotalSupplyCal: React.FC<TotalSupplyCalProps> = (props) => {
  const { totalSupply, tokenDecimals } = props;
  // Assume ERC-20 style decimals = 18 unless you pass a different one via prop later
  const DECIMALS = tokenDecimals;

  const addGrouping = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const formatFromRaw = (raw: string, decimals: number = DECIMALS): string => {
    // sanitize
    const cleaned = (raw || "0").replace(/^0+/, "") || "0";

    // split into int.frac by decimals
    if (decimals <= 0) {
      const intPartOnly = cleaned;
      return addGrouping(intPartOnly);
    }

    if (cleaned.length <= decimals) {
      const zeros = "0".repeat(decimals - cleaned.length);
      const frac = (zeros + cleaned).replace(/0+$/, "");
      // small value < 1
      return frac ? `0.${frac}` : "0";
    }

    const intPart = cleaned.slice(0, cleaned.length - decimals);
    let fracPart = cleaned.slice(cleaned.length - decimals).replace(/0+$/, "");

    // Compact suffix selection based on integer digit count
    const units = [
      { p: 12, s: "T" },
      { p: 9, s: "B" },
      { p: 6, s: "M" },
      { p: 3, s: "K" },
    ];
    const dlen = intPart.length;
    const unit = units.find((u) => dlen > u.p);

    if (!unit) {
      // < 1,000: show up to 2 decimals
      const grouped = addGrouping(intPart);
      const dec = fracPart.slice(0, 2);
      return dec ? `${grouped}.${dec}` : grouped;
    }

    // Compose short number using string math to avoid precision loss
    const headLen = dlen - unit.p; // digits before decimal in the shortened number
    const head = intPart.slice(0, headLen);
    const tailDigits = intPart.slice(headLen) + fracPart; // digits after decimal available

    // decimals: 0 for >=100, 1 for >=10, else 2
    const headNum = parseInt(head, 10);
    const decPlaces = headNum >= 100 ? 0 : headNum >= 10 ? 1 : 2;
    const decDigits = tailDigits.slice(0, decPlaces).replace(/0+$/, "");
    const groupedHead = addGrouping(head);
    return decDigits
      ? `${groupedHead}.${decDigits} ${unit.s}`
      : `${groupedHead} ${unit.s}`;
  };

  const formatted = formatFromRaw(totalSupply);
  return <>{formatted}</>;
};

export default TotalSupplyCal;
