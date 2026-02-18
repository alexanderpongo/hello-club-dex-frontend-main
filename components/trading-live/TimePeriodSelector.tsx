"use client";
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type TimePeriod = "1H" | "6H" | "24H";

interface TimePeriodSelectorProps {
  selectedPeriod?: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  return (
    <div className="inline-flex items-center rounded-sm border dark:border-white/10 border-black/10 dark:bg-[#151515] bg-gray-100 p-0.5">
      <ToggleGroup
        type="single"
        value={selectedPeriod || ""}
        onValueChange={(value) => {
          if (value) onPeriodChange(value as TimePeriod);
        }}
        className="gap-0.5"
      >
        <ToggleGroupItem
          value="1H"
          aria-label="1 Hour"
          className="data-[state=on]:!bg-[#c2fe0c]  data-[state=on]:!text-black data-[state=on]:border-[#c2fe0c]/30 text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 bg-transparent dark:text-white/70 text-black/70 dark:hover:bg-[#1f1f1f] hover:bg-gray-200 dark:hover:text-white hover:text-black border-0 h-auto py-1.5 md:py-2 px-2 rounded-sm"
        >
          1H
        </ToggleGroupItem>
        <ToggleGroupItem
          value="6H"
          aria-label="6 Hours"
          className="data-[state=on]:!bg-[#c2fe0c]  data-[state=on]:!text-black data-[state=on]:border-[#c2fe0c]/30 text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 bg-transparent dark:text-white/70 text-black/70 dark:hover:bg-[#1f1f1f] hover:bg-gray-200 dark:hover:text-white hover:text-black border-0 h-auto py-1.5 md:py-2 px-2 rounded-sm"
        >
          6H
        </ToggleGroupItem>
        <ToggleGroupItem
          value="24H"
          aria-label="24 Hours"
          className="data-[state=on]:!bg-[#c2fe0c]  data-[state=on]:!text-black data-[state=on]:border-[#c2fe0c]/30 text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 bg-transparent dark:text-white/70 text-black/70 dark:hover:bg-[#1f1f1f] hover:bg-gray-200 dark:hover:text-white hover:text-black border-0 h-auto py-1.5 md:py-2 px-2 rounded-sm"
        >
          24H
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default TimePeriodSelector;

