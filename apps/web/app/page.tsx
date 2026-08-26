"use client"
import { CTA } from "@/components/cta"
import { Features } from "@/components/features.old/features"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { Integrations } from "@/components/integraions.old/integrations"
import { Navbar } from "@/components/nav-bar"
import { Pricing } from "@/components/pricing.old/pricing"
import { StatsSection } from "@/components/stats.old/stats-section"
import { Testimonials } from "@/components/testimonials.old/testimonials"
import { usePathname } from "next/navigation"

export default function Page() {
  const pathname = usePathname()
  return (
    <main key={pathname} className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <StatsSection />
      <Integrations />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  )
}
