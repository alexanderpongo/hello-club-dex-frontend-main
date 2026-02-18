import React, { useEffect, useState } from "react";
import LockDetailsCard from "./LockDetailsCard";
import { useAccount } from "wagmi";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import axios from "axios";
import { differenceInDays, format } from "date-fns";

interface LockDetail {
  title: string;
  value: string;
  subtitle?: string;
  timeStamp?: number | undefined;
}

type LpLockType = {
  id: string;
  owner: string;
  tokenId: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
  unlockTime: string;
  token0Symbol?: string;
  token1Symbol?: string;
};

function LockDetailsSection() {
  const { address, chainId } = useAccount();

  const [lpLocks, setLpLocks] = useState<LpLockType[]>([]);

  const mockLocks: LpLockType[] = [
    {
      id: "demo-1",
      owner: address || "0x000...000",
      tokenId: "740213",
      blockNumber: "18000000",
      blockTimestamp: String(Math.floor(Date.now() / 1000) - 86400 * 10),
      transactionHash: "0xabc...def",
      unlockTime: String(Math.floor(Date.now() / 1000) + 86400 * 30), // 30 days from now
      token0Symbol: "WBNB",
      token1Symbol: "USDT",
    },
    {
      id: "demo-2",
      owner: address || "0x000...000",
      tokenId: "852104",
      blockNumber: "18500000",
      blockTimestamp: String(Math.floor(Date.now() / 1000) - 86400 * 5),
      transactionHash: "0x789...012",
      unlockTime: String(Math.floor(Date.now() / 1000) + 86400 * 180), // 6 months from now
      token0Symbol: "USDC",
      token1Symbol: "WBNB",
    }
  ];

  const displayLocks = lpLocks && lpLocks.length > 0 ? lpLocks : mockLocks;
  const [nextUnLock, setNextUnlock] = useState<number>(0);
  const [remainingDays, setRemainingDays] = useState("");

  const fetchLpLocks = async () => {
    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId ?? "default"];
    const QUERY = `
           query MyQuery {
              lpLocks (orderBy: unlockTime, orderDirection: asc, skip: ${0}, first: ${1000},where: {owner: "${address}"})  {
                  id
                  owner
                  tokenId
                  unlockTime
                  blockNumber
                  blockTimestamp
                  transactionHash
              }
          }
          `;

    try {
      // const response = await axios.post(
      //   chainContractConfig?.lpLockSubgraphUrl as string,
      //   {
      //     query: QUERY,
      //   }
      // );

      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId ?? "default"];
      const response = await fetch("api/get-locks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          url: chainContractConfig?.lpLockSubgraphUrl as string,
        }),
      });

      const data = await response.json();
      // console.log("lock", data);
      setLpLocks(data?.data);
      // if (response) {
      //   console.log(response?.data?.data?.lpLocks);
      //   setLpLocks(response?.data?.data?.lpLocks);
      // }
    } catch (error) {
      console.error("Error while fetch lp locks", error);
    }
  };

  useEffect(() => {
    if (chainId) {
      fetchLpLocks();
    }
  }, [chainId]);

  useEffect(() => {
    if (displayLocks && displayLocks.length > 0) {
      let nextUnLock = 0;
      displayLocks.map((lock, index) => {
        if (index == 0) {
          nextUnLock = Number(lock.unlockTime);
        } else {
          if (nextUnLock > Number(lock.unlockTime)) {
            nextUnLock = Number(lock.unlockTime);
          }
        }
      });

      setNextUnlock(nextUnLock);
    }
  }, [displayLocks]);

  useEffect(() => {
    const unlockTime = Number(nextUnLock) * 1000;
    const now = Date.now();

    const remainingDays = differenceInDays(new Date(unlockTime), new Date(now));
    setRemainingDays(remainingDays.toString());
  }, [nextUnLock]);

  const cardData: LockDetail[] = [
    // {
    //   title: "Total Value Locked",
    //   value: "$12,450.00",
    //   subtitle: "+5.2% from last week",
    // },
    {
      title: "Active Locks",
      value: displayLocks.length.toString(),
      // subtitle: "Across 1 blockchain",
    },
    {
      title: "Next Unlock",
      value: `${nextUnLock > 0
        ? format(new Date(Number(nextUnLock) * 1000), "PPP")
        : "N/A"
        }`,
      subtitle: `In ${nextUnLock > 0 ? remainingDays : "N/A"} days`,
      timeStamp: nextUnLock,
    },
  ];

  // const colorClasses = ["text-green-400", "text-gray-400", "text-primary"];
  const colorClasses = ["text-gray-400", "text-primary"];
  return (
    <div className="grid grid-cols-1 [370px]:grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 w-full py-1 my-1">
      {cardData.map((data, index) => (
        <LockDetailsCard
          data={data}
          key={index}
          colorClass={colorClasses[index % colorClasses.length]}
        />
      ))}
    </div>
  );
}

export default LockDetailsSection;
