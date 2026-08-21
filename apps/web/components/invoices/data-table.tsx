"use client"

import * as React from "react"

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

import { Check, Columns3 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { Button } from "@workspace/ui/components/button"

import { ArrowDown, ArrowUp, ListFilter } from "lucide-react"

import { columns } from "./columns"
import { invoiceTableFeatures } from "./table-config"

import { Search } from "lucide-react"
import { DataTablePagination } from "./data-table-pagination"
import { InvoiceBulkActions } from "./invoice-bulk-actions"
import Link from "next/link"
import { Invoice } from "@/hooks/use-invoice"

interface DataTableProps {
  data: Invoice[] | undefined
}

export function DataTable({ data }: DataTableProps) {
  const table = useTable(
    {
      features: invoiceTableFeatures,
      data: data ?? [],
      columns,
      globalFilterFn: "includesString",
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
            placeholder="Search invoices..."
            value={table.state.globalFilter ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value)
            }}
            className="h-10 w-full pl-9 sm:max-w-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
                      statusFilter.slice(1)
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
                <span className="flex-1">All statuses</span>

                {statusFilter === undefined && <Check className="h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  statusColumn?.setFilterValue("Draft")
                }}
              >
                <span className="flex-1">Draft</span>
                {statusFilter === "Draft" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  statusColumn?.setFilterValue("Sent")
                }}
              >
                <span className="flex-1">Sent</span>

                {statusFilter === "Sent" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  statusColumn?.setFilterValue("Paid")
                }}
              >
                <span className="flex-1">Paid</span>
                {statusFilter === "Paid" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  statusColumn?.setFilterValue("Overdue")
                }}
              >
                <span className="flex-1">Overdue</span>

                {statusFilter === "Overdue" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  statusColumn?.setFilterValue("Cancelled")
                }}
              >
                <span className="flex-1">Cancelled</span>

                {statusFilter === "Cancelled" && <Check className="h-4 w-4" />}
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

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                {table
                  .getAllLeafColumns()
                  .filter(
                    (column) =>
                      column.id !== "actions" && column.id !== "select"
                  )
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

      <InvoiceBulkActions
        selectedCount={table.getSelectedRowModel().rows.length}
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
                    const canSort = header.column.getCanSort()

                    return (
                      <TableHead key={header.id} className="whitespace-nowrap">
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[#2EAFB4]"
                            title={
                              header.column.getNextSortingOrder() === "asc"
                                ? "Sort ascending"
                                : header.column.getNextSortingOrder() === "desc"
                                  ? "Sort descending"
                                  : "Clear sorting"
                            }
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
                          {hasFilters ? "No invoices found" : "No invoices yet"}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {hasFilters
                            ? "We couldn't find any invoices matching your filters."
                            : "Create your first invoice to get started."}
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
                        <Link
                          href="/dashboard/invoices/new"
                          className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          Create invoice
                        </Link>
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
