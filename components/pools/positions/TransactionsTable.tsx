"use client";
import React from "react";
import { PositionTransaction } from "@/types/lp-page.types";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import { adjustTokenSymbol } from "@/lib/token-utils";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";

interface TransactionsTableProps {
  transactionsData: PositionTransaction[];
  token0Symbol: string; // e.g. HELLO
  token1Symbol: string; // e.g. BNB
  explorerTxBaseUrl?: string; // e.g. https://bscscan.com/tx
  loading?: boolean;
  chainId: number;
}

// Map raw tx type to display label
const formatTypeLabel = (raw: string) => {
  switch (raw) {
    case "increase_liquidity":
      return "Add Liquidity";
    case "decrease_liquidity":
      return "Remove Liquidity";
    case "collect_fees":
      return "Collect Fees";
    default:
      return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
};

// Simple relative time formatter (seconds -> human short string)
const formatRelativeTime = (unixSeconds: number) => {
  const nowMs = Date.now();
  const tsMs = unixSeconds * 1000;
  let diffSec = Math.max(0, Math.floor((nowMs - tsMs) / 1000));
  const minute = 60;
  const hour = 3600;
  const day = 86400;
  const week = day * 7;
  if (diffSec < minute) return `${diffSec}s ago`;
  if (diffSec < hour) return `${Math.floor(diffSec / minute)}m ago`;
  if (diffSec < day) return `${Math.floor(diffSec / hour)}h ago`;
  if (diffSec < week) return `${Math.floor(diffSec / day)}d ago`;
  const weeks = Math.floor(diffSec / week);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
};

// Format numeric token amounts with thousands and trim decimals
const formatTokenAmount = (value: number | string | undefined) => {
  if (value === undefined || value === null || value === "") return "-";
  const num = Number(value);
  if (!isFinite(num)) return String(value);
  // Decide decimals: if >= 1 use up to 3 decimals, else up to 6
  const decimals = num >= 1 ? 2 : 6;
  const fixed = num.toFixed(decimals);
  // Trim trailing zeros
  const trimmed = fixed.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  // Thousand separators
  return trimmed.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactionsData,
  token0Symbol,
  token1Symbol,
  explorerTxBaseUrl,
  loading = false,
  chainId,
}) => {
  const columns: ColumnDef<PositionTransaction>[] = [
    {
      accessorKey: "timestamp",
      header: () => <span className="text-xs text-[#9CA3AF]">TIME</span>,
      cell: ({ row }) => (
        <span className="text-xs dark:text-gray-400 text-black">
          {formatRelativeTime(row.original.timestamp)}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: () => <span className="text-xs text-[#9CA3AF]">TYPE</span>,
      cell: ({ row }) => (
        <span className="text-xs font-semibold dark:text-white text-black">
          {formatTypeLabel(row.original.type)}
        </span>
      ),
    },
    {
      accessorKey: "token0",
      header: () => (
        <span className="text-xs text-[#9CA3AF] uppercase">
          {adjustTokenSymbol(token0Symbol, chainId)}
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-xs dark:text-white text-black">
          {renderFormattedValue(row.original.amounts?.token0 as number)}
        </span>
      ),
    },
    {
      accessorKey: "token1",
      header: () => (
        <span className="text-xs text-[#9CA3AF] uppercase">
          {adjustTokenSymbol(token1Symbol, chainId)}
        </span>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs dark:text-white text-black">
            {renderFormattedValue(row.original.amounts?.token1 as number)}
          </span>
          {explorerTxBaseUrl && row.original.hash && (
            <a
              href={`${explorerTxBaseUrl}/tx/${row.original.hash}`}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-[#ADFF2F] transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: transactionsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      <div className="relative rounded-xl overflow-hidden dark:bg-[#121212] bg-white border border-black/10 dark:border-[rgba(255,255,255,0.03)] border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-black/10 dark:border-[rgba(255,255,255,0.08)] hover:bg-transparent">
              {table.getFlatHeaders().map((header) => (
                <TableHead
                  key={header.id}
                  className={`text-right ${header.column.id === "timestamp" ||
                      header.column.id === "type"
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
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-14 text-center"
                >
                  <span className="text-xs text-gray-400 font-lato">Loading...</span>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-black/10 dark:border-[rgba(255,255,255,0.03)] dark:hover:bg-white/[0.04] transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "timestamp" ||
                          cell.column.id === "type"
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
                  className="h-14 text-center"
                >
                  <span className="text-xs text-gray-400">
                    No transactions.
                  </span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionsTable;
