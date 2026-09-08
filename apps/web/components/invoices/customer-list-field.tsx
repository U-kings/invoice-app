"use client"

import { Search } from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@workspace/ui/lib/utils"
import { Customer } from "@/hooks/use-create-customer"
import { useCustomers } from "@/hooks/use-customers"
import { useEffect, useMemo, useRef, useState } from "react"

interface CustomerListFieldProps {
  id: string
  value?: string // Represents the active Customer ID string (from your form controller)
  field: boolean
  onChange: (value: string) => void
  onSelect: (item: Customer) => void
}

export function CustomerListField({
  id,
  value,
  onChange,
  field,
  onSelect,
}: CustomerListFieldProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const debouncedSearch = useDebounce(searchQuery, 400)

  // 🚀 Self-contained data fetching directly within the field component
  const { data } = useCustomers({
    page: 1,
    pageSize: 10,
    search: debouncedSearch,
  })

  // 🚀 Find currently active customer object solely using the API response data pool
  const activeCustomer = useMemo(() => {
    if (!value) return null
    const pool = Array.isArray(data?.customers) ? data.customers : []
    return pool.find((c) => c.id === value) || null
  }, [data?.customers, value])

  // Sync the typed search string parameter when an option is selected or updated
  useEffect(() => {
    if (activeCustomer) {
      setSearchQuery(activeCustomer.name)
    } else if (!value) {
      setSearchQuery("")
    }
  }, [activeCustomer, value])

  // Compute local filtered items based on what's fetched from the hook
  const filteredItems = useMemo(() => {
    const search = searchQuery.trim().toLowerCase()
    const currentPool = data?.customers || []

    if (
      !search ||
      (activeCustomer && activeCustomer.name.toLowerCase() === search)
    ) {
      return currentPool
    }

    return currentPool.filter(
      (item) =>
        item.name?.toLowerCase().includes(search) ||
        item.email?.toLowerCase().includes(search)
    )
  }, [data?.customers, searchQuery, activeCustomer])

  const containerRef = useRef<HTMLDivElement>(null)

  // Handle outside pointers to drop component focus panels cleanly
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        if (activeCustomer) {
          setSearchQuery(activeCustomer.name)
        }
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
    }
  }, [activeCustomer])

  return (
    <Field className="min-w-0">
      <FieldLabel htmlFor={id}>Customers</FieldLabel>

      <div ref={containerRef} className="relative min-w-0">
        <Search className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          id={id}
          value={searchQuery}
          aria-invalid={field}
          placeholder="Search or enter customer..."
          className="h-12 min-w-0 pl-9"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            const nextText = event.target.value
            setSearchQuery(nextText)
            onChange(nextText) // Informs parent hooks/validations of active typing events
            setOpen(true)
          }}
        />

        {open && (
          <div
            className={cn(
              "absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-y-auto rounded-xl border bg-popover p-1 shadow-lg"
            )}
          >
            {filteredItems?.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted"
                onMouseDown={(event) => {
                  event.preventDefault()

                  setSearchQuery(item.name)
                  onSelect(item)
                  setOpen(false)
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.email}
                  </p>
                </div>
              </button>
            ))}

            {filteredItems?.length === 0 && (
              <p className="px-3 py-3 text-sm text-muted-foreground">
                No customers found.
              </p>
            )}
          </div>
        )}
      </div>
    </Field>
  )
}
