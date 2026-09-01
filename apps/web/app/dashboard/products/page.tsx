"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Package, Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { formatCurrency } from "@/lib/currency"

export interface ProductItem {
  id: string
  name: string
  description: string
  quantity: number
  rate: number
  currency?: string
}

const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: "item-001",
    name: "Website Design",
    description: "UI/UX and website design",
    quantity: 1,
    rate: 1500,
    currency: "USD",
  },
  {
    id: "item-002",
    name: "Frontend Development",
    description: "Next.js & Tailwind CSS implementation",
    quantity: 1,
    rate: 2500,
    currency: "USD",
  },
  {
    id: "item-003",
    name: "Brand Identity",
    description: "Logo suite, color palette, and typography guidelines",
    quantity: 1,
    rate: 800,
    currency: "USD",
  },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = MOCK_PRODUCTS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products & Services</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Manage your reusable items, products, and services for fast invoicing.
          </p>
        </div>

        <Button className="w-full bg-[#2EAFB4] text-white hover:bg-[#26969a] sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          <span>Add product</span>
        </Button>
      </motion.div>

      {/* Search Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-[#2EAFB4]"
          />
        </div>
      </div>

      {/* Main Data Table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                <th className="py-4 px-6">Item / Service</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Default Qty</th>
                <th className="py-4 px-6">Rate</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-foreground flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-[#2EAFB4]/10 flex items-center justify-center text-[#2EAFB4]">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="py-4 px-6 text-foreground">{item.quantity}</td>
                    <td className="py-4 px-6 font-semibold text-foreground">
                      {formatCurrency(item.rate, item.currency ?? "USD")}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}