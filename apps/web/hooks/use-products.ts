"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@workspace/ui/components/toast"

export interface Product {
  id: string
  name: string
  description: string | null
  rate: string | number
  createdAt: string
  updatedAt: string
}

export interface ProductsPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ProductsResponse {
  products: Product[]
  pagination: ProductsPagination
}

interface CreateProductInput {
  name: string
  description?: string
  rate: number
}

interface UpdateProductInput {
  name?: string
  description?: string | null
  rate?: number
}

interface UseProductsOptions {
  page?: number
  pageSize?: number
  search?: string
}

export function useProducts({
  page = 1,
  pageSize = 10,
  search = "",
}: UseProductsOptions = {}) {
  return useQuery<ProductsResponse>({
    queryKey: ["products", { page, pageSize, search }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })

      if (search.trim()) {
        params.set("search", search.trim())
      }

      const response = await fetch(
        `/api/dashboard/products?${params.toString()}`
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)

        throw new Error(data?.error || "Failed to fetch products")
      }

      return response.json()
    },
  })
}

export function useProduct(productId?: string) {
  return useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) {
        throw new Error("Product ID is required")
      }

      const response = await fetch(`/api/dashboard/products/${productId}`)

      if (!response.ok) {
        const data = await response.json().catch(() => null)

        throw new Error(data?.error || "Failed to fetch product")
      }

      return response.json()
    },
    enabled: Boolean(productId),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const response = await fetch("/api/dashboard/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)

        throw new Error(result?.error || "Failed to create product")
      }

      return response.json()
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      })

      toast.add({
        type: "success",
        title: "Product Created",
        description: "Product created successfully",
      })
    },

    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to Create Product",
        description: error.message || "Failed to create product",
      })
    },
  })
}

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateProductInput) => {
      const response = await fetch(`/api/dashboard/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)

        throw new Error(result?.error || "Failed to update product")
      }

      return response.json()
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      })

      queryClient.invalidateQueries({
        queryKey: ["product", productId],
      })

      toast.add({
        type: "success",
        title: "Product Updated",
        description: "Product updated successfully",
      })
    },

    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to Update Product",
        description: error.message || "Failed to update product",
      })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/dashboard/products/${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)

        throw new Error(result?.error || "Failed to delete product")
      }

      return response.json()
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      })

      toast.add({
        type: "success",
        title: "Product Deleted",
        description: "Product deleted successfully",
      })
    },

    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to Delete Product",
        description: error.message || "Failed to delete product",
      })
    },
  })
}
