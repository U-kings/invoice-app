"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { flexRender, useTable } from "@tanstack/react-table"

import { Check, ChevronDown, Columns3, ListFilter, Search } from "lucide-react"

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

import { useDebounce } from "@/hooks/use-debounce"
import {
  InvoiceReminderType,
  useInvoiceReminders,
} from "@/hooks/use-invoice-reminders"

import { columns } from "./columns"
import { reminderTableFeatures } from "./table-config"
import { DataTablePagination } from "../common/data-table-pagination"

export function DataTable() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [searchInput, setSearchInput] = useState("")

  const [type, setType] = useState<InvoiceReminderType | undefined>(undefined)

  const debouncedSearch = useDebounce(searchInput, 400)

  // ---------------------------------------------------------
  // Reset pagination when filters change
  // ---------------------------------------------------------

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [debouncedSearch, type])

  // ---------------------------------------------------------
  // Fetch reminders
  // ---------------------------------------------------------

  const { data, isLoading, isFetching, isError, error } = useInvoiceReminders({
    page,
    pageSize,
    search: debouncedSearch,
    type,
  })

  const reminders = data?.data ?? []
  const serverPagination = data?.pagination

  // ---------------------------------------------------------
  // Table
  // ---------------------------------------------------------

  const table = useTable(
    {
      features: reminderTableFeatures,

      data: reminders,

      columns,

      globalFilterFn: "includesString",

      state: {
        globalFilter: searchInput,

        columnFilters: type
          ? [
              {
                id: "type",
                value: type,
              },
            ]
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
          typeof updater === "function" ? updater(searchInput) : updater

        setSearchInput(nextValue)
      },

      onColumnFiltersChange: (updater) => {
        const currentFilters = type
          ? [
              {
                id: "type",
                value: type,
              },
            ]
          : []

        const nextFilters =
          typeof updater === "function" ? updater(currentFilters) : updater

        const typeFilter = nextFilters.find((filter) => filter.id === "type")

        setType(typeFilter?.value as InvoiceReminderType | undefined)
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
    })
  )

  const typeColumn = table.getColumn("type")

  const typeFilter = typeColumn?.getFilterValue() as
    InvoiceReminderType | undefined

  const globalFilter = table.state.globalFilter ?? ""

  const hasFilters = globalFilter.trim().length > 0 || Boolean(typeFilter)

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border bg-background">
        <div className="flex h-64 items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Loading reminders...
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------
  // Error
  // ---------------------------------------------------------

  if (isError) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border bg-background p-6">
        <div className="max-w-md text-center">
          <p className="font-medium">Unable to load reminders</p>

          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Toolbar */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}

        <div className="relative flex w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search reminders..."
            value={table.state.globalFilter ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value)
            }}
            className="h-10 w-full pl-9"
          />
        </div>

        {/* Filters */}

        <div className="flex flex-wrap items-center gap-2">
          {/* Reminder type */}

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
                {typeFilter
                  ? getReminderTypeLabel(typeFilter)
                  : "Reminder type"}
              </span>

              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  typeColumn?.setFilterValue(undefined)
                }}
              >
                <span className="flex-1">All reminders</span>

                {!typeFilter && <Check className="h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  typeColumn?.setFilterValue("BEFORE_DUE")
                }}
              >
                <span className="flex-1">Before due</span>

                {typeFilter === "BEFORE_DUE" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  typeColumn?.setFilterValue("DUE_DATE")
                }}
              >
                <span className="flex-1">Due date</span>

                {typeFilter === "DUE_DATE" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  typeColumn?.setFilterValue("OVERDUE")
                }}
              >
                <span className="flex-1">Overdue</span>

                {typeFilter === "OVERDUE" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column visibility */}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" className="h-10 gap-2" />}
            >
              <Columns3 className="h-4 w-4" />

              <span>Columns</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                {table
                  .getAllLeafColumns()
                  .filter((column) => column.id !== "actions")
                  .map((column) => {
                    const header = column.columnDef.header

                    const label =
                      typeof header === "string" ? header : column.id

                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        disabled={!column.getCanHide()}
                        onCheckedChange={(checked) => {
                          column.toggleVisibility(!!checked)
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

      {/* Background fetching indicator */}

      {isFetching && !isLoading && (
        <div className="text-xs text-muted-foreground">
          Updating reminders...
        </div>
      )}

      {/* Table */}

      <div className="overflow-hidden rounded-2xl border bg-background">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    const canSort = header.column.getCanSort()

                    return (
                      <TableHead key={+index} className="whitespace-nowrap">
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[#2EAFB4]"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}

                            <SortIcon direction={header.column.getIsSorted()} />
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
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
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell key={+index} className="whitespace-nowrap">
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
                    colSpan={table.getVisibleLeafColumns().length}
                    className="h-64 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="space-y-1">
                        <p className="font-medium">
                          {hasFilters
                            ? "No reminders found"
                            : "No reminders yet"}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {hasFilters
                            ? "We couldn't find any reminders matching your filters."
                            : "Invoice reminders will appear here when they are scheduled."}
                        </p>
                      </div>

                      {hasFilters && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            table.setGlobalFilter("")

                            typeColumn?.setFilterValue(undefined)
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

      {/* Pagination */}

      <DataTablePagination table={table} />
    </div>
  )
}

function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
  if (direction === "asc") {
    return <span className="text-xs">↑</span>
  }

  if (direction === "desc") {
    return <span className="text-xs">↓</span>
  }

  return null
}

function getReminderTypeLabel(type: InvoiceReminderType) {
  switch (type) {
    case "BEFORE_DUE":
      return "Before due"

    case "DUE_DATE":
      return "Due date"

    case "OVERDUE":
      return "Overdue"
  }
}
