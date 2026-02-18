"use client";
import { LucideLoader2 } from "lucide-react";
import React from "react";

interface LockedCheckerProps {
  row: { tokenLocked?: boolean };
}

const LockedChecker: React.FC<LockedCheckerProps> = ({ row }) => {
  if (row?.tokenLocked === undefined) {
    // show loader if data is not yet available
    return <LucideLoader2 className="w-4 h-4 animate-spin text-gray-500" />;
  }

  const isLocked = row.tokenLocked;

  return (
    <div className="flex items-center justify-start h-[20px]">
      <span
        className={`text-xs ${
          isLocked
            ? "text-[#4ADE80] bg-[#22C55E33] border border-[#4ADE80]/20 rounded-full px-3 py-[2px]"
            : "text-[#906565] bg-[#6B728033] border border-[#A3A3A3]/20 rounded-full px-3 py-[2px]"
        }`}
      >
        {isLocked ? "Locked" : "Unlock"}
      </span>
    </div>
  );
};

export default LockedChecker;
