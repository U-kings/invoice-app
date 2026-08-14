"use client"

import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import { createColumnHelper } from "@tanstack/react-table"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { InvoiceStatusBadge } from "./invoice-status-badge"
import { invoiceTableFeatures } from "./table-config"

import type { Invoice } from "./invoice-data"

const columnHelper = createColumnHelper<typeof invoiceTableFeatures, Invoice>()

// function SortIcon({
//   direction,
// }: {
//   direction: false | "asc" | "desc";
// }) {
//   if (direction === "asc") {
//     return <ArrowUp className="h-3.5 w-3.5" />;
//   }

//   if (direction === "desc") {
//     return <ArrowDown className="h-3.5 w-3.5" />;
//   }

//   return null;
// }

export const columns = columnHelper.columns([
  columnHelper.display({
  id: "select",

  enableSorting: false,
  enableHiding: false,

  header: ({ table }) => {
    const selectedRows =
      table.getSelectedRowModel().rows

    const visibleRows =
      table.getRowModel().rows

    const selectedCount =
      selectedRows.length

    const visibleSelectedCount =
      visibleRows.filter((row) =>
        row.getIsSelected()
      ).length

    const allVisibleSelected =
      visibleRows.length > 0 &&
      visibleSelectedCount === visibleRows.length

    const someVisibleSelected =
      visibleSelectedCount > 0 &&
      visibleSelectedCount < visibleRows.length

    return (
      <Checkbox
        checked={allVisibleSelected}
        indeterminate={
          someVisibleSelected ||
          (selectedCount > 0 && !allVisibleSelected)
        }
        onCheckedChange={() => {
          if (selectedCount > 0) {
            table.resetRowSelection()
            return
          }

          visibleRows.forEach((row) => {
            row.toggleSelected(true)
          })
        }}
        aria-label="Select all invoices"
      />
    )
  },

  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      onCheckedChange={(checked) => {
        row.toggleSelected(checked === true)
      }}
      aria-label={`Select ${row.original.id}`}
    />
  ),
}),

  columnHelper.accessor("id", {
    header: "Invoice",

    cell: ({ row }) => {
      const invoice = row.original

      return (
        <Link
          href={`/dashboard/invoices/${invoice.id}`}
          className="font-medium transition-colors hover:text-[#2EAFB4]"
        >
          {invoice.id}
        </Link>
      )
    },
  }),

  columnHelper.accessor("customer", {
    header: "Customer",

    cell: ({ row }) => {
      const invoice = row.original

      return (
        <div className="min-w-0">
          <p className="truncate font-medium">{invoice.customer}</p>

          <p className="truncate text-xs text-muted-foreground">
            {invoice.email}
          </p>
        </div>
      )
    },
  }),

  columnHelper.accessor("issueDate", {
    header: "Issue date",

    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{getValue()}</span>
    ),
  }),

  columnHelper.accessor("dueDate", {
    header: "Due date",

    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">{getValue()}</span>
    ),
  }),

  columnHelper.accessor("amount", {
    header: "Amount",

    cell: ({ getValue }) => (
      <span className="font-medium">${getValue().toLocaleString()}</span>
    ),
  }),

  columnHelper.accessor("status", {
    header: "Status",

    filterFn: "status",

    cell: ({ getValue }) => <InvoiceStatusBadge status={getValue()} />,
  }),

  columnHelper.display({
    id: "actions",

    enableSorting: false,
    enableHiding: false,

    cell: ({ row }) => {
      const invoice = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
          >
            <MoreHorizontal className="h-4 w-4" />

            <span className="sr-only">Open actions for {invoice.id}</span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              render={<Link href={`/dashboard/invoices/${invoice.id}`} />}
            >
              View invoice
            </DropdownMenuItem>

            <DropdownMenuItem>Edit invoice</DropdownMenuItem>

            <DropdownMenuItem>Download PDF</DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-red-500">
              Delete invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }),
])
