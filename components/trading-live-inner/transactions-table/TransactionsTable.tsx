"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@/types/generated/transactions";
import axios from "axios";
import TransactionRow from "./TransactionRow";
import TransactionSkelton from "./TransactionSkelton";
import { useMemo, useState } from "react";
import AllTransactionsModal from "./AllTransactionsModal";
import { Loader2, Search, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import { toast } from "react-toastify";
import { formatSmallNumber } from "@/lib/format-utils";
import NetworkLogo from "./NetworkLogo";
import { useWindowSize } from "@/hooks/useWindowSize";

const getBlockExplorerUrl = (chainId: number, hash: string) => {
  switch (chainId) {
    case 1:
      return `https://etherscan.io/tx/${hash}`;
    case 56:
      return `https://bscscan.com/tx/${hash}`;
    case 8453:
      return `https://basescan.org/tx/${hash}`;
    case 97:
      return `https://testnet.bscscan.com/tx/${hash}`;
    default:
      return "";
  }
};

const columns: ColumnDef<Transaction>[] = [
  {
    id: "type",
    accessorKey: "type",
    header: () => <div className="text-center">TYPE</div>,
    cell: ({ getValue }) => {
      const type = getValue() as string;
      return (
        <div className="text-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-medium ${
              type === "BUY"
                ? "border-emerald-500 text-emerald-500"
                : "border-red-500 text-red-500"
            }`}
          >
            {type}
          </span>
        </div>
      );
    },
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: () => <div className="text-center">AMOUNT</div>,
    cell: ({ getValue }) => (
      <div className="text-center text-gray-800 dark:text-white/90 font-lato text-xs">
        {getValue() as string}
      </div>
    ),
  },
  // {
  //   id: "price",
  //   accessorKey: "price",
  //   header: () => <div className="text-right">PRICE</div>,
  //   cell: ({ getValue }) => (
  //     <div className="text-right text-gray-800 dark:text-white/90 font-lato text-xs">
  //       {getValue() as string}
  //     </div>
  //   ),
  // },
  {
    id: "total",
    accessorKey: "total",
    header: () => <div className="text-center">TOTAL (USD)</div>,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <div className="text-center text-gray-800 dark:text-white/90 font-lato text-xs">
          {formatSmallNumber(value)}
        </div>
      );
    },
  },
  {
    id: "time",
    accessorKey: "time",
    header: () => <div className="text-center">TIME</div>,
    cell: ({ getValue }) => (
      <div className="text-right text-gray-500 dark:text-[#9CA3AF] font-lato text-xs">
        {getValue() as string}
      </div>
    ),
  },
  {
    id: "wallet",
    accessorKey: "wallet",
    header: () => <div className="text-center">WALLET</div>,
    cell: ({ getValue }) => {
      const wallet = getValue() as string;

      const handleCopy = () => {
        navigator.clipboard.writeText(wallet);
        toast.success("Copied to clipboard");
      };

      return (
        <div className="flex items-center justify-end gap-2">
          <span className="text-gray-500 dark:text-[#9CA3AF] font-lato text-xs">
            {wallet}
          </span>
          <Copy size={12} className="cursor-pointer" onClick={handleCopy} />
        </div>
      );
    },
  },
  {
    id: "transaction_hash",
    accessorKey: "transaction_hash",
    header: () => <div className="text-center">HASH</div>,
    cell: ({ row, getValue }) => {
      const hash = getValue() as string;
      const { chainId } = row.original as Transaction & { chainId: number };

      return (
        <div className="flex items-center justify-center gap-2">
          <a
            href={getBlockExplorerUrl(chainId, hash)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <NetworkLogo chainId={chainId} />
          </a>
        </div>
      );
    },
  },
];

const TransactionTable = ({
  tokenAddress,
  poolAddress,
  chainId,
  startblock,
  endblock,
  token0PriceInUSD,
}: {
  tokenAddress: string;
  poolAddress: string;
  chainId: number;
  startblock: number;
  endblock: string;
  token0PriceInUSD: number | null;
}) => {
  const [filter, setFilter] = useState<"All" | "BUY" | "SELL">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const { width } = useWindowSize();

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "transactions",
      tokenAddress,
      poolAddress,
      chainId,
      filter,
      debouncedSearchTerm,
      token0PriceInUSD,
    ],
    queryFn: async () => {
      const response = await axios.get("/api/get-transactions", {
        params: {
          tokenAddress,
          poolAddress,
          chainId,
          offset: 10,
          filter,
          walletAddress: debouncedSearchTerm,
          token0PriceInUSD,
        },
      });
      return response.data;
    },
  });

  const displayedData = useMemo(
    () => data?.result?.map((tx: Transaction) => ({ ...tx, chainId })) ?? [],
    [data, chainId]
  );

  const table = useReactTable({
    data: displayedData,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full space-y-2 bg-white dark:bg-[#0E0E10] rounded-lg">
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center px-2 gap-4">
        <div className="font-formula text-primary uppercase text-[32px] text-left w-full md:w-auto">
          TRANSACTIONS
        </div>
        <div className="gap-2 flex flex-wrap items-center">
          <Button
            className={`rounded ${
              filter === "All"
                ? "button-primary"
                : "text-gray-500 dark:text-[#9CA3AF]"
            }`}
            variant={"ghost"}
            onClick={() => setFilter("All")}
          >
            All
          </Button>
          <Button
            className={ 
              filter === "BUY"
                ? "button-primary"
                : "text-gray-500 dark:text-[#9CA3AF]"
            }
            variant={"ghost"}
            onClick={() => setFilter("BUY")}
          >
            BUY
          </Button>
          <Button
            className={
              filter === "SELL"
                ? "button-primary"
                : "text-gray-500 dark:text-[#9CA3AF]"
            }
            variant={"ghost"}
            onClick={() => setFilter("SELL")}
          >
            SELL
          </Button>
          <Input
            placeholder="Search by wallet address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-48 bg-transparent border-gray-300 dark:border-[#ADFF2F]/30 rounded-[6px] text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50"
          />
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-gray-600 dark:text-white/70 font-bold text-xs font-lato"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex justify-center items-center py-10">
                    <Loader2 size={24} className="animate-spin h-10 w-10" />
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-red-500"
                >
                  Error fetching transactions.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-gray-500"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              table
                .getRowModel()
                .rows.map((row) => <TransactionRow key={row.id} row={row} />)
            )}
          </TableBody>
        </Table>
      </div>
      <div className="w-full ">
        <Button
          className="w-full button-primary uppercase"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          View All Transactions
        </Button>
      </div>
      <AllTransactionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tokenAddress={tokenAddress}
        poolAddress={poolAddress}
        chainId={chainId}
        startblock={startblock}
        endblock={endblock}
        token0PriceInUSD={token0PriceInUSD}
      />
    </div>
  );
};

export default TransactionTable;
