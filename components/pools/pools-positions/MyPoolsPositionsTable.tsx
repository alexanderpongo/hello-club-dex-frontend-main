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
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import MyPoolsPositionsTableTokenPair from "@/components/pools/pools-positions/my-pools-positions-table-comp/MyPoolsPositionsTableTokenPair";
import { AdjustedPosition } from "@/types/lp-page.types";
import MyPoolsTableLiquidity from "@/components/pools/pools-positions/my-pools-positions-table-comp/MyPoolsTableLiquidity";
import Earnings from "@/components/pools/pools-positions/my-pools-positions-table-comp/Earnings";
import APR from "@/components/pools/pools-positions/my-pools-positions-table-comp/APR";
import PriceRangeComp from "@/components/pools/pools-positions/my-pools-positions-table-comp/PriceRange";
import PNL from "./my-pools-positions-table-comp/PNL";
import APRHeader from "./my-pools-positions-table-comp/APRHeader";
import { YieldSparkline } from "./my-pools-positions-table-comp/YieldSparkline";

interface MyPoolsPositionsTableProps {
  tableData: AdjustedPosition[];
  tableLoading: boolean;
}

const columns: ColumnDef<AdjustedPosition>[] = [
  {
    accessorKey: "TokenPair",
    header: "POSITION",
    cell: ({ row }) => (
      <MyPoolsPositionsTableTokenPair
        poolData={row.original.poolData}
        positionId={row.original.position_id}
      />
    ),
  },
  {
    accessorKey: "liquidity",
    header: "Liquidity",
    cell: ({ row }) => (
      <MyPoolsTableLiquidity
        currentLiquidity={row.original.liquidity.current_amounts.total_usd || 0}
      />
    ),
  },
  {
    accessorKey: "earnings",
    header: "Earnings",
    cell: ({ row }) => (
      <Earnings
        earningsAmount={row.original.fees.total_earned.total_usd || 0}
      />
    ),
  },
  {
    accessorKey: "apr",
    header: () => <APRHeader />,
    cell: ({ row }) => <APR apr={row.original.performance.apr} />,
  },
  {
    accessorKey: "roi",
    header: "ROI",
    cell: ({ row }) => <APR apr={row.original.performance.roi} />,
  },
  {
    accessorKey: "pnl",
    header: "PNL",
    cell: ({ row }) => (
      <PNL pnlAmount={row.original.performance.pnl.net_pnl_usd} />
    ),
  },
  {
    accessorKey: "price_range",
    header: "Price Range(MIN/MAX)",
    cell: ({ row }) => (
      <PriceRangeComp price_range={row.original.price_range} />
    ),
  },
  {
    accessorKey: "yield_trend",
    header: () => <div className="text-right uppercase">Trend</div>,
    cell: () => <YieldSparkline />,
  },
];

const MyPoolsPositionsTable: React.FC<MyPoolsPositionsTableProps> = (props) => {
  const { tableData, tableLoading } = props;
  const router = useRouter();

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="w-full">
      <div className="relative rounded-xl overflow-x-auto dark:bg-[#121212] bg-white border border-black/10 dark:border-[rgba(255,255,255,0.03)]">
        <Table className="">
          <TableHeader>
            <TableRow className="border-b border-black/10 dark:border-[rgba(255,255,255,0.08)] hover:bg-transparent">
              {table.getFlatHeaders().map((header) => (
                <TableHead
                  key={header.id}
                  className={`text-xs font-bold text-[#9CA3AF] uppercase tracking-wider ${header.column.id === "TokenPair"
                    ? "text-left"
                    : "text-right"
                    }`}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
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
                          `/pools/pool/${row.original.poolData.chain.id}/${row.original.pool.address}/position/${row.original.position_id}`
                        )
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.id === "TokenPair"
                              ? "text-left"
                              : "text-right"
                          }
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
    </div>
  );
};

export default MyPoolsPositionsTable;
