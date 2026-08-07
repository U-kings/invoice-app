"use client";

import { motion } from "motion/react";
import { CalendarDays } from "lucide-react";

const upcoming = [
  {
    customer: "Apple Inc.",
    amount: "$4,200",
    due: "Tomorrow",
  },
  {
    customer: "Netflix",
    amount: "$2,100",
    due: "Aug 15",
  },
  {
    customer: "Spotify",
    amount: "$1,650",
    due: "Aug 18",
  },
];

export function UpcomingInvoices() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl"
    >
      <div className="mb-6 flex items-center gap-3">
        <CalendarDays className="text-[#2EAFB4]" />

        <h2 className="text-xl font-semibold">
          Upcoming Invoices
        </h2>
      </div>

      <div className="space-y-4">
        {upcoming.map((invoice) => (
          <div
            key={invoice.customer}
            className="rounded-2xl border p-4 transition hover:border-[#2EAFB4]/40"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">
                {invoice.customer}
              </p>

              <p className="font-semibold">
                {invoice.amount}
              </p>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Due {invoice.due}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}