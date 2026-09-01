import {
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  tableFeatures,
} from "@tanstack/react-table"

const reminderTypeFilter = (
  row: any,
  columnId: string,
  filterValue: string
) => {
  if (!filterValue) {
    return true
  }

  return row.getValue(columnId) === filterValue
}

export const reminderTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,

  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),

  filterFns: {
    includesString: filterFn_includesString,
    reminderType: reminderTypeFilter,
  },
})
