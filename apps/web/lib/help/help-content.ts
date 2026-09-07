import {
  BookOpen,
  CreditCard,
  FileText,
  Lock,
  Users,
} from "lucide-react"

export type HelpArticle = {
  slug: string
  title: string
  description: string
  content: string[]
}

export type HelpCategory = {
  slug: string
  title: string
  description: string
  icon: typeof BookOpen
  articles: HelpArticle[]
}

export const helpCategories: HelpCategory[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "Learn the basics and set up your Invoice Flow account.",
    icon: BookOpen,
    articles: [
      {
        slug: "getting-started",
        title: "Getting started with Invoice Flow",
        description:
          "Everything you need to know to get your account ready.",
        content: [
          "Welcome to Invoice Flow. This guide walks you through the basic steps for getting your account ready and creating your first invoice.",
          "Start by completing your business profile. Add your business name, contact information, country, and preferred currency. This information is used throughout your invoices.",
          "Next, add your customers. Keeping your customer information in Invoice Flow makes it easier to create and send invoices without repeatedly entering the same details.",
          "Once your profile and customers are ready, create your first invoice from the Invoices section.",
        ],
      },
    ],
  },
  {
    slug: "invoices",
    title: "Invoices",
    description: "Create, send, manage, and track your invoices.",
    icon: FileText,
    articles: [
      {
        slug: "create-invoice",
        title: "How to create an invoice",
        description:
          "Create a professional invoice for your customer.",
        content: [
          "Go to the Invoices section from your dashboard and select Create invoice.",
          "Select an existing customer or add a new customer. Then add the products or services you are billing for.",
          "Review the subtotal, discount, tax, and total amount before saving the invoice.",
          "You can save the invoice as a draft if you are not ready to send it yet, or send it when everything is complete.",
        ],
      },
      {
        slug: "send-invoice",
        title: "How to send an invoice",
        description:
          "Send an invoice directly to your customer's email.",
        content: [
          "Open the invoice you want to send from the Invoices section.",
          "Review the invoice details and make sure the customer's email address is correct.",
          "Choose the option to send the invoice. Invoice Flow will deliver the invoice to your customer.",
          "After sending, you can track the invoice status from your invoices list.",
        ],
      },
      {
        slug: "invoice-reminders",
        title: "How invoice reminders work",
        description:
          "Keep track of upcoming and overdue invoice payments.",
        content: [
          "Invoice reminders help you follow up with customers when an invoice is approaching or has passed its due date.",
          "Reminders are scheduled based on the invoice's due date and your configured reminder settings.",
          "When a reminder is due, Invoice Flow processes it automatically and sends the appropriate email.",
          "You can review reminder activity from the invoice and reminder management areas of your account.",
        ],
      },
      {
        slug: "download-invoice-pdf",
        title: "How to download an invoice as a PDF",
        description:
          "Download a professional PDF copy of your invoice.",
        content: [
          "Open the invoice you want to download.",
          "Choose the PDF or Download option from the invoice actions.",
          "Invoice Flow generates a PDF using the invoice information and your business details.",
          "The generated PDF can then be saved, shared, or printed.",
        ],
      },
    ],
  },
  {
    slug: "customers",
    title: "Customers",
    description:
      "Manage customer information and invoice relationships.",
    icon: Users,
    articles: [
      {
        slug: "manage-customers",
        title: "Managing your customers",
        description:
          "Add, update, and organize your customer information.",
        content: [
          "The Customers section gives you a central place to manage the people and businesses you invoice.",
          "You can add customer contact information and reuse it when creating invoices.",
          "Keeping customer information up to date helps ensure invoices and payment reminders are delivered correctly.",
        ],
      },
    ],
  },
  {
    slug: "payments",
    title: "Payments",
    description:
      "Understand payments, payment status, and payment options.",
    icon: CreditCard,
    articles: [
      {
        slug: "payment-status",
        title: "Understanding payment status",
        description:
          "Learn what the different payment statuses mean.",
        content: [
          "Invoice Flow tracks payment information associated with your invoices.",
          "A pending payment means that payment processing has started but has not yet been confirmed.",
          "Once payment is successfully confirmed, the invoice can be marked as paid.",
          "If a payment fails or expires, the invoice remains available for follow-up.",
        ],
      },
    ],
  },
  {
    slug: "billing",
    title: "Billing & Subscription",
    description:
      "Manage your plan, subscription, and billing details.",
    icon: CreditCard,
    articles: [
      {
        slug: "upgrade-to-pro",
        title: "How to upgrade to Pro",
        description:
          "Upgrade your Invoice Flow account to the Pro plan.",
        content: [
          "Open Billing from your dashboard settings.",
          "Select Upgrade to Pro to start the checkout process.",
          "You will be redirected to our payment provider to securely complete your subscription.",
          "After your payment is confirmed, your subscription will be activated and your account will receive Pro features.",
        ],
      },
      {
        slug: "manage-subscription",
        title: "Managing your subscription",
        description:
          "Understand your current plan and subscription status.",
        content: [
          "Your current subscription and plan are displayed on the Billing page.",
          "The Billing page shows your current plan, subscription status, billing period, and cancellation information when available.",
          "If you cancel your subscription, access remains available according to the terms of your current billing period.",
        ],
      },
    ],
  },
  {
    slug: "account-security",
    title: "Account & Security",
    description:
      "Manage your account, sessions, password, and security.",
    icon: Lock,
    articles: [
      {
        slug: "secure-your-account",
        title: "Keeping your account secure",
        description:
          "Best practices for protecting your Invoice Flow account.",
        content: [
          "Use a strong, unique password for your Invoice Flow account.",
          "Review your active sessions regularly and revoke sessions you do not recognize.",
          "Keep your email address up to date so you can receive important account notifications.",
          "If you believe someone has accessed your account, change your password and review your active sessions immediately.",
        ],
      },
    ],
  },
]

export function getHelpCategory(slug: string) {
  return helpCategories.find((category) => category.slug === slug)
}

export function getHelpArticle(
  categorySlug: string,
  articleSlug: string,
) {
  const category = getHelpCategory(categorySlug)

  return category?.articles.find(
    (article) => article.slug === articleSlug,
  )
}