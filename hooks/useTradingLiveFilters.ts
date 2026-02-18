"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { TimePeriod } from "@/components/trading-live/TimePeriodSelector";

export function useTradingLiveFilters() {
  const searchParams = useSearchParams();

  const [chain, setChainState] = useState("");
  const [isActive, setIsActiveState] = useState(true);
  const [sortBy, setSortByState] = useState("token0MarketCap");
  const [sortOrder, setSortOrderState] = useState("desc");
  const [searchQuery, setSearchQueryState] = useState("");
  const [timePeriod, setTimePeriodState] = useState<TimePeriod>("24H");

 
  useEffect(() => {
    setChainState(searchParams.get("chain") || "");
    setIsActiveState(searchParams.get("active") === "false" ? false : true);
    setSortByState(searchParams.get("sortBy") || "token0MarketCap");
    setSortOrderState(searchParams.get("order") || "desc");
    setSearchQueryState(searchParams.get("search") || "");
    setTimePeriodState((searchParams.get("period") || "24H") as TimePeriod);
  }, [searchParams]);

  
  const updateFilters = useCallback(
    (updates: {
      chain?: string;
      isActive?: boolean;
      sortBy?: string;
      sortOrder?: string;
      searchQuery?: string;
      timePeriod?: TimePeriod;
    }) => {
      if (typeof window === "undefined") return;

      const params = new URLSearchParams(searchParams.toString());

      // Update chain
      if (updates.chain !== undefined) {
        setChainState(updates.chain);
        if (updates.chain) {
          params.set("chain", updates.chain);
        } else {
          params.delete("chain");
        }
      }

      // Update isActive
      if (updates.isActive !== undefined) {
        setIsActiveState(updates.isActive);
        if (!updates.isActive) {
          params.set("active", "false");
        } else {
          params.delete("active");
        }
      }

      // Update sortBy
      if (updates.sortBy !== undefined) {
        setSortByState(updates.sortBy);
        if (updates.sortBy !== "token0MarketCap") {
          params.set("sortBy", updates.sortBy);
        } else {
          params.delete("sortBy");
        }
      }

      // Update sortOrder
      if (updates.sortOrder !== undefined) {
        setSortOrderState(updates.sortOrder);
        if (updates.sortOrder !== "desc") {
          params.set("order", updates.sortOrder);
        } else {
          params.delete("order");
        }
      }

      // Update search
      if (updates.searchQuery !== undefined) {
        setSearchQueryState(updates.searchQuery);
        if (updates.searchQuery) {
          params.set("search", updates.searchQuery);
        } else {
          params.delete("search");
        }
      }

      // Update timePeriod
      if (updates.timePeriod !== undefined) {
        setTimePeriodState(updates.timePeriod);
        if (updates.timePeriod !== "24H") {
          params.set("period", updates.timePeriod);
        } else {
          params.delete("period");
        }
      }

      const queryString = params.toString();
      const newUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;

      window.history.replaceState(null, "", newUrl);
    },
    [searchParams]
  );

  const setChain = useCallback(
    (value: string) => updateFilters({ chain: value }),
    [updateFilters]
  );

  const setIsActive = useCallback(
    (value: boolean) => updateFilters({ isActive: value }),
    [updateFilters]
  );

  const setSortBy = useCallback(
    (value: string) => updateFilters({ sortBy: value }),
    [updateFilters]
  );

  const setSortOrder = useCallback(
    (value: string) => updateFilters({ sortOrder: value }),
    [updateFilters]
  );

  const setSearchQuery = useCallback(
    (value: string) => updateFilters({ searchQuery: value }),
    [updateFilters]
  );

  const setTimePeriod = useCallback(
    (value: TimePeriod) => updateFilters({ timePeriod: value }),
    [updateFilters]
  );

 
  return {

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
    updateFilters,
  };
}
