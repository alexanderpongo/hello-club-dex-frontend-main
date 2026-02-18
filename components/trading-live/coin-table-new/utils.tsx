// Helper to convert number to subscript characters
const toSubscript = (num: number): string => {
  const subscriptMap: { [key: string]: string } = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };
  return num.toString().split('').map(d => subscriptMap[d] || d).join('');
};

export const renderFormattedValue = (value: number): React.ReactNode => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }
  
  const abs = Math.abs(value);
  if (abs === 0) return "0";

  const sign = value < 0 ? "-" : "";
  console.log("Rendering value:", value);

  // For extremely large values >= 1 trillion, use subscript notation
  if (abs >= 1e12) {
    const expStr = abs.toExponential();
    const [mantissaStr, expPart] = expStr.split("e");
    const exponent = parseInt(expPart, 10);
    
    // Clean mantissa to get significant digits
    const mantissa = mantissaStr.replace(".", "");
    const firstTwo = mantissa.slice(0, 2);
    const lastTwo = mantissa.slice(-2);
    
    // Total digit count is exponent + 1
    const totalDigits = exponent + 1;
    const zerosCount = totalDigits - 4; // Subtract first 2 and last 2 digits
    
    return (
      <span>
        {sign}
        {firstTwo}
        {toSubscript(zerosCount)}
        {lastTwo}
      </span>
    );
  }

  // For values >= 1 million, use M suffix
  if (1e12 > abs && abs >= 1e9) {
    const billions = value / 1e9;
    return `${sign}${billions.toFixed(2)}B`;
  }

  // For values >= 1 million, use M suffix
  if (abs < 1e9 && abs >= 1e6) {
    const millions = value / 1e6;
    return `${sign}${millions.toFixed(2)}M`;
  }

  // For values >= 1000, use K suffix
  if (abs < 1e6 && abs >= 1000) {
    const thousands = value / 1000;
    return `${sign}${thousands.toFixed(2)}K`;
  }

  // For values >= 1 but < 1000, show with up to 4  decimals (remove trailing zeros)
  if (abs >= 1) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7,
    });
  }
  console.log("Rendering small value:", value);

  // For prices < 1
  const expStr = abs.toExponential(); // positive mantissa for easier parsing
  const [mantissaStr, expPart] = expStr.split("e");
  const exponent = parseInt(expPart, 10); // negative for values < 1
  const [mInt, mFrac = ""] = mantissaStr.split(".");
  const mantDigits = (mInt + mFrac).replace(/^0+/, ""); // digits of mantissa without dot and leading zeros

  if (!Number.isFinite(exponent) || mantDigits.length === 0) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 8 });
  }

  const zerosBefore = Math.max(0, Math.abs(exponent) - 1); // zeros after decimal before first non-zero
  const significantDigits = 5; // how many leading significant digits to show
  const shown = mantDigits.slice(0, significantDigits);

  // If more than 3 leading zeros, display as 0.0₄4 format

  if (zerosBefore >= 3) {
    return (
      <span>
        {sign}
        0.0{toSubscript(zerosBefore)}
        {shown}
      </span>
    );
  }

  // Otherwise, render full decimal with zerosBefore zeros then the digits
  const zerosStr = "0".repeat(zerosBefore);
  return (
    <span>
      {sign}
      0.{zerosStr}
      {shown}
    </span>
  );
};
