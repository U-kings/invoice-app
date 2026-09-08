"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Badge } from "@workspace/ui/components/badge"
import { customerTableFeatures } from "./table-config"
import { CustomerStatus } from "@/hooks/use-customers"
import { formatActivityDate } from "@/lib/invoices/invoice"
import { CustomerActions } from "./customer-actions"
export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  createdAt: string
  invoiceCount: number
  status: CustomerStatus
}

const columnHelper = createColumnHelper<
  typeof customerTableFeatures,
  Customer
>()

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
          aria-label="Select all customers"
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
        aria-label={`Select ${row.original.name}`}
      />
    ),
  }),

  columnHelper.accessor("name", {
    header: "Customer",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.getValue("name")}</div>
    ),
  }),

  columnHelper.accessor("email", {
    header: "Email",
  }),

  columnHelper.accessor("createdAt", {
    header: "Added date",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">
        {formatActivityDate(row.getValue("createdAt"))}
      </div>
    ),
  }),
  columnHelper.accessor("invoiceCount", {
    header: "Invoice",
  }),

  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant="outline" className="font-normal capitalize">
          {status}
        </Badge>
      )
    },
  }),
  columnHelper.display({
    id: "actions",

    enableSorting: false,
    enableHiding: false,

    cell: ({ row }) => {
      // const invoice = row.original

      return <CustomerActions customer={row.original} />
    },
  }),
])
