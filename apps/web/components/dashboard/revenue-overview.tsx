"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { motion } from "motion/react";

import { revenueData } from "./revenue-data";

export function RevenueOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: .5 }}
      className="rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl"
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Revenue Overview
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Revenue generated this year
          </p>
        </div>

        <select className="rounded-xl border bg-background px-4 py-2 text-sm outline-none">
          <option>This Year</option>
          <option>Last 6 Months</option>
          <option>This Month</option>
        </select>
      </div>

      <div className="mb-8">
        <h3 className="text-4xl font-bold">
          $88,455.12
        </h3>

        <p className="mt-2 text-green-500">
          +12.5%
          <span className="ml-2 text-muted-foreground">
            vs last month
          </span>
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient
                id="revenue"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#2EAFB4"
                  stopOpacity={0.35}
                />

                <stop
                  offset="100%"
                  stopColor="#2EAFB4"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
            />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2EAFB4"
              strokeWidth={3}
              fill="url(#revenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}