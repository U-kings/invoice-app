"use client";

import { Lock } from "lucide-react";
import { motion } from "motion/react";

export function TrustBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.4,
      }}
      className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"
    >
      <Lock className="h-4 w-4 text-[#2EAFB4]" />

      <span>Your data is encrypted and secure.</span>
    </motion.div>
  );
}