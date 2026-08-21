"use client"

import Link from "next/link"
import { useState } from "react"
import { MoreHorizontal, Trash2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { InvoiceDeleteDialog } from "./invoice-delete-dialog"
import { Invoice } from "@/hooks/use-invoice"
import { getEffectiveInvoiceStatus } from "@/lib/invoices/invoice"

interface InvoiceTableActionsProps {
  invoice: Invoice
  //   onDeleted: () => void
}

export function InvoiceTableActions({ invoice }: InvoiceTableActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  const isDraft = getEffectiveInvoiceStatus(invoice) === "Draft"
  const isSent = getEffectiveInvoiceStatus(invoice) === "Sent"
  const isPaid = getEffectiveInvoiceStatus(invoice) === "Paid"
  const isCancelled = getEffectiveInvoiceStatus(invoice) === "Cancelled"
  const isOverdue = getEffectiveInvoiceStatus(invoice) === "Overdue"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
        >
          <MoreHorizontal className="h-4 w-4" />

          <span className="sr-only">Open actions</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={<Link href={`/dashboard/invoices/${invoice?.id}`} />}
          >
            View invoice
          </DropdownMenuItem>
          {!isCancelled && !isPaid && (
            <DropdownMenuItem
              render={<Link href={`/dashboard/invoices/${invoice?.id}/edit`} />}
            >
              Edit invoice
            </DropdownMenuItem>
          )}

          <DropdownMenuItem>Download PDF</DropdownMenuItem>
          {isOverdue && isSent && (
            <DropdownMenuItem>Resend invoice</DropdownMenuItem>
          )}
          {isDraft && (
            <DropdownMenuItem>Send invoice</DropdownMenuItem>
          )}
          {(isSent || isDraft) && !isCancelled && (
            <DropdownMenuItem>Mark as paid</DropdownMenuItem>
          )}
          {!isCancelled && !isPaid && (
            <DropdownMenuItem>Cancel invoice</DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-500"
            onClick={() => setDeleteOpen(true)}
          >
            Delete invoice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InvoiceDeleteDialog
        invoiceId={invoice.id}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
