"use client"

import { useEffect, useState } from "react"
import { flexRender, useTable } from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  Check,
  Columns3,
  ListFilter,
  Search,
} from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { columns } from "./columns"
import { paymentTableFeatures } from "../common/table-config"

import { DataTablePagination } from "../common/data-table-pagination"
import { PaymentBulkActions } from "../common/bulk-actions"

import {
  PaymentStatus,
  usePayments,
} from "@/hooks/use-payment"

import { useDebounce } from "@/hooks/use-debounce"

export function PaymentDataTable() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState("")
  const [status, setStatus] = useState<PaymentStatus | undefined>(
    undefined
  )

  const debouncedSearch = useDebounce(searchInput, 400)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [debouncedSearch, status])

  const {
    data,
    isLoading,
    isFetching,
  } = usePayments({
    page,
    pageSize,
    search: debouncedSearch,
    status,
  })

  const paymentsList = data?.payments ?? []
  const serverPagination = data?.pagination

  const table = useTable(
    {
      features: paymentTableFeatures,
      data: paymentsList,
      columns,

      globalFilterFn: "includesString",

      state: {
        globalFilter: searchInput,

        columnFilters: status
          ? [{ id: "status", value: status }]
          : [],

        pagination: {
          pageIndex: page - 1,
          pageSize,
        },
      },

      pageCount: serverPagination?.totalPages ?? -1,

      manualFiltering: true,
      manualPagination: true,

      onGlobalFilterChange: (updater) => {
        const nextValue =
          typeof updater === "function"
            ? updater(searchInput)
            : updater

        setSearchInput(nextValue)
      },

      onColumnFiltersChange: (updater) => {
        const currentFilters = status
          ? [{ id: "status", value: status }]
          : []

        const nextFilters =
          typeof updater === "function"
            ? updater(currentFilters)
            : updater

        const statusFilterObj = nextFilters.find(
          (filter) => filter.id === "status"
        )

        setStatus(
          statusFilterObj?.value as
            | PaymentStatus
            | undefined
        )
      },

      onPaginationChange: (updater) => {
        const nextState =
          typeof updater === "function"
            ? updater({
                pageIndex: page - 1,
                pageSize,
              })
            : updater

        setPage(nextState.pageIndex + 1)
        setPageSize(nextState.pageSize)
      },
    },

    (state) => ({
      globalFilter: state.globalFilter,
      columnFilters: state.columnFilters,
      sorting: state.sorting,
      pagination: state.pagination,
      columnVisibility: state.columnVisibility,
      rowSelection: state.rowSelection,
    })
  )

  const statusColumn = table.getColumn("status")

  const statusFilter =
    statusColumn?.getFilterValue() as
      | PaymentStatus
      | undefined

  const globalFilter =
    table.state.globalFilter ?? ""

  const hasFilters =
    globalFilter.trim().length > 0 ||
    Boolean(statusFilter)

  function SortIcon({
    direction,
  }: {
    direction: false | "asc" | "desc"
  }) {
    if (direction === "asc") {
      return <ArrowUp className="h-3.5 w-3.5" />
    }

    if (direction === "desc") {
      return <ArrowDown className="h-3.5 w-3.5" />
    }

    return null
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search payments..."
            value={table.state.globalFilter ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value)
            }}
            className="h-10 w-full pl-9 sm:max-w-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
                />
              }
            >
              <ListFilter className="h-4 w-4" />

              <span>
                {statusFilter
                  ? `Status: ${
                      statusFilter.charAt(0).toUpperCase() +
                      statusFilter.slice(1).toLowerCase()
                    }`
                  : "Status"}
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  statusColumn?.setFilterValue(undefined)
                }}
              >
                <span className="flex-1">
                  All statuses
                </span>

                {statusFilter === undefined && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  statusColumn?.setFilterValue("PENDING")
                }}
              >
                <span className="flex-1">Pending</span>

                {statusFilter === "PENDING" && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  statusColumn?.setFilterValue("SUCCESS")
                }}
              >
                <span className="flex-1">Success</span>

                {statusFilter === "SUCCESS" && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  statusColumn?.setFilterValue("FAILED")
                }}
              >
                <span className="flex-1">Failed</span>

                {statusFilter === "FAILED" && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  statusColumn?.setFilterValue("CANCELLED")
                }}
              >
                <span className="flex-1">Cancelled</span>

                {statusFilter === "CANCELLED" && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  className="h-10 gap-2"
                />
              }
            >
              <Columns3 className="h-4 w-4" />
              <span>Columns</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48"
            >
              <DropdownMenuGroup>
                {table
                  .getAllLeafColumns()
                  .filter(
                    (column) =>
                      column.id !== "actions" &&
                      column.id !== "select"
                  )
                  .map((column) => {
                    const header =
                      column.columnDef.header

                    const label =
                      typeof header === "string"
                        ? header
                        : column.id

                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        disabled={!column.getCanHide()}
                        onCheckedChange={(checked) => {
                          column.toggleVisibility(
                            !!checked
                          )
                        }}
                      >
                        {label}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bulk actions */}
      <PaymentBulkActions
        selectedCount={
          table.getSelectedRowModel().rows.length
        }
        onClear={() => {
          table.resetRowSelection()
        }}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-background">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort =
                      header.column.getCanSort()

                    return (
                      <TableHead
                        key={header.id}
                        className="whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : canSort
                            ? (
                                <button
                                  type="button"
                                  onClick={header.column.getToggleSortingHandler()}
                                  className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[#2EAFB4]"
                                  title={
                                    header.column.getNextSortingOrder() ===
                                    "asc"
                                      ? "Sort ascending"
                                      : header.column.getNextSortingOrder() ===
                                          "desc"
                                        ? "Sort descending"
                                        : "Clear sorting"
                                  }
                                >
                                  {flexRender(
                                    header.column
                                      .columnDef.header,
                                    header.getContext()
                                  )}

                                  <SortIcon
                                    direction={header.column.getIsSorted()}
                                  />
                                </button>
                              )
                            : flexRender(
                                header.column
                                  .columnDef.header,
                                header.getContext()
                              )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      table.getVisibleLeafColumns().length
                    }
                    className="h-64 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="space-y-1">
                        <p className="font-medium">
                          {hasFilters
                            ? "No payments found"
                            : "No payments yet"}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {hasFilters
                            ? "We couldn't find any payments matching your filters."
                            : "Payments will appear here when customers pay your invoices."}
                        </p>
                      </div>

                      {hasFilters && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            table.setGlobalFilter("")
                            statusColumn?.setFilterValue(
                              undefined
                            )
                          }}
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}