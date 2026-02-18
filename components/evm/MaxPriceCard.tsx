// "use client";
// import { useLPStore } from "@/store/useDexStore";
// import { CircleMinus, CirclePlus, Infinity } from "lucide-react";
// import React, { useEffect, useState } from "react";

// const MaxPriceCard = () => {
//   const {
//     fromLPToken,
//     toLPToken,
//     activePriceRange,
//     setActivePriceRange,
//     setTickUpperPrice,
//     tickUpperPrice,
//     tickLowerPrice,
//     tickSpace,
//     basePrice,
//     baseTick,
//     feeTier,
//   } = useLPStore();

//   // useEffect(() => {
//   //   // setTickUpperPrice()
//   // }, []);
//   const [isUserTyping, setIsUserTyping] = useState(false);
//   const [tickUpperPriceRaw, setTickUpperPriceRaw] = useState("");
//   const [isDisable, setIsDisable] = useState(false);

//   const maxTickHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let input = e.target.value;
//     input = input.replace(/[^0-9.%]/g, "");

//     // console.log("inputinputinput", input);
//     // setIsUserTyping(true);
//     // setTickUpperPriceRaw(input);
//     setTickUpperPrice(input);
//   };

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

//   // console.log(
//   //   "tickPerValue",
//   //   tickPerValue,
//   //   "baseTick",
//   //   baseTick,
//   //   "basePrice",
//   //   parseFloat(basePrice)
//   // );

//   const tickIncreaseHandler = () => {
//     // setIsUserTyping(false);
//     setActivePriceRange(0);
//     let value = parseFloat(tickUpperPrice) + tickPerValue;
//     setTickUpperPrice(value.toFixed(6).toString());
//   };

//   const tickDecreaseHandler = () => {
//     // setIsUserTyping(false);
//     setActivePriceRange(0);
//     let value = parseFloat(tickUpperPrice) - tickPerValue;
//     if (value > 0 && parseFloat(tickLowerPrice) < parseFloat(tickUpperPrice)) {
//       setTickUpperPrice(value.toFixed(6).toString());
//       // setWarning(false);
//     }
//   };

//   function formatTickPrice(tickUpperPrice: string) {
//     const [intPart, decimalPart] = tickUpperPrice.split(".");

//     if (!decimalPart || decimalPart.length < 12) {
//       return parseFloat(tickUpperPrice);
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
//       <div className="flex flex-col !font-lato justify-center items-center grow w-full font-normal text-base space-y-2">
//         <div className="font-normal text-xs ">Max Price</div>
//         <div className="font-bold">
//           {activePriceRange === 1 ? (
//             <Infinity className="text-[16px] sm:!text-xl h-[26px] " />
//           ) : (
//             // <span className="text-[16px] sm:!text-2xl "> ∞</span>
//             <input
//               disabled={isDisable}
//               value={
//                 isNaN(parseFloat(tickUpperPrice))
//                   ? "0"
//                   : getTrimmedResult(tickUpperPrice)
//               }
//               onInput={maxTickHandler}
//               placeholder={activePriceRange === 1 ? "∞" : "0.00"}
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
//           <div className="text-xs w-full text-center ">
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

// export default MaxPriceCard;

// // "use client";
// // import { useLPStore } from "@/store/useDexStore";
// // import { CircleMinus, CirclePlus, Infinity } from "lucide-react";
// // import React from "react";

// // const MaxPriceCard = () => {
// //   const {
// //     fromLPToken,
// //     toLPToken,
// //     activePriceRange,
// //     setActivePriceRange,
// //     setTickUpperPrice,
// //     tickUpperPrice,
// //     tickLowerPrice,
// //     tickSpace,
// //   } = useLPStore();

// //   const maxTickHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     let input = e.target.value.replace(/[^0-9.%]/g, "");
// //     setTickUpperPrice(input);
// //   };

// //   // Math helpers
// //   const priceToTick = (price: number) =>
// //     Math.floor(Math.log(price) / Math.log(1.0001));
// //   const tickToPrice = (tick: number) => Math.pow(1.0001, tick);
// //   const roundToTickSpacing = (tick: number, spacing: number) =>
// //     Math.round(tick / spacing) * spacing;

