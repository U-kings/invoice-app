"use client"

import Link from "next/link"

import {
  Check,
  CheckCircle2,
  CircleX,
  Copy,
  Download,
  Ellipsis,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDownloadInvoice } from "@/hooks/use-download-invoice"
import { toast } from "@workspace/ui/components/toast"
import { getEffectiveInvoiceStatus } from "@/lib/invoices/invoice"
import { Customer } from "@/hooks/use-create-customer"
import { DeleteCustomerDialog } from "./delete-customer-dialog"
import { FaTrashRestore } from "react-icons/fa"
import { RestoreCustomerDialog } from "./restore-customer-dialog"

interface CustomerActionsProps {
  customer: Customer
}

export function CustomerActions({ customer }: CustomerActionsProps) {
  const router = useRouter()
  //   const effectiveStatus = getEffectiveInvoiceStatus(customer)
  //   const canMarkAsPaid =
  //     effectiveStatus === "Sent" || effectiveStatus === "Overdue"
  //   const canCancel =
  //     effectiveStatus === "Draft" ||
  //     effectiveStatus === "Sent" ||
  //     effectiveStatus === "Overdue"
  //   const isPaid = effectiveStatus === "Paid"
  //   const isCancelled = effectiveStatus === "Cancelled"
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)

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
                aria-label="More customer actions"
              />
            }
          >
            <Ellipsis className="h-4 w-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-auto">
            {/* Edit */}
            <DropdownMenuItem
              className=""
              //   onClick={() => {
              //     setDeleteOpen(true)
              //   }}
              render={
                <Link
                  href={`/dashboard/customers?id=${customer.id}&email=${customer.email}&edit=true`}
                />
              }
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {/* Restore */}
            <DropdownMenuItem
              className=""
              onClick={() => {
                setRestoreOpen(true)
              }}
            >
              <FaTrashRestore className="mr-2 h-4 w-4" />
              Restore
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

      {/* Restore dialog */}
      <RestoreCustomerDialog
        customer={customer}
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
      />

      {/* Delete dialog */}
      <DeleteCustomerDialog
        customer={customer}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
