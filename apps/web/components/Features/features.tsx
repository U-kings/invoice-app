"use client";

import { motion } from "motion/react";

import {
  FileText,
  CreditCard,
  Bell,
  BarChart3,
  Users,
  RefreshCcw,
} from "lucide-react";

import { FeatureCard } from "./feature-card";

const features = [
  {
    title: "Create Invoices",
    description:
      "Generate beautiful professional invoices in seconds with your own branding.",
    icon: FileText,
    color: "teal" as const,
  },
  {
    title: "Accept Payments",
    description:
      "Accept payments via Stripe, Paystack, Flutterwave and more.",
    icon: CreditCard,
    color: "blue" as const,
  },
  {
    title: "Automatic Reminders",
    description:
      "Send automatic reminders and reduce late payments effortlessly.",
    icon: Bell,
    color: "teal" as const,
  },
  {
    title: "Analytics & Reports",
    description:
      "Track revenue, invoices and customer insights in real-time.",
    icon: BarChart3,
    color: "teal" as const,
  },
  {
    title: "Client Portal",
    description:
      "Give clients a secure portal to view and pay invoices online.",
    icon: Users,
    color: "blue" as const,
  },
  {
    title: "Recurring Billing",
    description:
      "Automate subscriptions and recurring invoices effortlessly.",
    icon: RefreshCcw,
    color: "teal" as const,
  },
];

export function Features() {
  return (
    <section className="relative py-28" id="features">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="mx-auto mb-20 max-w-3xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2EAFB4]">
            Features
          </span>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            Everything you need
            <br />
            to get paid faster
          </h2>

          <p className="mt-6 text-lg text-muted-foreground">
            Powerful invoicing, automated payments, recurring billing,
            analytics, and client management—all in one place.
          </p>
        </motion.div>

        <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
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
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}