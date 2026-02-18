"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TradingLiveTableItem } from "@/types/trading-live-table.types";
import TokenPair from "@/components/trading-live/coin-table-new/TokenPair";
import PoolPrice from "./coin-table-new/PoolPrice";
import Age from "@/components/trading-live/coin-table-new/Age";
import Volume from "@/components/trading-live/coin-table-new/Volume";
import DynamicVolume from "@/components/trading-live/coin-table-new/DynamicVolume";
import MCap from "./coin-table-new/MCap";
import TVL from "./coin-table-new/TVL";
import Liquidity from "./coin-table-new/Liquidity";
import { Button } from "../ui/button";
import { Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTradingLiveStore } from "@/store/tradinglive.store";
import { useRouter } from "next/navigation";
import { useTradingLiveFilters } from "@/hooks/useTradingLiveFilters";

const columns: ColumnDef<TradingLiveTableItem>[] = [
  {
    accessorKey: "TokenPair",
    header: "TOKEN",
    cell: ({ row }) => (
      <TokenPair
        chain={row.original.chain}
        token0={row.original.token0}
        token1={row.original.token1}
      />
    ),
  },
  {
    accessorKey: "price",
    header: "PRICE",
    cell: ({ row }) => <PoolPrice token0={row.original.token0} />,
  },
  // {
  //   accessorKey: "age",
  //   header: "AGE",
  //   cell: ({ row }) => <Age created_at={row.original.created_at} />,
  // },
  {
    accessorKey: "volume",
    header: "VOLUME",
    cell: ({ row }) => <Volume volume={row.original.volume} />,
  },
  {
    accessorKey: "1h_volume",
    header: "1H",
    cell: ({ row }) => (
      <DynamicVolume volumeChange={row.original.volume.volume_1h_change} />
    ),
  },
  {
    accessorKey: "6h_volume",
    header: "6H",
    cell: ({ row }) => (
      <DynamicVolume volumeChange={row.original.volume.volume_6h_change} />
    ),
  },
  {
    accessorKey: "24h_volume",
    header: "24H",
    cell: ({ row }) => (
      <DynamicVolume volumeChange={row.original.volume.volume_24h_change} />
    ),
  },
  {
    accessorKey: "mcap",
    header: "MCAP",
    cell: ({ row }) => <MCap mcap={row.original.token0.market_cap} />,
  },
  {
    accessorKey: "tvl",
    header: "TVL",
    cell: ({ row }) => <TVL tvl={row.original.tvl_usd} />,
  },
  {
    accessorKey: "liquidity",
    header: "LIQUIDITY",
    cell: ({ row }) => <Liquidity liquidityUsd={row.original.pool_liquidity.total_value_usd} />,
  },
];

interface CoinTableNewProps {
  tableData: TradingLiveTableItem[];
}

