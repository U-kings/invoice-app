"use client";

import { motion } from "motion/react";
import { IconType } from "react-icons";
import { cn } from "@workspace/ui/lib/utils";

interface IntegrationCardProps {
  name: string;
  icon: IconType;
  color: string;
}

export function IntegrationCard({
  name,
  icon: Icon,
  color,
}: IntegrationCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.03,
      }}
      transition={{
        duration: 0.25,
      }}
      className={cn(
        "group relative overflow-hidden",
        "rounded-3xl border border-border/60",
        "bg-card/60 backdrop-blur-xl",
        "p-8",
        "flex h-36 items-center justify-center",
        "hover:border-[#2EAFB4]/40",
        "hover:shadow-[0_20px_60px_rgba(46,175,180,.15)]"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#2EAFB4]/0 via-[#2EAFB4]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-center gap-2">
        <Icon
          size={32}
        //   size={42}
          style={{ color }}
          className="transition-transform duration-300 group-hover:scale-110"
        />

        <span className="text-2xl font-bold">
          {name}
        </span>
      </div>
    </motion.div>
  );
}