"use client";

import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

interface AuthSuccessProps {
  title?: string;
  description?: string;
}

export function AuthSuccess({
  title = "Success!",
  description = "Redirecting...",
}: AuthSuccessProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="rounded-full bg-[#2EAFB4]/10 p-5">
        <CheckCircle2 className="h-12 w-12 text-[#2EAFB4]" />
      </div>

      <h2 className="mt-6 text-3xl font-bold">
        {title}
      </h2>

      <p className="mt-3 text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
}