// import React from "react";
// import { NumericFormat } from "react-number-format";
// import { formatUnits } from "viem";

// const APRDetails = async ({ row }: { row: any }) => {
//   const getTrimmedResult = (raw: number | string) => {
//     const str = typeof raw === "number" ? raw.toFixed(18) : raw;
//     const [intPart, decimalPart] = str.split(".");
//     if (!decimalPart) return str;

//     if (intPart === "0") {
//       const firstNonZeroIndex = decimalPart.search(/[1-9]/);
//       if (firstNonZeroIndex === -1) return "0";

//       const sliceEnd = Math.min(firstNonZeroIndex + 5, 18);
//       const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");
//       return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
//     }

//     const trimmedDecimals = decimalPart.slice(0, 2).replace(/0+$/, "");
//     return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
//   };
//   // Helper function to calculate TVL and determine token symbol
//   //   const getTVL = (fee: any, token0: any, token1: any) => {
//   //     console.log("data apr", fee);

//   //     const amount0 = BigInt(fee.amount0.toString() || "0");
//   //     const amount1 = BigInt(fee.amount1.toString() || "0");
//   //     const liquidity = BigInt(fee.liquidity.toString() || "0");

//   //     if (liquidity === BigInt(0)) {
//   //       return { value: null, symbol: "" };
//   //     }

//   //     let feeAmount: BigInt = BigInt("0");
//   //     let decimals = token0.decimal;
//   //     let symbol = token0.symbol;

//   //     if (amount0 > BigInt(0) && amount1 > BigInt(0)) {
//   //       feeAmount = amount0 * BigInt(2);
//   //     } else if (amount0 > BigInt(0)) {
//   //       feeAmount = amount0;
//   //     } else if (amount1 > BigInt(0)) {
//   //       feeAmount = amount1;
//   //       decimals = token1.decimal;
//   //       symbol = token1.symbol;
//   //     }

//   //     // Convert BigInt to human-readable string with decimals
//   //     const formatted = formatUnits(feeAmount as bigint, decimals);
//   //     const formattedValue = getTrimmedResult(formatted);
//   //     return {
//   //       value: formattedValue,
//   //       symbol,
//   //     };
//   //   };

//   //   const { value, symbol } = getTVL(
//   //     row?.original,
//   //     row?.original.token0,
//   //     row?.original.token1
//   //   );

//   // 1) helper to fetch price

//   async function getTokenPriceUSD(address: string, chain: string) {
//     const res = await fetch(
//       `https://api.coingecko.com/api/v3/simple/token_price/${chain}?contract_addresses=${address}&vs_currencies=usd`
//     );
//     const json = await res.json();
//     const key = Object.keys(json)[0];
//     return json[key]?.usd ?? 0;
//   }

//   // 2) main TVL calculator
//   async function getTVL(fee: any, token0: any, token1: any, chain = "bsc") {
//     const raw0 = BigInt(fee.amount0 ?? "0");
//     const raw1 = BigInt(fee.amount1 ?? "0");
//     if (raw0 === BigInt("0") && raw1 === BigInt("0")) return { tvlUSD: 0 };

//     // fetch USD prices for each token
//     const [price0, price1] = await Promise.all([
//       getTokenPriceUSD(token0.address, chain),
//       getTokenPriceUSD(token1.address, chain),
//     ]);

//     // convert to human-readable token amounts
//     const amt0 = parseFloat(formatUnits(raw0, token0.decimal));
//     const amt1 = parseFloat(formatUnits(raw1, token1.decimal));

//     // USD value of each side
//     const val0 = amt0 * price0;
//     const val1 = amt1 * price1;

//     return {
//       token0Amount: amt0,
//       token1Amount: amt1,
//       token0ValueUSD: val0,
//       token1ValueUSD: val1,
//       tvlUSD: val0 + val1,
//     };
//   }

//   const { tvlUSD, token0Amount, token1Amount } = await getTVL(
//     row.original,
//     row.original.token0,
//     row.original.token1
//   );

//   console.log("TVL (USD):", tvlUSD);
//   console.log("token0 amount:", token0Amount);
//   console.log("token1 amount:", token1Amount);

//   // Format value for display: up to 18 decimals
//   const formatValue = (val: string) => {
//     if (!val) return "0";
//     const [integer, fraction = ""] = val.split(".");
//     const truncatedFraction = fraction.slice(0, 18);
//     return parseInt(truncatedFraction) === 0
//       ? integer
//       : `${integer}.${truncatedFraction}`;
//   };

//   return (
//     <div className="flex justify-start items-center">
//       {/* {value === null ? (
//         <span className="text-red-400 text-sm">Not available</span>
//       ) : (
//         <span className="flex items-center gap-1">
//           <NumericFormat
//             value={formatValue(value)}
//             thousandSeparator=","
//             displayType="text"
//           />
//           <span className="text-xs text-[#A3A3A3]"> {symbol}</span>
//         </span>
//       )} */}
//     </div>
//   );
// };

// export default APRDetails;
