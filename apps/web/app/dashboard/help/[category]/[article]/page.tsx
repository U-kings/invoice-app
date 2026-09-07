import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BookOpen } from "lucide-react"

import { getHelpArticle, getHelpCategory } from "@/lib/help/help-content"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

type HelpArticlePageProps = {
  params: Promise<{
    category: string
    article: string
  }>
}

export default async function HelpArticlePage({
  params,
}: HelpArticlePageProps) {
  const { category: categorySlug, article: articleSlug } = await params

  const category = getHelpCategory(categorySlug)

  if (!category) {
    notFound()
  }

  const article = getHelpArticle(categorySlug, articleSlug)

  if (!article) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      {/* Back */}
      <Button
        nativeButton={false}
        render={<Link href={`/dashboard/help/${category.slug}`} />}
        variant="ghost"
        className="-ml-2"
      >
        <ArrowLeft className="mr-2 size-4" />
        {category.title}
      </Button>

      {/* Article */}
      <article>
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
          <BookOpen className="size-5 text-primary" />
        </div>

        <p className="mt-6 text-sm font-medium text-primary">
          {category.title}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {article.title}
        </h1>

        <p className="mt-3 text-base leading-7 text-muted-foreground">
          {article.description}
        </p>

        <Card className="mt-8">
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-6">
              {article.content.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-sm leading-7 text-foreground/90 sm:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </article>

      {/* Footer navigation */}
      <div className="border-t pt-6">
        <Link
          href={`/dashboard/help/${category.slug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← More articles in {category.title}
        </Link>
      </div>
    </div>
  )
}
