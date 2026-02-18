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
import { DataTableToolbar } from "./data-table-toolbar";
import { LucideLoader2 } from "lucide-react";
import Link from "next/link";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function FeeCollectsTable<TData, TValue>({
  data,
  columns,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const safeData = Array.isArray(data) ? data : [data];

  const table = useReactTable({
    data: safeData,
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

  // React.useEffect(() => {
  //   console.log("data data", data);
  //   table
  //     .getAllColumns()
  //     .filter((col) => col.id == "chainId")[0]
  //     .toggleVisibility(false);
  // }, []);

  React.useEffect(() => {
    // console.log("data data", data);
    table
      .getAllColumns()
      .find((col) => col.id === "chainId")
      ?.toggleVisibility(false);
  }, [table, data]);

  return (
    <div className="space-y-5 w-full">
      {/* <DataTableToolbar table={table} /> */}
      <div
        className="rounded-md bg-transparent overflow-hidden"
        // style={{
        //   border: "1px solid #FFFFFF14 !important",
        //   boxShadow: "20px 20px 120px 0px #D5B03A33",
        // }}
      >
        {/* <div className="mx-4 my-2 text-[18px] font-medium">
          Pools({})
        </div> */}
        <div className="w-full border border-[#27262611] bg-[#27262611]  dark:border-[#FFFFFF1A] overflow-y-auto max-w-[300px] md:max-w-full overflow-scroll md:overflow-visible md:max-h-none">
          <Table className=" rounded-xl dark:border-[#FFFFFF1A] dark:bg-[#FFFFFF1A]  w-full  overflow-y-auto  md:overflow-visible ">
            <TableHeader className=" rounded-xl">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        className="border-b dark:border-[#1a1a1a]"
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
              {Array.isArray(table.getRowModel().rows) &&
              table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border dark:border-[#FFFFFF1A] bg-[#27262611] hover:bg-[#0000001a] dark:hover:bg-[#ffffff1a]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell className="!text-left" key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="border dark:border-[#FFFFFF1A] bg-[#27262611] hover:bg-[#0000001a] dark:hover:bg-[#ffffff1a]">
                  <TableCell
                    colSpan={columns.length}
                    className="w-full h-24 justify-center items-center text-center"
                  >
                    <LucideLoader2 className="animate-spin absolute left-[50%] top-[50%]" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* <DataTablePagination table={table} /> */}
    </div>
  );
}
