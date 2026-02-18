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
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLpPoolsTableStore } from "@/store/lpPoolsTable.store";
import TokenPair from "@/components/pools/pools-main/table/TokenPair";
import FeeTier from "@/components/pools/pools-main/table/FeeTier";
import Volume from "@/components/pools/pools-main/table/Volume";
import APR from "@/components/pools/pools-main/table/APR";
import TVL from "@/components/pools/pools-main/table/TVL";
import PoolType from "@/components/pools/pools-main/table/PoolType";
import { useRouter } from "next/navigation";

const columns: ColumnDef<TradingLiveTableItem>[] = [
  {
    accessorKey: "TokenPair",
    header: "MY POOLS",
    cell: ({ row }) => (
      <TokenPair
        chain={row.original.chain}
        token0={row.original.token0}
        token1={row.original.token1}
      />
    ),
  },
  {
    accessorKey: "fee_tier",
    header: "FEE TIER",
    cell: ({ row }) => <FeeTier feeTier={row.original.fee_tier} />,
  },
  {
    accessorKey: "apr",
    header: "APR",
    cell: ({ row }) => <APR APR={row.original.apr.value} />,
  },
  {
    accessorKey: "tvl",
    header: "TVL",
    cell: ({ row }) => <TVL tvl={row.original.tvl_usd} />,
  },
  {
    accessorKey: "24h_volume",
    header: "VOLUME 24H",
    cell: ({ row }) => (
      <Volume volume_24h={row.original.volume.volume_24h_usd} />
    ),
  },
  {
    accessorKey: "pool_type",
    header: "POOL TYPE",
    cell: ({ row }) => <PoolType />,
  },
];

interface MainPoolsTableProps {
  tableData: TradingLiveTableItem[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (columnId: string, order: "asc" | "desc") => void;
  onPageChange?: (page: number) => void;
}

const MainPoolsTable: React.FC<MainPoolsTableProps> = (props) => {
  const { tableData, sortBy = "", sortOrder = "desc", onSort, onPageChange } = props;
  const {
    tableLoading,
    setItemsPerPage,
    itemsPerPage,
    page,
    totalPages,
    hasNext,
    hasPrev,
    setPage,
  } = useLpPoolsTableStore();


  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  // Map column IDs to backend sortBy parameter values
  const columnToSortByMap: Record<string, string> = {
    apr: "apr",
    tvl: "tvlUSD",
    "24h_volume": "volume24hUSD",
  };

  // Map backend sortBy to column IDs
  const getCurrentColumnId = () => {
    if (sortBy === "apr") return "apr";
    if (sortBy === "tvlUSD") return "tvl";
    if (sortBy === "volume24hUSD") return "24h_volume";
    return null;
  };

  const handleHeaderClick = (columnId: string) => {
    // Only allow sorting on sortable columns
    if (!columnToSortByMap[columnId] || !onSort) return;

    const backendSortBy = columnToSortByMap[columnId];
    const isCurrentSort = getCurrentColumnId() === columnId;
    //sort with clicks, ie first click-sort desc, second click-sort asc, third click-remove sort
    if (!isCurrentSort) {
      onSort(backendSortBy, "desc");
    } else if (sortOrder === "desc") {
      onSort(backendSortBy, "asc");
    } else {
      onSort("", "desc");
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

  const router = useRouter();

  return (
    <div className="w-full">
      <div className="relative rounded-lg overflow-x-auto">
        <Table className="">
          <TableHeader>
            <TableRow className=" border-white/10">
              {table.getFlatHeaders().map((header) => {
                const columnId = header.column.id;
                const isSortable = columnToSortByMap[columnId] !== undefined;

                return (
                  <TableHead
                    key={header.id}
                    onClick={isSortable ? () => handleHeaderClick(columnId) : undefined}
                    className={`text-xs font-bold text-[#9CA3AF] uppercase tracking-wider transition-colors ${isSortable ? 'cursor-pointer hover:text-white/80 select-none' : ''
                      } text-left py-4 px-2 first:pl-2 ${header.column.id === "TokenPair" ? "w-[220px]" :
                        header.column.id === "fee_tier" ? "w-[90px]" :
                          header.column.id === "apr" ? "w-[100px]" :
                            header.column.id === "tvl" ? "w-[120px]" :
                              header.column.id === "24h_volume" ? "w-[120px]" :
                                header.column.id === "pool_type" ? "w-[100px]" : "w-auto"}`}
                  >
                    <div className="flex items-center gap-1.5 justify-start">
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
          <TableBody className="">
            {tableLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-[#9CA3AF]">
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
                      className="border-b-0 dark:hover:bg-white/[0.04] hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/pools/pool/${row.original.chain.id}/${row.original.pool_address}`
                        )
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="text-left py-5 px-2 first:pl-2"
                        >
                          <div className="flex justify-start items-center">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between w-full items-center gap-2 py-2 px-4 border border-t-[#ffffff08] border-b-0 border-l-0 border-r-0">
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span className="font-lato font-normal">ROWS</span>
          <Select
            onValueChange={(value) => {
              const n = Number(value);
              setItemsPerPage(n);
              // Reset to first page when page size changes
              setPage(1);
            }}
            value={itemsPerPage.toString()}
            defaultValue="10"
          >
            <SelectTrigger className=" bg-transparent border-[#292929] text-[#9CA3AF] text-xs w-16 rounded-md h-10">
              <SelectValue
                placeholder="Order"
                className="text-[#9CA3AF] text-xs rounded-none"
              />
            </SelectTrigger>
            <SelectContent className="dark:bg-[#0E0E10] bg-slate-100 border-white/10 text-xs">
              <SelectGroup>
                <SelectItem value={"5"} className="text-[#9CA3AF] text-xs">
                  5
                </SelectItem>
                <SelectItem value={"10"} className="text-[#9CA3AF] text-xs">
                  10
                </SelectItem>
                <SelectItem value={"20"} className="text-[#9CA3AF] text-xs">
                  20
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="text-[10px] text-gray-500">
          Page {Math.max(1, Math.min(page, Math.max(1, totalPages)))} of{" "}
          {Math.max(1, totalPages)}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#9CA3AF]"
            aria-label="First page"
            disabled={tableLoading || !hasPrev || page <= 1}
            onClick={() => handlePageChange(1)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#9CA3AF]"
            aria-label="Previous page"
            disabled={tableLoading || !hasPrev || page <= 1}
            onClick={() => handlePageChange(Math.max(1, page - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#9CA3AF]"
            aria-label="Next page"
            disabled={tableLoading || !hasNext || page >= totalPages}
            onClick={() => handlePageChange(Math.min(totalPages || 1, page + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#9CA3AF]"
            aria-label="Last page"
            disabled={tableLoading || !hasNext || page >= totalPages}
            onClick={() => handlePageChange(Math.max(1, totalPages))}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div >
  );
};

export default MainPoolsTable;
