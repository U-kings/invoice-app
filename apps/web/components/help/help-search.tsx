"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRight, Search, X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"

import { helpCategories } from "@/lib/help/help-content"
import { HelpSearchHighlight } from "./help-search-highlight"

type SearchResult = {
  article: (typeof helpCategories)[number]["articles"][number]
  category: (typeof helpCategories)[number]
}

export function HelpSearch() {
  const [query, setQuery] = useState("")

  const normalizedQuery = query.trim().toLowerCase()

  const results = useMemo<SearchResult[]>(() => {
    if (!normalizedQuery) {
      return []
    }

    const matches: SearchResult[] = []

    for (const category of helpCategories) {
      for (const article of category.articles) {
        const searchableText = [
          article.title,
          article.description,
          ...article.content,
          category.title,
          category.description,
        ]
          .join(" ")
          .toLowerCase()

        if (searchableText.includes(normalizedQuery)) {
          matches.push({
            article,
            category,
          })
        }
      }
    }

    return matches
  }, [normalizedQuery])

  const isSearching = normalizedQuery.length > 0

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for help with invoices, payments, billing..."
          className="h-14 rounded-xl pr-12 pl-12 text-base shadow-sm"
          aria-label="Search help articles"
        />

        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQuery("")}
            className="absolute top-1/2 right-2 size-10 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {isSearching && (
        <div className="mt-6">
          {results.length > 0 ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">
                  {results.length} {results.length === 1 ? "result" : "results"}{" "}
                  for{" "}
                  <mark className="rounded-sm bg-primary/15 px-1 font-semibold text-primary">
                    “{query}”
                  </mark>
                </p>
              </div>

              <div className="space-y-3">
                {results.map(({ article, category }) => (
                  <Link
                    key={`${category.slug}-${article.slug}`}
                    href={`/dashboard/help/${category.slug}/${article.slug}`}
                    className="group block"
                  >
                    <Card className="p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 text-left">
                          <p className="mb-1 text-xs font-medium tracking-wide text-primary uppercase">
                            {category.title}
                          </p>

                          <h3 className="font-semibold">
                            <HelpSearchHighlight
                              text={article.title}
                              query={query}
                            />
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            <HelpSearchHighlight
                              text={article.description}
                              query={query}
                            />
                          </p>
                        </div>

                        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <Card className="p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                <Search className="size-5 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">No articles found</h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                We couldn&apos;t find anything matching &quot;{query}&quot;. Try
                searching for something like invoices, customers, payments, or
                billing.
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-5"
                onClick={() => setQuery("")}
              >
                Clear search
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
