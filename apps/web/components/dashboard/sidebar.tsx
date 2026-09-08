"use client"

import Link from "next/link"

import { navLinks } from "./nav-links"
import { NavItem } from "./nav-item"
import { Logo } from "../logo"
import { Button } from "@workspace/ui/components/button"
import { useBilling } from "@/hooks/use-billing"

export function Sidebar() {
  const { data } = useBilling()

  const isPro =
    data?.subscription.plan === "PRO" && data.subscription.status === "ACTIVE"
  
  return (
    <aside className="fixed top-0 left-0 hidden h-screen w-72 border-r bg-background/80 backdrop-blur-xl lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center border-b px-8">
        <div className="flex items-center gap-3">
          {/* <Link href="/" className="flex items-center gap-3"> */}
          {/* <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2EAFB4] text-lg font-bold text-white">
            I
          </div> */}

          <div>
            {/* <p className="text-lg font-bold">
              InvoiceFlow
            </p> */}
            <Logo />

            <p className="ml-10 text-xs text-muted-foreground">
              Business Dashboard
            </p>
          </div>
          {/* </Link> */}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-5">
        {navLinks.map((item) => {
          if ((item.title === "Reports" || item.title === "Payments") && !isPro) {
            return
          } else {
            return <NavItem key={item.href} {...item} />
          }
        })}
      </nav>

      {/* Upgrade Card */}
      <div className="p-5">
        <div className="rounded-3xl border bg-linear-to-br from-[#2EAFB4]/10 to-transparent p-5">
          <h3 className="font-semibold">
            {isPro ? "Manage your plan" : "Upgrade to Pro"}
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            {isPro
              ? "View your subscription and billing."
              : "Unlock more features for your business."}
            {/* Unlock premium reports, automation, and team collaboration. */}
          </p>

          <Button
            nativeButton={false}
            render={<Link href="/dashboard/billing" />}
            className="mt-5 h-10 w-full rounded-xl bg-[#2EAFB4] py-3 font-medium text-white transition hover:bg-[#26969a] hover:opacity-90"
          >
            {isPro ? "Manage plan" : "Upgrade"}
            {/* Upgrade */}
          </Button>
        </div>
      </div>
    </aside>
  )
}
