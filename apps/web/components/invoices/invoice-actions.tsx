"use client"

import Link from "next/link"

import {
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
import { InvoiceDeleteDialog } from "./invoice-delete-dialog"
import { useState } from "react"
import { InvoiceSendDialog } from "./invoice-send-dialog"
import { useRouter } from "next/navigation"
import {
  cancelInvoice,
  markInvoiceAsPaid,
  notifyInvoiceStorageUpdated,
  saveInvoices,
} from "./invoice-storage"
import { Invoice } from "./invoice-data"
import { InvoiceCancelDialog } from "./invoice-cancel-dialog"

interface InvoiceActionsProps {
  invoice: Invoice
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const router = useRouter()
  const isPaid = invoice?.status === "Paid"
  const isCancelled = invoice?.status === "Cancelled"
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* Edit */}
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={`/dashboard/invoices/${invoice.id}/edit`} />}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>

        {/* Download */}
        <Button
          variant="outline"
          onClick={() => {
            console.log("Download invoice:", invoice.id)
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>

        {/* More actions */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label="More invoice actions"
              />
            }
          >
            <Ellipsis className="h-4 w-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            {/* Send invoice */}
            {(!isCancelled || isPaid) && (
              <DropdownMenuItem
                disabled={isCancelled || isPaid}
                onClick={() => {
                  setSendOpen(true)
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send invoice
              </DropdownMenuItem>
            )}

            {/* Mark as paid */}
            {!isCancelled && !isPaid && (
              <DropdownMenuItem
                disabled={isCancelled || isPaid}
                onClick={() => {
                  console.log("Mark invoice as paid:", invoice.id)
                  markInvoiceAsPaid(invoice.id)
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as paid
              </DropdownMenuItem>
            )}

            {/* Duplicate */}
            <DropdownMenuItem
              onClick={() => {
                console.log("Duplicate invoice:", invoice.id)
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            {(isPaid || !isCancelled) && (
              <DropdownMenuItem
                className="text-amber-600 focus:text-amber-600"
                disabled={isPaid || isCancelled}
                onClick={() => setCancelOpen(true)}
              >
                <CircleX className="mr-2 h-4 w-4" />
                Cancel invoice
              </DropdownMenuItem>
            )}

            {/* Delete */}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                setDeleteOpen(true)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Send dialog */}
      <InvoiceSendDialog
        invoiceId={invoice.id}
        email={invoice.customerEmail}
        open={sendOpen}
        onOpenChange={setSendOpen}
      />

      {/* Delete dialog */}
      <InvoiceDeleteDialog
        invoiceId={invoice.id}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          router.push("/dashboard/invoices")
        }}
      />

      {/* Cancel dialog */}
      <InvoiceCancelDialog
        invoiceId={invoice.id}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
    </>
  )
}
