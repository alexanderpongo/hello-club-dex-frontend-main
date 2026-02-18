// "use client";

// import {
//   useReactTable,
//   getCoreRowModel,
//   getSortedRowModel,
//   getPaginationRowModel,
//   flexRender,
//   type ColumnDef,
//   type SortingState,
//   type PaginationState,
//   type FilterFn,
//   getFilteredRowModel,
// } from "@tanstack/react-table";
// import { useEffect, useMemo, useState } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { ProcessedPoolsType } from "@/types/trading-live.types";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import TokenPair from "@/components/trading-live/coin-table-comps/TokenPair";
// import PoolPrice from "@/components/trading-live/coin-table-comps/PoolPrice";
// import Spinner from "@/components/Spinner";
// import Age from "@/components/trading-live/coin-table-comps/Age";
// import MCAP from "@/components/trading-live/coin-table-comps/_MCAP";
// import { RowProvider } from "@/components/trading-live/coin-table-comps/RowContext";
// import { useAccount } from "wagmi";
// import { useRouter, useSearchParams } from "next/navigation";

// export const getFeeTier = (fee: any) => {
//   let feeAmount = fee.result[4]! / 10000;
//   return feeAmount;
// };

// const columns: ColumnDef<ProcessedPoolsType>[] = [
//   {
//     accessorKey: "rank",
//     header: "",
//     cell: ({ row }) => (
//       <div className="text-[#6B7280] leading-4 text-xs ">#{row.index + 1}</div>
//     ),
//   },
//   {
//     accessorKey: "name",
//     header: "TOKEN",
//     cell: ({ row }) => (
//       <TokenPair
//         chainId={row.original.chainId}
//         poolAddress={row.original.poolAddress}
//         poolId={row.original.id}
//         token0LogoURI={row.original.token0.logoURI}
//         token0Symbol={row.original.token0.symbol}
//         token1LogoURI={row.original.token1.logoURI}
//         token1Symbol={row.original.token1.symbol}
//       />
//     ),
//   },
//   {
//     accessorKey: "Fee Tier",
//     header: "FEE TIER",
//     cell: ({ row }) => (
//       <div className="font-mono text-foreground">
//         {getFeeTier(row.original)}%
//       </div>
//     ),
//   },
//   {
//     accessorKey: "price",
//     header: "PRICE",
//     cell: ({ row }) => (
//       <PoolPrice pool={row.original} setBasePrice={() => {}} />
//     ),
//   },
//   {
//     accessorKey: "age",
//     header: "AGE",
//     cell: ({ row }) => (
//       <Age blockTimestamp={row.original.blockTimestamp} className="" />
//     ),
//   },
//   {
//     accessorKey: "mcap",
//     header: "MCAP",
//     cell: ({ row }) => (
//       <MCAP
//         chainId={row.original.chainId}
//         token0={row.original.token0.address}
//         poolAddress={row.original.poolAddress}
//         token0Decimals={row.original.token0.decimal}
//         token0Symbol={row.original.token0.symbol}
//         tokenId={row.original.tokenId}
//       />
//     ),
//   },
// ];

// interface CoinTableProps {
//   tableData: ProcessedPoolsType[];
//   isLoading?: boolean;
//   emptyMessage?: string;
// }

// const CoinTable: React.FC<CoinTableProps> = (props) => {
//   const {
//     tableData,
//     isLoading = false,
//     emptyMessage = "No data to display",
//   } = props;
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [globalFilter, setGlobalFilter] = useState<string>("all");
//   const [pagination, setPagination] = useState<PaginationState>({
//     pageIndex: 0,
//     pageSize: 10,
//   });
//   // Cache the last successful data so we can keep showing rows while new data loads
//   const [lastData, setLastData] = useState<ProcessedPoolsType[]>([]);
//   const { chainId } = useAccount();
//   const searchParams = useSearchParams();
//   const route = useRouter();

//   // Use TanStack global filter to persist chain filtering in table state
//   const chainGlobalFilter: FilterFn<ProcessedPoolsType> = (
//     row,
//     _columnId,
//     value
//   ) => {
//     if (!value || value === "all") return true;
//     const cid = Number(value);
//     if (!Number.isFinite(cid)) return true;
//     return row.original.chainId === cid;
//   };

//   // Sync global filter with URL ?chain= param driven by Header
//   useEffect(() => {
//     const qp = searchParams.get("chain");
//     setGlobalFilter(qp ?? "all");
//   }, [searchParams]);

//   // Persist previously loaded data to avoid clearing rows during background loads
//   useEffect(() => {
//     if (!isLoading && Array.isArray(tableData) && tableData.length > 0) {
//       setLastData(tableData);
//     }
//   }, [isLoading, tableData]);

//   // Prefer showing cached rows while loading to prevent flicker
//   const dataForTable = useMemo(
//     () => (isLoading && lastData.length ? lastData : tableData),
//     [isLoading, lastData, tableData]
//   );

