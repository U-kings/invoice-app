"use client";

import { motion } from "motion/react";

import {
  Plus,
  UserPlus,
  CreditCard,
  FileText,
} from "lucide-react";

const actions = [
  {
    title: "New Invoice",
    icon: FileText,
  },
  {
    title: "Add Customer",
    icon: UserPlus,
  },
  {
    title: "Record Payment",
    icon: CreditCard,
  },
  {
    title: "Create Estimate",
    icon: Plus,
  },
];

export function QuickActions() {
  return (
    <div className="rounded-3xl h-full border bg-background/80 p-6 shadow-sm backdrop-blur-xl">
      <h2 className="mb-6 text-xl font-semibold">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <motion.button
              key={action.title}
              whileHover={{
                scale: 1.04,
                y: -4,
              }}
              whileTap={{
                scale: 0.96,
              }}
              className="flex flex-col items-center justify-center rounded-2xl border p-6 transition hover:border-[#2EAFB4]"
            >
              <div className="rounded-xl bg-[#2EAFB4]/10 p-3">
                <Icon className="text-[#2EAFB4]" />
              </div>

              <span className="mt-4 text-sm font-medium">
                {action.title}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}