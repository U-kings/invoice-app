"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface PaginationTable {
  state: {
    pagination: {
      pageIndex: number;
      pageSize: number;
    };
  };

  getPrePaginatedRowModel: () => {
    rows: unknown[];
  };

  getCanNextPage: () => boolean;

  getCanPreviousPage: () => boolean;

  nextPage: () => void;

  previousPage: () => void;

  setPageSize: (size: number) => void;
}

interface DataTablePaginationProps {
  table: PaginationTable;
}

export function DataTablePagination({
  table,
}: DataTablePaginationProps) {
  const pageIndex = table.state.pagination.pageIndex;

  const pageSize = table.state.pagination.pageSize;

  const totalRows =
    table.getPrePaginatedRowModel().rows.length;

  const start =
    totalRows === 0
      ? 0
      : pageIndex * pageSize + 1;

  const end = Math.min(
    (pageIndex + 1) * pageSize,
    totalRows,
  );

  return (
    <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Results */}
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {start}
        </span>
        {"–"}
        <span className="font-medium text-foreground">
          {end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground">
          {totalRows}
        </span>{" "}
        invoices
      </p>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        {/* Page size */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-sm text-muted-foreground">
            Rows per page
          </span>

          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-9 w-[72px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="10">
                10
              </SelectItem>

              <SelectItem value="20">
                20
              </SelectItem>

              <SelectItem value="30">
                30
              </SelectItem>

              <SelectItem value="50">
                50
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <span className="text-sm text-muted-foreground">
          Page{" "}
          <span className="font-medium text-foreground">
            {pageIndex + 1}
          </span>
        </span>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={!table.getCanPreviousPage()}
            onClick={() => {
              table.previousPage();
            }}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={!table.getCanNextPage()}
            onClick={() => {
              table.nextPage();
            }}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}