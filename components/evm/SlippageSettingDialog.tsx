"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { useSwapStore } from "@/store/useDexStore";
import { useState } from "react";

const SlippageSettingDialog = () => {
  const [isLastTabActive, setIsLastTabActive] = useState(false);
  const [activeValue, setActiveValue] = useState("2");
  const { setSlippage } = useSwapStore();
  const ranges = [0.1, 0.5, 1, "auto"];

  const priceInputHandler = (value: number | string) => {
    let input = value.toString().replace(/[^0-9.%]/g, "");
    const parsedValue = parseFloat(input);

    if (parsedValue > 49) {
      setIsLastTabActive(true);
      return;
    }

    setIsLastTabActive(false);
    setSlippage(parsedValue);
    setActiveValue(input);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-end items-center border dark:border-[#FFFFFF1A] dark:bg-[#1A1A1A] text-sm rounded-xl p-1 group cursor-pointer hover:border-primary">
          <div className="w-[27px] h-[27px] flex justify-center items-center">
            <Settings className="h-5 w-5 group-hover:text-primary" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-[#1a1a1a] border-[2px] right-0 dark:border-[#ffffff14] px-1 sm:p-6 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <div className="text-[16px] font-medium sm:font-semibold text-left">
              Slippage Settings
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-left">
            Adjust the maximum slippage percentage for your trades
          </DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-row grow gap-1.5 mt-4">
          {ranges.map((range, index) => (
            <div
              key={index}
              className="flex flex-row grow items-center justify-center"
            >
              {range === "auto" ? (
                <div
                  className={`flex flex-row items-center w-20  grow px-2 py-2 rounded-[12px] border ${isLastTabActive ? "border-red-500" : "border-primary"
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
                  className={`flex justify-center text-sm font-bold grow w-10 border border-primary rounded-[12px] bg-transparent hover:bg-primary hover:text-white dark:hover:text-black items-center py-2 px-2 hover:cursor-pointer ${activeValue === range.toString()
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

export default SlippageSettingDialog;
