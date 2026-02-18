import { TradingLiveTableItem } from "@/types/trading-live-table.types";
import { ProcessedPoolsType } from "@/types/trading-live.types";
import { create } from "zustand";

interface FilterState {
  chain: string;
  isActive: boolean;
  sortBy: string;
  sortOrder: string;
  searchQuery: string;
  itemsPerPage: number;
  timePeriod: string;
}

interface TradingLiveStore {
  token0PriceInUSD: number | null;
  setToken0PriceInUSD: (price: number | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  tableData: TradingLiveTableItem[];
  setTableData: (data: TradingLiveTableItem[]) => void;
  appendTableData: (data: TradingLiveTableItem[]) => void;
  resetTableData: () => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  // pagination
  page: number;
  setPage: (page: number) => void;
  loadMore: () => void;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  setPagination: (p: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  }) => void;
  tableLoading: boolean;
  setTableLoading: (loading: boolean) => void;
  loadingMore: boolean;
  setLoadingMore: (loading: boolean) => void;
  // Filter state tracking
  previousFilters: FilterState | null;
  updateFilters: (filters: FilterState) => boolean; // returns true if filters changed
}

export const useTradingLiveStore = create<TradingLiveStore>((set) => ({
  token0PriceInUSD: null,
  setToken0PriceInUSD: (price: number | null) =>
    set({ token0PriceInUSD: price }),
  searchQuery: "",
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  finalFilteredData: [],
  tableData: [],
  setTableData: (data: TradingLiveTableItem[]) => set({ tableData: data }),
  appendTableData: (data: TradingLiveTableItem[]) =>
    set((state) => {
      // Create a Set of existing pool addresses for O(1) lookup
      const existingPoolAddresses = new Set(
        state.tableData.map((item) => item.pool_address)
      );

      // Filter out duplicates from new data
      const newUniqueData = data.filter(
        (item) => !existingPoolAddresses.has(item.pool_address)
      );

      return { tableData: [...state.tableData, ...newUniqueData] };
    }),
  resetTableData: () => set({ tableData: [], page: 1 }),
  itemsPerPage: 20,
  setItemsPerPage: (count: number) => set({ itemsPerPage: count }),
  // pagination defaults
  page: 1,
  setPage: (page: number) => set({ page }),
  loadMore: () => set((state) => ({ page: state.page + 1 })),
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  setPagination: (p) =>
    set({
      page: p.page,
      itemsPerPage: p.limit,
      total: p.total,
      totalPages: p.total_pages,
      hasNext: p.has_next,
      hasPrev: p.has_prev,
    }),
  tableLoading: false,
  setTableLoading: (loading: boolean) => set({ tableLoading: loading }),
  loadingMore: false,
  setLoadingMore: (loading: boolean) => set({ loadingMore: loading }),
  // Filter state tracking
  previousFilters: null,
  updateFilters: (filters: FilterState) => {
    let filtersChanged = false;
    set((state) => {
      const prev = state.previousFilters;

      // If no previous filters, this is first time - don't reset
      if (!prev) {
        return { previousFilters: filters };
      }

      // Check if any filter actually changed
      filtersChanged =
        prev.chain !== filters.chain ||
        prev.isActive !== filters.isActive ||
        prev.sortBy !== filters.sortBy ||
        prev.sortOrder !== filters.sortOrder ||
        prev.searchQuery !== filters.searchQuery ||
        prev.itemsPerPage !== filters.itemsPerPage ||
        prev.timePeriod !== filters.timePeriod;

      return { previousFilters: filters };
    });

    return filtersChanged;
  },
}));
