"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LPAdded } from "./data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import Actions from "./Actions";
import TVLDetails from "./TVLDetails";
import LpDetailsField from "./LpDetailsField";
import RangeSelector from "./RangeSelector";
import LockedChecker from "./LockedChecker";
// import APRDetails from "./APRDetails";

export const getFeeTier = (fee: any) => {
  let feeAmount = fee.result[4]! / 10000;
  return feeAmount;
};

const getTVLValue = (fee: any, token0: any, token1: any) => {
  const amount0 = BigInt(fee.amount0.toString() || "0");
  const amount1 = BigInt(fee.amount1.toString() || "0");
  const liquidity = BigInt(fee.liquidity.toString() || "0");

  if (liquidity === BigInt(0)) {
    return 0;
  }

  let feeAmount: BigInt = BigInt("0");
  let decimals = token0.decimal;

  if (amount0 > BigInt(0) && amount1 > BigInt(0)) {
    feeAmount = amount0 * BigInt(2);
  } else if (amount0 > BigInt(0)) {
    feeAmount = amount0;
  } else if (amount1 > BigInt(0)) {
    feeAmount = amount1;
    decimals = token1.decimal;
  }

  // Convert to numeric value for sorting
  return parseFloat(feeAmount.toString()) / Math.pow(10, decimals);
};

export const columns: ColumnDef<LPAdded | any>[] = [
  {
    accessorKey: "version",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Pools"
        className="text-xs"
      />
    ),
    cell: ({ row }) => {
      return (
        <span className="max-w-[500px] truncate font-normal">
          <LpDetailsField row={row?.original} />
          {/* <LpDetails row={row} /> */}
        </span>
      );
    },

    filterFn: (row, _columnId, filterValue) => {
      const label1 = row.original.token0.symbol!;
      const label2 = row.original.token1.symbol!;
      return (
        label1.toLowerCase().includes(filterValue.toLowerCase()) ||
        label2.toLowerCase().includes(filterValue.toLowerCase())
      );
    },
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "Fee Tier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fee Tier" />
    ),
    cell: ({ row }) => {
      return (
        <span className="max-w-[500px] truncate font-normal">
          {/* {row.getValue("TVL")} */}
          <div className="flex gap-1 text-[10px]  font-bold">
            {/* <div className="w-[29px] rounded-full bg-[#EC489933] text-[#EC4899] text-center">
              V3
            </div> */}
            <div className=" rounded-sm text-center text-[#A3A3A3] bg-[#6B728033] border border-[#A3A3A3]/20 text-xs py-1 px-2">
              {getFeeTier(row.original)}%
            </div>
          </div>
        </span>
      );
    },
    accessorFn: (row: any) => getFeeTier(row),
    sortingFn: "basic",
    enableSorting: true,
  },
  // {
  //   accessorKey: "APR",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="APR" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <span className="max-w-[500px] truncate font-normal">
  //         <APRDetails row={row} />
  //       </span>
  //     );
  //   },
  //   accessorFn: (row: any) => getTVLValue(row, row.token0, row.token1),
  //   sortingFn: "basic",
  //   enableSorting: true,
  // },
  {
    accessorKey: "TVL",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TVL" />
    ),
    cell: ({ row }) => {
      return (
        <span className="max-w-[500px] truncate font-normal">
          <TVLDetails row={row} />
        </span>
      );
    },
    accessorFn: (row: any) => getTVLValue(row, row.token0, row.token1),
    sortingFn: "basic",
    enableSorting: true,
  },
  {
    accessorKey: "In Range",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="In Range"
        className="text-xs"
      />
    ),
    cell: ({ row }) => <RangeSelector row={row.original} />,
    enableSorting: false, // This involves async blockchain calls, disable sorting
  },
  {
    accessorKey: "LP Lock",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="LP Lock"
        customSortLabels={{ asc: "Unlock", desc: "Lock" }}
        useCustomIcons={true}
        customIconType="lock"
      />
    ),
    cell: ({ row }) => <LockedChecker row={row.original} />,
    enableSorting: true,
  },

  {
    id: "actions",
    cell: ({ row }) => <Actions row={row.original} />,
  },
];
