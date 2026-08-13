"use client"
import { CTA } from "@/components/cta"
import { Features } from "@/components/Features/features"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { Integrations } from "@/components/Integraions/integrations"
import { Navbar } from "@/components/nav-bar"
import { Pricing } from "@/components/Pricing/pricing"
import { StatsSection } from "@/components/Stats/stats-section"
import { Testimonials } from "@/components/Testimonials/testimonials"
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
