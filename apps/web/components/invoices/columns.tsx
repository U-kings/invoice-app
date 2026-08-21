"use client"

import Link from "next/link"
import { createColumnHelper } from "@tanstack/react-table"

import { Checkbox } from "@workspace/ui/components/checkbox"

import { InvoiceStatusBadge } from "./invoice-status-badge"
import { invoiceTableFeatures } from "./table-config"

import { InvoiceTableActions } from "./invoice-table-actions"
import { formatCurrency } from "@/lib/currency"
import {
  formatActivityDate,
  getEffectiveInvoiceStatus,
} from "@/lib/invoices/invoice"
import { Invoice } from "@/hooks/use-invoice"

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

// export const columns = columnHelper.columns([

export const columns = columnHelper.columns([
  columnHelper.display({
    id: "select",

    enableSorting: false,
    enableHiding: false,

    header: ({ table }) => {
      const selectedRows = table.getSelectedRowModel().rows

      const visibleRows = table.getRowModel().rows

      const selectedCount = selectedRows.length

      const visibleSelectedCount = visibleRows.filter((row) =>
        row.getIsSelected()
      ).length

      const allVisibleSelected =
        visibleRows.length > 0 && visibleSelectedCount === visibleRows.length

      const someVisibleSelected =
        visibleSelectedCount > 0 && visibleSelectedCount < visibleRows.length

      return (
        <Checkbox
          checked={allVisibleSelected}
          indeterminate={
            someVisibleSelected || (selectedCount > 0 && !allVisibleSelected)
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
          {invoice.id?.includes("INV")
            ? invoice.id
            : `INV-${invoice.id?.slice(0, 4)}`}
        </Link>
      )
    },
  }),

  columnHelper.accessor("customerId", {
    header: "Customer",

    cell: ({ row }) => {
      const invoice = row.original

      return (
        <div className="min-w-0">
          {/* <p className="truncate font-medium">{invoice.customerId}</p> */}

          <p className="truncate text-xs text-muted-foreground">
            {invoice.customer?.email}
          </p>
        </div>
      )
    },
  }),

  columnHelper.accessor("issueDate", {
    header: "Issue date",

    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {formatActivityDate(getValue())}
      </span>
    ),
  }),

  columnHelper.accessor("dueDate", {
    header: "Due date",

    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {formatActivityDate(getValue())}
      </span>
    ),
  }),

  columnHelper.accessor(
    (row) =>
      row.lineItems.reduce(
        (total, item) => total + item.quantity * item.rate,
        0
      ),
    {
      id: "amount",
      header: "Amount",

      cell: ({ getValue, row }) => (
        <span className="font-medium">
          {formatCurrency(getValue(), row.original.currency)}
        </span>
      ),
    }
  ),

  columnHelper.accessor("status", {
    header: "Status",

    filterFn: "status",

    cell: ({ row }) => (
      <InvoiceStatusBadge status={getEffectiveInvoiceStatus(row.original)} />
    ),
  }),

  columnHelper.display({
    id: "actions",

    enableSorting: false,
    enableHiding: false,

    cell: ({ row }) => {
      // const invoice = row.original

      return <InvoiceTableActions invoice={row.original} />
    },
  }),
])
