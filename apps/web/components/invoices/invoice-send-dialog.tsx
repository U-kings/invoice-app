"use client"

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
import { useEffect, useState } from "react"
import { useSendInvoice } from "@/hooks/use-send-invoice"
import { toast } from "@workspace/ui/components/toast"

interface InvoiceSendDialogProps {
  invoiceId: string | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string | undefined
}

export function InvoiceSendDialog({
  invoiceId,
  open,
  onOpenChange,
  email,
}: InvoiceSendDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState(email)
  const sendInvoiceMutation = useSendInvoice()

  const [subject, setSubject] = useState(
    `Invoice ${invoiceId} from Your Company`
  )

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecipientEmail(email)
      setSubject(`Invoice ${invoiceId} from Your Company`)
    }
  }, [open, email, invoiceId])

  useEffect(() => {
    // if (sendInvoiceMutation.isError) {
    //   onOpenChange(false)
    // }
    if (sendInvoiceMutation.isSuccess) {
      onOpenChange(false)
    }

    return () => {}
  }, [onOpenChange, sendInvoiceMutation.isError, sendInvoiceMutation.isSuccess])

  async function handleSend() {
    // try {
    sendInvoiceMutation.mutate(invoiceId)

    // } catch (error) {
    //   console.error("Failed to send invoice:", error)
    //   toast.add({
    //     type: "error",
    //     title: "Send failed",
    //     description: "Failed to send invoice",
    //   })
    // }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send invoice</DialogTitle>

          <DialogDescription>
            Review the recipient before sending {invoiceId}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice-email">To</Label>

            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="invoice-email"
                type="email"
                disabled
                value={recipientEmail}
                onChange={(event) => setRecipientEmail(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-subject">Subject</Label>

            <Input
              id="invoice-subject"
              value={subject}
              disabled
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>
        </div>

        <div className="text-center flex justify-center text-red-400">
          <p className="text-sm">
            {sendInvoiceMutation.isError
              ? sendInvoiceMutation.error.message
              : ""}
          </p>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="outline"
                disabled={sendInvoiceMutation?.isPending}
              />
            }
          >
            Cancel
          </DialogClose>

          <Button
            disabled={
              sendInvoiceMutation?.isPaused || sendInvoiceMutation.isPending
            }
            onClick={handleSend}
          >
            {sendInvoiceMutation.isPending || sendInvoiceMutation.isPending
              ? "Sending..."
              : "Send invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
