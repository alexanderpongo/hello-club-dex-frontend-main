"use client";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-end px-2">
      {/* <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div> */}
      <div className="w-full flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4 lg:space-x-8">
        <div className="flex items-center sm:space-x-2">
          <p className="text-sm font-medium hidden sm:block">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger
              className="h-8 w-[70px] dark:bg-[#1a1a1a] border dark:border-[#FFFFFF14]"
              // style={{ border: "1px solid #FFFFFF14", background: "#1a1a1a" }}
            >
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent
              side="top"
              className="dark:bg-[#1a1a1a] border dark:border-[#FFFFFF14]"
              // style={{ border: "1px solid #FFFFFF14", background: "#1a1a1a" }}
            >
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <div className="flex sm:hidden items-center justify-center text-sm font-medium">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <div className="hidden sm:flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex dark:bg-[#1a1a1a] border dark:border-[#FFFFFF14]"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              // style={{ border: "1px solid #FFFFFF14", background: "#1a1a1a" }}
            >
              <span className="sr-only">Go to first page</span>
              <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 dark:bg-[#1a1a1a] border dark:border-[#FFFFFF14]"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              // style={{ border: "1px solid #FFFFFF14", background: "#1a1a1a" }}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 dark:bg-[#1a1a1a] border dark:border-[#FFFFFF14]"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              // style={{ border: "1px solid #FFFFFF14", background: "#1a1a1a" }}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex dark:bg-[#1a1a1a] border dark:border-[#FFFFFF14]"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              // style={{ border: "1px solid #FFFFFF14", background: "#1a1a1aa" }}
            >
              <span className="sr-only">Go to last page</span>
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
