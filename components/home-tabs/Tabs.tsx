"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Tabs = () => {
  const pathName = usePathname();

  const Active = `bg-[#c2fe0c26] text-primary text-[18px] h-[40px] w-full font-formula uppercase flex rounded-sm  items-center border border-[#C2FE0C2E]  justify-center  `;

  const Inactive = `bg-transparent text-[#ffffff99] text-[18px] uppercase h-[40px] w-full flex items-center font-formula border-0  justify-center text-center`;

  return (
    <div className="flex  items-center mx-auto bg-black/10 dark:bg-white/5 w-full  md:w-[550px] rounded-xl h-[48px] gap-2 justify-center text-center mt-5">
      <Link
        href={"/trade"}
        className={pathName === "/trade" ? Active : Inactive}
      >
        SWAP
      </Link>
      <Link href={"/lp"} className={pathName === "/lp" ? Active : Inactive}>
        ADD LIQUIDITY
      </Link>
    </div>
  );
};

export default Tabs;
