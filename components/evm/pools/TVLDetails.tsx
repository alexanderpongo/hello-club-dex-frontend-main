// "use client";
// import { chains } from "@/config/chains";
// import { LucideLoader2 } from "lucide-react";
// import Image from "next/image";
// import React, { useCallback, useEffect, useState } from "react";
// import { useAccount, useConfig } from "wagmi";
// import { suggestedToken } from "@/config/suggest-tokens";
// import { TokenType } from "@/interfaces/index.i";
// import {
//   fetchTokenName,
//   fetchTokenDecimals,
//   fetchTokenSymbol,
// } from "@/service/blockchain.service";
// import { getInitials } from "@/lib/utils";
// import { NumericFormat } from "react-number-format";
// import { formatEther, formatUnits, parseEther } from "viem";
// // import { fallbackImage } from "@/lib/fallback";

// const TVLDetails = ({ row }: { row: any }) => {
//   // const { chainId } = useAccount();
//   // const config = useConfig();
//   // const chain = chains.filter((chain) => chain.chainId == chainId)[0];

//   // const [tokenA, setTokenA] = useState<TokenType>();
//   // const [isLoadingTokenA, setIsLoadingTokenA] = useState<boolean>(false);
//   // const [tokenB, setTokenB] = useState<TokenType>();
//   // const [isLoadingTokenB, setIsLoadingTokenB] = useState<boolean>(false);
//   // const [valueUsd, setValueUsd] = useState("");

//   // const suggestedTokens: TokenType[] = suggestedToken[chainId ?? "default"];

//   //   const fetchTokenDetail = async (address: string) => {
//   //     try {
//   //       const response = await fetch("api/find-by-address", {
//   //         method: "POST",
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //         },
//   //         body: JSON.stringify({
//   //           address: address,
//   //           chainId: chainId,
//   //         }),
//   //       });

//   //       const data = await response.json();
//   //       return data.body.tokens;
//   //     } catch (error) {
//   //       console.log("Error while fetching tokens", error);
//   //     }
//   //   };

//   // const fetchTokenADetailsFromContract = async () => {
//   //   const tokenName = await fetchTokenName(
//   //     config,
//   //     chainId ?? 97,
//   //     row.original.result[2].toLowerCase()
//   //   );
//   //   const tokenSymbol = await fetchTokenSymbol(
//   //     config,
//   //     chainId ?? 97,
//   //     row.original.result[2].toLowerCase()
//   //   );
//   //   const tokenDecimals = await fetchTokenDecimals(
//   //     config,
//   //     chainId ?? 97,
//   //     row.original.result[2].toLowerCase()
//   //   );
//   //   setTokenA({
//   //     chainId: (chainId as number) ?? (97 as number),
//   //     address: row.original.result[2].toLowerCase(),
//   //     name: tokenName as string,
//   //     symbol: tokenSymbol as string,
//   //     decimals: tokenDecimals as number,
//   //     logoURI: "",
//   //   });
//   // };

//   // const fetchTokenBDetailsFromContract = async () => {
//   //   const tokenName = await fetchTokenName(
//   //     config,
//   //     chainId ?? 97,
//   //     row.original.result[3].toLowerCase()
//   //   );
//   //   const tokenSymbol = await fetchTokenSymbol(
//   //     config,
//   //     chainId ?? 97,
//   //     row.original.result[3].toLowerCase()
//   //   );
//   //   const tokenDecimals = await fetchTokenDecimals(
//   //     config,
//   //     chainId ?? 97,
//   //     row.original.result[3].toLowerCase()
//   //   );
//   //   setTokenB({
//   //     chainId: (chainId as number) ?? (97 as number),
//   //     address: row.original.result[3].toLowerCase(),
//   //     name: tokenName as string,
//   //     symbol: tokenSymbol as string,
//   //     decimals: tokenDecimals as number,
//   //     logoURI: "",
//   //   });
//   // };

