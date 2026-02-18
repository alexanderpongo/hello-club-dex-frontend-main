// "use client";
// import { CircleMinus, CirclePlus } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { useLPStore } from "@/store/useDexStore";

// const MinPriceCard = () => {
//   const {
//     fromLPToken,
//     toLPToken,
//     activePriceRange,
//     setActivePriceRange,
//     setTickLowerPrice,
//     setTickCalculateValue,
//     tickLowerPrice,
//     tickUpperPrice,
//     basePrice,
//     baseTick,
//     feeTier,
//     poolAddress,
//   } = useLPStore();

//   // const [warning, setWarning] = useState(false);

//   const [isDisable, setIsDisable] = useState(false);

//   const minTickHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let input = e.target.value;
//     input = input.replace(/[^0-9.%]/g, "");

//     setTickLowerPrice(input);
//   };
//   // const tickPerValue = parseFloat(basePrice) / baseTick!;

//   // console.log(feeTier);

//   let tickBasis = 0;
//   if (feeTier === "0.01") {
//     tickBasis = 1 / 10000;
//   } else {
//     tickBasis = baseTick!;
//   }
//   let tickPerValue = 0;
//   if (parseFloat(basePrice) > 0) {
//     if (feeTier === "0.01") {
//       tickPerValue = parseFloat(basePrice) * tickBasis;
//     } else {
//       tickPerValue = parseFloat(basePrice) / tickBasis;
//     }
//   }
//   const tickIncreaseHandler = () => {
//     setActivePriceRange(0);
//     let value = parseFloat(tickLowerPrice) + tickPerValue;

//     if (value >= 0 && parseFloat(tickLowerPrice) < parseFloat(tickUpperPrice)) {
//       setTickLowerPrice(value.toString());
//       // setWarning(false);
//     }
//     //  else {
//     //   setWarning(true);
//     //   setTickLowerPrice("0");
//     // }
//     // console.log("i basePrice", basePrice, "tickLowerPrice", tickLowerPrice);
//   };

//   const tickDecreaseHandler = () => {
//     setActivePriceRange(0);
//     let value = parseFloat(tickLowerPrice) - tickPerValue;

//     if (value >= 0) {
//       setTickLowerPrice(value.toString());
//       // setWarning(false);
//     }
//     // else {
//     //   setWarning(true);
//     //   setTickLowerPrice("0");
//     // }
//     // console.log("d basePrice", basePrice, "tickLowerPrice", tickLowerPrice);
//   };

//   function formatTickPrice(tickLowerPrice: string) {
//     const [intPart, decimalPart] = tickLowerPrice.split(".");

//     if (!decimalPart || decimalPart.length < 12) {
//       return parseFloat(tickLowerPrice);
//     }

//     if (decimalPart.length < 15) {
//       return `${intPart}.${decimalPart}`;
//     }

//     // If decimalPart is 15 or more digits
//     return `${intPart}.${decimalPart.slice(0, 12)}...`;
//   }

//   useEffect(() => {
//     // console.log("setIsDisable", isDisable, parseFloat(basePrice), basePrice);

//     // priceRangeHandler(activePriceRange);
//     if (parseFloat(basePrice) === 0 || isNaN(parseFloat(basePrice))) {
//       setIsDisable(true);
//     } else {
//       setIsDisable(false);
//     }
//     // console.log("setIsDisable1", isDisable, parseFloat(basePrice), basePrice);
//   }, [basePrice]);

//   const getTrimmedResult = (raw: string) => {
//     const [intPart, decimalPart] = raw.split(".");
//     if (!decimalPart) return raw;

//     if (intPart === "0") {
//       const firstNonZeroIndex = decimalPart.search(/[1-9]/);
//       if (firstNonZeroIndex === -1) return "0";

//       const sliceEnd = Math.min(firstNonZeroIndex + 9, 18);
//       const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");

//       return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
//     }

//     // For non-zero intPart, return int with 2–3 decimals
//     const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
//     return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
//   };

//   return (
//     <div className="flex w-full flex-row md:grow items-center rounded-xl  py-3 px-2  card-primary">
//       <button disabled={isDisable}>
//         <CircleMinus
//           onClick={tickDecreaseHandler}
//           className={`${
//             isDisable
//               ? "text-[#c2fe0c94] cursor-default"
//               : "text-primary hover:cursor-pointer"
//           }`}
//         />
//       </button>