const CoinTableNew: React.FC<CoinTableNewProps> = (props) => {
  const { tableData } = props;
  const {
    hasNext,
    tableLoading,
    loadMore,
    loadingMore,
    itemsPerPage,
    setItemsPerPage,
    total,
  } = useTradingLiveStore();
  const router = useRouter();
  const { sortBy, sortOrder, updateFilters, timePeriod } = useTradingLiveFilters();

  // Map column IDs to backend sortBy parameter values and period
  const columnToSortByMap: Record<string, { sortBy: string; period?: string }> = {
    "1h_volume": { sortBy: "volume", period: "1H" },
    "6h_volume": { sortBy: "volume", period: "6H" },
    "24h_volume": { sortBy: "volume", period: "24H" },
    mcap: { sortBy: "token0MarketCap" },
    tvl: { sortBy: "tvlUSD" },
    liquidity: { sortBy: "liquidity" },
  };

  // Map backend sortBy + period to column IDs 
  const getCurrentColumnId = () => {
    if (sortBy === "volume") {
      // For volume, check the period
      if (timePeriod === "1H") return "1h_volume";
      if (timePeriod === "6H") return "6h_volume";
      if (timePeriod === "24H") return "24h_volume";
      return "volume";
    }
    if (sortBy === "token0MarketCap") return "mcap";
    if (sortBy === "tvlUSD") return "tvl";
    if (sortBy === "liquidity") return "liquidity";
    return null;
  };

  const handleHeaderClick = (columnId: string) => {
    // Only allow sorting on sortable columns
    if (!columnToSortByMap[columnId]) return;

    const sortConfig = columnToSortByMap[columnId];
    const isCurrentSort = getCurrentColumnId() === columnId;

    if (!isCurrentSort) {
      // First click: sort desc
      const updates: any = { sortBy: sortConfig.sortBy, sortOrder: "desc" };
      if (sortConfig.period) {
        updates.timePeriod = sortConfig.period;
      }
      updateFilters(updates);
    } else if (sortOrder === "desc") {
      // Second click: sort asc
      updateFilters({ sortOrder: "asc" });
    } else {
      // Third click: back to default (token0MarketCap desc)
      updateFilters({ sortBy: "token0MarketCap", sortOrder: "desc" });
    }
  };

  const getSortIndicator = (columnId: string) => {
    const isCurrentSort = getCurrentColumnId() === columnId;

    if (!isCurrentSort) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-40" />;
    }

    if (sortOrder === "desc") {
      return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
    } else {
      return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
  };

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="pb-2 md:pb-4">
      <div className="dark:bg-[#121212] bg-gray-100 rounded-xl border border-black/10 dark:border-[rgba(255,255,255,0.03)] max-h-[calc(100vh-160px)] md:max-h-[calc(100vh-140px)] overflow-y-auto overflow-x-auto">
        <Table className="w-full border-collapse">
          <TableHeader className="sticky top-0 z-20 dark:bg-[#121212] bg-gray-100">
            <TableRow className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider font-lato border-b border-black/10 dark:border-[rgba(255,255,255,0.08)]">
              {table.getFlatHeaders().map((header) => {
                const columnId = header.column.id;
                const isSortable = columnToSortByMap[columnId] !== undefined;

                return (
                  <TableHead
                    key={header.id}
                    onClick={isSortable ? () => handleHeaderClick(columnId) : undefined}
                    className={`dark:bg-[#121212] bg-gray-100 py-3 px-4 md:px-6 transition-colors ${isSortable ? 'cursor-pointer dark:hover:text-white/80 hover:text-black/80 select-none' : ''
                      } ${header.column.id === "TokenPair"
                        ? "text-left sticky left-0 z-10 w-[140px] md:w-[240px]"
                        : "text-right"
                      }`}
                  >
                    <div className={`flex items-center gap-2 ${header.column.id === "TokenPair" ? "justify-start" : "justify-end"
                      }`}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {isSortable && getSortIndicator(columnId)}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody className="group/tbody">
            {tableLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-white/40">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-b border-black/10 dark:border-[rgba(255,255,255,0.03)] md:hover:bg-gray-100 md:dark:hover:bg-white/[0.04] active:bg-gray-100 active:dark:bg-white/[0.04] transition-all duration-300 cursor-pointer group/row md:group-hover/tbody:opacity-40 md:hover:!opacity-100 active:opacity-100"
                      onClick={() =>
                        router.push(
                          `/trading-live/${row.original.chain.id}/${row.original.pool_address}`
                        )
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={`transition-all duration-300 py-4 px-4 md:px-6 md:group-hover/row:bg-gray-200 md:dark:group-hover/row:bg-white/[0.04] active:bg-gray-200 active:dark:bg-white/[0.04] ${cell.column.id === "TokenPair"
                            ? "text-left sticky left-0 z-10 dark:bg-[#121212] bg-gray-100"
                            : "text-right"
                            }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-12 text-white/40"
                    >
                      <p className="text-lg">No tokens found</p>
                      <p className="text-sm mt-2">Try adjusting your search or filters</p>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
        {tableData.length > 0 && loadingMore && (
          <div className="text-center py-4 text-white/40 text-sm">
            <span className="inline-flex items-center gap-2">
              <span className="animate-pulse">Loading more tokens...</span>
            </span>
          </div>
        )}
      </div>

      {/* Metadata and Page Size Selector */}
      <div className="flex justify-between items-center mt-4 px-2">
        <div className="text-sm dark:text-white/40 text-black/40">
          Showing <span className="dark:text-white text-black font-medium">{tableData.length}</span> of{" "}
          <span className="dark:text-white text-black font-medium">{total}</span> pools
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs dark:text-white/40 text-black/40">Items per page:</span>
          <Select
            onValueChange={(value) => setItemsPerPage(Number(value))}
            value={itemsPerPage.toString()}
          >
            <SelectTrigger className="dark:bg-[#151515] primary dark:border-white/10 border-black/10 dark:text-white/70 text-black/70 dark:hover:bg-[#1f1f1f] hover:bg-gray-200 text-xs w-16 rounded-sm h-auto py-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-[#151515] primary dark:border-white/10 border-black/10 text-xs">
              <SelectGroup>
                <SelectItem value="5" className="dark:text-white/70 text-black/70 dark:hover:bg-[#1f1f1f] hover:bg-gray-200 text-xs">
                  5
                </SelectItem>
                <SelectItem value="10" className="dark:text-white/70 text-black/70 dark:hover:bg-[#1f1f1f] hover:bg-gray-200 text-xs">
                  10
                </SelectItem>
                <SelectItem value="20" className="dark:text-white/70 text-black/70 dark:hover:bg-[#1f1f1f] hover:bg-gray-200 text-xs">
                  20
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasNext && (
        <div className="flex justify-center w-full items-center mt-4">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            className="button-primary px-8 py-2 "
          >
            {loadingMore ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CoinTableNew;
