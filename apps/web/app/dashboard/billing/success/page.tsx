"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, Check, CreditCard, Sparkles } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { useSubscriptionSync } from "@/hooks/use-subscription-sync"
import { useEffect, useRef } from "react"
import { useAuthStore } from "@/app/store/useAuthStore"

export default function SubscriptionSuccessPage() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const { sync, isSyncing, error } = useSubscriptionSync()
  const runsRef = useRef(false) // Prevents strict-mode double firing in development

  useEffect(() => {
    if (runsRef.current) return
    runsRef.current = true

    async function handlePaymentVerification() {
      const result = await sync()

      if (result.success) {
        // setAuth(data.user, data.access_token)
        // If your frontend uses a state manager like Zustand/Context,
        // trigger your user state update method right here:
        // updateUserState({ subscriptionStatus: result.subscriptionStatus })
        // Redirect directly to the newly unlocked reports space
        // router.push("/dashboard/reports")
      }
    }

    handlePaymentVerification()
  }, [sync])

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-0">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="overflow-hidden border-border/60 shadow-xl shadow-black/5">
            <CardContent className="px-6 py-12 sm:px-10 sm:py-14">
              <div className="flex flex-col items-center text-center">
                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.15,
                    duration: 0.45,
                    type: "spring",
                    stiffness: 180,
                  }}
                  className="relative mb-7"
                >
                  <div className="flex size-20 items-center justify-center rounded-full bg-[#2EAFB4]/10">
                    <div className="flex size-14 items-center justify-center rounded-full bg-[#2EAFB4] text-white shadow-lg shadow-[#2EAFB4]/25">
                      <Check className="size-7 stroke-3" />
                    </div>
                  </div>

                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.45,
                      duration: 0.35,
                      type: "spring",
                    }}
                    className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full border-4 border-background bg-foreground text-background"
                  >
                    <Sparkles className="size-3.5" />
                  </motion.div>
                </motion.div>

                {/* Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                >
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    You&apos;re all set!
                  </h1>

                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                    Your Invoice Flow subscription has been activated
                    successfully. You now have access to all the features
                    included in your plan.
                  </p>
                </motion.div>

                {/* Subscription summary */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="mt-8 w-full max-w-md"
                >
                  <div className="rounded-xl border bg-muted/40 p-5 text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                        <CreditCard className="size-5 text-[#2EAFB4]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          Subscription activated
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Your account is ready to use
                        </p>
                      </div>

                      <span className="rounded-full bg-[#2EAFB4]/10 px-2.5 py-1 text-xs font-medium text-[#248d91] dark:text-[#65d5d8]">
                        Active
                      </span>
                    </div>

                    <div className="mt-5 border-t pt-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-[#2EAFB4]/10">
                          <Check className="size-3 text-[#2EAFB4]" />
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Your new subscription benefits are now available
                          across your Invoice Flow account.
                        </p>
                      </div>

                      <div className="mt-3 flex items-start gap-3">
                        <div className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-[#2EAFB4]/10">
                          <Check className="size-3 text-[#2EAFB4]" />
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Your billing and subscription details can be managed
                          from your billing page.
                          {/* from your account settings. */}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                  className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
                >
                  <Button
                    nativeButton={false}
                    render={<Link href="/dashboard" />}
                    size="lg"
                    className="h-11 px-6 shadow-sm"
                  >
                    Go to dashboard
                    <ArrowRight className="ml-2 size-4" />
                  </Button>

                  <Button
                    nativeButton={false}
                    render={<Link href="/dashboard/billing" />}
                    variant="outline"
                    size="lg"
                    className="h-11 px-6"
                  >
                    Manage subscription
                  </Button>
                </motion.div>

                {/* Footer message */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="mt-7 text-xs text-muted-foreground"
                >
                  Thanks for choosing Invoice Flow.
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
