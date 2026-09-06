"use client"

import { motion } from "motion/react"

import { useDashboard } from "@/hooks/use-dashboard"

function formatRelativeTime(date: string) {
  const now = Date.now()
  const activityDate = new Date(date).getTime()
  const difference = now - activityDate

  const seconds = Math.floor(difference / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return "Just now"
  }

  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`
  }

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`
  }

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function ActivityFeed() {
  const { data, isLoading, isError } = useDashboard()

  const activities = data?.activity ?? []

  return (
    <div className="h-full rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl">
      <h2 className="mb-6 text-xl font-semibold">
        Activity
      </h2>

      {isLoading ? (
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex gap-4"
            >
              <div className="mt-2 h-3 w-3 shrink-0 animate-pulse rounded-full bg-muted" />

              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex min-h-56 items-center justify-center text-sm text-muted-foreground">
          Unable to load activity.
        </div>
      ) : activities.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center text-center">
          <p className="font-medium">
            No activity yet
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Your recent activity will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{
                opacity: 0,
                x: 20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: index * 0.1,
              }}
              className="flex gap-4"
            >
              <div className="mt-2 h-3 w-3 shrink-0 rounded-full bg-[#2EAFB4]" />

              <div className="min-w-0">
                <p className="font-medium">
                  {activity.title}
                </p>

                {activity.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                )}

                <p className="mt-1 text-sm text-muted-foreground">
                  {formatRelativeTime(activity.date)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}