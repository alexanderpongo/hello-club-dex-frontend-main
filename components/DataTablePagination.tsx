'use client';
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataTablePaginationProps {
  itemsPerPage: string;
  setItemsPerPage: React.Dispatch<React.SetStateAction<string>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  paginationMeta: PaginationMeta;
}

const DataTablePagination = ({
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  paginationMeta,
}: DataTablePaginationProps) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (paginationMeta && currentPage < paginationMeta?.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Pagination className="flex justify-end">
      <PaginationContent>
        {Number(itemsPerPage) >= 5 && (
          <>
            <PaginationItem className="my-auto text-slate text-sm">
              Rows Per Page:
            </PaginationItem>
            <PaginationItem className="my-auto">
              <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                <SelectTrigger className="w-[70px] bg-white bg-opacity-[0.08] border-none ring-1 ring-white ring-opacity-[0.05] rounded-[15px]">
                  <SelectValue placeholder="Items Per Page" />
                </SelectTrigger>
                <SelectContent className="bg-dark border-none rounded-sm">
                  <SelectItem
                    value="5"
                    className="hover:bg-white/10 cursor-pointer"
                  >
                    5
                  </SelectItem>
                  <SelectItem
                    value="10"
                    className="hover:bg-white/10 cursor-pointer"
                  >
                    10
                  </SelectItem>
                  <SelectItem
                    value="20"
                    className="hover:bg-white/10 cursor-pointer"
                  >
                    20
                  </SelectItem>
                  <SelectItem
                    value="50"
                    className="hover:bg-white/10 cursor-pointer"
                  >
                    50
                  </SelectItem>
                  <SelectItem
                    value="100"
                    className="hover:bg-white/10 cursor-pointer"
                  >
                    100
                  </SelectItem>
                </SelectContent>
              </Select>
            </PaginationItem>
          </>
        )}

        <PaginationItem className="my-auto">
          <PaginationPrevious
            className="my-auto cursor-pointer"
            onClick={handlePrevious}
          />
        </PaginationItem>
        {Array.from({ length: paginationMeta.totalPages }, (_, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              isActive={i + 1 === currentPage}
              onClick={() => setCurrentPage(i + 1)}
              className="my-auto cursor-pointer"
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem className="my-auto">
          <PaginationNext
            className="my-auto cursor-pointer"
            onClick={handleNext}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default DataTablePagination;
