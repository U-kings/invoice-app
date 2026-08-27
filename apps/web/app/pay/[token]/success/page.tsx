"use client"

// import { prisma } from "@repo/db"
import { notFound, redirect, useParams } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle2,
  ArrowRight,
  FileText,
  Calendar,
  ShieldCheck,
  Mail,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { usePublicInvoice } from "@/hooks/use-public-invoice"

export default function InvoicePaymentSuccessPage() {
  const params = useParams<{ token: string }>()

  const token = params.token
  const { data: invoice, isLoading, isError, error } = usePublicInvoice(token)

  // 1. Fetch the invoice along with the customer billing context
  //   const invoice = await prisma.invoice.findUnique({
  //     where: { id: invoiceId },
  //     include: {
  //       customer: true,
  //     },
  //   })

  if (!invoice) {
    // return notFound()
  }

  // Optional: If a user manually visits this URL but the invoice isn't paid,
  // redirect them back to the checkout page. (Assumes you have a status field)
  if (invoice?.status !== "PAID") {
    // return redirect(`/pay/${token}`)
  }

  return (
    <div className="flex min-h-[80vh] animate-in items-center justify-center bg-background/50 p-4 duration-500 fade-in slide-in-from-bottom-4 md:p-6">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xl">
        {/* Top Decorative Gradient Hero */}
        <div className="flex flex-col items-center justify-center border-b bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-8 text-center">
          <div className="animate-bounce-short mb-4 rounded-full bg-emerald-100 p-3 text-emerald-600 ring-8 ring-emerald-500/5 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
            Payment Successful!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Thank you. Your transaction has been processed securely.
          </p>
        </div>

        {/* Transaction Overview Body */}
        <div className="space-y-6 p-6">
          {/* Main Huge Amount Display Block */}
          <div className="rounded-xl border border-dashed bg-muted/40 p-4 text-center">
            <span className="block text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Amount Paid
            </span>
            <span className="mt-1 block text-3xl font-extrabold text-gray-900 dark:text-zinc-50">
              {invoice?.currency || "NGN"}{" "}
              {invoice?.total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Metadata Grid Data Matrix */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Transaction Details
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b pb-2.5">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4 stroke-[1.5]" /> Invoice ID
                </span>
                <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                  {invoice?.id.slice(0, 8)}...{invoice?.id.slice(-4)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-2.5">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 stroke-[1.5]" /> Customer
                </span>
                <div className="text-right">
                  <span className="block font-medium text-foreground">
                    {invoice?.customer.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {invoice?.customer.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-b pb-2.5">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 stroke-[1.5]" /> Date & Time
                </span>
                <span className="font-medium text-foreground">
                  {new Date().toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 stroke-[1.5]" /> Status
                </span>
                <Badge
                  variant="outline"
                  className="rounded-full border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-600 dark:text-emerald-400"
                >
                  Settled
                </Badge>
              </div>
            </div>
          </div>

          {/* Callout Notice Footer Info Box */}
          <div className="rounded-lg border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
            A confirmation receipt alongside complete accounting logs has been
            dispatched to your email address.
          </div>
        </div>

        {/* Interactive Action Navigation Footers */}
        <div className="flex flex-col gap-2 border-t bg-muted/10 p-6 pt-5 sm:flex-row">
          <Button variant="outline" className="h-11 w-full sm:flex-1">
            <Link href={`/invoices/${invoice?.id}`}>View Statement</Link>
          </Button>
          <Button className="group h-11 w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700 sm:flex-1">
            <Link href="/invoices">
              <div className="flex items-center gap-2 leading-0">
                <span>Go to Invoices</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
