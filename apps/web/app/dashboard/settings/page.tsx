import Link from "next/link"
import {
  ArrowRight,
  Bell,
  Building2,
  CreditCard,
  FileText,
  Lock,
  User,
} from "lucide-react"

import { Card, CardContent } from "@workspace/ui/components/card"

const settingsSections = [
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        description: "Manage your personal account information.",
        href: "/dashboard/settings/profile",
        icon: User,
      },
      {
        title: "Security",
        description: "Manage your password and account security.",
        href: "/dashboard/settings/security",
        icon: Lock,
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        title: "Business profile",
        description:
          "Update your business information and default preferences.",
        href: "/dashboard/settings/business",
        icon: Building2,
      },
    ],
  },
  {
    title: "Invoicing",
    items: [
      {
        title: "Invoice settings",
        description: "Configure invoice defaults and numbering.",
        href: "/dashboard/settings/invoices",
        icon: FileText,
      },
      {
        title: "Invoice reminders",
        description: "Configure automatic payment reminders.",
        href: "/dashboard/settings/reminders",
        icon: Bell,
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        title: "Payment settings",
        description: "Manage payment methods and payment preferences.",
        href: "/dashboard/settings/payments",
        icon: CreditCard,
      },
    ],
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, business, invoicing, and payment settings.
        </p>
      </div>

      <div className="space-y-8">
        {settingsSections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-sm font-medium">
              {section.title}
            </h2>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {section.items.map((item) => {
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-center gap-4 p-5 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                          <Icon className="size-5 text-muted-foreground" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            {item.title}
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>

                        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        ))}
      </div>
    </div>
  )
}