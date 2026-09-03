"use client"

import Link from "next/link"
import { useState } from "react"
import { Ellipsis, Pencil, Trash2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { Product } from "@/hooks/use-products"
import { DeleteProductDialog } from "./delete-product-dialog"

interface ProductActionsProps {
  product: Product
}

export function ProductActions({ product }: ProductActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <div className="">
        {/* More actions */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label="More product actions"
              />
            }
          >
            <Ellipsis className="h-4 w-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-auto">
            {/* Edit */}
            <DropdownMenuItem
              render={
                <Link
                  href={`/dashboard/products?id=${product.id}&edit=true`}
                />
              }
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Delete */}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                setDeleteOpen(true)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete dialog */}
      <DeleteProductDialog
        product={product}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}