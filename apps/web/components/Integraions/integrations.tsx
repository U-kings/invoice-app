"use client";

import { motion } from "motion/react";

import {
  SiHaystack,
  SiStripe,
  SiPaypal,
  SiQuickbooks,
  SiZapier,
} from "react-icons/si";

import { IntegrationCard } from "./integration-card";

const integrations = [
  {
    name: "Paystack",
    icon: SiHaystack,
    color: "#00C3F7",
  },
  {
    name: "Stripe",
    icon: SiStripe,
    color: "#635BFF",
  },
  {
    name: "Flutterwave",
    icon: SiPaypal,
    color: "#F5A623", // Replace with Flutterwave logo if available
  },
  {
    name: "PayPal",
    icon: SiPaypal,
    color: "#0070E0",
  },
  {
    name: "QuickBooks",
    icon: SiQuickbooks,
    color: "#2CA01C",
  },
  {
    name: "Zapier",
    icon: SiZapier,
    color: "#FF4F00",
  },
];

export function Integrations() {
  return (
    <section className="py-28" id="integrations">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#2EAFB4]">
            Integrations
          </p>

          <h2 className="mt-5 text-4xl font-bold md:text-5xl">
            Connect with the tools you already use
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Seamlessly integrate with your payment providers,
            accounting software, and automation platforms.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-6">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
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
              <IntegrationCard {...integration} />
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center text-muted-foreground"
        >
          ...and many more
        </motion.p>
      </div>
    </section>
  );
}