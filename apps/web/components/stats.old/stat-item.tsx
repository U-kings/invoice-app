"use client";

import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface StatItemProps {
  icon: LucideIcon;
  value: string;
  label: string;
  color?: "teal" | "blue";
}

export function StatItem({
  icon: Icon,
  value,
  label,
  color = "teal",
}: StatItemProps) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group relative flex items-center gap-5 rounded-2xl p-4"
    >
      {/* Icon */}

      <div
        className={cn(
          "relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full",
          color === "teal"
            ? "bg-[#2EAFB4]/15"
            : "bg-indigo-500/15"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            color === "teal"
              ? "bg-[#2EAFB4]/20"
              : "bg-indigo-500/20"
          )}
        />

        <Icon
          className={cn(
            "relative z-10 h-9 w-9",
            color === "teal"
              ? "text-[#2EAFB4]"
              : "text-indigo-500"
          )}
        />
      </div>

      {/* Text */}

      <div>
        <h3 className="text-5xl font-bold tracking-tight">
          {value}
        </h3>

        <p className="mt-2 text-lg text-muted-foreground">
          {label}
        </p>
      </div>
    </motion.div>
  );
}