"use client"

import { useEffect, useState } from "react"

import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"

import { Search, Plus } from "lucide-react"

import { useCustomers } from "@/hooks/use-customers"
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog"
import { CustomerDataTable } from "@/components/customers/data-table"
import { useSearchParams } from "next/navigation"

export default function CustomersPage() {
  const searchParams = useSearchParams()
  // Get the value as a string ("true" or null if it doesn't exist)
  const editParam = searchParams.get("edit")
  const customerEmail = searchParams.get("email") ?? ""
  const customerId = searchParams.get("id") ?? ""
  // Convert it into a clean boolean
  const isEditing = editParam === "true"
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)

  const { data, isLoading, isError, error } = useCustomers({
    page,
    pageSize: 10,
    search,
  })

  useEffect(() => {
    if (isEditing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAddCustomerOpen(true)
    }
    return () => {}
  }, [isEditing])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your customers and keep track of their invoices.
          </p>
        </div>

        <Button onClick={() => setAddCustomerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add customer
        </Button>
      </div>

      {/* Content */}
      <div className="overflow-clip">
        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">
            Loading customers...
          </div>
        ) : isError ? (
          <div className="p-6 text-sm text-destructive">
            {error.message?.toString()?.includes("Can't reach database server")
              ? "Unable to connect to the database. Please check your network or try again later."
              : error.message}
          </div>
        ) : (
          <CustomerDataTable setAddCustomerOpen={setAddCustomerOpen} />
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!data.pagination.hasPreviousPage}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              disabled={!data.pagination.hasNextPage}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AddCustomerDialog
        open={addCustomerOpen}
        isEditing={isEditing}
        customerEmail={customerEmail}
        customerId={customerId}
        onOpenChange={setAddCustomerOpen}
      />
    </div>
  )
}
