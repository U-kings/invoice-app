"use client";

import { motion } from "motion/react";

import {
  FileText,
  Users,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { StatItem } from "./stat-item";

const stats = [
  {
    icon: FileText,
    value: "$8M+",
    label: "Invoices Sent",
    color: "teal" as const,
  },
  {
    icon: Users,
    value: "120K+",
    label: "Businesses",
    color: "teal" as const,
  },
  {
    icon: ShieldCheck,
    value: "99.9%",
    label: "Uptime",
    color: "teal" as const,
  },
  {
    icon: TrendingUp,
    value: "35%",
    label: "Faster Payments",
    color: "teal" as const,
  },
];

export function StatsSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="
            overflow-hidden
            rounded-[32px]
            border
            border-border/60
            bg-card/60
            backdrop-blur-xl
            shadow-[0_20px_80px_rgba(0,0,0,.12)]
          "
        >
          <div
            className="
              grid
              grid-cols-1
              divide-y
              divide-border/60

              md:grid-cols-2
              md:divide-x
              md:divide-y-0

              xl:grid-cols-4
            "
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                viewport={{
                  once: true,
                }}
                className="p-8"
              >
                <StatItem {...stat} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}