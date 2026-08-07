"use client"

import Link from "next/link"
import { Menu, ChevronDown, ArrowRight } from "lucide-react"
import { motion } from "motion/react"

import { Logo } from "./logo"
import { ThemeToggle } from "./theme-toggle"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet"

import { Button } from "@workspace/ui/components/button"
import { useEffect, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"

// const links = ["Features", "Pricing", "Integrations", "Resources", "FAQ"]

const links = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "Integrations",
    href: "#integrations",
  },
  {
    label: "Pricing",
    href: "#pricing",
  },
  // {
  //   label: "Testimonials",
  //   href: "#testimonials",
  // },
  {
    label: "Resources",
    href: "#resources",
  },
  {
    label: "FAQ",
    href: "#faq",
  },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    handleScroll()

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const [activeSection, setActiveSection] = useState("home")

  useEffect(() => {
    const sections = document.querySelectorAll("section[id], footer[id]")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        root: null,
        threshold: 0.5,
      }
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  console.log("Active Section:", activeSection)

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled &&
          "border-b border-border/40 bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60"
        // "border-b border-border/50 bg-background/80 shadow-lg backdrop-blur-xl"
      )}
    >
      <div className="mx-auto flex h-20 w-full items-center justify-between px-4 md:px-6">
        {/* <div className="mx-auto w-full flex h-20 max-w-7xl items-center justify-between px-6 bg-white"> */}
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between">
          <Logo />

          <nav className="hidden items-center gap-10 lg:flex">
            {links.map((item) => {
              const id = item.href.replace("#", "")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative py-2 text-sm font-medium transition hover:text-[#2EAFB4]",
                    activeSection === id && "text-[#2EAFB4]"
                  )}
                >
                  <span className="flex items-center gap-1">
                    {item.label}
                    {item.label === "Resources" && <ChevronDown size={15} />}
                  </span>
                  {activeSection === id && (
                    <motion.span
                      layoutId="active-nav"
                      className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#2EAFB4]"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>

            <ThemeToggle />

            <motion.div
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <Button className="rounded-xl bg-[#2EAFB4]">
                <Link
                  href="/signup"
                  // className="mx-0 mt-4 rounded-xl border text-center"
                >
                  Get Started
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger>
                {/* <Button size="icon" variant="ghost"> */}
                <div className="p-4">
                  <Menu />
                </div>
                {/* </Button> */}
              </SheetTrigger>

              <SheetContent side="right">
                <div className="mt-10 flex flex-col gap-5 px-6 py-4">
                  {links.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ))}

                  <Button
                    variant="ghost"
                    className="mt-8 h-10 rounded-xl bg-white/10 py-4 text-center"
                  >
                    <Link
                      href="/login"
                      // className=""
                    >
                      Login
                    </Link>
                  </Button>

                  <Button className="mt-0 h-10 rounded-xl bg-[#2EAFB4]">
                    <Link
                      href="/signup"
                      // className="mx-0 mt-4 rounded-xl border text-center"
                    >
                      Get Started
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
