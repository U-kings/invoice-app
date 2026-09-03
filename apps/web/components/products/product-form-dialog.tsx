"use client"

import { useEffect, useState } from "react"
import { Loader2, Package } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"

import {
  useCreateProduct,
  useUpdateProduct,
  type Product,
} from "@/hooks/use-products"

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) {
  const isEditing = Boolean(product)

  const createProduct = useCreateProduct()

  const updateProduct = useUpdateProduct(product?.id ?? "")

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [rate, setRate] = useState("")

  useEffect(() => {
    if (!open) {
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(product?.name ?? "")
    setDescription(product?.description ?? "")
    setRate(product?.rate !== undefined ? String(product.rate) : "")
  }, [open, product])

  const isPending = createProduct.isPending || updateProduct.isPending

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name?.trim() || !rate) {
      return
    }

    const payload = {
      name: name?.trim(),
      description: description?.trim() || undefined,
      rate: Number(rate),
    }

    if (product) {
      updateProduct.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })

      return
    }

    createProduct.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false)
        setName("")
        setDescription("")
        setRate("")
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Package className="size-5 text-primary" />
            </div>

            <DialogTitle>
              {isEditing ? "Edit product" : "Add product"}
            </DialogTitle>

            <DialogDescription>
              {isEditing
                ? "Update the product information used on your invoices."
                : "Add a product or service to your invoice catalog."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product name</Label>

              <Input
                id="product-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Website Design"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>

              <Textarea
                id="product-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe this product or service..."
                rows={3}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-rate">Rate</Label>

              <Input
                id="product-rate"
                type="number"
                min="0"
                step="0.01"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
                placeholder="0.00"
                disabled={isPending}
              />

              <p className="text-xs text-muted-foreground">
                Enter the default rate used when adding this product to an
                invoice.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending || !name.trim() || !rate}>
              {isPending && <Loader2 className="size-4 animate-spin" />}

              {isEditing ? "Save changes" : "Add product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
