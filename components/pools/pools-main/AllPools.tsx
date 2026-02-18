"use client";
import React, { useEffect, useState } from "react";
import CommonCard from "../CommonCard";
import { Flame, Search, TrendingUp, Users, Zap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import MainPoolsTable from "@/components/pools/pools-main/table/MainPoolsTable";
import axios from "axios";
import {
  PoolApiResponse,
  TradingLiveTableItem,
} from "@/types/trading-live-table.types";
import { useLpPoolsTableStore } from "@/store/lpPoolsTable.store";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { chains } from "@/config/chains";
import { LpPageStatsResponse } from "@/types/lp-page.types";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";
import { useSearchParams, useRouter } from "next/navigation";

const AllPools = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [chain, setChain] = useState<string>("all");
  const [isActive, setIsActive] = useState<boolean | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [tableData, setTableData] = useState<TradingLiveTableItem[]>([]);
  const { itemsPerPage, page, setPagination, setPage, setTableLoading } =
    useLpPoolsTableStore();
  const [totalTVL, setTotalTVL] = useState<React.ReactNode>("$0");
  const [h24Volume, seth24Volume] = useState<React.ReactNode>("$0");
  const [totalActivePools, setTotalActivePools] =
    useState<React.ReactNode>("0");
  const [avgAPR, setAvgAPR] = useState<React.ReactNode>("0%");

  // Initialize state from URL parameters on mount
  useEffect(() => {
    const sortByParam = searchParams.get("sortBy") || "";
    const sortOrderParam = searchParams.get("order") || "desc";
    const pageParam = searchParams.get("page");

    setSortBy(sortByParam);
    setSortOrder(sortOrderParam as "asc" | "desc");

    // Initialize page from URL if present
    if (pageParam) {
      const pageNum = parseInt(pageParam, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setPage(pageNum);
      }
    }
  }, [searchParams]);

  // Function to update URL with all parameters
  const updateURL = (updates: { sortBy?: string; sortOrder?: "asc" | "desc"; page?: number } = {}) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update sortBy
    if ('sortBy' in updates) {
      if (updates.sortBy) {
        params.set("sortBy", updates.sortBy);
      } else {
        params.delete("sortBy");
      }
    }

    // Update sortOrder
    if ('sortOrder' in updates) {
      if (updates.sortOrder && updates.sortOrder !== "desc") {
        params.set("order", updates.sortOrder);
      } else {
        params.delete("order");
      }
    }

    // Update page
    if ('page' in updates) {
      if (updates.page && updates.page > 1) {
        params.set("page", String(updates.page));
      } else {
        params.delete("page");
      }
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleToggleChange = (value: string) => {
    // Map toggle to isActive tri-state and reset to first page
    if (value === "all") {
      setIsActive(undefined);
    } else if (value === "active") {
      setIsActive(true);
    } else if (value === "closed") {
      setIsActive(false);
    }
    setPage(1);
  };

  const baseURL = process.env.NEXT_PUBLIC_TRADING_LIVE_BASE_API;

  const handleFetchData = async (): Promise<PoolApiResponse | null> => {
    try {
      const params = new URLSearchParams();
      // Only include is_active when a specific state is selected
      if (typeof isActive === "boolean") {
        params.set("is_active", String(isActive));
      }
      if (chain && chain !== "all") params.set("chain", chain);
      if (searchQuery) params.set("search", searchQuery);
      if (sortBy) params.set("sort_by", sortBy);
      if (sortOrder) params.set("sort_order", sortOrder);
      params.set("limit", String(itemsPerPage));
      params.set("page", String(page));

      const url = `${baseURL}/pools?${params.toString()}`;
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };

  const { isPending, data, isLoading } = useQuery<PoolApiResponse | null>({
    queryKey: [
      "trading-live-pools",
      chain,
      isActive,
      searchQuery,
      sortBy,
      sortOrder,
      itemsPerPage,
      page,
    ],
    queryFn: handleFetchData,
    placeholderData: keepPreviousData,
    staleTime: 300000,
  });

  useEffect(() => {
    if (isLoading) {
      setTableLoading(true);
    } else {
      setTableLoading(false);
    }
  }, [isLoading]);

  // Mock data for demo purposes
  const mockPools: TradingLiveTableItem[] = [
    {
      pool_address: "0x123...456",
      pool_id: "740213",
      chain: { id: "bsc", name: "BSC", fullName: "BNB Smart Chain", explorer: "https://bscscan.com", explorerLink: "https://bscscan.com/address/0x123...456" },
      token0: { address: "0x...", symbol: "HELLO", name: "HELLO Labs", decimals: 18, logo: "https://assets.coingecko.com/coins/images/28394/small/hello.png", price_usd: 0.05, price_in_paired_token: 0.00016, paired_token_symbol: "WBNB", price_source: "calculated", market_cap: 50000000, fdv: 60000000 },
      token1: { address: "0x...", symbol: "WBNB", name: "Wrapped BNB", decimals: 18, logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png", price_usd: 310, price_in_paired_token: 6200, paired_token_symbol: "HELLO", price_source: "native", market_cap: 45000000000, fdv: 45000000000 },
      fee_tier: "0.05%",
      fee_tier_raw: 500,
      liquidity: "1000000000000000000",
      price_info: { native_token: "BNB", native_token_price_usd: 310, sqrt_price: "0" },
      pool_liquidity: { token0_value_usd: 1250000, token1_value_usd: 1250000, total_value_usd: 2500000 },
      volume: { token0: 500000, token1: 1500, total_usd: 150000, volume_1h_usd: 12000, volume_1h_change: 5.2, volume_6h_usd: 45000, volume_6h_change: -2.1, volume_24h_usd: 155240, volume_24h_change: 12.5 },
      apr: { value: 24.5, daily_fees: 215, avg_daily_volume_30d: 120000 },
      tvl_usd: 2500000,
      tx_count: 1450,
      created_at: { timestamp: 1700000000, block: 18000000, date: "2024-01-01" },
      is_active: true,
      last_synced: new Date().toISOString()
    },
    {
      pool_address: "0x789...012",
      pool_id: "852104",
      chain: { id: "ethereum", name: "Ethereum", fullName: "Ethereum Mainnet", explorer: "https://etherscan.io", explorerLink: "https://etherscan.io/address/0x789...012" },
      token0: { address: "0x...", symbol: "ETH", name: "Ethereum", decimals: 18, logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png", price_usd: 2450, price_in_paired_token: 2450, paired_token_symbol: "USDT", price_source: "calculated", market_cap: 300000000000, fdv: 300000000000 },
      token1: { address: "0x...", symbol: "USDT", name: "Tether", decimals: 6, logo: "https://assets.coingecko.com/coins/images/325/small/tether.png", price_usd: 1, price_in_paired_token: 0.0004, paired_token_symbol: "ETH", price_source: "native", market_cap: 95000000000, fdv: 95000000000 },
      fee_tier: "0.3%",
      fee_tier_raw: 3000,
      liquidity: "500000000000000000",
      price_info: { native_token: "ETH", native_token_price_usd: 2450, sqrt_price: "0" },
      pool_liquidity: { token0_value_usd: 5000000, token1_value_usd: 5000000, total_value_usd: 10000000 },
      volume: { token0: 1000, token1: 2450000, total_usd: 2450000, volume_1h_usd: 150000, volume_1h_change: 2.1, volume_6h_usd: 850000, volume_6h_change: 8.4, volume_24h_usd: 2465000, volume_24h_change: -4.2 },
      apr: { value: 12.8, daily_fees: 8500, avg_daily_volume_30d: 2100000 },
      tvl_usd: 10000000,
      tx_count: 5200,
      created_at: { timestamp: 1705000000, block: 18500000, date: "2024-01-15" },
      is_active: true,
      last_synced: new Date().toISOString()
    },
    {
      pool_address: "0xabc...def",
      pool_id: "963258",
      chain: { id: "base", name: "Base", fullName: "Base Chain", explorer: "https://basescan.org", explorerLink: "https://basescan.org/address/0xabc...def" },
      token0: { address: "0x...", symbol: "BNB", name: "Build N Build", decimals: 18, logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png", price_usd: 310, price_in_paired_token: 310, paired_token_symbol: "BUSD", price_source: "calculated", market_cap: 45000000000, fdv: 45000000000 },
      token1: { address: "0x...", symbol: "BUSD", name: "Binance USD", decimals: 18, logo: "https://assets.coingecko.com/coins/images/9576/small/BUSD.png", price_usd: 1, price_in_paired_token: 0.0032, paired_token_symbol: "BNB", price_source: "native", market_cap: 1000000000, fdv: 1000000000 },
      fee_tier: "0.01%",
      fee_tier_raw: 100,
      liquidity: "2000000000000000000",
      price_info: { native_token: "BNB", native_token_price_usd: 310, sqrt_price: "0" },
      pool_liquidity: { token0_value_usd: 750000, token1_value_usd: 750000, total_value_usd: 1500000 },
      volume: { token0: 5000, token1: 1550000, total_usd: 1550000, volume_1h_usd: 45000, volume_1h_change: 15.2, volume_6h_usd: 280000, volume_6h_change: 10.5, volume_24h_usd: 1568000, volume_24h_change: 22.1 },
      apr: { value: 38.4, daily_fees: 1250, avg_daily_volume_30d: 1400000 },
      tvl_usd: 1500000,
      tx_count: 3100,
      created_at: { timestamp: 1708000000, block: 19000000, date: "2024-02-15" },
      is_active: true,
      last_synced: new Date().toISOString()
    }
  ];

  useEffect(() => {
    if (data && data.data && data.data.length > 0) {
      // Adjust token0/token1 ordering based on price_source rules:
      const adjustedData = data.data.map((item) => {
        const t0 = item.token0;
        const t1 = item.token1;
        const t0IsCalculated = t0?.price_source === "calculated";
        const t1IsCalculated = t1?.price_source === "calculated";

        if (t1IsCalculated && !t0IsCalculated) {
          return { ...item, token0: t1, token1: t0 };
        }
        return item;
      });

      setTableData(adjustedData);
      if (data.pagination) {
        const p = data.pagination;
        setPagination({
          page: p.page,
          limit: p.limit,
          total: p.total,
          total_pages: p.total_pages,
          has_next: p.has_next,
          has_prev: p.has_prev,
        });
      }
    } else if (!isLoading) {
      // Use mock pools if no data is returned from API (demo information)
      setTableData(mockPools);
      setPagination({
        page: 1,
        limit: 10,
        total: mockPools.length,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      });
    }
  }, [data, isLoading]);

  const chainImage = (chainId: number) => {
    const chainInfo = chains.find((c) => c.chainId === Number(chainId));
    return chainInfo?.image || "";
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleFetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (chain && chain !== "all") params.set("chain", chain);
      const url = `${baseURL}/stats?${params.toString()}`;
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };

  const {
    isPending: statPending,
    data: stats,
    isLoading: isStatsLoading,
  } = useQuery<LpPageStatsResponse | null>({
    queryKey: ["trading-live-stats", chain],
    queryFn: handleFetchStats,
    placeholderData: keepPreviousData,
    staleTime: 300000,
  });

  useEffect(() => {
    const overallStats = stats?.data.overall;

    // Use real stats if available and not zero, otherwise use mock stats for demo
    const hasRealStats = overallStats && overallStats.total_tvl_usd > 0;

    const tvlValue = hasRealStats ? overallStats.total_tvl_usd : 14250800.50;
    const vol24hValue = hasRealStats && overallStats.total_volume_24h_usd > 0.00001
      ? overallStats.total_volume_24h_usd
      : 4215000.00;
    const activePoolsValue = hasRealStats ? overallStats.active_pools : 1240;
    const aprValue = hasRealStats ? overallStats.apr.weighted_average : 18.25;

    const tvl = renderFormattedValue(tvlValue);
    const volume24h = renderFormattedValue(vol24hValue);

    seth24Volume(`$${volume24h}`);
    setTotalTVL(`$${tvl}`);
    setTotalActivePools(activePoolsValue.toString());
    setAvgAPR(`${aprValue.toFixed(2)}`);
  }, [stats]);

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="grid gap-6 sm:grid-cols-4 grid-cols-2">
        <CommonCard
          icon={
            <TrendingUp className="h-4 w-4 dark:text-[#ADFF2F] text-[#9fcd0a]" />
          }
          title={"TOTAL TVL"}
          value={totalTVL}
        />

        <CommonCard
          icon={<Zap className="h-4 w-4 dark:text-[#ADFF2F] text-[#9fcd0a]" />}
          title={"24H VOLUME"}
          value={h24Volume}
        />

        <CommonCard
          icon={
            <Users className="h-4 w-4 dark:text-[#ADFF2F] text-[#9fcd0a]" />
          }
          title={"TOTAL ACTIVE POOLS"}
          value={`${totalActivePools}`}
        />

        <CommonCard
          icon={
            <Flame className="h-4 w-4 dark:text-[#ADFF2F] text-[#9fcd0a]" />
          }
          title={"AVG APR"}
          value={`${avgAPR} %`}
        />
      </div>
      <div className="dark:bg-[#121212] bg-slate-100  border border-[rgba(255,255,255,0.03)] rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-4 sm:px-5 py-3 border-[rgba(255,255,255,0.08)] border-b">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1">
            <div className="">
              <Select
                defaultValue="all"
                onValueChange={(v) => {
                  setChain(v);
                  setPage(1);
                }}
                value={chain}
              >
                <SelectTrigger className="sm:w-[180px] font-normal font-lato ring-offset-black dark:text-white text-black text-xs py-2 px-3 dark:bg-[#1A1A1A] bg-slate-200 border border-[#ffffff1a] rounded-full whitespace-nowrap gap-2 h-9 w-full ">
                  <SelectValue placeholder="All chains" asChild>
                    <div className="pointer-events-none flex items-center gap-2">
                      {chain === "bsc" && (
                        <>
                          <Image
                            src={chainImage(56)}
                            alt="BNB"
                            width={16}
                            height={16}
                            className="rounded-full w-4 h-4 object-contain"
                          />
                          <span>BNB Chain</span>
                        </>
                      )}
                      {chain === "ethereum" && (
                        <>
                          <Image
                            src={chainImage(1)}
                            alt="Ethereum"
                            width={16}
                            height={16}
                            className="rounded-full w-4 h-4 object-contain"
                          />
                          <span>Ethereum Chain</span>
                        </>
                      )}
                      {chain === "base" && (
                        <>
                          <Image
                            src={chainImage(8453)}
                            alt="Base"
                            width={16}
                            height={16}
                            className="rounded-full w-4 h-4 object-contain"
                          />
                          <span>Base Chain</span>
                        </>
                      )}
                      {chain === "all" && <span>All Chains</span>}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="dark:bg-[#1A1A1A] bg-slate-200 border border-[rgba(255,255,255,0.1)] rounded-lg shadow-lg z-10 w-full sm:min-w-[220px]">
                  <SelectItem
                    value="all"
                    className="w-full text-left px-3 py-2.5 text-xs dark:text-white text-black hover:bg-[rgba(173,255,47,0.1)] rounded-md transition-colors flex items-center gap-2"
                  >
                    All Chains
                  </SelectItem>
                  <SelectItem
                    value="bsc"
                    className="w-full text-left px-3 py-2.5 text-xs dark:text-white text-black hover:bg-[rgba(173,255,47,0.1)] rounded-md transition-colors flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={chainImage(56)}
                        alt="BNB"
                        width={16}
                        height={16}
                        className="rounded-full w-4 h-4 object-contain"
                      />
                      BNB Chain
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="ethereum"
                    className="w-full text-left px-3 py-2.5 text-xs dark:text-white text-black hover:bg-[rgba(173,255,47,0.1)] rounded-md transition-colors flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={chainImage(1)}
                        alt="BNB"
                        width={16}
                        height={16}
                        className="rounded-full w-4 h-4 object-contain"
                      />
                      Ethereum Chain
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="base"
                    className="w-full text-left px-3 py-2.5 text-xs dark:text-white text-black hover:bg-[rgba(173,255,47,0.1)] rounded-md transition-colors flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={chainImage(8453)}
                        alt="BNB"
                        width={16}
                        height={16}
                        className="rounded-full w-4 h-4 object-contain"
                      />
                      Base Chain
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full flex-1">
              <InputGroup className="ring-offset-black border border-[#ffffff1a] dark:bg-[#1A1A1A] bg-slate-200">
                <InputGroupInput
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search pools..."
                  className="text-sm dark:text-white text-black placeholder:text-muted-foreground "
                />
                <InputGroupAddon>
                  <Search className="dark:text-gray-500 text-black" />
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>

          <div>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              className="gap-1"
              onValueChange={handleToggleChange}
              value={
                isActive === undefined ? "all" : isActive ? "active" : "closed"
              }
            >
              <ToggleGroupItem
                value="all"
                aria-label="Toggle star"
                className=" data-[state=on]:bg-[#adff2f26] data-[state=on]:border-[#adff2f26] dark:data-[state=on]:text-[#adff2f] data-[state=on]:text-[#9fcd0a] text-xs font-medium transition-all  whitespace-nowrap flex-shrink-0 bg-transparent text-[#a3a3a3] hover:bg-accent hover:text-foreground border-none h-6 px-2 py-1"
              >
                All
              </ToggleGroupItem>
              <ToggleGroupItem
                value="active"
                aria-label="Toggle heart"
                className=" data-[state=on]:bg-[#adff2f26] data-[state=on]:border-[#adff2f26] dark:data-[state=on]:text-[#adff2f] data-[state=on]:text-[#9fcd0a] text-xs font-medium transition-all  whitespace-nowrap flex-shrink-0 bg-transparent text-[#a3a3a3] hover:bg-accent hover:text-foreground border-none h-6 px-2 py-1"
              >
                Active
              </ToggleGroupItem>
              <ToggleGroupItem
                value="closed"
                aria-label="Toggle bookmark"
                // className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"
                className=" data-[state=on]:bg-[#adff2f26] data-[state=on]:border-[#adff2f26] dark:data-[state=on]:text-[#adff2f] data-[state=on]:text-[#9fcd0a] text-xs font-medium transition-all  whitespace-nowrap flex-shrink-0 bg-transparent text-[#a3a3a3] hover:bg-accent hover:text-foreground border-none h-6 px-2 py-1"
              >
                Closed
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="">
          <MainPoolsTable
            tableData={tableData}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={(columnId, order) => {
              setSortBy(columnId);
              setSortOrder(order);
              setPage(1);
              updateURL({ sortBy: columnId, sortOrder: order, page: 1 });
            }}
            onPageChange={(newPage) => {
              updateURL({ page: newPage });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AllPools;
