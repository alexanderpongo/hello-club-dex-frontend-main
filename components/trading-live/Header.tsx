"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTradingLiveStore } from "@/store/tradinglive.store";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PoolApiResponse, TradingLiveTableItem } from "@/types/trading-live-table.types";
import TimePeriodSelector, { TimePeriod } from "./TimePeriodSelector";
import { useTradingLiveFilters } from "@/hooks/useTradingLiveFilters";
import { chains } from "@/config/chains";

const Header = () => {
  const {
    setTableData,
    appendTableData,
    resetTableData,
    itemsPerPage,
    page,
    setPage,
    setPagination,
    setTableLoading,
    setLoadingMore,
    tableData,
    updateFilters,
  } = useTradingLiveStore();

  const {
    chain,
    isActive,
    sortBy,
    sortOrder,
    searchQuery,
    timePeriod,
    setChain,
    setIsActive,
    setSortBy,
    setSortOrder,
    setSearchQuery,
    setTimePeriod,
    updateFilters: updateUrlFilters,
  } = useTradingLiveFilters();

  const [searchInput, setSearchInput] = useState<string>(searchQuery);

  // Available chains for multi-select - map from chains.ts
  const availableChains = [
    {
      id: "bsc",
      name: "BSC",
      icon: chains.find(c => c.chainId === 56)?.image || "https://etherscan.io/token/images/binancebnb_32.svg"
    },
    {
      id: "ethereum",
      name: "ETH",
      icon: chains.find(c => c.chainId === 1)?.image || "https://etherscan.io/images/svg/brands/ethereum-original.svg"
    },
    {
      id: "base",
      name: "BASE",
      icon: chains.find(c => c.chainId === 8453)?.image || "/chain-icons/base-logo.png"
    },
  ];

  // Mock data for demo purposes
  const mockTokens: TradingLiveTableItem[] = [
    {
      pool_address: "0x123...456",
      pool_id: "740213",
      chain: { id: "bsc", name: "BSC", fullName: "BNB Smart Chain", explorer: "https://bscscan.com", explorerLink: "https://bscscan.com/address/0x123...456" },
      token0: { address: "0x...", symbol: "HELLO", name: "HELLO Labs", decimals: 18, logo: "https://assets.coingecko.com/coins/images/28394/small/hello.png", price_usd: 0.0524, price_in_paired_token: 0.00016, paired_token_symbol: "WBNB", price_source: "calculated", market_cap: 52400000, fdv: 60000000 },
      token1: { address: "0x...", symbol: "WBNB", name: "Wrapped BNB", decimals: 18, logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png", price_usd: 310, price_in_paired_token: 6200, paired_token_symbol: "HELLO", price_source: "native", market_cap: 45000000000, fdv: 45000000000 },
      fee_tier: "0.05%",
      fee_tier_raw: 500,
      liquidity: "1000000000000000000",
      price_info: { native_token: "BNB", native_token_price_usd: 310, sqrt_price: "0" },
      pool_liquidity: { token0_value_usd: 1250000, token1_value_usd: 1250000, total_value_usd: 2500000 },
      volume: { token0: 500000, token1: 1500, total_usd: 155240, volume_1h_usd: 12000, volume_1h_change: 5.2, volume_6h_usd: 45000, volume_6h_change: -2.1, volume_24h_usd: 155240, volume_24h_change: 12.5 },
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
      token0: { address: "0x...", symbol: "ETH", name: "Ethereum", decimals: 18, logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png", price_usd: 2450.12, price_in_paired_token: 2450.12, paired_token_symbol: "USDT", price_source: "calculated", market_cap: 300000000000, fdv: 300000000000 },
      token1: { address: "0x...", symbol: "USDT", name: "Tether", decimals: 6, logo: "https://assets.coingecko.com/coins/images/325/small/tether.png", price_usd: 1, price_in_paired_token: 0.0004, paired_token_symbol: "ETH", price_source: "native", market_cap: 95000000000, fdv: 95000000000 },
      fee_tier: "0.3%",
      fee_tier_raw: 3000,
      liquidity: "500000000000000000",
      price_info: { native_token: "ETH", native_token_price_usd: 2450, sqrt_price: "0" },
      pool_liquidity: { token0_value_usd: 5000000, token1_value_usd: 5000000, total_value_usd: 10000000 },
      volume: { token0: 1000, token1: 2450000, total_usd: 2465000, volume_1h_usd: 150000, volume_1h_change: 2.1, volume_6h_usd: 850000, volume_6h_change: 8.4, volume_24h_usd: 2465000, volume_24h_change: -4.2 },
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
      token0: { address: "0x...", symbol: "USDC", name: "USD Coin", decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png", price_usd: 1.00, price_in_paired_token: 1.00, paired_token_symbol: "USDT", price_source: "calculated", market_cap: 35000000000, fdv: 35000000000 },
      token1: { address: "0x...", symbol: "USDT", name: "Tether", decimals: 6, logo: "https://assets.coingecko.com/coins/images/325/small/tether.png", price_usd: 1, price_in_paired_token: 1.00, paired_token_symbol: "USDC", price_source: "native", market_cap: 95000000000, fdv: 95000000000 },
      fee_tier: "0.01%",
      fee_tier_raw: 100,
      liquidity: "2000000000000000000",
      price_info: { native_token: "USDC", native_token_price_usd: 1, sqrt_price: "0" },
      pool_liquidity: { token0_value_usd: 750000, token1_value_usd: 750000, total_value_usd: 1500000 },
      volume: { token0: 5000, token1: 1550000, total_usd: 1568000, volume_1h_usd: 45000, volume_1h_change: 15.2, volume_6h_usd: 280000, volume_6h_change: 10.5, volume_24h_usd: 1568000, volume_24h_change: 22.1 },
      apr: { value: 38.4, daily_fees: 1250, avg_daily_volume_30d: 1400000 },
      tvl_usd: 1500000,
      tx_count: 3100,
      created_at: { timestamp: 1708000000, block: 19000000, date: "2024-02-15" },
      is_active: true,
      last_synced: new Date().toISOString()
    }
  ];

  // Parse chain into array for multi-select
  const selectedChains = chain === "all" || !chain ? ["all"] : chain.split(",");

  // Compute the chain parameter for API calls
  const chainParam = selectedChains.includes("all") || selectedChains.length === 0
    ? ""
    : selectedChains.length === availableChains.length
      ? ""
      : selectedChains.join(",");

  // Sync searchInput with URL searchQuery on mount
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Map time period to volume sort parameter
  const getVolumeSortBy = () => {
    if (sortBy === "volume") {
      const volumeMap: Record<TimePeriod, string> = {
        "1H": "volume1hChange",
        "6H": "volume6hChange",
        "24H": "volume24hChange",
      };
      return volumeMap[timePeriod];
    }
    return sortBy;
  };

  const baseURL = process.env.NEXT_PUBLIC_TRADING_LIVE_BASE_API;

  const handleFetchData = async (): Promise<PoolApiResponse | null> => {
    try {
      const actualSortBy = getVolumeSortBy();
      const chainQueryParam = chainParam ? `&chain=${chainParam}` : "";
      const url = `${baseURL}/pools?is_active=${isActive}${chainQueryParam}&sort_by=${actualSortBy}&limit=${itemsPerPage}&page=${page}&sort_order=${sortOrder}&search=${searchQuery}`;
      console.log("Fetching URL:", url);
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };

  const { isPending, data, isLoading, isFetching } =
    useQuery<PoolApiResponse | null>({
      queryKey: [
        "trading-live-pools",
        chainParam,
        isActive,
        sortBy,
        sortOrder,
        searchQuery,
        itemsPerPage,
        page,
        timePeriod,
      ],
      queryFn: handleFetchData,
      staleTime: 0,
      gcTime: 300000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: 600000,
    });

  useEffect(() => {
    if (isFetching) {
      if (page === 1) {
        setTableLoading(true);
      } else {
        setLoadingMore(true);
      }
    } else {
      setTableLoading(false);
      setLoadingMore(false);
    }
  }, [isFetching, page, setTableLoading, setLoadingMore]);

  useEffect(() => {
    if (isFetching) return;

    if (data && data.data && data.data.length > 0) {
      const adjustedData = data.data.map((item) => {
        const t0 = item.token0;
        const t1 = item.token1;
        if (t1?.price_source === "calculated" && t0?.price_source !== "calculated") {
          return { ...item, token0: t1, token1: t0 };
        }
        return item;
      });

      const responsePage = data.pagination?.page || 1;
      if (responsePage === 1) {
        setTableData(adjustedData);
      } else {
        appendTableData(adjustedData);
      }

      if (data.pagination) {
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          total_pages: data.pagination.total_pages,
          has_next: data.pagination.has_next,
          has_prev: data.pagination.has_prev,
        });
      }
    } else if (!isFetching) {
      if (page === 1) {
        setTableData(mockTokens);
        setPagination({
          page: 1,
          limit: itemsPerPage,
          total: mockTokens.length,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        });
      }
    }
  }, [data, isFetching, page, setTableData, appendTableData, setPagination, itemsPerPage]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput, setSearchQuery]);

  useEffect(() => {
    const currentFilters = {
      chain: chainParam,
      isActive,
      sortBy,
      sortOrder,
      searchQuery,
      itemsPerPage,
      timePeriod,
    };
    const filtersChanged = updateFilters(currentFilters);
    if (filtersChanged) {
      resetTableData();
    }
  }, [chainParam, isActive, sortBy, sortOrder, searchQuery, itemsPerPage, timePeriod, updateFilters, resetTableData]);

  const handleTimePeriodChange = (period: TimePeriod) => {
    if (sortBy !== "volume") {
      updateUrlFilters({ sortBy: "volume", timePeriod: period });
    } else {
      setTimePeriod(period);
    }
  };

  const handleSortByChange = (value: string) => {
    if (value !== "volume") {
      updateUrlFilters({ sortBy: value, timePeriod: "24H" });
    } else {
      setSortBy(value);
    }
  };

  const handleIsActiveChange = (value: string) => {
    setIsActive(value === "true");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleChainToggle = (chainId: string) => {
    const currentChains = selectedChains.includes("all")
      ? availableChains.map(c => c.id)
      : selectedChains;

    let newSelection: string[];
    if (selectedChains.includes("all")) {
      newSelection = availableChains.filter((c) => c.id !== chainId).map((c) => c.id);
    } else if (currentChains.includes(chainId)) {
      newSelection = currentChains.filter((id) => id !== chainId);
      if (newSelection.length === 0) newSelection = ["all"];
    } else {
      newSelection = [...currentChains, chainId];
    }

    const allChainsSelected = availableChains.every(c => newSelection.includes(c.id));
    const chainValue = newSelection.includes("all") || allChainsSelected ? "all" : newSelection.join(",");
    setChain(chainValue);
  };

  const handleClearFilters = () => {
    updateUrlFilters({
      chain: "all",
      isActive: true,
      sortBy: "token0MarketCap",
      sortOrder: "desc",
      searchQuery: "",
      timePeriod: "24H",
    });
    setSearchInput("");
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="title-large-semi-bold uppercase">
          LIVE TOKENS
        </h1>
        <p className="text-xs font-lato font-normal dark:text-[#a3a3a3] text-gray-500 tracking-wider">
          Real-time insights and analytics for trending tokens across all supported networks.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 justify-between items-center w-full">
        <ScrollArea className="w-full sm:w-auto whitespace-nowrap">
          <div className="flex gap-2 items-center pb-1 min-w-max">
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              {availableChains.map((network) => {
                const isSelected = selectedChains.includes(network.id) ||
                  (selectedChains.includes("all") && network.id !== "all");
                return (
                  <Button
                    key={network.id}
                    onClick={() => handleChainToggle(network.id)}
                    variant="ghost"
                    size="icon"
                    className={`rounded-sm p-1.5 md:p-2 transition-all duration-200 flex-shrink-0 w-auto h-auto ${isSelected
                      ? "border-white/10 bg-primary/10 hover:bg-primary/20 "
                      : " hover:bg-[#151515] dark:bg-gray-500/20 dark:hover:bg-[#151515] bg-gray-100 hover:bg-gray-200 border-white/5 hover:border-white/20 dark:border-white/5 dark:hover:border-white/20 border-gray-300 hover:border-gray-400"
                      } border`}
                    title={network.name}
                  >
                    <Image
                      src={network.icon}
                      alt={network.name}
                      width={20}
                      height={20}
                      className={`w-4 h-4 md:w-5 md:h-5 object-contain transition-all duration-200 ${isSelected
                        ? "opacity-100 brightness-110"
                        : "opacity-40 grayscale-[0.5]"
                        }`}
                    />
                  </Button>
                );
              })}
            </div>
            <Select
              onValueChange={handleIsActiveChange}
              value={isActive.toString()}
            >
              <SelectTrigger className={`w-[80px] px-2 text-xs outline-none appearance-none cursor-pointer transition-all border rounded-sm whitespace-nowrap flex items-center h-[32px] md:h-[36px] ${isActive === false
                ? "bg-primary/10 text-primary border-primary/30"
                : "dark:bg-[#151515] dark:border-white/10 border-black/10 dark:text-white/70 text-black/70 dark:hover:bg-[#1f1f1f] hover:bg-gray-300 hover:text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                }`}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent
                align="center"
                className="dark:bg-[#151515] bg-gray-100 dark:text-[#a3a3a3] text-xs border border-white/10 w-[100px]"
              >
                <SelectGroup>
                  <SelectItem value={"true"} className="dark:text-[#a3a3a3] text-black/70 text-xs dark:hover:bg-[#1f1f1f] hover:bg-gray-200">
                    Active
                  </SelectItem>
                  <SelectItem
                    value={"false"}
                    className="dark:text-[#a3a3a3] text-black/70 text-xs dark:hover:bg-[#1f1f1f] hover:bg-gray-200"
                  >
                    Inactive
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              onClick={handleClearFilters}
              variant="ghost"
              size="icon"
              className="rounded-sm px-10 h-[32px] md:h-[36px] transition-all duration-200 dark:bg-[#151515] bg-gray-100 dark:hover:bg-[#1f1f1f] hover:bg-gray-200 border dark:border-white/10 border-black/10 dark:text-white/70 text-black/70 dark:hover:text-white hover:text-black flex items-center"
            >
              <X className="w-4 h-4" /> RESET
            </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="relative w-full md:w-auto md:min-w-[200px]">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 w-3.5 h-3.5 dark:text-white/40 text-black/40 pointer-events-none" />
          <Input
            className="dark:bg-[#151515] bg-gray-100 border dark:border-white/10 border-black/10 dark:text-white/70 text-black/70 pl-9 pr-9 py-1.5 md:py-2 rounded-sm text-xs outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 dark:hover:bg-[#1f1f1f] hover:bg-gray-200 dark:hover:text-white hover:text-black transition-all w-full dark:placeholder:text-white/40 placeholder:text-black/40 font-lato h-auto"
            placeholder="Search..."
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
