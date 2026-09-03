"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { formatActivityDate } from "@/lib/invoices/invoice"
import { Product } from "@/hooks/use-products"
import { productTableFeatures } from "../common/table-config"
import { ProductActions } from "./product-actions"

const columnHelper = createColumnHelper<
  typeof productTableFeatures,
  Product
>()

export const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Product",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">
        {row.getValue("name")}
      </div>
    ),
  }),

  columnHelper.accessor("description", {
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as
        | string
        | null

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