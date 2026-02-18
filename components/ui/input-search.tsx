import * as React from "react";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export interface InputSearchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputSearch = React.forwardRef<HTMLInputElement, InputSearchProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="w-full relative">
        <Search
          className="w-[15px] h-[15px] absolute top-1/2 left-3 -translate-y-1/2"
          // stroke="#303030"
          stroke="#7b7b7b"
        />
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-black-200 bg-dark px-3 pl-[35px] text-sm ring-offset-[#1a1a1a] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#1a1a1a] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1a1a1a] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#1a1a1a] dark:bg-black dark:ring-offset-[#1a1a1a] dark:placeholder:text-[#7b7b7b] dark:focus-visible:ring-[#1a1a1a]",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
InputSearch.displayName = "Input";

export { InputSearch };
