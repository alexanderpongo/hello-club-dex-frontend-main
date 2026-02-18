import { Position } from "@/types/my-positions.types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import TokenPair from "@/components/pools/pools-main/table/positions-table/TokenPair";
import FeeTier from "@/components/pools/pools-main/table/FeeTier";
import APR from "@/components/pools/pools-main/table/APR";
import TVL from "@/components/pools/pools-main/table/TVL";
import PNL from "@/components/pools/pools-positions/my-pools-positions-table-comp/PNL";
import Status from "./Status";

interface PositionsTableProps {
  positionsTableData: Position[];
  tableLoading: boolean;
  chain: string;
}

const PositionsTable: React.FC<PositionsTableProps> = (props) => {
  const { positionsTableData, tableLoading, chain } = props;

  const columns: ColumnDef<Position>[] = [
    {
      accessorKey: "TokenPair",
      header: "MY POOLS",
      cell: ({ row }) => <TokenPair chain={chain} pool={row.original.pool} />,
    },
    {
      accessorKey: "fee_tier",
      header: "FEE TIER",
      cell: ({ row }) => <FeeTier feeTier={row.original.pool.fee_tier} />,
    },
    {
      accessorKey: "apr",
      header: "APR",
      cell: ({ row }) => <APR APR={row.original.performance.apr} />,
    },
    {
      accessorKey: "invested_value",
      header: "INVESTED VALUE",
      cell: ({ row }) => (
        <TVL tvl={row.original.liquidity.original_deposited.total_usd!} />
      ),
    },
    {
      accessorKey: "current_value",
      header: "CURRENT VALUE",
      cell: ({ row }) => (
        <TVL tvl={row.original.liquidity.current_amounts.total_usd!} />
      ),
    },
    {
      accessorKey: "yield",
      header: "YIELD",
      cell: ({ row }) => (
        <div className="flex flex-col items-start text-left">
          <span className="text-sm font-medium text-[#C2FE0C]">
            ${(row.original.fees.uncollected.total_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "price_range",
      header: "PRICE RANGE (MIN/MAX)",
      cell: ({ row }) => {
        const { price_lower, price_upper, current_price } = row.original.price_range.token1_per_token0;
        const in_range = row.original.price_range.in_range;

        // Calculate current price position as percentage (0 to 100)
        let position = 0;
        if (price_upper !== price_lower) {
          position = ((current_price - price_lower) / (price_upper - price_lower)) * 100;
        }
        position = Math.max(0, Math.min(100, position));

        return (
          <div className="flex flex-col items-end gap-1.5 min-w-[140px] text-right">
            {!in_range && (
              <span className="text-[9px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 rounded px-1 uppercase mb-1">
                Out of Range
              </span>
            )}
            <div className="flex justify-between w-full text-[10px] text-gray-400 font-lato px-0.5">
              <span>{price_lower > 1 ? price_lower.toFixed(2) : price_lower.toFixed(6)}</span>
              <span>{price_upper > 1 ? price_upper.toFixed(2) : price_upper.toFixed(6)}</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full relative overflow-hidden">
              <div
                className="absolute h-full bg-[#C2FE0C] transition-all duration-500"
                style={{
                  left: in_range ? `${Math.max(0, position - 2)}%` : '0%',
                  width: in_range ? '4%' : '0%',
                  opacity: in_range ? 1 : 0
                }}
              />
            </div>
            <span className="text-[10px] text-gray-500 uppercase">
              {row.original.pool.token1.symbol} per {row.original.pool.token0.symbol}
            </span>
          </div>
        );
      },
    },
  ];

  const router = useRouter();

  const table = useReactTable({
    data: positionsTableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });
  return (
    <div className="w-full">
      <div className="relative rounded-lg overflow-x-auto">
        <Table className="">
          <TableHeader>
            <TableRow className=" border-white/10">
              {table.getFlatHeaders().map((header) => (
                <TableHead
                  key={header.id}
                  className={`text-xs font-bold text-[#9CA3AF] uppercase tracking-wider py-4 px-2 first:pl-2 
                    ${header.column.id === "price_range" ? "text-right" : "text-left"}
                    ${header.column.id === "TokenPair" ? "w-[220px]" :
                      header.column.id === "fee_tier" ? "w-[90px]" :
                        header.column.id === "apr" ? "w-[100px]" :
                          header.column.id === "invested_value" ? "w-[130px]" :
                            header.column.id === "current_value" ? "w-[130px]" :
                              header.column.id === "yield" ? "w-[100px]" :
                                header.column.id === "price_range" ? "w-[200px]" : "w-auto"}`}
                >
                  <div className={`flex items-center gap-1.5 ${header.column.id === "price_range" ? "justify-end" : "justify-start"}`}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </div>
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
                          `/pools/pool/${chain}/${row.original.pool.address}/position/${row.original.token_id}`
                        )
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={`py-5 px-2 first:pl-2 ${cell.column.id === "price_range" ? "text-right" : "text-left"}`}
                        >
                          <div className={`flex items-center ${cell.column.id === "price_range" ? "justify-end" : "justify-start"}`}>
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
    </div>
  );
};

export default PositionsTable;
