"use client";

import { motion } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import { invoiceStatus } from "./invoice-status-data";

export function InvoiceStatus() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl"
    >
      <h2 className="mb-6 text-xl font-semibold">
        Invoice Status
      </h2>

      <div className="flex flex-col items-center lg:flex-row lg:gap-8">
        <div className="h-64 w-full max-w-[240px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={invoiceStatus}
                dataKey="value"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
              >
                {invoiceStatus.map((item) => (
                  <Cell
                    key={item.name}
                    fill={item.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 flex-1 space-y-4 lg:mt-0">
          {invoiceStatus.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: item.color,
                  }}
                />

                <span>{item.name}</span>
              </div>

              <span className="font-semibold">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}