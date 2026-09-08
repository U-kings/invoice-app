"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { formatActivityDate } from "@/lib/invoices/invoice"
import { Product } from "@/hooks/use-products"
import { productTableFeatures } from "../common/table-config"
import { ProductActions } from "./product-actions"
import { Checkbox } from "@workspace/ui/components/checkbox"

const columnHelper = createColumnHelper<typeof productTableFeatures, Product>()

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
    header: "Product",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.getValue("name")}</div>
    ),
  }),

  columnHelper.accessor("description", {
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null

      return (
        <div className="max-w-[320px] truncate text-muted-foreground">
          {description || "—"}
        </div>
      )
    },
  }),

  columnHelper.accessor("rate", {
    header: "Rate",
    cell: ({ row }) => {
      const rate = Number(row.getValue("rate"))

      return (
        <div className="font-medium text-foreground">
          {new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2,
          }).format(rate)}
        </div>
      )
    },
  }),

  columnHelper.accessor("createdAt", {
    header: "Added date",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">
        {formatActivityDate(row.getValue("createdAt"))}
      </div>
    ),
  }),

  columnHelper.display({
    id: "actions",

    enableSorting: false,
    enableHiding: false,

    cell: ({ row }) => {
      return <ProductActions product={row.original} />
    },
  }),
])
