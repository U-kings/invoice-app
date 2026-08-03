"use client"

import { motion } from "motion/react"
import { Dashboard } from "./dashboard"
import { HeroLeft } from "./hero-left"
import { BackgroundGlow } from "./background-glow"

const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  left: `${(i * 7 + 13) % 100}%`,
  top: `${(i * 11 + 17) % 100}%`,
  duration: 4 + (i % 5),
}))

export function Hero() {
  return (
    <section className="relative overflow-hidden" id="home">
      <BackgroundGlow />

      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[#2EAFB4]/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute h-1 w-1 rounded-full bg-[#2EAFB4]/40"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative mx-auto mb-0 flex min-h-screen max-w-7xl flex-col items-center gap-16 px-4 lg:px-6 pt-32 lg:flex-row">
        <HeroLeft />

        <Dashboard />
      </div>
    </section>
  )
}
