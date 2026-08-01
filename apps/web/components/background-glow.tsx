"use client";

import { motion } from "motion/react";

export function BackgroundGlow() {
  return (
    <>
      <motion.div
        animate={{
          x: [-30, 40, -30],
          y: [-20, 30, -20],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-0 top-10 h-72 w-72 rounded-full bg-[#2EAFB4]/20 blur-[120px]"
      />

      <motion.div
        animate={{
          x: [20, -30, 20],
          y: [40, -30, 40],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-[140px]"
      />
    </>
  );
}