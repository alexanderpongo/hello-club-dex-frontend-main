import React from "react";

export const formatSmallNumber = (num: number | string): React.ReactNode => {
  // 1. Parse and validate the input
  const numericValue =
    typeof num === "string" ? parseFloat(num.replace(/[^0-9.-]+/g, "")) : num;

  if (isNaN(numericValue) || numericValue === 0) {
    return "$0.00";
  }

  // 2. For numbers >= $0.01, format with 2 to 4 decimal places
  if (numericValue >= 0.01) {
    return `$${numericValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })}`;
  }

  // 3. For numbers < $0.01, use exponential notation with more precision
  const numStr = numericValue.toExponential(2); // e.g., 0.00129 -> "1.29e-3"
  const [mantissa, exponentStr] = numStr.split("e-");

  if (!exponentStr) {
    // Fallback for numbers that don't convert to exponential
    return `$${numericValue.toFixed(8)}`;
  }

  const exponent = parseInt(exponentStr, 10);
  const zeroCount = exponent - 1;

  // Get up to three significant digits from the mantissa (e.g., "1.29" -> "129")
  const significantDigits = mantissa.replace(".", "");

  return (
    <span>
      $0.0
      <sub style={{ fontSize: "0.6em", verticalAlign: "sub" }}>{zeroCount}</sub>
      {significantDigits}
    </span>
  );
};
