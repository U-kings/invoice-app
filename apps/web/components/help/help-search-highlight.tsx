import type { ReactNode } from "react"

type HelpSearchHighlightProps = {
  text: string
  query: string
}

export function HelpSearchHighlight({
  text,
  query,
}: HelpSearchHighlightProps): ReactNode {
  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return text
  }

  const escapedQuery = normalizedQuery.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  )

  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"))

  return parts.map((part, index) => {
    const isMatch = part.toLowerCase() === normalizedQuery.toLowerCase()

    if (!isMatch) {
      return <span key={index}>{part}</span>
    }

    return (
      <mark
        key={index}
        className="rounded-sm bg-primary/15 px-0.5 font-semibold text-primary"
      >
        {part}
      </mark>
    )
  })
}