//   // const fetchTokenA = async () => {
//   //   setIsLoadingTokenA(true);
//   //   // console.log("row", row);

//   //   // const tokenA = await fetchTokenDetail(row.original.result[2]);
//   //   // setTokenA(tokenA);
//   //   if (!tokenA) {
//   //     if (suggestedTokens?.find((token) => token.address === row?.tokenA)) {
//   //       setTokenA(
//   //         suggestedTokens?.find((token) => token.address === row?.tokenA)
//   //       );
//   //     } else {
//   //       await fetchTokenADetailsFromContract();
//   //     }
//   //   }
//   //   setIsLoadingTokenA(false);
//   // };

//   // const fetchTokenB = async () => {
//   //   setIsLoadingTokenB(true);
//   //   // const tokenB = await fetchTokenDetail(row?.tokenB);
//   //   setTokenB(tokenB);
//   //   if (!tokenB) {
//   //     if (suggestedTokens?.find((token) => token.address === row?.tokenB)) {
//   //       setTokenB(
//   //         suggestedTokens?.find((token) => token.address === row?.tokenB)
//   //       );
//   //     } else {
//   //       await fetchTokenBDetailsFromContract();
//   //     }
//   //   }
//   //   setIsLoadingTokenB(false);
//   // };

//   //   useEffect(() => {
//   //     if (chainId && row.original.result[2]) {
//   //       fetchTokenA();
//   //     }
//   //   }, [row.original?.result[2]!, chainId]);

//   //   useEffect(() => {
//   //     if (chainId && row.original.result[3]) {
//   //       fetchTokenB();
//   //     }
//   //   }, [row.original?.result[3]!, chainId]);

//   // useEffect(() => {
//   //   //   console.log("print row", row.original.result[2]);
//   //   if ((chainId ?? 97) && row.original) {
//   //     fetchTokenA();
//   //     fetchTokenB();
//   //   }
//   // }, []);

//   // const getTVL = (fee: any) => {
//   //   let feeAmount = 0;

//   //   const amount0 = parseFloat(fee.amount0.toString());
//   //   const amount1 = parseFloat(fee.amount1.toString());
//   //   if (isNaN(amount0)) {
//   //     console.error("Invalid amount0:", amount0);
//   //     return "Error: Invalid amount";
//   //   }
//   //   if (isNaN(amount1)) {
//   //     console.error("Invalid amount1:", amount1);
//   //     return "Error: Invalid amount";
//   //   }

//   //   if (amount0 > 0 && amount1 > 0) {
//   //     feeAmount = amount0 * 2;
//   //   } else if (amount0 > 0) {
//   //     feeAmount = amount0;
//   //   } else if (amount1 > 0) {
//   //     feeAmount = amount1;
//   //   }

//   //   return formatUnits(
//   //     BigInt(feeAmount.toLocaleString("fullwide", { useGrouping: false })),
//   //     row?.original.token0.decimal!
//   //   );

//   //   // return formatUnits(BigInt(feeAmount.toString() ?? "0"), tokenA?.decimals!);
//   //   // return feeAmount;
//   // };

// const getTVL = (fee: any, token0: any, token1: any) => {
//   const amount0 = parseFloat(fee.amount0.toString());
//   const amount1 = parseFloat(fee.amount1.toString());

//   if (isNaN(amount0) && isNaN(amount1)) return { value: "0", symbol: "" };

//   let feeAmount = 0;
//   let decimals = token0.decimal;
//   let symbol = token0.symbol;

//   if (amount0 > 0 && amount1 > 0) {
//     feeAmount = amount0 * 2;
//     decimals = token0.decimal;
//     symbol = token0.symbol;
//   } else if (amount0 > 0) {
//     feeAmount = amount0;
//     decimals = token0.decimal;
//     symbol = token0.symbol;
//   } else if (amount1 > 0) {
//     feeAmount = amount1;
//     decimals = token1.decimal;
//     symbol = token1.symbol;
//   }