//   const sortedData = useMemo(() => {
//     return [...dataForTable].sort((a, b) => {
//       const aNum = Number(a.id);
//       const bNum = Number(b.id);
//       if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
//       // Fallback for non-numeric ids
//       return String(a.id).localeCompare(String(b.id), undefined, {
//         numeric: true,
//       });
//     });
//   }, [dataForTable]);

//   const table = useReactTable({
//     data: sortedData,
//     columns,
//     autoResetPageIndex: false,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     globalFilterFn: chainGlobalFilter,
//     onSortingChange: setSorting,
//     onGlobalFilterChange: setGlobalFilter,
//     onPaginationChange: setPagination,
//     getFilteredRowModel: getFilteredRowModel(),
//     // Stabilize row identity to reduce remounting during updates
//     getRowId: (row) => `${row.chainId}-${row.poolAddress}-${row.id}`,
//     state: {
//       sorting,
//       globalFilter,
//       pagination,
//     },
//     initialState: {
//       pagination: { pageSize: 10 },
//     },
//   });

//   // Reset to first page when chain filter changes to avoid out-of-range pageIndex
//   useEffect(() => {
//     setPagination((p) => ({ ...p, pageIndex: 0 }));
//   }, [globalFilter]);

//   // Clamp pageIndex when data size shrinks (e.g., after filter) so page isn't empty
//   useEffect(() => {
//     const pageCount = table.getPageCount();
//     setPagination((p) =>
//       p.pageIndex >= pageCount && pageCount > 0
//         ? { ...p, pageIndex: Math.max(0, pageCount - 1) }
//         : p
//     );
//   }, [sortedData, table, pagination.pageSize]);

//   return (
//     <div className="w-full">
//       <div className="relative rounded-lg border-2 border-white/10 bg-card overflow-hidden">
//         <Table className="bg-[#0E0E10] border-white/10 ">
//           <TableHeader>
//             <TableRow className=" border-white/10">
//               {table.getFlatHeaders().map((header) => (
//                 <TableHead
//                   key={header.id}
//                   className={`text-xs font-bold text-[#9CA3AF] uppercase tracking-wider ${
//                     header.column.id === "name" || header.column.id === "rank"
//                       ? "text-left"
//                       : "text-right"
//                   }`}
//                 >
//                   {flexRender(
//                     header.column.columnDef.header,
//                     header.getContext()
//                   )}
//                 </TableHead>
//               ))}
//             </TableRow>
//           </TableHeader>
//           <TableBody className="border-white/10">
//             {table.getRowModel().rows.length === 0 && isLoading && (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="py-10 text-center text-[#9CA3AF]"
//                 >
//                   Loading data...
//                 </TableCell>
//               </TableRow>
//             )}
//             {table.getRowModel().rows.length === 0 && !isLoading ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="py-10 text-center text-[#9CA3AF]"
//                 >
//                   {emptyMessage}
//                 </TableCell>
//               </TableRow>
//             ) : (
//               table.getRowModel().rows.map((row) => (
//                 <RowProvider
//                   key={`${chainId ?? 0}-${row.original.poolAddress}`}
//                 >
//                   <TableRow
//                     className="border-b border-white/10 hover:bg-white/5 cursor-pointer"
//                     key={`${chainId ?? 0}-${row.original.poolAddress}`}
//                     onClick={() =>
//                       route.push(
//                         `/trading-live/${row.original.poolAddress}/${row.original.id}?chain=${row.original.chainId}`
//                       )
//                     }
//                   >
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell
//                         key={cell.id}
//                         className={
//                           cell.column.id === "name" || cell.column.id === "rank"
//                             ? "text-left"
//                             : "text-right"
//                         }
//                       >
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext()
//                         )}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </RowProvider>
//               ))
//             )}
//           </TableBody>
//         </Table>

//         {/* {isLoading && (
//           <div className="pointer-events-none absolute inset-x-0 top-2 flex items-center justify-center">
//             <div className="flex items-center gap-2 rounded-md bg-black/40 px-3 py-1 text-xs text-[#9CA3AF]">
//               <Spinner />
//               <span>Updating…</span>
//             </div>
//           </div>
//         )} */}
//       </div>

//       <div className="flex justify-center w-full">
//         <div className="flex items-center justify-center gap-2 mt-4 border border-white/10  rounded-sm bg-[#0E0E10]">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}
//             className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded-sm"
//           >
//             <ChevronLeft className="h-4 w-4" />
//           </Button>

//           {Array.from({ length: table.getPageCount() }, (_, i) => i).map(
//             (pageIndex) => (
//               <Button
//                 key={pageIndex}
//                 variant={
//                   table.getState().pagination.pageIndex === pageIndex
//                     ? "default"
//                     : "ghost"
//                 }
//                 size="icon"
//                 onClick={() => table.setPageIndex(pageIndex)}
//                 className={`h-8 w-8 rounded-sm ${
//                   table.getState().pagination.pageIndex === pageIndex
//                     ? "bg-primary text-[#000000] "
//                     : " text-[#9CA3AF] "
//                 }`}
//               >
//                 {pageIndex + 1}
//               </Button>
//             )
//           )}

//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}
//             className="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-30"
//           >
//             <ChevronRight className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CoinTable;
