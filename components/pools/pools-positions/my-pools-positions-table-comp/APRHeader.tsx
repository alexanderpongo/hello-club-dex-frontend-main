import React, { useState } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const APRHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen} delayDuration={0}>
        <TooltipTrigger asChild>
          <div
            className="flex justify-end items-center gap-1 cursor-pointer"
            onClick={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            tabIndex={0}
          >
            <div>APR</div>
            <div>
              <Info className="w-4 h-4" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-[#000000] border border-[rgba(255,255,255,0.08)] rounded-sm sm:max-w-[200px] max-w-[150px]">
          <p className="font-lato text-[10px] text-gray-400 uppercase tracking-wider ">
            APRs are calculated using the fees generated over the last 30 days
            annualized. Past performance is not indicative of future results.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default APRHeader;
