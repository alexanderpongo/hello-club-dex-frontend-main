"use client";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
  LockClosedIcon,
  LockOpen1Icon,
  CheckIcon,
  Cross2Icon,
  ResetIcon,
} from "@radix-ui/react-icons";
import { Column } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  customSortLabels?: {
    asc: string;
    desc: string;
  };
  useCustomIcons?: boolean;
  customIconType?: "lock" | "check" | "default";
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  customSortLabels,
  useCustomIcons = false,
  customIconType = "default",
}: DataTableColumnHeaderProps<TData, TValue>) {
  const getHeaderIcon = () => {
    const sortDirection = column.getIsSorted();

    if (!sortDirection) {
      return <CaretSortIcon className="ml-2 h-4 w-4" />;
    }

    if (useCustomIcons && customIconType !== "default") {
      switch (customIconType) {
        case "lock":
          return sortDirection === "asc" ? (
            <LockOpen1Icon className="ml-2 h-4 w-4" />
          ) : (
            <LockClosedIcon className="ml-2 h-4 w-4" />
          );
        case "check":
          return sortDirection === "asc" ? (
            <CheckIcon className="ml-2 h-4 w-4" />
          ) : (
            <Cross2Icon className="ml-2 h-4 w-4" />
          );
        default:
          break;
      }
    }

    // Default arrow icons
    return sortDirection === "desc" ? (
      <ArrowDownIcon className="ml-2 h-4 w-4" />
    ) : (
      <ArrowUpIcon className="ml-2 h-4 w-4" />
    );
  };

  const getDropdownIcons = () => {
    if (useCustomIcons && customIconType !== "default") {
      switch (customIconType) {
        case "lock":
          return {
            asc: (
              <LockOpen1Icon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            ),
            desc: (
              <LockClosedIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            ),
          };
        case "check":
          return {
            asc: (
              <CheckIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            ),
            desc: (
              <Cross2Icon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            ),
          };
      }
    }
    // Default arrow icons
    return {
      asc: (
        <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
      ),
      desc: (
        <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
      ),
    };
  };

  const dropdownIcons = getDropdownIcons();

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2 ", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent uppercase text-[#A3A3A3]"
          >
            {title === "TVL" ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{title}</span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-transparent !border dark:border-[#4c4c4c] rounded-sm bg-white dark:bg-black">
                    <p className="font-bold">Total Value Locked </p>
                    <div>
                      The total value of assets deposited in a protocol, showing
                      its overall liquidity and usage.
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span>{title}</span>
            )}

            {getHeaderIcon()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="bg-white dark:bg-black border-none"
        >
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            {dropdownIcons.asc}
            {customSortLabels?.asc || "Asc"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            {dropdownIcons.desc}
            {customSortLabels?.desc || "Desc"}
          </DropdownMenuItem>
          {column.getIsSorted() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.clearSorting()}>
                <ResetIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Reset
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
