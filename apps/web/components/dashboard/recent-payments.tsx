"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { useDashboard } from "@/hooks/use-dashboard";
import { PaymentStatusBadge } from "./payment-status-badge";

function formatCurrency(
  value: number,
  currency: string
) {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function RecentPayments() {
  const {
    data,
    isLoading,
    isError,
  } = useDashboard();

  const payments = data?.recentPayments ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Recent Payments
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your latest payment activity
          </p>
        </div>

        <Link
          href="/dashboard/payments"
          className="text-sm font-medium text-[#2EAFB4] transition-opacity hover:opacity-80"
        >
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border p-4"
            >
              <div className="space-y-2">
                <div className="h-5 w-28 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
              </div>

              <div className="space-y-2 text-right">
                <div className="ml-auto h-5 w-20 animate-pulse rounded-md bg-muted" />
                <div className="ml-auto h-5 w-16 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex min-h-56 items-center justify-center text-sm text-muted-foreground">
          Unable to load recent payments.
        </div>
      ) : payments.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center text-center">
          <p className="font-medium">
            No payments yet
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Your recent payments will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {payments.map((payment) => (
            <Link
              key={payment.id}
              href={`/dashboard/payments}`}
              className="block"
            >
              <div className="flex items-center justify-between rounded-xl border p-4 transition hover:bg-muted/40">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {payment.invoice.customer.name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {payment.invoice.invoiceNumber} ·{" "}
                    {payment.provider}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-semibold">
                    {formatCurrency(
                      payment.amount,
                      payment.currency
                    )}
                  </p>

                  <div className="mt-1 flex items-center justify-end gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </span>

                    <PaymentStatusBadge
                      status={payment.status}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}