"use client";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  ChainType,
  ContractConfigItemType,
  TokenType,
} from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { PairColumns } from "./PairDataColumns";
import { FeeColumns } from "./FeeDataColumns";
import { PairDataTable } from "./PairDataTable";
import { getInitials } from "@/lib/utils";
import { useSwapStore, useLPStore } from "@/store/useDexStore";
import Image from "next/image";
import UserPosition from "./UserPosition";
import { FeeCollectsTable } from "./FeeCollectsTable";
import { BadgeInfo, LucideLoader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface TransactionsProps {
  id: string;
  tokenA: TokenType | undefined;
  tokenB: TokenType | undefined;
  chain: ChainType | undefined;
}

const Transactions = ({ id, tokenA, tokenB, chain }: TransactionsProps) => {
  const { chainId, address } = useAccount();
  const router = useRouter();
  const [feesData, setFeesData] = useState([]);

  const [loading, setLoading] = useState(false);
  const {
    dataRow,
    setPairFromToken,
    setPairToToken,
    setSingleDataRow,
    defaultTab,
  } = useSwapStore();

  const { removeLpSuccess, collectFeeSuccess, pendingFee0, pendingFee1 } =
    useLPStore();

  // console.log("aaaaaaa", id, "dataRow", dataRow);

  const fetchData = async () => {
    setLoading(true);
    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId ?? "default"];
    // console.log("fetch call");

    if (!id) {
      throw new Error("Invalid pool ID");
    }

    const QUERY = `
    query MyQuery {
      pool(id: "${id}"){
        id
        amount0
        amount1
        liquidity
        owner
        blockTimestamp
      }
    }
   `;

    try {
      // const response = await axios.post(
      //   chainContractConfig?.subgraphUrl as string,
      //   {
      //     query: QUERY,
      //   }
      // );
      const response = await fetch("/api/get-user-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          url: chainContractConfig?.subgraphUrl as string,
        }),
      });
      const data = await response.json();

      // console.log("user data", data);

      if (data.status === 200 && data.body.data) {
        setSingleDataRow(data.body.data);
        // return as a array
        return [data.body.data];
      } else {
        // Return empty array if no data found
        return [];
      }
    } catch (error: any) {
      console.error("Error while fetching pools from subgraph:", error);
    } finally {
      setLoading(false);
    }
    fetchFeesCollectData();
  };

  const fetchFeesCollectData = async () => {
    setLoading(true);
    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId ?? "default"];

    if (!id) {
      throw new Error("Invalid pool ID");
    }

    const QUERY = `
  query MyQuery {
  collects(orderBy: blockTimestamp, orderDirection: desc, first: 1000) {
    amount0
    amount1
    tokenId
    recipient
    id
    blockTimestamp
      }
    }
    `;
    try {
      const response = await fetch("/api/get-fees-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          url: chainContractConfig?.subgraphUrl as string,
        }),
      });

      // const response = await axios.post(
      //   chainContractConfig?.subgraphUrl as string,
      //   {
      //     query: QUERY,
      //   }
      // );
      const data = await response.json();

      // console.log("fees collect data ", data?.data);
      let feecollects = data?.data;

      // if (data.status === 200) {
      //   const filteredCollects = feecollects.filter((collect: any) => {
      //     console.log(
      //       "collect.tokenId",
      //       collect.tokenId.toString().toLowerCase(),
      //       id.toString().toLowerCase(),
      //       "collect.recipient",
      //       address?.toString().toLowerCase(),
      //       collect.recipient.toString().toLowerCase()
      //     );
      //     return (
      //       collect.tokenId.toString().toLowerCase() ===
      //         id.toString().toLowerCase() &&
      //       address?.toString().toLowerCase() ===
      //         collect.recipient.toString().toLowerCase()
      //     );
      //   });
      //   console.log("filteredCollects", filteredCollects);
      //   setFeesData(filteredCollects);
      // }

      if (data.status === 200) {
        const filteredCollects = feecollects.filter((collect: any) => {
          return (
            collect.tokenId.toString().toLowerCase() ===
              id.toString().toLowerCase() &&
            address?.toString().toLowerCase() ===
              collect.recipient.toString().toLowerCase()
          );
        });

        // console.log("filteredCollects", filteredCollects);
        setFeesData(filteredCollects);
      } else {
        setFeesData([]); // assuming `setData` was a typo
      }
    } catch (error: any) {
      console.error("Error while fetching collects from subgraph:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenA && tokenB) {
      // Helper function to check if a token is the native token for the current chain
      const isNativeToken = (tokenAddress: string, chainId: number) => {
        const wrappedNativeAddresses = {
          1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase(), // ETH
          56: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c".toLowerCase(), // BNB
          97: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd".toLowerCase(), // BSC Testnet
          10: "0x4200000000000000000000000000000000000006".toLowerCase(), // Optimism
          8453: "0x4200000000000000000000000000000000000006".toLowerCase(), // Base
        };

        return (
          tokenAddress.toLowerCase() ===
          wrappedNativeAddresses[chainId as keyof typeof wrappedNativeAddresses]
        );
      };

      // Convert tokens to native if they are wrapped native tokens
      const convertedTokenA = {
        ...tokenA,
        address: isNativeToken(tokenA.address, tokenA.chainId)
          ? "native"
          : tokenA.address,
        name: isNativeToken(tokenA.address, tokenA.chainId)
          ? tokenA.name.replace(/^Wrapped /, "")
          : tokenA.name,
        symbol: isNativeToken(tokenA.address, tokenA.chainId)
          ? tokenA.symbol.replace(/^W/, "")
          : tokenA.symbol,
      };

      const convertedTokenB = {
        ...tokenB,
        address: isNativeToken(tokenB.address, tokenB.chainId)
          ? "native"
          : tokenB.address,
        name: isNativeToken(tokenB.address, tokenB.chainId)
          ? tokenB.name.replace(/^Wrapped /, "")
          : tokenB.name,
        symbol: isNativeToken(tokenB.address, tokenB.chainId)
          ? tokenB.symbol.replace(/^W/, "")
          : tokenB.symbol,
      };

      console.log("Transactions: Setting converted tokens:", {
        convertedTokenA,
        convertedTokenB,
      });

      setPairFromToken(convertedTokenA);
      setPairToToken(convertedTokenB);
    }
  }, [tokenA, tokenB, setPairFromToken, setPairToToken]);

  // const { data, isLoading, isError } = useQuery({
  //   queryKey: ["transactions", id, removeLpSuccess, collectFeeSuccess, chainId],
  //   queryFn: () => fetchData(),
  //   enabled: !!chainId,
  // });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["transactions", id, removeLpSuccess, collectFeeSuccess, chainId],
    queryFn: async () => {
      const result = await fetchData();
      await fetchFeesCollectData();
      return result;
    },
    enabled: !!chainId,
  });

  // Redirect to /pools if no wallet is connected (with 1 second delay)
  useEffect(() => {
    if (!address) {
      const timer = setTimeout(() => {
        router.push("/pools");
      }, 1000); // Wait 4 seconds before redirecting

      return () => clearTimeout(timer);
    }
  }, [address, router]);

  return (
    // <div className="flex flex-col w-full">
    //   <div
    //     className={`flex flex-row w-full items-center justify-start ${
    //       defaultTab === "my" ? "pb-0" : "pb-6"
    //     }`}
    //   >
    //     <div className="w-[78px] flex flex-row justify-start items-end relative">
    //       <div className="rounded-full w-[35px] h-[35px] border-[2px] border-[#1a1a1a] flex items-center justify-center bg-[#1a1a1a] text-white text-sm font-bold">
    //         {getInitials(dataRow?.token0.name! ?? "NA")}
    //       </div>
    //       <div className="rounded-full w-[33px] h-[33px] border-[2px] flex items-center justify-center bg-gray-200 text-black text-sm font-bold">
    //         {getInitials(dataRow?.token1.name! ?? "NA")}
    //       </div>
    //     </div>
    //     <div className="flex flex-row justify-center items-center gap-4">
    //       <div>
    //         {dataRow?.token0.symbol!} / {dataRow?.token1.symbol!}
    //       </div>
    //       <div className="text-gray-500  inline-flex gap-2 items-center ">
    //         {chain?.image && (
    //           <Image
    //             src={chain?.image!}
    //             alt={chain?.name!}
    //             width={0}
    //             height={0}
    //             sizes="100vw"
    //             //   className="rounded-full w-[18px] h-[18px] border-[2px] border-[#0F172A] absolute left-12 z-30"
    //             className="rounded-full w-[18px] h-[18px] border-[2px] border-[#0F172A]"
    //           />
    //         )}{" "}
    //         {chain?.name!}
    //       </div>
    //       {dataRow && (
    //         <div className="flex gap-1 text-[10px]  font-bold">
    //           <div className="w-[29px] rounded-full bg-[#EC489933] text-[#EC4899] text-center">
    //             V3
    //           </div>
    //           <div className="w-[39px] rounded-full text-center bg-primary text-[#000]">
    //             {dataRow?.result[4]! / 10000}%
    //           </div>
    //         </div>
    //       )}
    //     </div>
    //   </div>

    //   {defaultTab === "my" && (
    //     <>
    //       <div className="mt-4 mb-1">
    //         <UserPosition data={data} />
    //       </div>
    //     </>
    //   )}

    //   {defaultTab === "my" && parseFloat(dataRow.liquidity) !== 0 && (
    //     <div className="py-1 -mt-2 flex gap-1 text-black/60 dark:text-white/60 text-sm items-center text-start">
    //       <BadgeInfo className="text-sm flex-shrink-0" />
    //       <span>Please collect your fees before removing liquidity.</span>
    //     </div>
    //   )}

    //   {defaultTab === "my" &&
    //     address?.toString().toLowerCase() ===
    //       dataRow.owner.toString().toLowerCase()! &&
    //     feesData.length > 0 && (
    //       <div className="p-2 mt-4 card-primary md:p-4 w-full flex flex-col border  rounded-xl ">
    //         <div className="flex text-xl font-semibold ">
    //           Collected Fees & Funds
    //         </div>
    //         <div className="flex flex-row  pt-4 w-full md:min-w-[600px] ">
    //           <FeeCollectsTable data={feesData} columns={FeeColumns} />
    //         </div>
    //       </div>
    //     )}

    //   {defaultTab != "my" && (
    //     <div className="p-2 mt-4 card-primary md:p-4 w-full flex flex-col border  rounded-xl ">
    //       <div className="flex text-xl font-semibold ">Transactions</div>
    //       <div className="flex flex-row  pt-4 w-full md:min-w-[600px] ">
    //         <PairDataTable data={data} columns={PairColumns} />
    //       </div>
    //     </div>
    //   )}
    // </div>
    // <div className="flex flex-col w-full min-w-[700px]">
    //   <div
    //     className={`flex flex-row w-full items-center justify-start ${
    //       defaultTab === "my" ? "pb-0" : "pb-6"
    //     }`}
    //   >
    //     <div className="w-[78px] flex flex-row justify-start items-end relative">
    //       <div className="rounded-full w-[35px] h-[35px] border-[2px] border-[#1a1a1a] flex items-center justify-center bg-[#1a1a1a] text-white text-sm font-bold">
    //         {getInitials(dataRow?.token0.name! ?? "NA")}
    //       </div>
    //       <div className="rounded-full w-[33px] h-[33px] border-[2px] flex items-center justify-center bg-gray-200 text-black text-sm font-bold">
    //         {getInitials(dataRow?.token1.name! ?? "NA")}
    //       </div>
    //     </div>

    //     <div className="flex flex-row justify-start items-center gap-4 flex-1">
    //       <div>
    //         {dataRow?.token0.symbol!} / {dataRow?.token1.symbol!}
    //       </div>
    //       <div className="text-gray-500 inline-flex gap-2 items-center">
    //         {chain?.image && (
    //           <Image
    //             src={chain?.image!}
    //             alt={chain?.name!}
    //             width={18}
    //             height={18}
    //             className="rounded-full border-[2px] border-[#0F172A]"
    //           />
    //         )}
    //         {chain?.name!}
    //       </div>
    //       {dataRow && (
    //         <div className="flex gap-1 text-[10px] font-bold">
    //           <div className="w-[29px] rounded-full bg-[#EC489933] text-[#EC4899] text-center">
    //             V3
    //           </div>
    //           <div className="w-[39px] rounded-full text-center bg-primary text-[#000]">
    //             {dataRow?.result[4]! / 10000}%
    //           </div>
    //         </div>
    //       )}
    //     </div>
    //   </div>

    //   {/* Always maintain a min width for table wrapper */}
    //   <div className="mt-4 w-full min-w-[700px]">
    //     {defaultTab === "my" && <UserPosition data={data!} />}

    //     {defaultTab === "my" &&
    //       parseFloat(dataRow.liquidity) !== 0 &&
    //       (parseFloat(pendingFee0!) > 0 || parseFloat(pendingFee1!) > 0) && (
    //         <div className="py-1 -mt-2 flex gap-1 text-black/60 dark:text-white/60 text-sm items-center text-start">
    //           <BadgeInfo className="text-sm flex-shrink-0" />
    //           <span>Please collect your fees before removing liquidity.</span>
    //         </div>
    //       )}

    //     {defaultTab === "my" &&
    //       address?.toString().toLowerCase() ===
    //         dataRow.owner.toString().toLowerCase()! &&
    //       feesData.length > 0 && (
    //         <div className="p-2 mt-4 card-primary md:p-4 w-full flex flex-col border rounded-xl min-w-[600px]">
    //           <div className="flex text-xl font-formula text-primary">
    //             Collected Fees & Funds
    //           </div>
    //           <div className="flex flex-row pt-4 w-full">
    //             <FeeCollectsTable data={feesData} columns={FeeColumns} />
    //           </div>
    //         </div>
    //       )}

    //     {defaultTab !== "my" && (
    //       <div className="p-2 mt-4 card-primary md:p-4 w-full flex flex-col border rounded-xl min-w-[600px]">
    //         <div className="flex text-xl font-formula text-primary">
    //           Transactions
    //         </div>
    //         <div className="flex flex-row pt-4 w-full">
    //           <PairDataTable data={data} columns={PairColumns} />
    //         </div>
    //       </div>
    //     )}
    //   </div>
    // </div>
    <div className="flex flex-col w-full md:min-w-[700px]">
      <div
        className={`flex flex-col md:flex-row w-full items-start md:items-center justify-start gap-4 ${
          defaultTab === "my" ? "pb-0" : "pb-6"
        }`}
      >
        {/* Token icons */}
        <div className="flex flex-row items-end relative gap-2">
          <div className="rounded-full w-[35px] h-[35px] border-[2px] border-[#1a1a1a] flex items-center justify-center bg-[#1a1a1a] text-white text-sm font-bold overflow-hidden">
            {dataRow?.token0?.logoURI ? (
              <Image
                src={dataRow.token0.logoURI}
                alt={dataRow.token0.symbol}
                width={31}
                height={31}
                className="rounded-full"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
            ) : null}
            <div
              className={`${
                dataRow?.token0?.logoURI ? "hidden" : ""
              } w-full h-full flex items-center justify-center`}
            >
              {getInitials(dataRow?.token0.name! ?? "NA")}
            </div>
          </div>
          <div className="rounded-full w-[33px] h-[33px] border-[2px] flex items-center justify-center bg-gray-200 text-black text-sm font-bold overflow-hidden">
            {dataRow?.token1?.logoURI ? (
              <Image
                src={dataRow.token1.logoURI}
                alt={dataRow.token1.symbol}
                width={29}
                height={29}
                className="rounded-full"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
            ) : null}
            <div
              className={`${
                dataRow?.token1?.logoURI ? "hidden" : ""
              } w-full h-full flex items-center justify-center`}
            >
              {getInitials(dataRow?.token1.name! ?? "NA")}
            </div>
          </div>
        </div>

        {/* Token details */}
        <div className="flex flex-wrap md:flex-row justify-start items-center gap-2 md:gap-4 flex-1">
          <div>
            {dataRow?.token0.symbol!} / {dataRow?.token1.symbol!}
          </div>
          <div className="text-gray-500 inline-flex gap-2 items-center">
            {chain?.image && (
              <Image
                src={chain?.image!}
                alt={chain?.name!}
                width={18}
                height={18}
                className="rounded-full border-[2px] border-[#0F172A]"
              />
            )}
            {chain?.name!}
          </div>
          {dataRow && (
            <div className="flex gap-1 text-[10px] font-bold">
              <div className="w-[29px] rounded-full bg-[#EC489933] text-[#EC4899] text-center">
                V3
              </div>
              <div className="w-[39px] rounded-full text-center bg-primary text-[#000]">
                {dataRow?.result[4]! / 10000}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="mt-4 w-full md:min-w-[700px] overflow-x-auto">
        {defaultTab === "my" && parseFloat(dataRow.liquidity) !== 0 && (
          <UserPosition data={data!} />
        )}

        {defaultTab === "my" &&
          parseFloat(dataRow.liquidity) !== 0 &&
          (parseFloat(pendingFee0!) > 0 || parseFloat(pendingFee1!) > 0) && (
            <div className="py-1 -mt-2 flex gap-1 text-black/60 dark:text-white/60 text-sm items-center text-start">
              <BadgeInfo className="text-sm flex-shrink-0" />
              <span>Please collect your fees before removing liquidity.</span>
            </div>
          )}

        {address?.toString().toLowerCase() ===
          dataRow.owner.toString().toLowerCase()! &&
          feesData.length > 0 && (
            <div className="p-2 mt-4 card-primary md:p-4 w-full flex flex-col border rounded-xl overflow-x-auto">
              <div className="flex text-xl font-formula text-primary">
                Collected Fees & Funds
              </div>
              <div className="flex flex-row pt-4 w-full">
                {isLoading ? (
                  <LucideLoader2 className="animate-spin mx-auto " />
                ) : (
                  <FeeCollectsTable data={feesData} columns={FeeColumns} />
                )}
              </div>
            </div>
          )}

        {parseFloat(dataRow.liquidity) !== 0 && (
          <div className="p-2 mt-4 card-primary md:p-4 w-full flex flex-col border rounded-xl overflow-x-auto">
            <div className="flex text-xl font-formula text-primary">
              Transactions
            </div>
            <div className="flex flex-row pt-4 w-full">
              {isLoading ? (
                <LucideLoader2 className="animate-spin mx-auto " />
              ) : (
                <PairDataTable
                  data={data!}
                  columns={PairColumns}
                  isLoading={isLoading}
                  isError={isError}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
