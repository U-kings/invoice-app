"use client"

import Link from "next/link"
import { createColumnHelper } from "@tanstack/react-table"

import { Checkbox } from "@workspace/ui/components/checkbox"

import { formatCurrency } from "@/lib/currency"
import { formatActivityDate } from "@/lib/invoices/invoice"

import { paymentTableFeatures } from "../common/table-config"
import { PaymentTableActions } from "./payment-table-actions"
import { PaymentStatusBadge } from "./payment-status-badge"
import { PaymentListItem, PaymentStatus } from "@/hooks/use-payment"

const columnHelper = createColumnHelper<typeof paymentTableFeatures, PaymentListItem>()

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
          aria-label="Select all payments"
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
        aria-label={`Select payment ${row.original.id}`}
      />
    ),
  }),

  columnHelper.display({
    id: "payment",
    header: "Payment",

    cell: ({ row }) => {
      const payment = row.original

      return (
        <div className="min-w-0">
          <p className="font-medium">
            {payment.providerReference ??
              payment.providerTransactionId ??
              `#${payment.id.slice(0, 8)}`}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {payment.provider}
          </p>
        </div>
      )
    },
  }),

  columnHelper.display({
    id: "invoice",
    header: "Invoice",

    cell: ({ row }) => {
      const payment = row.original

      return (
        <Link
          href={`/dashboard/invoices/${payment.invoice.invoiceNumber}`}
          className="font-medium transition-colors hover:text-[#2EAFB4]"
        >
          {payment.invoice.invoiceNumber}
        </Link>
      )
    },
  }),

  columnHelper.display({
    id: "customer",
    header: "Customer",

    cell: ({ row }) => {
      const customer = row.original.invoice.customer

      return (
        <div className="min-w-0">
          <p className="truncate font-medium">{customer.name}</p>

          <p className="truncate text-xs text-muted-foreground">
            {customer.email}
          </p>
        </div>
      )
    },
  }),

  columnHelper.accessor("createdAt", {
    header: "Date",

    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {formatActivityDate(getValue()?.toString())}
      </span>
    ),
  }),

  columnHelper.accessor("amount", {
    header: "Amount",

    cell: ({ getValue, row }) => (
      <span className="font-medium">
        {formatCurrency(Number(getValue()), row.original.currency)}
      </span>
    ),
  }),

  columnHelper.accessor("provider", {
    header: "Provider",

    cell: ({ getValue }) => (
      <span className="text-sm capitalize">{getValue().toLowerCase()}</span>
    ),
  }),

  columnHelper.accessor("status", {
    header: "Status",

    filterFn: "status",

    cell: ({ getValue }) => (
      <PaymentStatusBadge status={getValue() as PaymentStatus} />
    ),
  }),

  columnHelper.display({
    id: "actions",

    enableSorting: false,
    enableHiding: false,

    cell: ({ row }) => <PaymentTableActions payment={row.original} />,
  }),
])
