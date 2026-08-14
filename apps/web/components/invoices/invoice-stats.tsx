"use client";

import { motion } from "motion/react";
import {
  CircleDollarSign,
  Clock3,
  FileText,
  TriangleAlert,
} from "lucide-react";

const stats = [
  {
    title: "Total invoices",
    value: "156",
    description: "All invoices",
    icon: FileText,
  },
  {
    title: "Paid",
    value: "$42,500",
    description: "Collected",
    icon: CircleDollarSign,
  },
  {
    title: "Pending",
    value: "$12,400",
    description: "Awaiting payment",
    icon: Clock3,
  },
  {
    title: "Overdue",
    value: "$4,250",
    description: "Needs attention",
    icon: TriangleAlert,
  },
];

export function InvoiceStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.title}
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
            }}
            className="rounded-2xl border bg-background p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {stat.title}
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>

              <div className="rounded-xl bg-[#2EAFB4]/10 p-2.5">
                <Icon className="h-5 w-5 text-[#2EAFB4]" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}