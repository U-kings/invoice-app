"use client"

import Link from "next/link"

import {
  CheckCircle2,
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

interface InvoiceActionsProps {
  invoiceId: string
  status: string
}

export function InvoiceActions({ invoiceId, status }: InvoiceActionsProps) {
  const isPaid = status.toLowerCase() === "paid"
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Edit */}
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={`/dashboard/invoices/${invoiceId}/edit`} />}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>

      {/* Download */}
      <Button
        variant="outline"
        onClick={() => {
          console.log("Download invoice:", invoiceId)
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
          <DropdownMenuItem
            onClick={() => {
              setSendOpen(true)
            }}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send invoice
          </DropdownMenuItem>

          {/* Mark as paid */}
          {!isPaid && (
            <DropdownMenuItem
              onClick={() => {
                console.log("Mark invoice as paid:", invoiceId)
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as paid
            </DropdownMenuItem>
          )}

          {/* Duplicate */}
          <DropdownMenuItem
            onClick={() => {
              console.log("Duplicate invoice:", invoiceId)
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            <InvoiceSendDialog
              invoiceId={invoiceId}
              email="billing@acme.com"
              open={sendOpen}
              onOpenChange={setSendOpen}
            />
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
            <InvoiceDeleteDialog
              invoiceId={invoiceId}
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
