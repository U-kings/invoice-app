"use client"

import { motion } from "motion/react"

import {
  Bell,
  Search,
  TrendingUp,
  FileClock,
  CheckCircle2,
  BellRing,
  CreditCard,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"

import { DashboardSidebar } from "./dashboard-sidebar"
import { StatCard } from "./stat-card"
import { RevenueChart } from "./revenue-chart"
import { RecentPayments } from "./recent-payments"

import { FloatingCard } from "./floating-card"
import Image from "next/image"

export function Dashboard() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 80,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.8,
      }}
      className="relative flex-1"
    >
      <Image
        src="/dashboard-hero-dark.png"
        width={1200}
        height={800}
        alt="Dashboard hero image"
        loading="eager"
        className="hidden dark:block overflow-hidden rounded-[32px] border border-white/15 bg-background/65 shadow-2xl backdrop-blur-[40px]"
      />
      <Image
        src="/dashboard-hero-light.png"
        width={1200}
        height={800}
        alt="Dashboard hero image"
        loading="eager"
        className="block dark:hidden overflow-hidden rounded-[32px] border border-white/15 bg-background/65 shadow-2xl backdrop-blur-[40px]"
      />

      <div className="hidden scale-70 overflow-hidden rounded-[32px] border border-white/15 bg-background/65 shadow-2xl backdrop-blur-[40px]">
        <div className="flex">
          <DashboardSidebar />

          <div className="flex-1 p-6">
            {/* HEADER */}

            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Overview</h2>

              <div className="flex items-center gap-5">
                <Search className="h-5 w-5 text-muted-foreground" />

                <Bell className="h-5 w-5 text-muted-foreground" />

                <Avatar>
                  <AvatarFallback>KI</AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* STATS */}

            <div className="grid gap-5 md:grid-cols-3">
              <StatCard
                title="Total Revenue"
                value="$42,800"
                subtitle="+34% from last month"
                icon={TrendingUp}
                accent
              />

              <StatCard
                title="Pending Invoices"
                value="12"
                subtitle="$8,940"
                icon={FileClock}
              />

              <StatCard
                title="Paid Invoices"
                value="83%"
                subtitle="+11% from last month"
                icon={CheckCircle2}
                accent
              />
            </div>

            {/* CHART */}

            <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_340px]">
              <div className="rounded-3xl border border-border/60 bg-background/40 p-6 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-semibold">Revenue Overview</h3>

                  <button className="rounded-lg border px-3 py-1 text-sm">
                    This Month
                  </button>
                </div>

                {/* Chart comes in Part 2B */}

                <RevenueChart />
              </div>

              <div className="rounded-3xl border border-border/60 bg-background/40 p-6 backdrop-blur-xl">
                <h3 className="mb-5 font-semibold">Recent Payments</h3>

                {/* Payments list in Part 2B */}

                <RecentPayments />
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingCard
        title="Paid"
        value="+$32,000"
        icon={CheckCircle2}
        className="top-8 -right-8 hidden xl:block"
      />

      <FloatingCard
        title="Reminder Sent"
        subtitle="Invoice #2031"
        icon={BellRing}
        className="bottom-28 -left-12 hidden xl:block"
      />

      <FloatingCard
        title="Stripe Connected"
        subtitle="Payments Active"
        icon={CreditCard}
        className="right-12 bottom-0 hidden xl:block"
      />
    </motion.div>
  )
}
