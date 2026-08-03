"use client"

import Link from "next/link"
import { motion } from "motion/react"

import {
  ArrowUpRight,
  Heart,
  Send,
  //   Github,
  //   Linkedin,
  //   Twitter,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { BsGithub, BsTwitterX } from "react-icons/bs"
import { LiaLinkedin } from "react-icons/lia"
import { Logo } from "./logo"

const footerLinks = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Integrations", "Updates"],
  },
  {
    title: "Resources",
    links: ["Blog", "Documentation", "Help Center", "Templates"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Contact Us", "Press"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Security"],
  },
]

const socials = [
  {
    icon: BsTwitterX,
    href: "#",
  },
  {
    icon: LiaLinkedin,
    href: "#",
  },
  {
    icon: BsGithub,
    href: "#",
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background" id="contact">
      <div className="mx-auto max-w-7xl px-4 lg:px-6 pt-20 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)_1.2fr]">
          {/* Logo */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* <Link href="/" className="flex items-center gap-3"> */}
              <Logo />
              {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2EAFB4] text-lg font-bold text-white">
                S
              </div>

              <span className="text-3xl font-bold">
                InvoiceFlow
              </span> */}
            {/* </Link> */}

            <p className="mt-6 max-w-xs leading-8 text-muted-foreground">
              The modern invoicing platform for businesses that want to get paid
              faster and grow smarter.
            </p>

            <div className="mt-8 flex gap-3">
              {socials.map(({ icon: Icon, href }, index) => (
                <Button
                  key={href + Icon.name + index}
                  variant="ghost"
                  size="icon"
                  //   asChild
                  className="rounded-full"
                >
                  <Link href={href}>
                    <Icon className="h-5 w-5" />
                  </Link>
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Links */}

          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.08,
              }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold">{section.title}</h3>

              <ul className="mt-6 space-y-4">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="group inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}

                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Newsletter */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.35,
            }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold">Newsletter</h3>

            <p className="mt-6 text-muted-foreground">
              Get the latest updates and tips.
            </p>

            <div className="relative mt-6">
              <Input placeholder="Enter your email" className="h-12 pr-14" />

              <Button
                size="icon"
                className="absolute top-1 right-1 h-10 w-10 bg-[#2EAFB4] hover:bg-[#27999e]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Bottom */}

        <div className="mt-16 flex flex-col items-center justify-between gap-5 border-t border-border/60 pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} InvoiceFlow. All rights reserved.</p>

          <p className="flex items-center gap-2">
            Made with
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            for businesses
          </p>
        </div>
      </div>
    </footer>
  )
}
