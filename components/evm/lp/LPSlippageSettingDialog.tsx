// "use client";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import Image from "next/image";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import React, { useCallback, useEffect, useState } from "react";
// import { Settings, Settings2 } from "lucide-react";
// import { useLPStore } from "@/store/useDexStore";

// function debounce<T extends (...args: any[]) => void>(
//   func: T,
//   wait: number
// ): (...args: Parameters<T>) => void {
//   let timeout: ReturnType<typeof setTimeout>;
//   return (...args: Parameters<T>) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// }

// const LPSlippageSettingDialog = () => {
//   const [isLastTabActive, setIsLastTabActive] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [debouncedSlippageInput, setDebouncedSlippageInput] =
//     useState<string>("");
//   const { setlpSlippage, lpSlippage } = useLPStore();
//   const ranges = [0.1, 0.5, 1, "auto"];

//   const [activeValue, setActiveValue] = useState("0.3"); // Default selected value

//   const priceInputHandler = (value: number | string) => {
//     let input = value.toString();
//     input = input.replace(/[^0-9.%]/g, "");
//     if (49 < parseFloat(input)) {
//       setIsLastTabActive(true);
//     } else {
//       console.log(value);
//       setlpSlippage(parseFloat(input));
//       setActiveValue(input.toString());
//     }
//   };

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <div className="flex justify-end items-center border border-[#FFFFFF1A] bg-[#1A1A1A] text-sm rounded-xl p-1 group cursor-pointer hover:border-[#00ffff]">
//           {/* <div className="text-sm text-black">0.3% slippage</div> */}
//           <div className="w-[27px] h-[27px] flex justify-center items-center">
//             {/* <Image
//               src="/icons/settings.svg"
//               alt="logo"
//               width={18}
//               height={18}
//             /> */}
//             <Settings className="h-5 w-5 group-hover:text-[#00ffff]" />
//           </div>
//         </div>
//       </DialogTrigger>
//       <DialogContent className="bg-[#1a1a1a] border-[2px] right-0 border-[#ffffff14] px-1 sm:p-6 sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>
//             <div className=" text-[16px] font-medium sm:font-semibold text-left">
//               Slippage Settings
//             </div>
//           </DialogTitle>
//         </DialogHeader>
//         <div className="w-full flex flex-row grow gap-1.5 mt-4">
//           {ranges.map((range, index) => {
//             return (
//               <div
//                 key={index}
//                 className="flex flex-row grow items-center justify-center "
//               >
//                 {range === "auto" ? (
//                   <div className="flex flex-row items-center w-20 ring-2 ring-inset grow ring-primary px-2 py-2 rounded-[12px]">
//                     <input

//                       type="text"
//                       placeholder="0.3"
//                       className="w-full text-sm font-bold focus:outline-none bg-transparent items-center text-right !ring-0 !border-none"
//                       value={activeValue}
//                       onChange={(e) => priceInputHandler(e.target.value)}
//                     />
//                     <span className="ml-[1px] text-sm font-bold items-center">
//                       %
//                     </span>
//                   </div>
//                 ) : (
//                   <div
//                     onClick={(e) => {
//                       priceInputHandler(range.toString());
//                     }}
//                     className={`flex justify-center text-sm font-bold grow w-10 ring-2 ring-primary ring-inset rounded-[12px] bg-transparent hover:bg-primary hover:text-black items-center py-2 px-2 hover:cursor-pointer ${
//                       activeValue === range.toString()
//                         ? "!bg-primary !text-black"
//                         : ""
//                     }`}
//                   >
//                     {range}%
//                   </div>
//                 )}
//               </div>
//             );
//           })}

//           {/* {slippageTabValue === "custom" && (
//             <div className="relative">
//               <Input
//                 className="pr-8 rounded-[12px] focus-visible:ring-transparent"
//                 autoFocus
//                 placeholder="0.0"
//                 value={slippageCustomInput}
//                 onChange={handleChange}
//               />
//               <span className="w-8 h-10 flex justify-center items-center absolute right-0 top-0">
//                 %
//               </span>
//             </div>
//           )} */}

//           {/* {slippageTabValue === "custom" &&
//             (parseFloat(slippageCustomInput) > 49 ||
//               parseFloat(slippageCustomInput) < 0.3 ||
//               slippageCustomInput === "") && (
//               <div className="text-xs text-red-500">
//                 Slippage value should be between 0.3% - 49%.
//               </div>
//             )} */}
//           {/* <div>
//             <Button
//               variant={"ghost"}
//               size={"lg"}
//               className="w-full sm:text-[15px] sm:font-semibold bg-[#ffffff05] border border-[#242E41]"
//             >
//               Save Setting
//             </Button>
//           </div> */}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default LPSlippageSettingDialog;

"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { useLPStore } from "@/store/useDexStore";
import { useState } from "react";

const LPSlippageSettingDialog = () => {
  const [isLastTabActive, setIsLastTabActive] = useState(false);
  const [activeValue, setActiveValue] = useState("0.3");
  const { setlpSlippage } = useLPStore();
  const ranges = [0.1, 0.5, 1, "auto"];

  const priceInputHandler = (value: number | string) => {
    let input = value.toString().replace(/[^0-9.%]/g, "");
    const parsedValue = parseFloat(input);

    if (parsedValue > 49) {
      setIsLastTabActive(true);
      return;
    }

    setIsLastTabActive(false);
    setlpSlippage(parsedValue);
    setActiveValue(input);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-end items-center border dark:border-[#FFFFFF1A] dark:!bg-[#1A1A1A] text-sm rounded-xl p-1 group cursor-pointer hover:border-primary">
          <div className="w-[27px] h-[27px] flex justify-center items-center">
            <Settings className="h-5 w-5 group-hover:text-primary" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="card-primary bg-white dark:!bg-[#1a1a1a] border-[2px] right-0 dark:border-[#ffffff14] px-1 sm:p-6 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <div className="text-[16px] font-medium sm:font-semibold text-left">
              Slippage Settings
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-row grow gap-1.5 mt-4">
          {ranges.map((range, index) => (
            <div
              key={index}
              className="flex flex-row grow items-center justify-center"
            >
              {range === "auto" ? (
                <div
                  className={`flex flex-row items-center w-20  grow px-2 py-2 rounded-[12px] border ${
                    isLastTabActive ? "border-red-500" : "border-primary"
                  }`}
                >
                  <input
                    type="text"
                    placeholder="0.3"
                    className="w-full text-sm font-bold focus:outline-none bg-transparent items-center text-right !ring-0 !border-none"
                    value={activeValue}
                    onChange={(e) => priceInputHandler(e.target.value)}
                  />
                  <span className="ml-[1px] text-sm font-bold items-center">
                    %
                  </span>
                </div>
              ) : (
                <div
                  onClick={() => priceInputHandler(range.toString())}
                  className={`flex justify-center text-sm font-bold grow w-10 border border-primary rounded-[12px] bg-transparent hover:bg-primary hover:text-white dark:hover:text-black items-center py-2 px-2 hover:cursor-pointer ${
                    activeValue === range.toString()
                      ? "!bg-primary dark:!text-black !text-white"
                      : "border-primary"
                  }`}
                >
                  {range}%
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LPSlippageSettingDialog;
