"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount, useConfig } from "wagmi";
import { chainConfig, contractConfig } from "@/config/blockchain.config";
import { readContract, switchChain } from "@wagmi/core";
import { Address, erc20Abi, Hex } from "viem";
import {
  ChainConfigItemType,
  ContractConfigItemType,
  TokenType,
} from "@/interfaces/index.i";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useSwapStore, useLPStore } from "@/store/useDexStore";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { DataTableToolbar } from "./data-table-toolbar";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { chains } from "@/config/chains";
import {
  getCorrectLogoURI,
  adjustTokenSymbol,
  getAllTokensForChain,
  clearTokenLookupCache,
} from "@/lib/token-utils";

const PoolsView = () => {
  const { chainId, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const config = useConfig();
  const [data, setData] = useState([]);
  const [myPoolData, setMyPoolData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const { setDefaultTab } = useSwapStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setLpAddingSuccess, setActiveStep } = useLPStore();

  const chainConf: ChainConfigItemType =
    chainConfig[chainId!] || chainConfig["default"];

  const [testTokens, setTestTokens] = React.useState<TokenType[]>([]);

  const allChains = useMemo(() => {
    const networks = [...chains];

    return networks.filter(
      (chain, index, self) =>
        index === self.findIndex((t) => t.chainId === chain.chainId)
    );
  }, [chains]);

  useEffect(() => {
    const restoreFromURL = async () => {
      const urlChain = searchParams.get("chainId");

      if (!urlChain) return;

      const chainConf: ChainConfigItemType =
        chainConfig[parseFloat(urlChain)] || chainConfig["default"];

      const selectedChain = allChains.find(
        (c) => c.chainId.toString() === urlChain
      );
      if (selectedChain) {
        try {
          await switchChain(config, { chainId: selectedChain.chainId });
        } catch (err) {
          console.error("Failed to switch chain", err);
        }
      }
    };

    restoreFromURL();
  }, [searchParams, allChains]);

  // Get initial tab from URL or default to "all"
  const getInitialTab = (): string => {
    const tabParam = searchParams.get("poolTab");
    const validTabs = ["all", "my"];
    return validTabs.includes(tabParam || "") ? (tabParam as string) : "all";
  };

  const [activeTab, setActiveTab] = useState("all");

  // Table state management
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [allPoolsSorting, setAllPoolsSorting] = useState<SortingState>([]);
  const [myPoolsSorting, setMyPoolsSorting] = useState<SortingState>([]);

  // Table instances for both tabs
  const allPoolsTable = useReactTable({
    data,
    columns,
    state: {
      sorting: allPoolsSorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setAllPoolsSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const myPoolsTable = useReactTable({
    data: myPoolData,
    columns,
    state: {
      sorting: myPoolsSorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setMyPoolsSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("poolTab", value);
    router.replace(`?${newSearchParams.toString()}`, { scroll: false });
  };

  // Initialize tab from URL on component mount and handle URL changes
  useEffect(() => {
    const currentTab = getInitialTab();
    setActiveTab(currentTab);
  }, [searchParams]);

  const defaultChain = 56;
  const fetchData = async () => {
    setLoading(true);

    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId ?? defaultChain];
    const QUERY = `
     query MyQuery {
        pools (skip: ${0}, first: ${1000})  {
            id
            owner
            tokenId
            transactionHash
            liquidity
            blockNumber
            blockTimestamp
            amount0
            amount1
        }
    }
    `;

    try {
      const response = await fetch("api/get-pools-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          url: chainContractConfig?.subgraphUrl as string,
        }),
      });

      const responseLocks = await fetch("api/get-all-locks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          url: chainContractConfig?.lpLockSubgraphUrl as string,
        }),
      });

      const locks = await responseLocks.json();

      const data = await response.json();

      // Extract the actual array from the response
      const locksArray = locks?.data ?? [];

      // Create a Set of token IDs

      const lockedTokenIds = new Set(
        locksArray.map((lock: any) => lock.tokenId.toString())
      );

      if (data?.data) {
        try {
          const pairData: any = await Promise.all(
            data.data.map(async (res: any) => {
              try {
                if (
                  !chainContractConfig?.v3PositionManagerAddress ||
                  !chainContractConfig?.v3PositionManagerABI
                ) {
                  throw new Error("Missing contract config");
                }

                const position: any = await readContract(config, {
                  address:
                    chainContractConfig.v3PositionManagerAddress as Address,
                  abi: chainContractConfig.v3PositionManagerABI,
                  functionName: "positions",
                  args: [res.tokenId],
                  chainId: chainId ?? defaultChain,
                });

                const token0Address = position[2];
                const token1Address = position[3];
                // console.log("wish res", token0Address, token1Address);

                const poolAddress = await readContract(config, {
                  address: chainContractConfig.v3FactoryAddress as Hex,
                  abi: chainContractConfig.v3FactoryABI,
                  functionName: "getPool",
                  args: [token0Address, token1Address, position[4]],
                  chainId: chainId ?? defaultChain,
                });

                const [
                  token0Name,
                  token0Symbol,
                  token0Decimal,
                  token1Name,
                  token1Symbol,
                  token1Decimal,
                ] = await Promise.all([
                  readContract(config, {
                    address: token0Address as Address,
                    abi: erc20Abi,
                    functionName: "name",
                    chainId: chainId ?? defaultChain,
                  }),
                  readContract(config, {
                    address: token0Address as Address,
                    abi: erc20Abi,
                    functionName: "symbol",

                    chainId: chainId ?? defaultChain,
                  }),
                  readContract(config, {
                    address: token0Address as Address,
                    abi: erc20Abi,
                    functionName: "decimals",
                    chainId: chainId ?? defaultChain,
                  }),
                  readContract(config, {
                    address: token1Address as Address,
                    abi: erc20Abi,
                    functionName: "name",
                    chainId: chainId ?? defaultChain,
                  }),
                  readContract(config, {
                    address: token1Address as Address,
                    abi: erc20Abi,
                    functionName: "symbol",
                    chainId: chainId ?? defaultChain,
                  }),
                  readContract(config, {
                    address: token1Address as Address,
                    abi: erc20Abi,
                    functionName: "decimals",
                    chainId: chainId ?? defaultChain,
                  }),
                ]);

                // Adjust symbols based on chainId
                const adjustedToken0Symbol = adjustTokenSymbol(
                  token0Symbol,
                  chainId ?? defaultChain
                );
                const adjustedToken1Symbol = adjustTokenSymbol(
                  token1Symbol,
                  chainId ?? defaultChain
                );
                const isTokenLocked = lockedTokenIds.has(
                  res.tokenId.toString()
                );

                // Return the result with adjusted symbols
                return {
                  ...res,
                  tokenLocked: isTokenLocked,
                  result: position,
                  token0: {
                    address: token0Address,
                    name: token0Name,
                    symbol: adjustedToken0Symbol,
                    decimal: token0Decimal,
                    logoURI: getCorrectLogoURI(
                      token0Address,
                      token0Symbol,
                      adjustedToken0Symbol,
                      chainId ?? defaultChain,
                      getAllTokensForChain(chainId ?? defaultChain, testTokens)
                    ),
                  },
                  token1: {
                    address: token1Address,
                    name: token1Name,
                    symbol: adjustedToken1Symbol,
                    decimal: token1Decimal,
                    logoURI: getCorrectLogoURI(
                      token1Address,
                      token1Symbol,
                      adjustedToken1Symbol,
                      chainId ?? defaultChain,
                      getAllTokensForChain(chainId ?? defaultChain, testTokens)
                    ),
                  },
                  poolAddress: poolAddress as `0x${string}`,
                };
              } catch (error) {
                console.error(
                  "Error fetching contract data for",
                  res.id,
                  error
                );
                return { ...res, result: null };
              }
            })
          );

          setData(pairData);
        } catch (error) {
          console.error("Error processing pools:", error);
        }
      }
    } catch (error) {
      console.error("Error while fetching pools from subgraph:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersData = async () => {
    setLoadingUserData(true);
    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId ?? "default"];
    const QUERY = `


query MyQuery {
  pools(
    first: 1000
    orderBy: blockTimestamp
    orderDirection: desc
    where: {owner: "${address}"}
  ) {
    id
    owner
    liquidity
    amount0
    amount1
    blockTimestamp
    blockNumber
    transactionHash
    tokenId
  }
}
    
    `;

    try {
      const response = await fetch("api/get-user-pools-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          url: chainContractConfig?.subgraphUrl as string,
        }),
      });
      ``;

      const responseLocks = await fetch("api/get-all-locks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          url: chainContractConfig?.lpLockSubgraphUrl as string,
        }),
      });

      const locks = await responseLocks.json();
      const data = await response.json();

      const lockedTokenIds = new Set(
        Array.isArray(locks)
          ? locks.map((lock: any) => lock.tokenId.toString())
          : []
      );

      if (data?.data) {
        try {
          const pairData: any = await Promise.all(
            data?.data.map(async (res: any) => {
              try {
                if (
                  !chainContractConfig?.v3PositionManagerAddress ||
                  !chainContractConfig?.v3PositionManagerABI
                ) {
                  throw new Error("Missing contract config");
                }

                const position: any = await readContract(config, {
                  address:
                    chainContractConfig.v3PositionManagerAddress as Address,
                  abi: chainContractConfig.v3PositionManagerABI,
                  functionName: "positions",
                  args: [res.tokenId],
                  chainId: chainId ?? defaultChain,
                });

                const token0Address = position[2];
                const token1Address = position[3];

                const [
                  token0Name,
                  token0Symbol,
                  token0Decimal,
                  token1Name,
                  token1Symbol,
                  token1Decimal,
                ] = await Promise.all([
                  readContract(config, {
                    address: token0Address as Address,
                    abi: erc20Abi,
                    functionName: "name",
                  }),
                  readContract(config, {
                    address: token0Address as Address,
                    abi: erc20Abi,
                    functionName: "symbol",
                  }),
                  readContract(config, {
                    address: token0Address as Address,
                    abi: erc20Abi,
                    functionName: "decimals",
                  }),
                  readContract(config, {
                    address: token1Address as Address,
                    abi: erc20Abi,
                    functionName: "name",
                  }),
                  readContract(config, {
                    address: token1Address as Address,
                    abi: erc20Abi,
                    functionName: "symbol",
                  }),
                  readContract(config, {
                    address: token1Address as Address,
                    abi: erc20Abi,
                    functionName: "decimals",
                  }),
                ]);

                // Adjust symbols based on chainId
                const adjustedToken0Symbol = adjustTokenSymbol(
                  token0Symbol,
                  chainId ?? defaultChain
                );
                const adjustedToken1Symbol = adjustTokenSymbol(
                  token1Symbol,
                  chainId ?? defaultChain
                );

                const isTokenLocked = lockedTokenIds.has(
                  res.tokenId.toString()
                );
                // Return the result with adjusted symbols
                return {
                  ...res,
                  tokenLocked: isTokenLocked,
                  result: position,
                  token0: {
                    address: token0Address,
                    name: token0Name,
                    symbol: adjustedToken0Symbol,
                    decimal: token0Decimal,
                    logoURI: getCorrectLogoURI(
                      token0Address,
                      token0Symbol,
                      adjustedToken0Symbol,
                      chainId ?? defaultChain,
                      getAllTokensForChain(chainId ?? defaultChain, testTokens)
                    ),
                  },
                  token1: {
                    address: token1Address,
                    name: token1Name,
                    symbol: adjustedToken1Symbol,
                    decimal: token1Decimal,
                    logoURI: getCorrectLogoURI(
                      token1Address,
                      token1Symbol,
                      adjustedToken1Symbol,
                      chainId ?? defaultChain,
                      getAllTokensForChain(chainId ?? defaultChain, testTokens)
                    ),
                  },
                };
              } catch (error) {
                console.error(
                  "Error fetching contract data for",
                  res.id,
                  error
                );
                return { ...res, result: null };
              }
            })
          );

          console.log("user pairData", pairData);

          setMyPoolData(pairData);
        } catch (error) {
          console.error("Error processing pools:", error);
        }
      }
    } catch (error) {
      console.error("Error while fetching pools from subgraph:", error);
    } finally {
      setLoadingUserData(false);
    }
  };

  useEffect(() => {
    setData([]);
    setMyPoolData([]);
    // Clear cache when chain changes
    clearTokenLookupCache();

    if (chainId) {
      if (activeTab === "all") {
        fetchData();
        setDefaultTab("all");
      } else {
        fetchUsersData();
        setDefaultTab("my");
      }

      return;
    }
  }, [chainId, activeTab, testTokens]);

  useEffect(() => {
    setData([]);
    fetchData();
    setDefaultTab("all");
    setLpAddingSuccess(false);
    setActiveStep(1);
  }, []);

  useEffect(() => {
    const fetchTokens = async () => {
      if (chainConf?.tokenApi) {
        try {
          const res = await fetch(chainConf?.tokenApi!);
          const data = await res.json();

          if (Array.isArray(data.tokens)) {
            setTestTokens(data.tokens);
            // Clear cache when new token data is loaded
            clearTokenLookupCache();
            // console.log("testTokens", data.tokens);
          } else {
            console.error("Invalid token data format", data);
          }
        } catch (err) {
          console.error("Failed to fetch tokens", err);
        }
      }
    };

    if (chainId === 97) {
      const testTokens: TokenType[] = Array.isArray(chainConf?.tokens)
        ? chainConf.tokens
        : [];
      console.error("testTokens", testTokens);
      setTestTokens(testTokens);
      // Clear cache when new token data is loaded
      clearTokenLookupCache();
    } else {
      fetchTokens();
    }
  }, [chainId, address]);

  return (
    <div className="p-2 w-full flex flex-col items-center">
      <>
        <div className="flex ml-10 md:ml-0 flex-row w-full justify-start">
          <div className="items-start title-large-semi-bold uppercase">
            Pools
          </div>
        </div>
        <div className="w-full mt-4 p-5 card-primary rounded-xl">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full mx-auto "
          >
            <div className="flex flex-col w-full items-start sm:flex-row justify-between sm:tems-center">
              <TabsList className="pool-tab-list w-fit border p-[1px]  border-none font-formula uppercase ">
                <TabsTrigger
                  className={`
                  uppercase text-base data-[state=active]:dark:bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-none data-[state=active]:ring-0 data-[state=active]:shadow-none
                  ${!address
                      ? "h-full rounded-[11px]"
                      : "h-full rounded-none rounded-l-[11px]"
                    }`}
                  value="all"
                >
                  All Pools
                </TabsTrigger>
                {address && (
                  <TabsTrigger
                    className=" text-base uppercase h-full rounded-none rounded-r-[11px] data-[state=active]:dark:bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-none data-[state=active]:ring-0 data-[state=active]:shadow-none
"
                    value="my"
                  >
                    My Pools
                  </TabsTrigger>
                )}
              </TabsList>
              <div className="flex flex-row justify-start items-center">
                <DataTableToolbar
                  table={activeTab === "all" ? allPoolsTable : myPoolsTable}
                />
              </div>
            </div>

            <TabsContent value="all">
              {/* <div className="flex flex-row  pt-3 w-full max-w-[300px] sm:w-full md:min-w-[900px] "> */}
              <div className="flex flex-row pt-3 w-full sm:w-full md:min-w-[900px]">
                <DataTable
                  data={data}
                  columns={columns}
                  loading={loading}
                  table={allPoolsTable}
                />
              </div>
            </TabsContent>
            {!address && activeTab === "my" ? (
              <TabsContent value="test">
                <Button
                  className="w-full button-primary !font-semibold uppercase h-14 !text-lg"
                  onClick={openConnectModal}
                >
                  Connect Wallet
                </Button>
              </TabsContent>
            ) : (
              <TabsContent value="my">
                <div className="flex flex-row  pt-3 w-full max-w-[300px] sm:w-full md:min-w-[900px] ">
                  <DataTable
                    data={myPoolData}
                    columns={columns}
                    loading={loadingUserData}
                    table={myPoolsTable}
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </>
    </div>
  );
};

export default PoolsView;
