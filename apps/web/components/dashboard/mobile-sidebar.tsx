"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu } from "lucide-react"
import { motion } from "motion/react"

import { navLinks } from "./nav-links"

import { cn } from "@workspace/ui/lib/utils"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"

import { Button } from "@workspace/ui/components/button"
import { Logo } from "../logo"

export function MobileSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        {/* <Button
          size="icon"
          variant="ghost"
          className="lg:hidden"
        > */}
        <div className="cursor-pointer lg:hidden">
          <Menu className="h-5 w-5" />
        </div>
        {/* </Button> */}
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle>
            <div
              // href="/dashboard"
              onClick={() => setOpen(false)}
              className="items-left flex flex-col gap-3"
            >
              {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2EAFB4] font-bold text-white">
                I
              </div> */}
              <Logo />

              <div>
                {/* <p className="text-lg font-bold">InvoiceFlow</p> */}

                <p className="ml-10 text-xs text-muted-foreground">
                  Business Dashboard
                </p>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-2 p-4">
          {navLinks.map((item, index) => {
            const active =
              pathname === item.href ||
              pathname?.includes(item.href?.split("/")[2] ?? "Default")
            const Icon = item.icon

            return (
              <motion.div
                key={item.href}
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: index * 0.05,
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 transition-colors",
                    active ? "bg-[#2EAFB4] text-white" : "hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />

                  <span>{item.title}</span>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <div className="mt-auto border-t p-4">
          <div className="rounded-2xl bg-[#2EAFB4]/10 p-4">
            <h3 className="font-semibold">Upgrade to Pro</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Unlock premium reports and automation.
            </p>

            <Button className="mt-4 w-full bg-[#2EAFB4] hover:bg-[#26969a]">
              Upgrade
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
