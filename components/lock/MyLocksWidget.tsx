import React, { useEffect, useState } from "react";
import MyLockCard from "./MyLockCard";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { useAccount } from "wagmi";
import axios from "axios";
import { Chain } from "viem";
import { bsc } from "viem/chains";
import { Button } from "../ui/button";
import { useConnectModal } from "@rainbow-me/rainbowkit";

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

function MyLocksWidget({
  setTabValue,
}: {
  setTabValue?: (value: string) => void;
}) {
  const { openConnectModal } = useConnectModal();
  const { address, chainId, chain } = useAccount();
  const [isRefetch, setIsRefetch] = useState<boolean>(false);

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

  const fetchLpLocks = async () => {
    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId ?? "default"];
    const QUERY = `
         query MyQuery {
            lpLocks (skip: ${0}, first: ${1000},where: {owner: "${address}"})  {
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

      // if (response) {
      //   console.log(response?.data?.data?.lpLocks);
      //   setLpLocks(response?.data?.data?.lpLocks);
      // }
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
    } catch (error) { }
  };

  useEffect(() => {
    if (chainId) {
      fetchLpLocks();
    }
  }, [chainId, address, isRefetch]);

  return (
    <div className="space-y-4">
      {displayLocks.map((lock, index) => (
        <div key={lock.id || index} className="relative group">
          <MyLockCard
            details={lock}
            chain={chain || (bsc as any)}
            isRefetch={isRefetch}
            setIsRefetch={setIsRefetch}
          />
        </div>
      ))}

      {!address && (
        <div className="flex flex-col w-full justify-center items-center text-center py-8 bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-white/10 mt-6 space-y-4 font-lato">
          <p className="text-gray-400 text-sm">Connect your wallet to manage your own locks</p>
          <Button
            className="rounded-full bg-primary text-black hover:bg-primary/80 px-8 h-10 font-normal"
            onClick={openConnectModal}
          >
            Connect Wallet
          </Button>
        </div>
      )}

      {address && lpLocks.length === 0 && (
        <div className="flex flex-col w-full justify-center items-center text-center py-6 text-gray-400 space-y-4 font-lato">
          <p className="text-sm">You haven't created any locks yet</p>
          <Button
            className="rounded-full border border-primary text-primary hover:bg-primary/10 px-8 h-10 font-normal"
            onClick={() => setTabValue?.("new")}
          >
            Create your first lock
          </Button>
        </div>
      )}
    </div>
  );
}

export default MyLocksWidget;
