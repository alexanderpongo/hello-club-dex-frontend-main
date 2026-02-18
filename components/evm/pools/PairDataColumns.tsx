"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LPAdded, Pool } from "./data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { useSwapStore } from "@/store/useDexStore";

import LpDetails from "./LpDetails";
import Actions from "./Actions";
import TVLDetails from "./TVLDetails";
import { formatUnits, parseUnits } from "viem";

// const getFeeTier = (fee: any) => {
//   let feeAmount = fee.result[4] / 10000;
//   return feeAmount;
// };

const getTrimmedResult = (raw: string) => {
  const [intPart, decimalPart] = raw.split(".");
  if (!decimalPart) return raw;

  if (intPart === "0") {
    const firstNonZeroIndex = decimalPart.search(/[1-9]/);
    if (firstNonZeroIndex === -1) return "0";

    const sliceEnd = Math.min(firstNonZeroIndex + 3, 18);
    const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");

    return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
  }

  // For non-zero intPart, return int with 2–3 decimals
  const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
  return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
};

const formatTokenFromValue = (value: any, deci: number) => {
  // console.log("valuevaluevalue", value.amount0!);

  let amount;
  if (parseFloat(value?.amount0) > 0) {
    amount = value.amount0;
  } else {
    amount = 0;
  }
  const formatValue = formatUnits(BigInt(Math.floor(parseFloat(amount))), deci);

  // console.log("getTrimmedResult(formatValue)", getTrimmedResult(formatValue));

  // parseFloat(value?.amount0!) / deci;
  // return parseFloat(formatValue).toFixed(2);
  return getTrimmedResult(formatValue);
};

const formatTokenToValue = (value: any, deci: number) => {
  // console.log("valuevaluevalue", value.amount1!);
  let amount;
  if (parseFloat(value?.amount1) > 0) {
    amount = value.amount1;
  } else {
    amount = 0;
  }
  const formatValue = formatUnits(BigInt(Math.floor(parseFloat(amount))), deci);

  return getTrimmedResult(formatValue);
};

const typeDetector = (value: any) => {
  if (value?.amount1! && value?.amount0!) {
    return "Add Liquidity";
  } else {
    return "Remove Liquidity";
  }
};

const timeAgo = (timestamp: number) => {
  const secondsAgo = Math.floor(Date.now() / 1000) - timestamp;

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(secondsAgo / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
};

export const PairColumns: ColumnDef<LPAdded>[] = [
  {
    accessorKey: "time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Time" />
    ),
    cell: ({ row }) => {
      return (
        <span className="max-w-[500px] truncate font-normal">
          {timeAgo(parseFloat(row?.original?.blockTimestamp))}
        </span>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      // console.log("row now", row);

      return (
        <span className="max-w-[500px] truncate font-normal">
          {typeDetector(row?.original!)}
        </span>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "token0",
    header: ({ column }) => {
      const { pairFromToken } = useSwapStore();

      return (
        <DataTableColumnHeader column={column} title={pairFromToken?.symbol!} />
      );
    },
    cell: ({ row }) => {
      // console.log("row.original?.A", row.original?.tokenB);
      const { pairFromToken } = useSwapStore();
      return (
        <span className="max-w-[500px] truncate font-normal">
          {formatTokenFromValue(row.original, pairFromToken?.decimals!)}
        </span>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "token1",
    header: ({ column }) => {
      const { pairToToken } = useSwapStore();
      return (
        <DataTableColumnHeader column={column} title={pairToToken?.symbol!} />
      );
    },
    cell: ({ row }) => {
      const { pairToToken } = useSwapStore();
      // console.log("row.original?.B", row.original);
      return (
        <span className="max-w-[500px] truncate font-normal">
          {/* {row.getValue("Time")} */}
          {formatTokenToValue(row.original!, pairToToken?.decimals!)}
        </span>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   accessorKey: "token0",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title={pairFromToken?.symbol!} />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <span className="max-w-[500px] truncate font-normal">
  //         {row.original?.tokenA!}
  //       </span>
  //     );
  //   },
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  // {
  //   accessorKey: "token1",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title={pairToToken?.symbol!} />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <span className="max-w-[500px] truncate font-normal">
  //         {row.getValue("Time")}
  //       </span>
  //     );
  //   },
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  //   {
  //     accessorKey: "FeeTier",
  //     header: ({ column }) => (
  //       <DataTableColumnHeader column={column} title="FeeTier" />
  //     ),
  //     cell: ({ row }) => {
  //       return (
  //         <span className="max-w-[500px] truncate font-normal">
  //           {/* {row.getValue("TVL")} */}
  //           <div className="flex gap-1 text-[10px]  font-bold">
  //             <div className="w-[29px] rounded-full bg-[#EC489933] text-[#EC4899] text-center">
  //               V3
  //             </div>
  //             <div className="w-[39px] rounded-full text-center bg-[#00ffff] text-[#000]">
  //               {getFeeTier(row.original)}%
  //             </div>
  //           </div>
  //         </span>
  //       );
  //     },
  //   },
  //   {
  //     accessorKey: "TVL",
  //     header: ({ column }) => (
  //       <DataTableColumnHeader column={column} title="TVL" />
  //     ),
  //     cell: ({ row }) => {
  //       return (
  //         <span className="max-w-[500px] truncate font-normal">
  //           <TVLDetails row={row} />
  //         </span>
  //       );
  //     },
  //   },
  // {
  //   accessorKey: "volume24",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Volume(24h)" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <span className="max-w-[500px] truncate font-normal">
  //         {row.getValue("volume24")}
  //       </span>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "volumeW",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Volume(1W)" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <span className="max-w-[500px] truncate font-normal">
  //         {row.getValue("volumeW")}
  //       </span>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "volumeM",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Volume(1M)" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <span className="max-w-[500px] truncate font-normal">
  //         {row.getValue("volumeM")}
  //       </span>
  //     );
  //   },
  // },
  //   {
  //     accessorKey: "chainId",
  //     header: ({ column }) => (
  //       <DataTableColumnHeader column={column} title="Chain" />
  //     ),
  //     cell: ({ row }) => {
  //       // const chain = chains.find(
  //       //   (chain) => chain.chainId === row.getValue("chainId")
  //       // );

  //       // if (!chain) {
  //       //   return null;
  //       // }

  //       return (
  //         <div className="flex w-[100px] items-center">
  //           {/* {status.icon && (
  //             <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
  //           )} */}
  //           <span>{row.getValue("chainId")}</span>
  //         </div>
  //       );
  //     },
  //     filterFn: (row, id, value) => {
  //       return value.includes(row.getValue(id));
  //     },
  //   },
  //   {
  //     accessorKey: "priority",
  //     header: ({ column }) => (
  //       <DataTableColumnHeader column={column} title="Priority" />
  //     ),
  //     cell: ({ row }) => {
  //       const priority = priorities.find(
  //         (priority) => priority.value === row.getValue("priority")
  //       );

  //       if (!priority) {
  //         return null;
  //       }

  //       return (
  //         <div className="flex items-center">
  //           {priority.icon && (
  //             <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
  //           )}
  //           <span>{priority.label}</span>
  //         </div>
  //       );
  //     },
  //     filterFn: (row, id, value) => {
  //       return value.includes(row.getValue(id));
  //     },
  //   },
  //   {
  //     id: "actions",
  //     cell: ({ row }) => <Actions row={row.original} />,
  //   },
];
