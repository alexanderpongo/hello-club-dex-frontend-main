"use client";
import { chains } from "@/config/chains";
import { getInitials } from "@/lib/utils";
import React from "react";
import { useAccount } from "wagmi";
import Image from "next/image";

const LpDetailsField = ({ row }: { row: any }) => {
  const { chainId, address } = useAccount();
  const chain = chains.filter((chain) => chain.chainId == chainId)[0];

  return (
    <>
      <div className="flex justify-start items-center">
        <div className="w-[78px] flex flex-row justify-start items-end relative">
          {row.token0?.logoURI ? (
            <div className="rounded-full w-[30px] h-[30px] border-[2px] border-[#1a1a1a] flex items-center justify-center bg-[#1a1a1a] text-white text-sm">
              <Image
                src={row.token0.logoURI}
                alt={row.token0.symbol}
                width={0}
                height={0}
                sizes="100vw"
                className="rounded-full w-full h-full border-[2px] border-[#1a1a1a] flex items-center justify-center bg-[#1a1a1a] text-white text-sm"
              />
            </div>
          ) : (
            <>
              {row.token0.name && (
                <div className="rounded-full w-[30px] h-[30px] border-[2px] border-[#1a1a1a] flex items-center justify-center bg-[#1a1a1a] text-white text-sm">
                  {getInitials(row.token0.symbol ?? "NA")}
                </div>
              )}
            </>
          )}

          {row.token1.logoURI ? (
            <div className="rounded-full w-[30px] h-[30px]  flex items-center justify-center  text-black text-sm">
              <Image
                src={row.token1.logoURI}
                alt={row.token1.symbol}
                width={0}
                height={0}
                sizes="100vw"
                className="rounded-full w-full h-full border-[1px] border-[#A3A3A3] flex items-center justify-center  text-black text-sm"
              />
            </div>
          ) : (
            <>
              {row.token1.name && (
                <div className="rounded-full w-[30px] h-[30px] border-[1px] border-[#A3A3A3] flex items-center justify-center bg-gray-200 text-black text-sm ">
                  {getInitials(row.token1.symbol ?? "NA")}
                </div>
              )}
            </>
          )}
        </div>
        <div>
          <div>
            {row.token0.symbol} / {row.token1?.symbol}
          </div>
          {address && (
            <div className="flex flex-row justify-center items-start text-[#A3A3A3] text-xs">
              {chain?.image && (
                <Image
                  src={chain?.image}
                  alt={chain?.name}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="rounded-full w-[18px] h-[18px] border-[2px] border-[#0F172A] mr-[2px]"
                />
              )}{" "}
              {chain?.name}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LpDetailsField;
