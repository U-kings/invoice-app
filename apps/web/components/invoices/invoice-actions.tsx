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
import { InvoiceDeleteDialog } from "./invoice-delete-dialog"
import { useState } from "react"
import { InvoiceSendDialog } from "./invoice-send-dialog"
import { useRouter } from "next/navigation"
import { InvoiceCancelDialog } from "./invoice-cancel-dialog"
import { InvoiceMarkPaidDialog } from "./invoice-mark-paid-dialog"
import { useDownloadInvoice } from "@/hooks/use-download-invoice"
import { toast } from "@workspace/ui/components/toast"
import { getEffectiveInvoiceStatus } from "@/lib/invoices/invoice"
import { Invoice } from "@/hooks/use-invoice"

interface InvoiceActionsProps {
  invoice: Invoice | undefined
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const router = useRouter()
  const effectiveStatus = getEffectiveInvoiceStatus(invoice)
  const canMarkAsPaid =
    effectiveStatus === "Sent" || effectiveStatus === "Overdue"
  const canCancel =
    effectiveStatus === "Draft" ||
    effectiveStatus === "Sent" ||
    effectiveStatus === "Overdue"
  const isPaid = effectiveStatus === "Paid"
  const isCancelled = effectiveStatus === "Cancelled"
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [markPaidOpen, setMarkPaidOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const downloadInvoice = useDownloadInvoice()

  const handleCopyInvoiceLink = async (publicToken: string) => {
    try {
      const url = `${window.location.origin}/invoice/${publicToken}`

      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.add({
        title: "Link copied",
        type: "success",
        description: "Invoice link copied to clipboard.",
      })
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to copy invoice link:", error)

      toast.add({
        title: "Copy failed",
        type: "error",
        description: "Unable to copy the invoice link.",
      })
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* Edit */}
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={`/dashboard/invoices/${invoice?.id}/edit`} />}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>

        {/* Download */}
        <Button
          onClick={() =>
            downloadInvoice.mutate({
              invoiceId: invoice?.id,
            })
          }
          disabled={downloadInvoice.isPending}
        >
          <Download className="size-4" />

          {downloadInvoice.isPending ? "Downloading..." : "Download PDF"}
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
            {canMarkAsPaid && (
              <DropdownMenuItem
                disabled={isCancelled || isPaid}
                onClick={() => setMarkPaidOpen(true)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as paid
              </DropdownMenuItem>
            )}

            {/* Duplicate */}
            <DropdownMenuItem
              onClick={() => handleCopyInvoiceLink(invoice?.publicToken ?? "")}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}

              {copied ? "Copied" : "Copy link"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            {canCancel && (
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
        invoiceId={invoice?.id}
        email={invoice?.customer?.email}
        open={sendOpen}
        onOpenChange={setSendOpen}
      />

      <InvoiceMarkPaidDialog
        invoice={invoice}
        open={markPaidOpen}
        onOpenChange={setMarkPaidOpen}
      />

      {/* Delete dialog */}
      <InvoiceDeleteDialog
        invoiceId={invoice?.id}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          router.push("/dashboard/invoices")
        }}
      />

      {/* Cancel dialog */}
      <InvoiceCancelDialog
        invoice={invoice}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
    </>
  )
}
