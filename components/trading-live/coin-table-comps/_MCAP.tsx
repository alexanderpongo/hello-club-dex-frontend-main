// import React, { useEffect, useMemo, useState } from "react";
// import { erc20Abi, formatUnits, Hex } from "viem";
// import { readContract } from "@wagmi/core";
// import { useAccount, useConfig } from "wagmi";
// import { ContractConfigItemType } from "@/interfaces/index.i";
// import { contractConfig } from "@/config/blockchain.config";
// import { useCmcTokenPrice } from "@/hooks/useCmcTokenPrice";
// import { useOptionalRowContext } from "@/components/trading-live/coin-table-comps/RowContext";
// import { useTradingLiveStore } from "@/store/tradinglive.store";
// import { useQuery } from "@tanstack/react-query";

// interface MCAPProps {
//   poolAddress: Hex;
//   token0: Hex;
//   token0Decimals: number;
//   token0Symbol: string;
//   chainId: number;
//   tokenId: string;
// }

// const MCAP: React.FC<MCAPProps> = (props) => {
//   const {
//     poolAddress,
//     token0,
//     token0Decimals,
//     token0Symbol,
//     chainId,
//     tokenId,
//   } = props;
//   const config = useConfig();
//   const defaultChain = 56;
//   const [CMCAP, setCMCAP] = useState<number | null>(null);
//   const rowCtx = useOptionalRowContext();
//   // const { setFinalFilteredData, finalFilteredData, removeRowByKey } =
//   //   useTradingLiveStore();

//   const chainContractConfig: ContractConfigItemType =
//     contractConfig[chainId ?? defaultChain];

//   //   1. Fetch the total supply of token0
//   const totalSupply = async (token0Address: Hex) => {
//     const tSupply = await readContract(config, {
//       address: token0Address,
//       abi: erc20Abi,
//       functionName: "totalSupply",
//       chainId: chainId ?? defaultChain,
//     });

//     const convertedTSupply = formatUnits(tSupply, token0Decimals);

//     return Number(convertedTSupply);
//   };
//   //   2. Fetch pool balance of token0

//   const token0PoolBalance = async () => {
//     const balance = await readContract(config, {
//       address: token0,
//       abi: erc20Abi,
//       functionName: "balanceOf",
//       args: [poolAddress],
//       chainId: chainId ?? defaultChain,
//     });

//     const convertedBalance = formatUnits(balance, token0Decimals);
//     return Number(convertedBalance);
//   };

//   //   3. Fetch dead and null addresses balance of token0
//   const deadAddress = "0x000000000000000000000000000000000000dEaD";
//   const nullAddress = "0x0000000000000000000000000000000000000000";

//   const deadAddressBalance = async () => {
//     const balance = await readContract(config, {
//       address: token0,
//       abi: erc20Abi,
//       functionName: "balanceOf",
//       args: [deadAddress],
//       chainId: chainId ?? defaultChain,
//     });

//     const convertedBalance = formatUnits(balance, token0Decimals);
//     return Number(convertedBalance);
//   };
//   const nullAddressBalance = async () => {
//     const balance = await readContract(config, {
//       address: token0,
//       abi: erc20Abi,
//       functionName: "balanceOf",
//       args: [nullAddress],
//       chainId: chainId ?? defaultChain,
//     });
//     const convertedBalance = formatUnits(balance, token0Decimals);
//     return Number(convertedBalance);
//   };

//   //   4. Calculate circulating supply
//   //   Circulating Supply = Total Supply - (Dead Address Balance + Null Address Balance + Pool Balance)
//   const circulatingSupply = (
//     totalSupply: number,
//     deadBalance: number,
//     nullBalance: number,
//     poolBalance: number
//   ) => {
//     return totalSupply - (deadBalance + nullBalance + poolBalance);
//   };

//   const priceUSD = rowCtx?.finalPriceUSD ?? null;

//   const { data: mcapData, isLoading } = useQuery({
//     queryKey: [
//       "mcap",
//       chainId,
//       token0,
//       token0Decimals,
//       poolAddress,
//       tokenId,
//       priceUSD,
//     ],
//     queryFn: async () => {
//       const [tSupply, poolBal, deadBal, nullBal] = await Promise.all([
//         totalSupply(token0),
//         token0PoolBalance(),
//         deadAddressBalance(),
//         nullAddressBalance(),
//       ]);
//       const circSupply = circulatingSupply(tSupply, deadBal, nullBal, poolBal);
//       const mcap = circSupply * (priceUSD as number);
//       return Number.isFinite(mcap) ? mcap : null;
//     },
//     staleTime: 60_000,
//     gcTime: 5 * 60_000,
//     refetchOnWindowFocus: false,
//     enabled: Boolean(priceUSD != null && token0 && poolAddress),
//     placeholderData: (prev) => prev,
//   });

//   useEffect(() => {
//     if (typeof mcapData === "number") {
//       if (mcapData < 0.001) {
//         removeRowByKey(chainId, String(tokenId));
//       }
//       setCMCAP(mcapData);
//     } else if (mcapData === null) {
//       setCMCAP(null);
//     }
//   }, [mcapData, chainId, tokenId, removeRowByKey]);

//   return (
//     <div>
//       {isLoading && !rowCtx?.finalPriceUSD ? (
//         <span>Loading ...</span>
//       ) : (
//         <>{CMCAP ? `$${CMCAP.toLocaleString()}` : "-"}</>
//       )}
//     </div>
//   );
// };

// export default MCAP;
