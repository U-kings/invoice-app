import {
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  tableFeatures,
} from "@tanstack/react-table";

const statusFilter = (
  row: any,
  columnId: string,
  filterValue: string,
) => {
  if (!filterValue) {
    return true;
  }

  return row.getValue(columnId) === filterValue;
};

export const invoiceTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,

  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),

  filterFns: {
    includesString: filterFn_includesString,
    status: statusFilter,
  },
});