"use client"

import {
  Check,
  CreditCard,
  CalendarDays,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { useBilling } from "@/hooks/use-billing"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { useCreateCheckout } from "@/hooks/use-create-checkout"
import { cn } from "@workspace/ui/lib/utils"
import { useRouter } from "next/navigation"

export default function BillingPage() {
  const checkoutMutation = useCreateCheckout()
  const { data, isLoading, isError } = useBilling()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border p-6">
        <h2 className="font-semibold">Unable to load billing information</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Please refresh the page and try again.
        </p>
      </div>
    )
  }

  const subscription = data.subscription
  const isPro = subscription.plan === "PRO" && subscription.status === "ACTIVE"

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>

        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Manage your subscription, payment method, and billing history.
        </p>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Current plan</CardTitle>

              <CardDescription>
                Your current Invoice Flow subscription.
              </CardDescription>
            </div>

            <div className="rounded-full border px-3 py-1 text-xs font-medium">
              {subscription.status}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="size-6 text-primary" />
              </div>

              <div>
                <p className="text-lg font-semibold">
                  {isPro ? "Pro" : "Free"}
                </p>

                <p className="text-sm text-muted-foreground">
                  {isPro
                    ? "You're on the Pro plan."
                    : "You're currently using the Free plan."}
                </p>
              </div>
            </div>

            {!isPro && (
              <Button
                onClick={() => checkoutMutation.mutate()}
                disabled={checkoutMutation.isPending}
                className="h-10 px-4"
              >
                {checkoutMutation.isPending
                  ? "Redirecting..."
                  : "Upgrade to Pro"}
              </Button>
            )}
          </div>

          {subscription.cancelAtPeriodEnd && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Your Pro subscription is scheduled to end at the end of your
              current billing period.
            </div>
          )}

          {subscription.currentPeriodEnd && (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />

              <span>
                Current billing period ends{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <section>
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Plans</h2>

          <p className="text-sm text-muted-foreground">
            Choose the plan that fits your business.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Free */}
          <Card className={cn(!isPro && "border-primary/30")}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Free</CardTitle>

                  <CardDescription className="mt-1">
                    Everything you need to get started.
                  </CardDescription>
                </div>

                {!isPro && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Current plan
                  </span>
                )}
              </div>

              <div className="pt-4">
                <span className="text-3xl font-bold">₦0</span>

                <span className="ml-1 text-sm text-muted-foreground">
                  /month
                </span>
              </div>
            </CardHeader>

            <CardContent className="flex h-full flex-col justify-between">
              <ul className="space-y-3 text-sm">
                {[
                  "Create invoices",
                  "Manage customers",
                  "Invoice PDFs",
                  "Invoice reminders",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                    {feature === "Create invoices" && (
                      <span className="text-xs text-gray-400">
                        (5 invoices/month)
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              {!isPro && (
                <Button variant="outline" className="mt-6 h-12 w-full" disabled>
                  Current plan
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro */}
          <Card
            className={cn(
              "relative overflow-hidden",
              isPro ? "border-primary/50 shadow-sm" : "border-primary/30"
            )}
          >
            {!isPro ? (
              <div className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Recommended
              </div>
            ) : (
              <div className="absolute top-4 right-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Current plan
              </div>
            )}

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pro
                <Sparkles className="size-4 text-primary" />
              </CardTitle>

              <CardDescription>
                Advanced tools for growing businesses.
              </CardDescription>

              <div className="pt-4">
                <span className="text-3xl font-bold">₦5000</span>

                <span className="ml-1 text-sm text-muted-foreground">
                  /month
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 text-sm">
                {[
                  "Everything in Free",
                  "Advanced reports",
                  "Priority invoice reminders",
                  "Advanced payment options",
                  "Business insights",
                  "Priority support",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isPro ? (
                <Button
                  variant="outline"
                  className="mt-6 h-12 w-full"
                  onClick={() => router.push("/dashboard/settings/billing")}
                >
                  Manage subscription
                </Button>
              ) : (
                <Button
                  className="mt-6 h-12 w-full"
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending
                    ? "Redirecting..."
                    : "Upgrade to Pro"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Payment method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            Payment method
          </CardTitle>

          <CardDescription>
            Your saved payment method will appear here.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isPro ? (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Payment method</p>

                <p className="text-sm text-muted-foreground">
                  Manage your payment method through your billing provider.
                </p>
              </div>

              <Button variant="outline" className="h-10">
                Update
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <CreditCard className="mx-auto size-6 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">No payment method</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Upgrade to Pro to add a payment method.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-5" />
            Billing history
          </CardTitle>

          <CardDescription>
            Your subscription invoices and receipts will appear here.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Receipt className="mx-auto size-7 text-muted-foreground" />

            <p className="mt-3 font-medium">No billing history yet</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Subscription invoices will appear here after your first Pro
              payment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="size-5 text-primary" />
          </div>

          <div>
            <p className="font-medium">Secure billing</p>

            <p className="text-sm text-muted-foreground">
              Payment information is handled securely by our payment provider.
              Invoice Flow does not store your full card details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