//   // Convert feeAmount to BigInt using full precision
//   const feeBigInt = BigInt(Math.floor(feeAmount * 10 ** decimals));

//   return {
//     value: formatUnits(feeBigInt, decimals),
//     symbol,
//   };
// };

//   return (
//     <div className="flex justify-start items-center">
//       {/* {isLoadingTokenA || isLoadingTokenB ? (
//         <LucideLoader2 className="animate-spin flex justify-center" />
//       ) : ( */}
//       <>
//         {/* {valueUsd}$ {getTVL(row.original).toFixed(2)} */}
//         <NumericFormat
//           prefix={row?.original.token0.symbol! + " "}
//           // value={parseFloat(getTVL(row?.original!))}
//           // value={parseFloat(
//           //   getTVL(
//           //     row?.original!,
//           //     row?.original.token0.decimal!,
//           //     row?.original.token1.decimal!
//           //   )
//           // )}
//            value={parseFloat(value)}
//   prefix={symbol + " "}
//           decimalScale={5}
//           // thousandsGroupStyle="lakh"
//           thousandSeparator=","
//           displayType="text"
//         />
//       </>
//       {/* )} */}
//     </div>
//   );
// };

// export default TVLDetails;

"use client";

// import React from "react";
// import { NumericFormat } from "react-number-format";
// import { formatUnits } from "viem";

// const TVLDetails = ({ row }: { row: any }) => {
//   // Helper function to calculate TVL and determine token symbol
//   const getTVL = (fee: any, token0: any, token1: any) => {
//     const amount0 = parseFloat(fee.amount0.toString());
//     const amount1 = parseFloat(fee.amount1.toString());

//     if (isNaN(amount0) && isNaN(amount1)) return { value: "0", symbol: "" };

//     let feeAmount = 0;
//     let decimals = token0.decimal;
//     let symbol = token0.symbol;
//     if (parseFloat(fee.liquidity) === 0) {
//       feeAmount = 0;
//     } else if (amount0 > 0 && amount1 > 0) {
//       feeAmount = amount0 * 2;
//       decimals = token0.decimal;
//       symbol = token0.symbol;
//     } else if (amount0 > 0) {
//       feeAmount = amount0;
//       decimals = token0.decimal;
//       symbol = token0.symbol;
//     } else if (amount1 > 0) {
//       feeAmount = amount1;
//       decimals = token1.decimal;
//       symbol = token1.symbol;
//     }

//     const feeBigInt = BigInt(feeAmount);

//     return {
//       value: formatUnits(feeBigInt, decimals),
//       symbol,
//     };
//   };

//   const { value, symbol } = getTVL(
//     row?.original,
//     row?.original.token0,
//     row?.original.token1
//   );

//   return (
//     <div className="flex justify-start items-center">
//       <NumericFormat
//         value={parseFloat(value)}
//         prefix={symbol + " "}
//         decimalScale={5}
//         thousandSeparator=","
//         displayType="text"
//       />
//     </div>
//   );
// };

// export default TVLDetails;

// import React from "react";
// import { NumericFormat } from "react-number-format";
// import { formatUnits } from "viem";

// const TVLDetails = ({ row }: { row: any }) => {
//   // Helper function to calculate TVL and determine token symbol
//   const getTVL = (fee: any, token0: any, token1: any) => {
//     const amount0 = parseFloat(fee.amount0.toString());
//     const amount1 = parseFloat(fee.amount1.toString());

//     if (parseFloat(fee.liquidity) === 0) {
//       return { value: null, symbol: "" }; // Use null to indicate no liquidity
//     }

//     let feeAmount = 0;
//     let decimals = token0.decimal;
//     let symbol = token0.symbol;

