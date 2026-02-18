import { create } from "zustand";

interface LpPoolsTableStore {
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  itemsPerPage: number;
  page: number;
  setPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
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
}

export const useLpPoolsTableStore = create<LpPoolsTableStore>((set) => ({
  page: 1,
  setPage: (page: number) => set({ page }),
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  itemsPerPage: 10,
  setItemsPerPage: (count: number) => set({ itemsPerPage: count }),
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
}));
