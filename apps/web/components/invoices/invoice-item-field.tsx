"use client"

import * as React from "react"
import { Plus, Search } from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldLabel,
} from "@workspace/ui/components/field"
import { InvoiceItem } from "./invoice-schema"


interface InvoiceItemFieldProps {
  id: string
  value: string
  items: InvoiceItem[]
  onChange: (value: string) => void
  onSelect: (item: InvoiceItem) => void
}

export function InvoiceItemField({
  id,
  value,
  items,
  onChange,
  onSelect,
}: InvoiceItemFieldProps) {
  const [open, setOpen] = React.useState(false)

  const filteredItems = React.useMemo(() => {
    const search = value.trim().toLowerCase()

    if (!search) {
      return items
    }

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search)
    )
  }, [items, value])

  const exactMatch = items.some(
    (item) => item.name.toLowerCase() === value.trim().toLowerCase()
  )

  const containerRef = React.useRef<HTMLDivElement>(null)

React.useEffect(() => {
  function handlePointerDown(event: PointerEvent) {
    if (!containerRef.current) return

    if (!containerRef.current.contains(event.target as Node)) {
      setOpen(false)
    }
  }

  document.addEventListener("pointerdown", handlePointerDown)

  return () => {
    document.removeEventListener("pointerdown", handlePointerDown)
  }
}, [])

  return (
    <Field className="min-w-0">
      <FieldLabel htmlFor={id} className="opacity-0">
        Item
      </FieldLabel>

      <div ref={containerRef} className="relative min-w-0">
        <Search className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          id={id}
          value={value}
          placeholder="Search or enter an item..."
          className="h-12 min-w-0 pl-9"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
          }}
        />

        {open && (
          <div className="absolute top-full right-0 left-0 z-10 mt-1 overflow-hidden rounded-xl border bg-popover p-1 shadow-lg">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted"
                onMouseDown={(event) => {
                  event.preventDefault()

                  // IMPORTANT:
                  // Update the RHF fields through the parent.
                  onSelect(item)

                  setOpen(false)
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {item.name}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <span className="shrink-0 text-sm font-medium">
                  {item.rate.toLocaleString()}
                </span>
              </button>
            ))}

            {value.trim() && !exactMatch && (
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-muted"
                onMouseDown={(event) => {
                  event.preventDefault()
                  setOpen(false)
                }}
              >
                <Plus className="h-4 w-4" />

                <span>
                  Add "{value.trim()}"
                </span>
              </button>
            )}

            {filteredItems.length === 0 && !value.trim() && (
              <p className="px-3 py-3 text-sm text-muted-foreground">
                No items available.
              </p>
            )}
          </div>
        )}
      </div>
    </Field>
  )
}


// // invoice-item-field.tsx

// "use client"

// import * as React from "react"
// import { Check, Plus, Search } from "lucide-react"

// import { Input } from "@workspace/ui/components/input"
// import { Field, FieldLabel } from "@workspace/ui/components/field"

// import type { InvoiceItem } from "./invoice-items"
// import { ControllerFieldState } from "react-hook-form"

// interface InvoiceItemFieldProps {
//   value: string
//   items: InvoiceItem[]
//   fieldState: ControllerFieldState
//   onChange: (value: string) => void
//   onSelect: (item: InvoiceItem) => void
// }

// export function InvoiceItemField({
//   value,
//   items,
//   fieldState,
//   onChange,
//   onSelect,
// }: InvoiceItemFieldProps) {
//   const [open, setOpen] = React.useState(false)

//   const filteredItems = React.useMemo(() => {
//     const search = value.trim().toLowerCase()

//     if (!search) {
//       return items
//     }

//     return items.filter(
//       (item) =>
//         item.name.toLowerCase().includes(search) ||
//         item.description.toLowerCase().includes(search)
//     )
//   }, [items, value])

//   const exactMatch = items.some(
//     (item) => item.name.toLowerCase() === value.trim().toLowerCase()
//   )

//   return (
//     <Field>
//       <FieldLabel htmlFor="invoice-item" className="opacity-0">
//         Item
//       </FieldLabel>

//       <div className="relative">
//         <Search className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

//         <Input
//           id="invoice-item"
//           value={value}
//           placeholder="Search or enter an item..."
//           aria-invalid={fieldState.invalid}
//           className="h-12 pl-9"
//           onFocus={() => setOpen(true)}
//           onChange={(event) => {
//             onChange(event.target.value)
//             setOpen(true)
//           }}
//           onBlur={() => {
//             // Give the dropdown click time to fire.
//             setTimeout(() => setOpen(false), 150)
//           }}
//         />

//         {open && (
//           <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-xl border bg-popover p-1 shadow-lg">
//             {filteredItems.map((item) => (
//               <button
//                 key={item.id}
//                 type="button"
//                 className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
//                 onMouseDown={(event) => {
//                   event.preventDefault()
//                   onSelect(item)
//                   setOpen(false)
//                 }}
//               >
//                 <div className="min-w-0 flex-1">
//                   <p className="truncate text-sm font-medium">
//                     {item.name}
//                   </p>

//                   <p className="truncate text-xs text-muted-foreground">
//                     {item.description}
//                   </p>
//                 </div>

//                 <span className="shrink-0 text-sm font-medium">
//                   {item.rate.toLocaleString()}
//                 </span>
//               </button>
//             ))}

//             {value.trim() && !exactMatch && (
//               <button
//                 type="button"
//                 className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted"
//                 onMouseDown={(event) => {
//                   event.preventDefault()
//                   setOpen(false)
//                 }}
//               >
//                 <Plus className="h-4 w-4" />

//                 <span>
//                   Add "{value.trim()}"
//                 </span>
//               </button>
//             )}

//             {filteredItems.length === 0 && !value.trim() && (
//               <p className="px-3 py-3 text-sm text-muted-foreground">
//                 No items available.
//               </p>
//             )}
//           </div>
//         )}
//       </div>
//     </Field>
//   )
// }