// //   const tickIncreaseHandler = () => {
// //     setActivePriceRange(0);
// //     const currentPrice = parseFloat(tickUpperPrice || "0");
// //     if (!currentPrice || currentPrice <= 0) return;

// //     const currentTick = priceToTick(currentPrice);
// //     const nextTick = currentTick + tickSpace!;
// //     const newPrice = tickToPrice(nextTick);

// //     setTickUpperPrice(newPrice.toFixed(6));
// //   };

// //   const tickDecreaseHandler = () => {
// //     setActivePriceRange(0);
// //     const currentPrice = parseFloat(tickUpperPrice || "0");
// //     const minPrice = parseFloat(tickLowerPrice || "0");
// //     if (!currentPrice || currentPrice <= 0) return;

// //     const currentTick = priceToTick(currentPrice);
// //     const nextTick = currentTick - tickSpace!;
// //     const newPrice = tickToPrice(nextTick);

// //     if (newPrice > minPrice) {
// //       setTickUpperPrice(newPrice.toFixed(6));
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
// //         <div className="font-normal text-xs text-[#ffffff99]">Max Price</div>
// //         <div className="font-bold">
// //           {activePriceRange === 1 ? (
// //             <Infinity className="text-[16px] sm:!text-xl !h-[28px]" />
// //           ) : (
// //             <input
// //               value={isNaN(parseFloat(tickUpperPrice)) ? "0" : tickUpperPrice}
// //               onInput={maxTickHandler}
// //               placeholder={activePriceRange === 1 ? "∞" : "0.00"}
// //               type="text"
// //               className={`focus:outline-none bg-transparent text-[#ffffff] text-[16px] sm:text-[20px] font-bold text-center w-full !h-[28px]`}
// //             />
// //           )}
// //         </div>
// //         {fromLPToken && toLPToken && (
// //           <div className="text-xs w-full text-center text-[#ffffff99]">
// //             {fromLPToken?.symbol} per {toLPToken?.symbol}
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

// // export default MaxPriceCard;

"use client";

import { useLPStore } from "@/store/useDexStore";
import { CircleMinus, CirclePlus, Infinity } from "lucide-react";
import React, { useEffect, useState } from "react";

const MaxPriceCard = () => {
  const {
    fromLPToken,
    toLPToken,
    activePriceRange,
    setActivePriceRange,
    setTickUpperPrice,
    tickUpperPrice,
    tickLowerPrice,
    basePrice,
    baseTick,
    feeTier,
  } = useLPStore();

  const [isDisable, setIsDisable] = useState(false);

  /** ✅ Handle manual input */
  const maxTickHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^0-9.]/g, ""); // Only numbers and dot
    setTickUpperPrice(input);
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

  /** ✅ Safe parsing */
  const getParsedValue = (value: string) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  /** ✅ Plus button handler */
  const tickIncreaseHandler = () => {
    const upper = getParsedValue(tickUpperPrice);
    const newValue = upper + tickPerValue;

    if (tickPerValue > 0) {
      setActivePriceRange(0);
      setTickUpperPrice(newValue.toFixed(6));
      // Don't update inverse values - ViewPriceButton will recalculate them during toggle
    }
  };

  /** ✅ Minus button handler */
  const tickDecreaseHandler = () => {
    const upper = getParsedValue(tickUpperPrice);
    const lower = getParsedValue(tickLowerPrice);
    const newValue = upper - tickPerValue;

    if (tickPerValue > 0 && newValue > lower) {
      setActivePriceRange(0);
      setTickUpperPrice(newValue.toFixed(6));
      // Don't update inverse values - ViewPriceButton will recalculate them during toggle
    }
  };

  /** ✅ Disable if basePrice invalid */
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
        <div className="font-normal text-xs">Max Price</div>
        <div className="font-bold">
          {activePriceRange === 1 ? (
            <Infinity className="text-[16px] sm:text-xl h-[26px]" />
          ) : (
            <input
              disabled={isDisable}
              value={
                isNaN(parseFloat(tickUpperPrice))
                  ? "0"
                  : getTrimmedResult(tickUpperPrice)
              }
              onChange={maxTickHandler}
              placeholder={activePriceRange === 1 ? "∞" : "0.00"}
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

export default MaxPriceCard;
