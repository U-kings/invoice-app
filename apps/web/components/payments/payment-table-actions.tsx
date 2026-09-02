"use client"

import Link from "next/link"
import { MoreHorizontal, Trash2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { PaymentListItem } from "@/hooks/use-payment"

interface PaymentTableActionsProps {
  payment: PaymentListItem
}

export function PaymentTableActions({ payment }: PaymentTableActionsProps) {
  const isPending = payment.status.toLowerCase() === "pending"
  const isSuccess = payment.status.toLowerCase() === "success"
  const isFailed = payment.status.toLowerCase() === "failed"
  const isCancelled = payment.status.toLowerCase() === "cancelled"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
      >
        <MoreHorizontal className="h-4 w-4" />

        <span className="sr-only">Open payment actions</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          render={<Link href={`/dashboard/payments/${payment.id}`} />}
        >
          View payment
        </DropdownMenuItem>

        <DropdownMenuItem
          render={
            <Link
              href={`/dashboard/invoices/${payment.invoice.invoiceNumber}`}
            />
          }
        >
          View invoice
        </DropdownMenuItem>

        {payment.checkoutUrl && (
          <DropdownMenuItem
            render={
              <a
                href={payment.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Open payment link
          </DropdownMenuItem>
        )}

        {isFailed && <DropdownMenuItem>Retry payment</DropdownMenuItem>}

        {isPending && (
          <>
            <DropdownMenuItem>Mark as successful</DropdownMenuItem>

            <DropdownMenuItem>Cancel payment</DropdownMenuItem>
          </>
        )}

        {!isCancelled && !isSuccess && !isPending && (
          <DropdownMenuItem>View details</DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-red-500">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete payment
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
