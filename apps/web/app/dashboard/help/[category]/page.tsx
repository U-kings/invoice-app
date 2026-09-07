import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react"

import { getHelpCategory } from "@/lib/help/help-content"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

type HelpCategoryPageProps = {
  params: Promise<{
    category: string
  }>
}

export default async function HelpCategoryPage({
  params,
}: HelpCategoryPageProps) {
  const { category: categorySlug } = await params

  const category = getHelpCategory(categorySlug)

  if (!category) {
    notFound()
  }

  const Icon = category.icon

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-10">
      {/* Back */}
      <Button
        nativeButton={false}
        render={<Link href="/dashboard/help" />}
        variant="ghost"
        className="-ml-2"
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to Help Center
      </Button>

      {/* Header */}
      <div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          {category.title}
        </h1>

        <p className="mt-2 text-muted-foreground">{category.description}</p>
      </div>

      {/* Articles */}
      <div className="space-y-3">
        {category.articles.map((article) => (
          <Link
            key={article.slug}
            href={`/dashboard/help/${category.slug}/${article.slug}`}
            className="group block"
          >
            <Card className="transition-colors group-hover:border-primary/30">
              <CardContent className="flex items-center justify-between gap-5 p-5">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <BookOpen className="size-4 text-muted-foreground" />
                  </div>

                  <div>
                    <h2 className="font-medium">{article.title}</h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {article.description}
                    </p>
                  </div>
                </div>

                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Support */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Still need help?</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you couldn't find the answer you're looking for, contact our
            support team.
          </p>

          <Button
            className="mt-4"
            nativeButton={false}
            render={<Link href="/dashboard/help" />}
          >
            Return to Help Center
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
