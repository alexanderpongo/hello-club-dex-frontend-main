"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { LucideLoader2, Search } from "lucide-react";
import Link from "next/link";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading: boolean;
  table?: any; // Optional table instance from parent
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  table: parentTable,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const router = useRouter();
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  // Use parent table if provided, otherwise create local table
  const table =
    parentTable ||
    useReactTable({
      data,
      columns,
      state: {
        sorting,
        columnVisibility,
        rowSelection,
        columnFilters,
      },
      enableRowSelection: true,
      onRowSelectionChange: setRowSelection,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
    });

  React.useEffect(() => {
    // console.log("data data", data);
    table.getAllColumns().filter((col: any) => col.id == "chainId")[0];
    // .toggleVisibility(false);
  }, []);

  // const handleClickRow = (row: any, cell: any) => {
  //   if (!address) {
  //     openConnectModal?.(); // safe call in case it's undefined
  //   } else {
  //     if (cell.column.id != "actions") {
  //       router.push(`/${row?.original?.id}`);
  //     }
  //   }
  // };

  return (
    <div className="space-y-5 w-full">
      <div
        className="rounded-md bg-transparent overflow-hidden"
        // style={{
        //   border: "1px solid #FFFFFF14 !important",
        //   boxShadow: "20px 20px 120px 0px #D5B03A33",
        // }}
      >
        <ScrollArea className="w-full rounded-xl overflow-y-auto max-w-[300px] md:max-w-full h-[550px]  md:max-h-none">
          <Table className=" w-full overflow-y-auto  md:overflow-visible ">
            <TableHeader className=" rounded-xl ">
              {table.getHeaderGroups().map((headerGroup: any) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header: any) => {
                    return (
                      <TableHead
                        className="border-b dark:border-[#FFFFFF1A] uppercase text-[#A3A3A3]"
                        key={header.id}
                        colSpan={header.colSpan}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,

                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row: any) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b  dark:border-[#FFFFFF08] last:border-b hover:bg-[#efefef] hover:dark:bg-[#1f1f1f] "
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <TableCell
                        key={cell.id}
                        // onClick={() => handleClickRow(row, cell)}
                        className={`${cell.column.id != "actions" && "c"}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                        {/* </Link> */}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : loading ? (
                <TableRow className=" ">
                  <TableCell
                    colSpan={columns.length}
                    className=" w-full h-24 justify-center items-center text-center "
                  >
                    <LucideLoader2 className="animate-spin absolute left-[50%] top-[50%]" />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow className="dark:border-[#FFFFFF1A]">
                  <TableCell
                    colSpan={columns.length}
                    className="w-full h-24 text-center relative"
                  >
                    <div className="flex flex-col my-32 justify-center items-center w-full h-full space-y-2">
                      <div className="bg-black/5  dark:bg-dark m-5 border-none ring-1 ring-black/10 dark:ring-white/20 rounded-full">
                        <Search className="text-gray-400 m-5" />
                      </div>

                      <div className="uppercase font-barlow text-black dark:text-white text-xl">
                        No Pools Found.
                      </div>
                      <span className="text-sm text-gray-400 ">
                        No pools are currenlty available.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
                // <TableRow className=" dark:border-[#FFFFFF1A] ">
                //   <TableCell
                //     colSpan={columns.length}
                //     className=" w-full h-24 justify-center items-center text-center "
                //   >
                //     <Image
                //       src="/assets/no-data.png"
                //       alt="No Data"
                //       width={100}
                //       height={100}
                //       className=" w-[150px] flex items-center justify-center -z-10"
                //     />
                //   </TableCell>
                // </TableRow>
              )}
            </TableBody>
          </Table>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
