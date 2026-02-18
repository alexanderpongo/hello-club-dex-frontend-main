"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { flexRender, Row } from "@tanstack/react-table";
import { Transaction } from "@/types/generated/transactions";
import React from "react";

interface TransactionRowProps {
  row: Row<Transaction>;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ row }) => {
  return (
    <TableRow
      key={row.id}
      className="border-zinc-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900/50"
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default React.memo(TransactionRow);