//       <div className="flex flex-col !font-lato justify-center items-center grow w-full font-normal text-base space-y-2 ">
//         <div className="font-normal text-xs ">Min Price</div>
//         <div className="font-bold text-lg">
//           {" "}
//           {activePriceRange === 1 ? (
//             <span className="text-[16px] sm:text-xl">0</span>
//           ) : (
//             <input
//               disabled={isDisable}
//               value={
//                 isNaN(parseFloat(tickLowerPrice))
//                   ? "0"
//                   : getTrimmedResult(tickLowerPrice)
//               }
//               onInput={minTickHandler}
//               placeholder={activePriceRange === 1 ? "0" : "0.00"}
//               type="text"
//               className={`focus:outline-none bg-transparent ${
//                 isDisable
//                   ? "text-black dark:text-[#ffffff]"
//                   : "text-gray-400 dark:text-gray-200"
//               }  text-[16px] sm:text-[20px] font-bold text-center w-full`}
//             />
//           )}
//         </div>
//         {fromLPToken && toLPToken && (
//           <div className="text-xs w-full text-center">
//             {fromLPToken?.symbol} per {toLPToken?.symbol}
//           </div>
//         )}
//       </div>
//       <button disabled={isDisable}>
//         <CirclePlus
//           onClick={tickIncreaseHandler}
//           className={`${
//             isDisable
//               ? "text-[#c2fe0c94] cursor-default"
//               : "text-primary hover:cursor-pointer"
//           }`}
//         />
//       </button>
//     </div>
//   );
// };

// export default MinPriceCard;

// // "use client";

// // import { CircleMinus, CirclePlus } from "lucide-react";
// // import React from "react";
// // import { useLPStore } from "@/store/useDexStore";

// // const MinPriceCard = () => {
// //   const {
// //     fromLPToken,
// //     toLPToken,
// //     activePriceRange,
// //     setActivePriceRange,
// //     setTickLowerPrice,
// //     tickLowerPrice,
// //     tickUpperPrice,
// //     basePrice,
// //     baseTick,
// //   } = useLPStore();

// //   const minTickHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     let input = e.target.value.replace(/[^0-9.%]/g, "");
// //     setTickLowerPrice(input);
// //   };

// //   let tickPerValue = 0;
// //   if (parseFloat(basePrice) > 0 && baseTick! > 0) {
// //     tickPerValue = parseFloat(basePrice) / baseTick!;
// //   }

// //   const tickIncreaseHandler = () => {
// //     setActivePriceRange(0);
// //     const value = parseFloat(tickLowerPrice) + tickPerValue;

// //     if (value >= 0 && value < parseFloat(tickUpperPrice)) {
// //       setTickLowerPrice(value.toFixed(6).toString());
// //     }
// //   };

// //   const tickDecreaseHandler = () => {
// //     setActivePriceRange(0);
// //     const value = parseFloat(tickLowerPrice) - tickPerValue;

// //     if (value >= 0) {
// //       setTickLowerPrice(value.toFixed(6).toString());
// //     }
// //   };

// //   return (
// //     <div className="flex w-full flex-row md:grow items-center rounded-xl border border-[#FFFFFF0D] py-3 px-2 bg-[#FFFFFF14]">
// //       <button>
// //         <CircleMinus
// //           onClick={tickDecreaseHandler}
// //           className="text-[#00ffff] hover:cursor-pointer"
// //         />
// //       </button>
// //       <div className="flex flex-col md:!h-[76px] !font-lato justify-center items-center grow w-full font-normal text-base space-y-2">
// //         <div className="font-normal text-xs text-[#ffffff99]">Min Price</div>
// //         <div className="font-bold">
// //           {activePriceRange === 1 ? (
// //             <span className="text-[16px] sm:text-xl !h-[28px]">0</span>
// //           ) : (
// //             <input
// //               value={isNaN(parseFloat(tickLowerPrice)) ? "0" : tickLowerPrice}
// //               onInput={minTickHandler}
// //               placeholder="0.00"
// //               type="text"
// //               className="focus:outline-none bg-transparent text-[#ffffff] text-[16px] sm:text-[20px] font-bold text-center w-full !h-[28px]"
// //             />
// //           )}
// //         </div>
// //         {fromLPToken && toLPToken && (
// //           <div className="text-xs w-full text-center text-[#ffffff99]">
// //             {fromLPToken.symbol} per {toLPToken.symbol}
// //           </div>
// //         )}
// //       </div>
// //       <button>
// //         <CirclePlus
// //           onClick={tickIncreaseHandler}
// //           className="text-[#00ffff] hover:cursor-pointer"
// //         />
// //       </button>
// //     </div>
// //   );
// // };

// // export default MinPriceCard;

"use client";

