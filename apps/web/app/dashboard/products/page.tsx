"use client"

import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { Package, Plus, Search } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { useProducts } from "@/hooks/use-products"
import { ProductsTable } from "@/components/products/product-table"
import { ProductFormDialog } from "@/components/products/product-form-dialog"

export default function ProductsPage() {
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading, isError } = useProducts({
    // page,
    // pageSize,
    search,
  })

  // const products = data?.products ?? []
  const pagination = data?.pagination

  const products = useMemo(() => data?.products ?? [], [data?.products])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Products</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Manage the products and services you use on invoices.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Add product
        </Button>
      </motion.div>

      {/* Toolbar */}
      {/* <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
      </motion.div> */}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ProductsTable
          onAddProduct={() => setDialogOpen(true)}
          // products={products}
          // isLoading={isLoading}
          // isError={isError}
        />
      </motion.div>

      <ProductFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
