// "use client";
// import { contractConfig } from "@/config/blockchain.config";
// import { ContractConfigItemType } from "@/interfaces/index.i";
// import React, { useState } from "react";
// import { Abi, Address, createPublicClient, getContract } from "viem";
// import { useAccount, useConfig, http } from "wagmi";
// import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
// import { readContract } from "@wagmi/core";

// const RangeSelector = ({ row }: { row: any }) => {
//   const { address, chainId } = useAccount();
//   const config = useConfig();
//   const chainContractConfig: ContractConfigItemType =
//     contractConfig[chainId!] || contractConfig["default"];
//   const [inrage, setInRange] = useState(false);
//   const publicClient = createPublicClient({
//     chain: chainContractConfig.chain!,
//     transport: http(),
//   });

//   let currentTick: number;
//   const rangeChecker = async () => {
//     const pool = (await readContract(config, {
//       address: chainContractConfig.v3FactoryAddress as Address,
//       abi: chainContractConfig.v3FactoryABI,
//       functionName: "getPool",
//       args: [row?.result[2]!, row?.result[3]!, row?.result[4]!],
//     })) as Address;
//     // Initialize the pool contract
//     const poolContract = getContract({
//       address: pool as `0x${string}`,
//       abi: IUniswapV3PoolABI.abi as Abi,
//       client: publicClient,
//     });

//     console.log("poolContract", poolContract);

//     // Get slot0 data
//     const slot0 = (await readContract(config, {
//       address: poolContract.address,
//       abi: poolContract.abi,
//       functionName: "slot0",
//     })) as [bigint, number, number, number, number, number, boolean];

//     currentTick = slot0[1];

//     console.log("currentTick", currentTick);
//     if (currentTick >= row?.result[4]! && currentTick <= row?.result[5]!) {
//       setInRange(true);
//     } else {
//       setInRange(false);
//     }
//   };

//   return (
//     <div>
//       {inrage ? (
//         <>
//           <span>Yes</span>
//         </>
//       ) : (
//         <>No</>
//       )}
//     </div>
//   );
// };

// export default RangeSelector;

// "use client";
// import { contractConfig } from "@/config/blockchain.config";
// import { ContractConfigItemType } from "@/interfaces/index.i";
// import React, { useEffect, useState } from "react";
// import { Abi, Address, createPublicClient, getContract } from "viem";
// import { useAccount, useConfig, http } from "wagmi";
// import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
// import { readContract } from "@wagmi/core";
// import { LucideLoader2 } from "lucide-react";

// const RangeSelector = ({ row }: { row: any }) => {
//   const { chainId } = useAccount();
//   const config = useConfig();
//   const chainContractConfig: ContractConfigItemType =
//     contractConfig[chainId!] || contractConfig["default"];

//   const [inRange, setInRange] = useState<boolean | null>(null);
//   const [loading, setLoading] = useState(true);

//   const publicClient = createPublicClient({
//     chain: chainContractConfig.chain!,
//     transport: http(),
//   });

//   useEffect(() => {
//     // console.log("row data user ", row);

//     const checkRange = async () => {
//       try {
//         setLoading(true);
//         setInRange(null);
//         // console.log("get pool", [
//         //   row?.result[2]!,
//         //   row?.result[3]!,
//         //   row?.result[4]!,
//         // ]);

//         // Fetch pool address
//         const poolAddress = (await readContract(config, {
//           address: chainContractConfig.v3FactoryAddress as Address,
//           abi: chainContractConfig.v3FactoryABI,
//           functionName: "getPool",
//           args: [row?.result[2]!, row?.result[3]!, row?.result[4]!],
//         })) as Address;

//         if (
//           !poolAddress ||
//           poolAddress === "0x0000000000000000000000000000000000000000"
//         ) {
//           setInRange(false);
//           setLoading(false);
//           return;
//         }

//         // Initialize pool contract
//         const poolContract = getContract({
//           address: poolAddress,
//           abi: IUniswapV3PoolABI.abi as Abi,
//           client: publicClient,
//         });

//         // Get slot0 data
//         const slot0 = (await readContract(config, {
//           address: poolContract.address,
//           abi: poolContract.abi,
//           functionName: "slot0",
//         })) as [bigint, number, number, number, number, number, boolean];

