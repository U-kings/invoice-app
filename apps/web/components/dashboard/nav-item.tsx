"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"

import { cn } from "@workspace/ui/lib/utils"
import { string } from "zod"

interface NavItemProps {
  href: string
  title: string
  icon: React.ElementType
}

export function NavItem({ href, title, icon: Icon }: NavItemProps) {
  const pathname = usePathname()

  // const active =
  //   pathname === href ||
  //   pathname.startsWith(`${href}/`);
  // const dashboardUrl: string = href?.split("/")[2] ?? ""
  const active = pathname === href || pathname?.includes(href?.split("/")[2] ?? "Default")
  return (
    <Link href={href}>
      <motion.div
        whileHover={{
          x: 4,
        }}
        whileTap={{
          scale: 0.98,
        }}
        className={cn(
          "group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300",
          active
            ? "bg-[#2EAFB4] text-white shadow-lg shadow-[#2EAFB4]/25"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5" />

        <span className="font-medium">{title}</span>
      </motion.div>
    </Link>
  )
}
