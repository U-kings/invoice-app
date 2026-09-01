"use client"

import { flexRender, useTable } from "@tanstack/react-table"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Check,
  Columns3,
  ArrowDown,
  ArrowUp,
  ListFilter,
  Search,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { SetStateAction, useEffect, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { columns } from "./columns"
import { customerTableFeatures } from "./table-config"
import { CustomerStatus, useCustomers } from "@/hooks/use-customers"
// import { DataTablePagination } from "./data-table-pagination"

// Replace with your actual customer query hook
// import { useCustomers } from "@/hooks/use-customer"

interface CustomerDataTableProps {
  setAddCustomerOpen: (value: SetStateAction<boolean>) => void
}

export function CustomerDataTable({
  setAddCustomerOpen,
}: CustomerDataTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState("")
  const [status, setStatus] = useState<CustomerStatus | undefined>(undefined)
  const debouncedSearch = useDebounce(searchInput, 400)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [debouncedSearch, status])

  // Mock query call structure matching your pattern
  const { data, isLoading } = useCustomers({
    page,
    pageSize,
    search: debouncedSearch,
    status: status,
  })
  //   const data = { data: [], pagination: { totalPages: 1 } }

  const customersList = data?.customers ?? []
  const serverPagination = data?.pagination

  const table = useTable(
    {
      features: customerTableFeatures,
      data: customersList,
      columns,
      globalFilterFn: "includesString",
      state: {
        globalFilter: searchInput,
        columnFilters: status ? [{ id: "status", value: status }] : [],
        pagination: {
          pageIndex: page - 1,
          pageSize: pageSize,
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
        const currentFilters = status ? [{ id: "status", value: status }] : []
        const nextFilters =
          typeof updater === "function" ? updater(currentFilters) : updater
        const statusFilterObj = nextFilters.find((f) => f.id === "status")
        setStatus(statusFilterObj?.value as CustomerStatus | undefined)
      },
      onPaginationChange: (updater) => {
        const nextState =
          typeof updater === "function"
            ? updater({ pageIndex: page - 1, pageSize })
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
  const statusFilter = statusColumn?.getFilterValue() as string | undefined
  const globalFilter = table.state.globalFilter ?? ""
  const hasFilters = globalFilter.trim().length > 0 || Boolean(statusFilter)

  function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
    if (direction === "asc") return <ArrowUp className="h-3.5 w-3.5" />
    if (direction === "desc") return <ArrowDown className="h-3.5 w-3.5" />
    return null
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={table.state.globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-10 w-full pl-9 sm:max-w-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Dropdown */}
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
                  ? `Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`
                  : "Status"}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => statusColumn?.setFilterValue(undefined)}
              >
                <span className="flex-1">All statuses</span>
                {statusFilter === undefined && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => statusColumn?.setFilterValue("active")}
              >
                <span className="flex-1">Active</span>
                {statusFilter === "active" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => statusColumn?.setFilterValue("archived")}
              >
                <span className="flex-1">Archived</span>
                {statusFilter === "archived" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => statusColumn?.setFilterValue("blocked")}
              >
                <span className="flex-1">Blocked</span>
                {statusFilter === "blocked" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" className="h-10 gap-2" />}
            >
              <Columns3 className="h-4 w-4" />
              <span>Columns</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                {table
                  .getAllLeafColumns()
                  .filter((column) => column.id !== "select")
                  .map((column) => {
                    const header = column.columnDef.header
                    const label =
                      typeof header === "string" ? header : column.id
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        disabled={!column.getCanHide()}
                        onCheckedChange={(checked) =>
                          column.toggleVisibility(!!checked)
                        }
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

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-background">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    return (
                      <TableHead key={header.id} className="whitespace-nowrap">
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
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
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
                            ? "No customers found"
                            : "No customers yet"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {hasFilters
                            ? "We couldn't find any customers matching your filters."
                            : "Create your first customer to get started."}
                        </p>
                      </div>
                      {hasFilters ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            table.setGlobalFilter("")
                            statusColumn?.setFilterValue(undefined)
                          }}
                        >
                          Clear filters
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setAddCustomerOpen(true)}
                          //   href="/dashboard/customers/new"
                          className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-gray-200 transition-colors hover:bg-primary/90 hover:text-gray-200"
                        >
                          Add customer
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
      {/* <DataTablePagination table={table} /> */}
    </div>
  )
}
