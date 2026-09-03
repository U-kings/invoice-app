"use client"

import { flexRender, useTable } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, Columns3, Search } from "lucide-react"
import { useEffect, useState } from "react"

import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { useDebounce } from "@/hooks/use-debounce"
import { useProducts } from "@/hooks/use-products"

import { columns } from "./columns"
import { productTableFeatures } from "../common/table-config"
import { DataTablePagination } from "../common/data-table-pagination"

interface ProductsTableProps {
  onAddProduct: () => void
}

export function ProductsTable({
  onAddProduct,
}: ProductsTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState("")

  const debouncedSearch = useDebounce(searchInput, 400)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [debouncedSearch])

  const {
    data,
    isLoading,
    isError,
  } = useProducts({
    page,
    pageSize,
    search: debouncedSearch,
  })

  const productsList = data?.products ?? []
  const serverPagination = data?.pagination

  const table = useTable(
    {
      features: productTableFeatures,
      data: productsList,
      columns,

      globalFilterFn: "includesString",

      state: {
        globalFilter: searchInput,
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
      sorting: state.sorting,
      pagination: state.pagination,
      columnVisibility: state.columnVisibility,
      rowSelection: state.rowSelection,
    })
  )

  const globalFilter = table.state.globalFilter ?? ""
  const hasFilters = globalFilter.trim().length > 0

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
            placeholder="Search products..."
            value={table.state.globalFilter ?? ""}
            onChange={(event) =>
              table.setGlobalFilter(event.target.value)
            }
            className="h-10 w-full pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Column Visibility */}
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

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                {table
                  .getAllLeafColumns()
                  .filter(
                    (column) =>
                      column.id !== "actions"
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
                        onCheckedChange={(checked) =>
                          column.toggleVisibility(
                            !!checked
                          )
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
              {table.getHeaderGroups().map(
                (headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(
                      (header) => {
                        const canSort =
                          header.column.getCanSort()

                        return (
                          <TableHead
                            key={header.id}
                            className="whitespace-nowrap"
                          >
                            {header.isPlaceholder ? null : canSort ? (
                              <button
                                type="button"
                                onClick={header.column.getToggleSortingHandler()}
                                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[#2EAFB4]"
                              >
                                {flexRender(
                                  header.column.columnDef
                                    .header,
                                  header.getContext()
                                )}

                                <SortIcon
                                  direction={header.column.getIsSorted()}
                                />
                              </button>
                            ) : (
                              flexRender(
                                header.column.columnDef
                                  .header,
                                header.getContext()
                              )
                            )}
                          </TableHead>
                        )
                      }
                    )}
                  </TableRow>
                )
              )}
            </TableHeader>

            <TableBody>
              {isLoading ? (
                // Array.from({ length: pageSize }).map(
                Array.from({ length: 5 }).map(
                  (_, index) => (
                    <TableRow key={`loading-${index}`}>
                      {table
                        .getVisibleLeafColumns()
                        .map((column) => (
                          <TableCell
                            key={column.id}
                            className="whitespace-nowrap"
                          >
                            <div className="h-4 w-full max-w-45 animate-pulse rounded bg-muted" />
                          </TableCell>
                        ))}
                    </TableRow>
                  )
                )
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      table.getVisibleLeafColumns()
                        .length
                    }
                    className="h-64 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="space-y-1">
                        <p className="font-medium">
                          Unable to load products
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Something went wrong while
                          loading your products.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row
                      .getVisibleCells()
                      .map((cell) => (
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
                      table.getVisibleLeafColumns()
                        .length
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
                            ? "No products found"
                            : "No products yet"}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {hasFilters
                            ? "We couldn't find any products matching your search."
                            : "Create your first product to get started."}
                        </p>
                      </div>

                      {hasFilters ? (
                        <Button
                          variant="outline"
                          onClick={() =>
                            table.setGlobalFilter("")
                          }
                        >
                          Clear search
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={onAddProduct}
                        >
                          Add product
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
      {!isLoading &&
        !isError &&
        serverPagination &&
        serverPagination.total > 0 && (
          <DataTablePagination table={table} />
        )}
    </div>
  )
}