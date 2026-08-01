"use client";

import { motion } from "motion/react";
import { PricingCard } from "./pricing-card";

const plans = [
  {
    title: "Starter",
    description:
      "Perfect for freelancers and small businesses.",
    price: "$0",
    period: "/mo",
    buttonText: "Get Started Free",
    features: [
      "Unlimited Invoices",
      "Accept Payments (Paystack)",
      "Client Portal",
      "Basic Reports",
    ],
  },
  {
    title: "Pro",
    description:
      "For growing businesses that need more.",
    price: "$19",
    period: "/mo",
    buttonText: "Start 14-Day Free Trial",
    popular: true,
    features: [
      "Everything in Starter",
      "Automated Reminders",
      "Recurring Invoices",
      "Advanced Reports",
      "Priority Support",
    ],
  },
];

export function Pricing() {
  return (
    <section className="py-28" id="pricing">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-20 max-w-3xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#2EAFB4]">
            Pricing
          </p>

          <h2 className="mt-5 text-4xl font-bold md:text-5xl">
            Simple, transparent pricing
          </h2>

          <p className="mt-6 text-lg text-muted-foreground">
            Start for free and upgrade whenever your business grows.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <PricingCard {...plan} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}