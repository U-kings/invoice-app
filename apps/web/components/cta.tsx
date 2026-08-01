"use client";

import { motion } from "motion/react";
import { ArrowRight, Send } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export function CTA() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[36px] border border-border/60 bg-card/60 backdrop-blur-xl"
        >
          {/* Background Glow */}
          <div className="absolute left-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_left,#2EAFB4_0%,transparent_70%)] opacity-10" />

          {/* Dot Pattern */}
          <div className="absolute right-0 top-0 h-full w-64 opacity-40">
            <div
              className="h-full w-full bg-[radial-gradient(#2EAFB4_1.5px,transparent_1.5px)] bg-[length:18px_18px]"
            />
          </div>

          <div className="relative flex flex-col gap-12 p-10 lg:flex-row lg:items-center lg:justify-between lg:p-16">
            {/* Left */}
            <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#2EAFB4]/15"
              >
                <div className="absolute h-40 w-40 rounded-full bg-[#2EAFB4]/10 blur-3xl" />

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2EAFB4] shadow-lg">
                  <Send className="h-8 w-8 text-white" />
                </div>
              </motion.div>

              <div className="max-w-2xl">
                <h2 className="text-4xl font-bold leading-tight md:text-5xl">
                  Ready to spend less time
                  <br />
                  chasing invoices?
                </h2>

                <p className="mt-5 text-lg text-muted-foreground">
                  Join thousands of businesses that get paid faster with
                  InvoiceFlow.
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col items-center gap-5">
              <Button
                size="lg"
                className="group h-16 rounded-xl bg-[#2EAFB4] px-10 text-lg hover:bg-[#26989d]"
              >
                Get Started Free

                <ArrowRight className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>

              <p className="text-sm text-muted-foreground">
                No credit card • Cancel anytime
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}