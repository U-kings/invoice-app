"use client"

import { useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "motion/react"
import { Button } from "@workspace/ui/components/button"

import { TestimonialCard } from "./testimonial-card"

const testimonials = [
  {
    name: "David Okafor",
    role: "Founder",
    company: "TechNova",
    image: "/avatars/avatar-1.png",
    quote:
      "InvoiceFlow transformed how we bill clients. We get paid faster and spend far less time chasing invoices.",
  },
  {
    name: "Sarah Mitchell",
    role: "COO",
    company: "BrightWorks",
    image: "/avatars/avatar-2.png",
    quote:
      "The automated reminders alone saved us hours every week. Absolutely worth it.",
  },
  {
    name: "James Carter",
    role: "CEO",
    company: "Acme Corp",
    image: "/avatars/avatar-3.png",
    quote:
      "Beautiful UI, powerful features and fantastic customer support. Highly recommended.",
  },
  {
    name: "Grace Wilson",
    role: "Founder",
    company: "Studio One",
    image: "/avatars/avatar-4.png",
    quote:
      "Recurring invoices have completely automated our monthly billing process.",
  },
]

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
  })

  useEffect(() => {
    if (!emblaApi) return

    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [emblaApi])

  return (
    <section className="py-28" id="testimonials">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="text-sm font-semibold tracking-[0.35em] text-[#2EAFB4] uppercase">
            Testimonials
          </p>

          <h2 className="mt-5 text-4xl font-bold md:text-5xl">
            Loved by businesses worldwide
          </h2>
        </motion.div>

        <div className="relative">
          <div className="pointer-events-none absolute top-1/2 -left-14 z-10 hidden -translate-y-1/2 rounded-full lg:flex">
            <Button
              size="icon"
              variant="ghost"
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              className="pointer-events-auto rounded-full"
            >
              <ChevronLeft />
            </Button>
          </div>

          <div className="pointer-events-none absolute top-1/2 -right-14 z-10 hidden -translate-y-1/2 rounded-full lg:flex">
            <Button
              size="icon"
              type="button"
              variant="ghost"
              onClick={() => emblaApi?.scrollNext()}
              className="pointer-events-auto rounded-full"
            >
              <ChevronRight />
            </Button>
          </div>

          <div className="overflow-hidden px-0 py-16" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="min-w-0 flex-[0_0_100%] px-3 md:flex-[0_0_50%] xl:flex-[0_0_33.333%]"
                >
                  <TestimonialCard {...testimonial} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
