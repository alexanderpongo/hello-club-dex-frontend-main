"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { chains } from "@/config/chains";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { Search } from "lucide-react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex relative flex-1 flex-col sm:flex-row items-start sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
        <Search className="w-4 h-4 text-[#A3A3A3] mr-2 absolute sm:left-4 top-4 sm:top-2 left-2" />
        <Input
          placeholder="Filter pools..."
          value={(table.getColumn("version")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            // console.log("Filter input:", value); // 👈 logs on every change
            table.getColumn("version")?.setFilterValue(value);
          }}
          className="h-8 w-[150px] pl-7 lg:w-[250px] border-2  bg-transparent focus:!ring-[#00000014] dark:focus:!ring-[#FFFFFF14] rounded-sm dark:bg-[#1A1A1A] dark:border-[#FFFFFF14]/5"
        />
        {/* <Input
          placeholder="Filter pools..."
          value={(table.getColumn("TVL")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("TVL")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px] border-2 border-[#FFFFFF14] bg-transparent focus:!ring-[#FFFFFF14] "
          //   style={{ border: "1px solid #FFFFFF14", background: "#ffffff" }}
        /> */}
        {/* {table.getColumn("chainId") && (
          <DataTableFacetedFilter
            column={table.getColumn("chainId")}
            title="Chain"
            options={chains}
          />
        )} */}
        {/* {table.getColumn("priority") && (
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
          />
        )} */}
        {/* {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )} */}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
