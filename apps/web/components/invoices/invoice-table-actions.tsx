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
  invoice: Invoice
}

export function InvoiceTableActions({ invoice }: InvoiceActionsProps) {
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

          <DropdownMenuContent align="end" className="w-auto">
            <DropdownMenuItem
              disabled={isCancelled}
              render={
                <Link href={`/dashboard/invoices/${invoice?.invoiceNumber}`} />
              }
            >
              View
            </DropdownMenuItem>

            {/* {!isPaid && (
              <DropdownMenuItem
                disabled={isCancelled}
                render={
                  <Link
                    href={`/dashboard/invoices/${invoice?.invoiceNumber}/edit`}
                  />
                }
              >
                Edit
              </DropdownMenuItem>
            )} */}
            {/* Send invoice */}
            {!isCancelled && (
              <DropdownMenuItem
                disabled={isCancelled}
                onClick={() => {
                  setSendOpen(true)
                }}
              >
                Send invoice
              </DropdownMenuItem>
            )}
            {/* Mark as paid */}
            {canMarkAsPaid && (
              <DropdownMenuItem
                disabled={isCancelled || isPaid}
                onClick={() => setMarkPaidOpen(true)}
              >
                Mark as paid
              </DropdownMenuItem>
            )}
            {/* Duplicate */}
            <DropdownMenuItem
              onClick={() => handleCopyInvoiceLink(invoice?.publicToken ?? "")}
            >
              {copied ? "Copied" : "Copy link"}
            </DropdownMenuItem>
            {/* Download */}
            <DropdownMenuItem
              onClick={() =>
                downloadInvoice.mutate({
                  invoiceId: invoice?.id,
                })
              }
            >
              {downloadInvoice.isPending ? "Downloading..." : "Download PDF"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canCancel && (
              <DropdownMenuItem
                className="text-amber-600 focus:text-amber-600"
                disabled={isPaid || isCancelled}
                onClick={() => setCancelOpen(true)}
              >
                Cancel invoice
              </DropdownMenuItem>
            )}
            {/* Delete */}
            {effectiveStatus === "Draft" && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  setDeleteOpen(true)
                }}
              >
                Delete invoice
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Send dialog */}
      <InvoiceSendDialog
        invoiceId={invoice?.id}
        invoiceNumber={invoice?.invoiceNumber}
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
        invoice={invoice}
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
