"use client";

import { motion } from "motion/react";

export function AuthBackground() {
  return (
    <>
      {/* Background */}
      <div className="absolute inset-0 bg-background" />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Top Glow */}
      <motion.div
        animate={{
           x: [-30, 40, -30],
          y: [-20, 30, -20],
          // scale: [1, 1.15, 1],
          // opacity: [0.35, 0.6, 0.35],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-0 top-0 h-[450px] w-[450px] rounded-full bg-[#2EAFB4]/20 blur-[140px]"
      />

      {/* Bottom Glow */}
      <motion.div
        animate={{
            x: [20, -30, 20],
          y: [40, -30, 40],
          // scale: [1.1, 1, 1.1],
          // opacity: [0.25, 0.5, 0.25],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-400/20 blur-[180px]"
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-[#2EAFB4]/40"
            style={{
              left: `${(i * 13) % 100}%`,
              top: `${(i * 17) % 100}%`,
            }}
            animate={{
              y: [0, -25, 0],
              opacity: [0.25, 0.8, 0.25],
            }}
            transition={{
              duration: 5 + (i % 4),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </>
  );
}