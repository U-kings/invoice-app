"use client";

import { motion } from "motion/react";
import { MoreHorizontal } from "lucide-react";

import { InvoiceStatusBadge } from "./invoice-status-badge";
import Link from "next/link";

const invoices = [
  {
    id: "INV-1001",
    customer: "Acme Inc.",
    amount: "$2,500",
    date: "Jun 12",
    status: "Paid",
  },
  {
    id: "INV-1002",
    customer: "Globex",
    amount: "$1,850",
    date: "Jun 10",
    status: "Sent",
  },
  {
    id: "INV-1003",
    customer: "Initech",
    amount: "$4,200",
    date: "Jun 09",
    status: "Overdue",
  },
  {
    id: "INV-1004",
    customer: "Umbrella",
    amount: "$800",
    date: "Jun 07",
    status: "Draft",
  },
  {
    id: "INV-1005",
    customer: "Wayne Corp",
    amount: "$5,600",
    date: "Jun 05",
    status: "Paid",
  },
];

export function RecentInvoices() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Recent Invoices
        </h2>

        <button className="text-sm font-medium text-[#2EAFB4]">
          <Link href={"/dashboard/invoices"}>
          View All
          </Link>
        </button>
      </div>

      <div className="space-y-5">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between rounded-2xl border p-4 transition hover:bg-muted/40"
          >
            <div>
              <p className="font-semibold">
                {invoice.id}
              </p>

              <p className="text-sm text-muted-foreground">
                {invoice.customer}
              </p>
            </div>

            <div className="hidden text-right md:block">
              <p>{invoice.amount}</p>

              <p className="text-sm text-muted-foreground">
                {invoice.date}
              </p>
            </div>

            <InvoiceStatusBadge
              status={invoice.status}
            />

            <MoreHorizontal
              size={18}
              className="text-muted-foreground"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}