import { CircleMinus, CirclePlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLPStore } from "@/store/useDexStore";

const MinPriceCard = () => {
  const {
    fromLPToken,
    toLPToken,
    activePriceRange,
    setActivePriceRange,
    setTickLowerPrice,
    tickLowerPrice,
    tickUpperPrice,
    basePrice,
    baseTick,
    feeTier,
  } = useLPStore();

  const [isDisable, setIsDisable] = useState(false);

  /** ✅ Handle manual input */
  const minTickHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^0-9.]/g, ""); // Allow only numbers & dot
    setTickLowerPrice(input);
    // Don't update inverse values - ViewPriceButton will recalculate them during toggle
  };

  /** ✅ Calculate tickPerValue (always positive) */
  const tickBasis = feeTier === "0.01" ? 1 / 10000 : Math.abs(baseTick ?? 0);
  const tickPerValue =
    parseFloat(basePrice) > 0
      ? feeTier === "0.01"
        ? parseFloat(basePrice) * tickBasis
        : parseFloat(basePrice) / tickBasis
      : 0;

  /** ✅ Parse safely */
  const getParsedValue = (value: string) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  /** ✅ Plus button handler */
  const tickIncreaseHandler = () => {
    const lower = getParsedValue(tickLowerPrice);
    const upper = getParsedValue(tickUpperPrice);

    const newValue = lower + tickPerValue;

    if (tickPerValue > 0 && newValue >= 0 && newValue < upper) {
      setActivePriceRange(0);
      setTickLowerPrice(newValue.toFixed(6));
      // Don't update inverse values - ViewPriceButton will recalculate them during toggle
    }
  };

  /** ✅ Minus button handler */
  const tickDecreaseHandler = () => {
    const lower = getParsedValue(tickLowerPrice);
    const newValue = lower - tickPerValue;

    if (tickPerValue > 0 && newValue >= 0) {
      setActivePriceRange(0);
      setTickLowerPrice(newValue.toFixed(6));
      // Don't update inverse values - ViewPriceButton will recalculate them during toggle
    }
  };

  /** ✅ Disable buttons if basePrice invalid */
  useEffect(() => {
    setIsDisable(parseFloat(basePrice) <= 0 || isNaN(parseFloat(basePrice)));
  }, [basePrice]);

  /** ✅ Trimmed display */
  const getTrimmedResult = (raw: string) => {
    const [intPart, decimalPart] = raw.split(".");
    if (!decimalPart) return raw;

    if (intPart === "0") {
      const firstNonZeroIndex = decimalPart.search(/[1-9]/);
      if (firstNonZeroIndex === -1) return "0";

      const sliceEnd = Math.min(firstNonZeroIndex + 9, 18);
      const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");

      return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
    }

    const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
    return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
  };

  return (
    <div className="flex w-full flex-row md:grow items-center rounded-xl py-3 px-2 card-primary">
      {/* Minus Button */}
      <button disabled={isDisable} onClick={tickDecreaseHandler}>
        <CircleMinus
          className={`${isDisable
            ? "text-[#c2fe0c94] cursor-default"
            : "text-primary hover:cursor-pointer"
            }`}
        />
      </button>

      {/* Input Section */}
      <div className="flex flex-col !font-lato justify-center items-center grow w-full font-normal text-base space-y-2">
        <div className="font-normal text-xs">Min Price</div>
        <div className="font-bold text-lg">
          {activePriceRange === 1 ? (
            <span className="text-[16px] sm:text-xl">0</span>
          ) : (
            <input
              disabled={isDisable}
              value={
                isNaN(parseFloat(tickLowerPrice))
                  ? "0"
                  : getTrimmedResult(tickLowerPrice)
              }
              onChange={minTickHandler}
              placeholder="0.00"
              type="text"
              className={`focus:outline-none bg-transparent ${isDisable
                ? "text-black dark:text-[#ffffff]"
                : "text-gray-400 dark:text-gray-200"
                } text-[16px] sm:text-[20px] font-bold text-center w-full`}
            />
          )}
        </div>
        {fromLPToken && toLPToken && (
          <div className="text-xs w-full text-center">
            {fromLPToken.symbol} per {toLPToken.symbol}
          </div>
        )}
      </div>

      {/* Plus Button */}
      <button disabled={isDisable} onClick={tickIncreaseHandler}>
        <CirclePlus
          className={`${isDisable
            ? "text-[#c2fe0c94] cursor-default"
            : "text-primary hover:cursor-pointer"
            }`}
        />
      </button>
    </div>
  );
};

export default MinPriceCard;
