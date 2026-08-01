"use client";

import { motion } from "motion/react";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { CheckCircle2 } from "lucide-react";

const payments = [
  {
    name: "Sarah Johnson",
    company: "Studio Nova",
    amount: "$1,250",
    initials: "SJ",
  },
  {
    name: "Michael Brown",
    company: "Pixel Labs",
    amount: "$3,420",
    initials: "MB",
  },
  {
    name: "Emily Carter",
    company: "Acme Inc.",
    amount: "$920",
    initials: "EC",
  },
  {
    name: "James Smith",
    company: "Creative Hub",
    amount: "$5,180",
    initials: "JS",
  },
];

export function RecentPayments() {
  return (
    <div className="space-y-5">

      {payments.map((payment, index) => (
        <motion.div
          key={payment.name}
          initial={{
            opacity: 0,
            x: 25,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: index * .15,
          }}
          className="flex items-center justify-between rounded-2xl border border-border/50 p-4"
        >
          <div className="flex items-center gap-3">

            <Avatar>
              <AvatarFallback>
                {payment.initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-medium">
                {payment.name}
              </p>

              <p className="text-sm text-muted-foreground">
                {payment.company}
              </p>
            </div>

          </div>

          <div className="text-right">

            <p className="font-semibold">
              {payment.amount}
            </p>

            <div className="mt-1 flex items-center justify-end gap-1 text-xs text-[#2EAFB4]">
              <CheckCircle2 className="h-3 w-3" />
              Paid
            </div>

          </div>

        </motion.div>
      ))}

    </div>
  );
}