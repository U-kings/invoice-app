import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { prisma } from "@repo/db"

type ReportPeriod = "7d" | "30d" | "90d" | "12m"

interface AuthPayload {
  userId: string
}

function getPeriodStart(period: ReportPeriod) {
  const now = new Date()

  switch (period) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    case "12m": {
      const date = new Date(now)
      date.setMonth(date.getMonth() - 12)
      return date
    }

    case "30d":
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
}

function getPeriod(period: string | null): ReportPeriod {
  if (
    period === "7d" ||
    period === "30d" ||
    period === "90d" ||
    period === "12m"
  ) {
    return period
  }

  return "30d"
}

function addCurrencyAmount(
  target: Record<string, number>,
  currency: string,
  amount: number
) {
  target[currency] = (target[currency] ?? 0) + amount
}

function getInvoiceTotal(invoice: {
  currency: string
  discount: unknown
  taxRate: unknown
  lineItems: Array<{
    quantity: number
    rate: unknown
  }>
}) {
  const subtotal = invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * Number(item.rate),
    0
  )

  const discountRate = Number(invoice.discount ?? 0)
  const taxRate = Number(invoice.taxRate ?? 0)

  const discountAmount = subtotal * (discountRate / 100)
  const taxableAmount = Math.max(subtotal - discountAmount, 0)
  const taxAmount = taxableAmount * (taxRate / 100)

  return taxableAmount + taxAmount
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload

    const userId = decoded.userId

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = getPeriod(searchParams.get("period"))

    const now = new Date()
    const periodStart = getPeriodStart(period)

    const [invoices, periodPayments] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          userId,
          createdAt: {
            gte: periodStart,
            lte: now,
          },
        },
        include: {
          customer: true,
          lineItems: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      // Every successful payment received during the selected period.
      // This is the source of truth for revenue / money received.
      prisma.payment.findMany({
        where: {
          invoice: {
            userId,
          },
          status: "SUCCESS",
          createdAt: {
            gte: periodStart,
            lte: now,
          },
        },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              currency: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
    ])
    /*
     * ------------------------------------------------------------
     * OVERVIEW
     * ------------------------------------------------------------
     */

    const totalInvoiced: Record<string, number> = {}
    const totalPaid: Record<string, number> = {}
    const totalOutstanding: Record<string, number> = {}
    const totalOverdue: Record<string, number> = {}

    for (const invoice of invoices) {
      const amount = getInvoiceTotal(invoice)

      addCurrencyAmount(totalInvoiced, invoice.currency, amount)

      if (invoice.status === "PAID") {
        addCurrencyAmount(totalPaid, invoice.currency, amount)
      }

      if (
        invoice.status !== "PAID" &&
        invoice.status !== "CANCELLED" &&
        invoice.status !== "DRAFT"
      ) {
        addCurrencyAmount(totalOutstanding, invoice.currency, amount)
      }

      if (invoice.status === "OVERDUE") {
        addCurrencyAmount(totalOverdue, invoice.currency, amount)
      }
    }

    /*
     * ------------------------------------------------------------
     * INVOICE STATUS BREAKDOWN
     * ------------------------------------------------------------
     */

    const statusCounts = new Map<string, number>()

    for (const invoice of invoices) {
      statusCounts.set(
        invoice.status,
        (statusCounts.get(invoice.status) ?? 0) + 1
      )
    }

    const invoiceStatus = Array.from(statusCounts.entries()).map(
      ([status, count]) => ({
        status,
        count,
      })
    )

    /*
     * ------------------------------------------------------------
     * REVENUE TREND
     *
     * Revenue comes from successful payments rather than
     * simply looking at invoices marked PAID.
     * ------------------------------------------------------------
     */

    const revenueMap = new Map<
      string,
      {
        date: string
        currency: string
        amount: number
      }
    >()

    for (const payment of periodPayments) {
      const date = payment.createdAt.toISOString().slice(0, 10)

      const currency = payment.currency ?? payment.invoice.currency

      const key = `${date}:${currency}`

      const existing = revenueMap.get(key)

      if (existing) {
        existing.amount += Number(payment.amount)
      } else {
        revenueMap.set(key, {
          date,
          currency,
          amount: Number(payment.amount),
        })
      }
    }

    const revenueTrend = Array.from(revenueMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    )

    /*
     * ------------------------------------------------------------
     * TOP CUSTOMERS
     * ------------------------------------------------------------
     */

    const customerMap = new Map<
      string,
      {
        id: string
        name: string
        email: string
        invoiceCount: number
        totalInvoiced: Record<string, number>
        totalPaid: Record<string, number>
        outstanding: Record<string, number>
      }
    >()

    for (const invoice of invoices) {
      const amount = getInvoiceTotal(invoice)

      const customerId = invoice.customerId

      let customer = customerMap.get(customerId)

      if (!customer) {
        customer = {
          id: customerId,
          name: invoice.customer.name,
          email: invoice.customer.email,
          invoiceCount: 0,
          totalInvoiced: {},
          totalPaid: {},
          outstanding: {},
        }

        customerMap.set(customerId, customer)
      }

      customer.invoiceCount += 1

      addCurrencyAmount(customer.totalInvoiced, invoice.currency, amount)

      if (invoice.status === "PAID") {
        addCurrencyAmount(customer.totalPaid, invoice.currency, amount)
      }

      if (
        invoice.status !== "PAID" &&
        invoice.status !== "CANCELLED" &&
        invoice.status !== "DRAFT"
      ) {
        addCurrencyAmount(customer.outstanding, invoice.currency, amount)
      }
    }

    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.invoiceCount - a.invoiceCount)
      .slice(0, 10)

    /*
     * ------------------------------------------------------------
     * OUTSTANDING INVOICES
     * ------------------------------------------------------------
     */

    const outstandingInvoices = invoices
      .filter(
        (invoice) =>
          invoice.status !== "PAID" &&
          invoice.status !== "CANCELLED" &&
          invoice.status !== "DRAFT"
      )
      .map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customer.name,
        dueDate: invoice.dueDate.toISOString(),
        currency: invoice.currency,
        amount: getInvoiceTotal(invoice),
        status: invoice.status,
      }))
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )

    return NextResponse.json({
      period,
      overview: {
        invoiceCount: invoices.length,
        totalInvoiced,
        totalPaid,
        totalOutstanding,
        totalOverdue,
      },
      invoiceStatus,
      revenueTrend,
      topCustomers,
      outstandingInvoices,
    })
  } catch (error) {
    console.error("GET /api/dashboard/reports error:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch reports",
      },
      {
        status: 500,
      }
    )
  }
}
