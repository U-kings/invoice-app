"use client"

import * as React from "react"

import { Mail } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

interface InvoiceSendDialogProps {
  invoiceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
}

export function InvoiceSendDialog({
  invoiceId,
  open,
  onOpenChange,
  email,
}: InvoiceSendDialogProps) {
  const [isSending, setIsSending] =
    React.useState(false)

  async function handleSend() {
    setIsSending(true)

    try {
      // Replace with your API call later.
      await new Promise((resolve) =>
        setTimeout(resolve, 800),
      )

      console.log("Invoice sent:", {
        invoiceId,
        email,
      })

      onOpenChange(false)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Send invoice
          </DialogTitle>

          <DialogDescription>
            Review the recipient before sending{" "}
            {invoiceId}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice-email">
              To
            </Label>

            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="invoice-email"
                type="email"
                defaultValue={email}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-subject">
              Subject
            </Label>

            <Input
              id="invoice-subject"
              defaultValue={`Invoice ${invoiceId} from Your Company`}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="outline"
                disabled={isSending}
              />
            }
          >
            Cancel
          </DialogClose>

          <Button
            disabled={isSending}
            onClick={handleSend}
          >
            {isSending
              ? "Sending..."
              : "Send invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}