"use client";

import { motion } from "motion/react";

import { payments } from "./payments";
import { PaymentStatusBadge } from "./payment-status-badge";

export function RecentPayments() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Recent Payments
        </h2>

        <button className="text-sm font-medium text-[#2EAFB4]">
          View All
        </button>
      </div>

      <div className="space-y-5">
        {payments.map((payment) => (
          <div
            key={payment.customer}
            className="flex items-center justify-between rounded-xl border p-4"
          >
            <div>
              <p className="font-medium">
                {payment.customer}
              </p>

              <p className="text-sm text-muted-foreground">
                {payment.method}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold">
                {payment.amount}
              </p>

              <PaymentStatusBadge
                status={payment.status}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}