//         const currentTick = slot0[1];
//         // console.log("currentTick", currentTick, row?.result[4], row?.result[5]);

//         // Check if tick is within range
//         if (currentTick >= row?.result[5]! && currentTick < row?.result[6]!) {
//           setInRange(true);
//         } else {
//           setInRange(false);
//         }
//       } catch (error) {
//         console.error("Error checking range:", error);
//         setInRange(false);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (row) {
//       checkRange();
//     }
//   }, [row, chainId, config, publicClient, chainContractConfig]);

//   return (
//     // <>
//     //   {loading ? (
//     //     <div className="flex  justify-start items-center gap-2 text-gray-500">
//     //       <LucideLoader2 className="w-4 h-4 animate-spin" />
//     //     </div>
//     //   ) : (
//     //     <div
//     //       className={`mt-2 text-start px-3 py-1 rounded-full font-bold ${
//     //         inRange ? " text-green-500" : " text-red-500"
//     //       }`}
//     //     >
//     //       {inRange ? "Yes" : "No "}
//     //     </div>
//     //   )}
//     // </>
//     <div className="flex items-center justify-start h-[24px]">
//       {loading ? (
//         <LucideLoader2 className="w-4 h-4 animate-spin text-gray-500" />
//       ) : (
//         <span
//           className={`font-bold ${inRange ? "text-green-500" : "text-red-500"}`}
//         >
//           {inRange ? "Yes" : "No"}
//         </span>
//       )}
//     </div>
//   );
// };

// export default RangeSelector;

"use client";
import { contractConfig } from "@/config/blockchain.config";
import { ContractConfigItemType } from "@/interfaces/index.i";
import React, { useEffect, useState } from "react";
import { Abi, Address, createPublicClient, getContract } from "viem";
import { useAccount, useConfig, http } from "wagmi";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { readContract } from "@wagmi/core";
import { LucideLoader2 } from "lucide-react";

const RangeSelector = ({ row }: { row: any }) => {
  const { chainId } = useAccount();
  const config = useConfig();
  const chainContractConfig: ContractConfigItemType =
    contractConfig[chainId!] || contractConfig["default"];

  const [inRange, setInRange] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false); // Start as false

  const publicClient = createPublicClient({
    chain: chainContractConfig.chain!,
    transport: http(),
  });

  useEffect(() => {
    const checkRange = async () => {
      try {
        setLoading(true); // Only set true when fetching
        setInRange(null);

        const poolAddress = (await readContract(config, {
          address: chainContractConfig.v3FactoryAddress as Address,
          abi: chainContractConfig.v3FactoryABI,
          functionName: "getPool",
          args: [row?.result[2]!, row?.result[3]!, row?.result[4]!],
        })) as Address;

        if (
          !poolAddress ||
          poolAddress === "0x0000000000000000000000000000000000000000"
        ) {
          setInRange(false);
          return;
        }

        const poolContract = getContract({
          address: poolAddress,
          abi: IUniswapV3PoolABI.abi as Abi,
          client: publicClient,
        });

        const slot0 = (await readContract(config, {
          address: poolContract.address,
          abi: poolContract.abi,
          functionName: "slot0",
        })) as [bigint, number, number, number, number, number, boolean];

        const currentTick = slot0[1];

        setInRange(
          currentTick >= row?.result[5]! && currentTick < row?.result[6]!
        );
      } catch (error) {
        console.error("Error checking range:", error);
        setInRange(false);
      } finally {
        setLoading(false);
      }
    };

    if (row) checkRange();
  }, []);

  return (
    <div className="flex items-center justify-start h-[20px] ">
      {loading ? (
        <LucideLoader2 className="w-4 h-4 animate-spin text-gray-500" />
      ) : inRange !== null ? (
        <span
          className={` text-xs ${
            inRange
              ? "text-[#4ADE80] bg-[#22C55E33] border border-[#4ADE80]/20 rounded-full px-3 py-[2px]"
              : "text-[#A3A3A3] bg-[#6B728033] border border-[#A3A3A3]/20 rounded-full px-3 py-[2px]"
          }`}
        >
          {inRange ? "Yes" : "No"}
        </span>
      ) : null}{" "}
      {/* Show nothing until result comes */}
    </div>
  );
};

export default RangeSelector;
