"use client"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react"
import { motion } from "motion/react"

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const item = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  show: {
    opacity: 1,
    y: 0,
  },
}

export function HeroLeft() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-xl"
    >
      <motion.div variants={item}>
        <Badge className="rounded-full bg-[#2EAFB4]/15 px-4 py-4 text-[#2EAFB4]">
          ✨ New
          <span className="ml-2">Automated reminders are here!</span>
        </Badge>
      </motion.div>

      <motion.h1
        variants={item}
        className="mt-8 text-5xl leading-tight font-bold lg:text-6xl"
      >
        Send Invoices, Track Payments &{/* Create invoices that */}
        <span className="mt-2 block bg-gradient-to-r from-[#2EAFB4] to-cyan-400 bg-clip-text text-transparent">
          {/* actually get paid. */}
          Get Paid Faster
        </span>
      </motion.h1>

      <motion.p
        variants={item}
        className="mt-8 text-lg leading-8 text-muted-foreground"
      >
        Create invoices, accept payments via Paystack, and automatically send
        receipts to your customers — all in one place.
        {/* Accept payments, automate reminders, track every invoice and grow your
        business without chasing clients. */}
      </motion.p>

      <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
        <Button
          size="lg"
          className="rounded-xl bg-[#2EAFB4] px-8 hover:bg-[#26989d]"
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <Button size="lg" variant="outline" className="rounded-xl">
          <PlayCircle className="mr-2 h-5 w-5" />
          View Demo
        </Button>
      </motion.div>

      <motion.div
        variants={item}
        className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground"
      >
        {["No credit card", "Setup in 2 minutes", "Cancel anytime"].map(
          (text) => (
            <div key={text} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#2EAFB4]" />
              {text}
            </div>
          )
        )}
      </motion.div>
    </motion.div>
  )
}
