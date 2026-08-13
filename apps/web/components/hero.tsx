"use client"

import { motion } from "motion/react"
import { Dashboard } from "./dashboard"
import { HeroLeft } from "./hero-left"
import { BackgroundGlow } from "./background-glow"
import { useEffect, useMemo, useRef, useState } from "react"

const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  left: `${(i * 7 + 13) % 100}%`,
  top: `${(i * 11 + 17) % 100}%`,
  duration: 4 + (i % 5),
}))

const particles2 = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 4 + Math.random() * 5,
  // id: i,
  // left: `${(i * 7 + 5) % 100}`,
  // top: `${(i * 14 + 35) % 100}`,
  // duration: 4 + (i % 5),
}))

export function Hero() {
  const [isMounted, setIsMounted] = useState<boolean>(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <section className="relative overflow-hidden" id="home">
        <BackgroundGlow />
        <div className="absolute inset-0 overflow-hidden"></div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden" id="home">
      <BackgroundGlow />

      <div className="absolute inset-0 overflow-hidden">
        {/* {[...Array(15)].map((particle, i) => ( */}
        {particles2.map((particle, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[#2EAFB4]/40"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + particle.duration * 4,
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
      <div className="relative mx-auto mb-0 flex min-h-screen max-w-7xl flex-col items-center gap-16 px-4 pt-32 lg:flex-row lg:px-6">
        <HeroLeft />

        <Dashboard />
      </div>
    </section>
  )
}
