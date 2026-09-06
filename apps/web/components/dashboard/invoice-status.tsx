"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { useDashboard } from "@/hooks/use-dashboard";

type InvoiceStatusProps = {
  currency?: string;
};

const STATUS_CONFIG = [
  {
    key: "draft",
    name: "Draft",
    color: "#94A3B8",
  },
  {
    key: "sent",
    name: "Sent",
    color: "#3B82F6",
  },
  {
    key: "paid",
    name: "Paid",
    color: "#22C55E",
  },
  {
    key: "overdue",
    name: "Overdue",
    color: "#EF4444",
  },
  {
    key: "cancelled",
    name: "Cancelled",
    color: "#A855F7",
  },
] as const;

export function InvoiceStatus({
  currency,
}: InvoiceStatusProps) {
  const { data, isLoading, isError } = useDashboard();

  const statusData = useMemo(() => {
    if (!data) return [];

    const counts = data.invoiceStatus;

    const total = Object.values(counts).reduce(
      (sum, value) => sum + value,
      0
    );

    return STATUS_CONFIG.map((status) => {
      const value = counts[status.key];
      const percentage =
        total > 0 ? Math.round((value / total) * 100) : 0;

      return {
        ...status,
        value,
        percentage,
      };
    });
  }, [data]);

  const totalInvoices = statusData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Invoice Status
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your invoice pipeline
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-8 lg:flex-row">
          <div className="h-64 w-full max-w-60 animate-pulse rounded-full bg-muted" />

          <div className="w-full flex-1 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                <div className="h-5 w-24 animate-pulse rounded-md bg-muted" />
                <div className="h-5 w-12 animate-pulse rounded-md bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
          Unable to load invoice status.
        </div>
      ) : totalInvoices === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center text-center">
          <p className="font-medium">No invoices yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your invoice status breakdown will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center lg:flex-row lg:gap-2">
          <div className="relative h-64 w-full max-w-60">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  stroke="none"
                >
                  {statusData.map((item) => (
                    <Cell
                      key={item.key}
                      fill={item.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, _name, props) => [
                    `${value} invoice${
                      Number(value) === 1 ? "" : "s"
                    } (${props.payload.percentage}%)`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">
                {totalInvoices}
              </span>

              <span className="text-xs text-muted-foreground">
                Total invoices
              </span>
            </div>
          </div>

          <div className="mt-6 w-full flex-1 space-y-4 lg:mt-0">
            {statusData.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-0.5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <span className="text-xs">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-0">
                  <span className="text-sm font-semibold">
                    {item.value}
                  </span>

                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}