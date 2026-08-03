"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import { AuthBackground } from "./auth-background";

export function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AuthBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 lg:px-6 py-10">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            className="hidden lg:flex"
          >
            <div className="max-w-xl">
              <span className="inline-flex rounded-full border border-[#2EAFB4]/30 bg-[#2EAFB4]/10 px-4 py-1 text-sm font-medium text-[#2EAFB4]">
                Welcome Back 👋
              </span>

              <h1 className="mt-8 text-5xl font-bold leading-tight xl:text-6xl">
                Manage invoices
                <br />
                effortlessly.
              </h1>

              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Create invoices, track payments, automate reminders,
                and grow your business with a modern invoicing platform.
              </p>

              <div className="mt-10 flex items-center gap-8">
                <div>
                  <h3 className="text-4xl font-bold text-[#2EAFB4]">
                    20k+
                  </h3>

                  <p className="text-muted-foreground">
                    Businesses
                  </p>
                </div>

                <div>
                  <h3 className="text-4xl font-bold text-[#2EAFB4]">
                    $50M+
                  </h3>

                  <p className="text-muted-foreground">
                    Invoices Processed
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side */}
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.6,
              delay: 0.15,
            }}
            className="mx-auto w-full max-w-md"
          >
            <div className="rounded-3xl border border-border/60 bg-background/80 p-8 shadow-2xl backdrop-blur-xl md:p-10">
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}