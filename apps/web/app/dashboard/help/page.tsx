"use client"

import { useState } from "react"
import { motion } from "motion/react"
import {
  ArrowRight,
  BookOpen,
  CreditCard,
  FileText,
  HelpCircle,
  Lock,
  Mail,
  MessageCircle,
  Search,
  Users,
} from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { helpCategories } from "@/lib/help/help-content"
import Link from "next/link"
import { HelpSearch } from "@/components/help/help-search"

const popularQuestions = [
  "How do I create an invoice?",
  "How do I send an invoice to a customer?",
  "How do invoice reminders work?",
  "How do I upgrade to Pro?",
  "How do I change my business information?",
  "How do I download an invoice as a PDF?",
]

export default function HelpPage() {
  const [search, setSearch] = useState("")

  const filteredQuestions = popularQuestions.filter((question) =>
    question.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 pb-10">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border bg-card"
      >
        <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative px-6 py-12 text-center sm:px-10 sm:py-16">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <HelpCircle className="size-6 text-primary" />
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            How can we help?
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Find answers, learn how Invoice Flow works, or get help with your
            account.
          </p>

          <div className="mx-auto mt-7 w-full max-w-xl">
            <HelpSearch />
          </div>
        </div>
      </motion.section>

      {/* Categories */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight">
            Browse help topics
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Find guides and answers by category.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {helpCategories.map((category, index) => {
            const Icon = category.icon

            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                }}
              >
                <Link
                  key={category.title}
                  href={`/dashboard/help/${category.slug}`}
                  className="group block h-full"
                >
                  <Card className="group h-full cursor-pointer transition-colors hover:border-primary/30">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="size-5 text-primary" />
                        </div>

                        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </div>

                      <h3 className="mt-5 font-semibold">{category.title}</h3>

                      <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                        {category.description}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {category.articles.length}{" "}
                        {category.articles.length === 1
                          ? "article"
                          : "articles"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Popular questions */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight">
            Popular questions
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Quick answers to some of the most common questions.
          </p>
        </div>

        <Card>
          <CardContent className="divide-y p-0">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50 sm:px-6"
                >
                  <span className="text-sm font-medium">{question}</span>

                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </button>
              ))
            ) : (
              <div className="px-6 py-10 text-center">
                <Search className="mx-auto size-6 text-muted-foreground" />

                <p className="mt-3 font-medium">No results found</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try searching with different keywords.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Support */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-primary/20 bg-primary/3">
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <MessageCircle className="size-5 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">Still need help?</h2>

                <p className="mt-1 max-w-lg text-sm leading-5 text-muted-foreground">
                  Can't find what you're looking for? Our support team is here
                  to help you get the most out of Invoice Flow.
                </p>
              </div>
            </div>

            <Button className="shrink-0">
              <Mail className="mr-2 size-4" />
              Contact support
            </Button>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  )
}
