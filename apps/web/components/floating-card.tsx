"use client";

import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface FloatingCardProps {
  title: string;
  value?: string;
  subtitle?: string;
  icon: LucideIcon;
  className?: string;
}

export function FloatingCard({
  title,
  value,
  subtitle,
  icon: Icon,
  className,
}: FloatingCardProps) {
  return (
    <motion.div
      animate={{
        y: [-8, 8, -8],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.04,
      }}
      className={`absolute rounded-2xl border border-white/10 bg-background/75 p-4 shadow-2xl backdrop-blur-2xl ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#2EAFB4]/15 p-2 text-[#2EAFB4]">
          <Icon size={18} />
        </div>

        <div>
          <p className="text-sm font-medium">{title}</p>

          {value && (
            <p className="text-xl font-bold">{value}</p>
          )}

          {subtitle && (
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}