//     if (amount0 > 0 && amount1 > 0) {
//       feeAmount = amount0 * 2;
//     } else if (amount0 > 0) {
//       feeAmount = amount0;
//     } else if (amount1 > 0) {
//       feeAmount = amount1;
//       decimals = token1.decimal;
//       symbol = token1.symbol;
//     }

//     const feeBigInt = BigInt(feeAmount);

//     return {
//       value: formatUnits(feeBigInt, decimals),
//       symbol,
//     };
//   };

//   const { value, symbol } = getTVL(
//     row?.original,
//     row?.original.token0,
//     row?.original.token1
//   );

//   return (
//     <div className="flex justify-start items-center">
//       {value === null ? (
//         <span className="text-red-400 text-sm">Not available</span>
//       ) : (
//         <span className="flex items-center gap-1">
//           <NumericFormat
//             value={parseFloat(value)}
//             // prefix={symbol + " "}
//             decimalScale={3}
//             thousandSeparator=","
//             displayType="text"
//           />
//           <span className="text-xs text-[#A3A3A3]"> {symbol}</span>
//         </span>
//       )}
//     </div>
//   );
// };

// export default TVLDetails;

import React from "react";
import { NumericFormat } from "react-number-format";
import { formatUnits } from "viem";

const TVLDetails = ({ row }: { row: any }) => {
  const getTrimmedResult = (raw: number | string) => {
    const str = typeof raw === "number" ? raw.toFixed(18) : raw;
    const [intPart, decimalPart] = str.split(".");
    if (!decimalPart) return str;

    if (intPart === "0") {
      const firstNonZeroIndex = decimalPart.search(/[1-9]/);
      if (firstNonZeroIndex === -1) return "0";

      const sliceEnd = Math.min(firstNonZeroIndex + 5, 18);
      const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");
      return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
    }

    const trimmedDecimals = decimalPart.slice(0, 2).replace(/0+$/, "");
    return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
  };
  // Helper function to calculate TVL and determine token symbol
  const getTVL = (fee: any, token0: any, token1: any) => {
    const amount0 = BigInt(fee.amount0.toString() || "0");
    const amount1 = BigInt(fee.amount1.toString() || "0");
    const liquidity = BigInt(fee.liquidity.toString() || "0");

    if (liquidity === BigInt(0)) {
      return { value: null, symbol: "" };
    }

    let feeAmount: BigInt = BigInt("0");
    let decimals = token0.decimal;
    let symbol = token0.symbol;

    if (amount0 > BigInt(0) && amount1 > BigInt(0)) {
      feeAmount = amount0 * BigInt(2);
    } else if (amount0 > BigInt(0)) {
      feeAmount = amount0;
    } else if (amount1 > BigInt(0)) {
      feeAmount = amount1;
      decimals = token1.decimal;
      symbol = token1.symbol;
    }

    // Convert BigInt to human-readable string with decimals
    const formatted = formatUnits(feeAmount as bigint, decimals);
    const formattedValue = getTrimmedResult(formatted);
    return {
      value: formattedValue,
      symbol,
    };
  };

  const { value, symbol } = getTVL(
    row?.original,
    row?.original.token0,
    row?.original.token1
  );

  // Format value for display: up to 18 decimals
  const formatValue = (val: string) => {
    if (!val) return "0";
    const [integer, fraction = ""] = val.split(".");
    const truncatedFraction = fraction.slice(0, 18);
    return parseInt(truncatedFraction) === 0
      ? integer
      : `${integer}.${truncatedFraction}`;
  };

  return (
    <div className="flex justify-start items-center">
      {value === null ? (
        <span className="text-red-400 text-sm">Not available</span>
      ) : (
        <span className="flex items-center gap-1">
          <NumericFormat
            value={formatValue(value)}
            thousandSeparator=","
            displayType="text"
          />
          <span className="text-xs text-[#A3A3A3]"> {symbol}</span>
        </span>
      )}
    </div>
  );
};

export default TVLDetails;
