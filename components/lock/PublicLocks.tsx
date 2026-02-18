import React, { useCallback, useEffect, useState } from "react";
import LockDetailsCard from "./LockDetailsCard";
import axios from "axios";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { useAccount } from "wagmi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyLockCard from "./MyLockCard";
import { Chain } from "viem";
import { bsc, bscTestnet, mainnet } from "viem/chains";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

interface LockDetail {
  title: string;
  value: string;
  subtitle?: string;
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

const rowsPerPage: string[] = ["5", "10", "20"];

function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const PublicLocks = () => {
  const { address, chainId, chain } = useAccount();

  const [allLpLocks, setAllLpLocks] = useState<LpLockType[]>([]);

  const mockLocks: LpLockType[] = [
    {
      id: "demo-p1",
      owner: "0x123...456",
      tokenId: "740213",
      blockNumber: "18000000",
      blockTimestamp: String(Math.floor(Date.now() / 1000) - 86400 * 15),
      transactionHash: "0xabc...def",
      unlockTime: String(Math.floor(Date.now() / 1000) + 86400 * 45),
      token0Symbol: "WBNB",
      token1Symbol: "USDT",
    },
    {
      id: "demo-p2",
      owner: "0x456...789",
      tokenId: "852104",
      blockNumber: "18500000",
      blockTimestamp: String(Math.floor(Date.now() / 1000) - 86400 * 8),
      transactionHash: "0x789...012",
      unlockTime: String(Math.floor(Date.now() / 1000) + 86400 * 200),
      token0Symbol: "USDC",
      token1Symbol: "WBNB",
    },
    {
      id: "demo-p3",
      owner: "0x789...abc",
      tokenId: "963258",
      blockNumber: "19000000",
      blockTimestamp: String(Math.floor(Date.now() / 1000) - 86400 * 2),
      transactionHash: "0x012...345",
      unlockTime: String(Math.floor(Date.now() / 1000) + 86400 * 365),
      token0Symbol: "WBNB",
      token1Symbol: "DAI",
    }
  ];

  const displayLocks = allLpLocks && allLpLocks.length > 0 ? allLpLocks : mockLocks;
  const [rows, setRows] = useState<string>(rowsPerPage[0]);
  const [page, setPage] = useState<number>(1);
  const [isDisableedNext, setIsDisableedNext] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [debounceSearch, setDebounceSearch] = useState<string>("");
  const [isRefetch, setIsRefetch] = useState<boolean>(false);

  const fetchAllLpLocks = async () => {
    try {
      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId ?? "default"];
      console.log("chainContractConfig", chainContractConfig.lpLockSubgraphUrl);

      const response = await fetch("api/get-all-locks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          url: chainContractConfig?.lpLockSubgraphUrl as string,
          pages: page,
          rows: rows,
        }),
      });

      const data = await response.json();
      setAllLpLocks(data?.data);
    } catch (error) {
      console.error("Error while fetch lp locks", error);
    }
  };

  useEffect(() => {
    if (chainId) {
      fetchAllLpLocks();
    }
  }, [chainId, page, rows]);

  const cardData: LockDetail[] = [
    {
      title: "Total Locks",
      value: displayLocks.length.toString(),
    },
  ];

  const handleSearchInput = (e: any) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const debouncedSearch = useCallback(
    debounce((input: string) => {
      setDebounceSearch(input);
    }, 1500),
    []
  );

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cardData.map((data, index) => (
          <LockDetailsCard data={data} key={index} />
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div>
          <Tabs defaultValue="all" className="bg-transparent space-y-5">
            <TabsList className="p-1 items-center bg-black/10 dark:bg-white/5 w-full md:w-[181px] rounded-xl h-[48px] border-0">
              <TabsTrigger
                value="all"
                className="w-full font-formula h-[40px] text-[18px] uppercase flex justify-center items-center transition-all data-[state=active]:bg-[#C2FE0C26] data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-[#C2FE0C2E] data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-white/10 data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#ffffff99]"
              >
                All Locks
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="space-y-4 my-5">
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
      </div>

      <div className="flex justify-between items-center gap-2">
        {/* row limit selection */}
        {/* <Select value={rows} onValueChange={(value) => setRows(value)}>
            <SelectTrigger className="w-fit h-10 bg-black/10 dark:bg-white dark:bg-opacity-[0.08] border border-white/10 rounded-[12px] font-barlow uppercase text-sm font-medium space-x-2">
              <SelectValue placeholder="Select a row limit" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-dark border border-white/10 rounded-[12px] p-2 backdrop-blur-sm">
              <SelectGroup>
                {rowsPerPage.map((rows) => (
                  <SelectItem
                    key={rows}
                    value={rows}
                    className="flex flex-row w-full items-center gap-2 hover:cursor-pointer hover:bg-black/10 hover:dark:bg-white/10"
                  >
                    <div className="flex flex-row items-center gap-2">
                      <p className="inline-flex">{rows}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPage(page - 1)}
              className="button-secondary w-fit !h-10 !bg-transparent border border-[#c2fe0c4D] dark:border-white/10 rounded-[12px] font-barlow uppercase text-sm font-medium space-x-2 hover:border-primary dark:hover:border-primary]"
              disabled={page == 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage(page + 1)}
              className="button-secondary w-fit !h-10 !bg-transparent border border-[#c2fe0c4D] dark:border-white/10 rounded-[12px] font-barlow uppercase text-sm font-medium space-x-2 hover:border-primary dark:hover:border-primary"
              disabled={isDisableedNext}
            >
              Next
            </Button>
          </div> */}
      </div>
    </div>
  );
};

export default PublicLocks;
