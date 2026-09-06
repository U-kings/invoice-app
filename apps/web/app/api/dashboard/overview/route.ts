import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

import { prisma } from "@repo/db"
import { getInvoiceTotal } from "@/lib/invoices/invoice"

type RevenuePeriod = "month" | "6months" | "year"

function getRevenuePeriod(value: string | null): RevenuePeriod {
  if (value === "month" || value === "6months" || value === "year") {
    return value
  }

  return "6months"
}

function getDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(date)
}

function getStartOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getStartOfNextMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1)
}

function getMonthStart(date: Date, monthsAgo: number) {
  return new Date(date.getFullYear(), date.getMonth() - monthsAgo, 1)
}

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
  }).format(date)
}

function decimalToNumber(value: unknown) {
  return Number(value ?? 0)
}

function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100
  }

  return ((current - previous) / previous) * 100
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let decoded: { userId?: string }

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId?: string
      }
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = decoded.userId

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requestedCurrency = req.nextUrl.searchParams
      .get("currency")
      ?.toUpperCase()

    const { searchParams } = new URL(req.url)

    const revenuePeriod = getRevenuePeriod(searchParams.get("period"))

    const now = new Date()

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )

    const currentMonthStart = getStartOfMonth(now)

    const revenueStartDate =
      revenuePeriod === "month"
        ? currentMonthStart
        : revenuePeriod === "year"
          ? new Date(now.getFullYear(), 0, 1)
          : getMonthStart(now, 5)

    const startOfMonth = getStartOfMonth(now)
    const startOfNextMonth = getStartOfNextMonth(now)
    const startOfPreviousMonth = getMonthStart(now, 1)
    const startOfSixMonthsAgo = getMonthStart(now, 5)

    const [
      businessProfile,
      invoices,
      revenueInvoices,
      totalCustomers,
      recentInvoices,
      recentPayments,
      invoiceStatusCounts,
      monthlyCustomers,
      upcomingInvoices,
    ] = await Promise.all([
      /**
       * Business profile
       */
      prisma.businessProfile.findUnique({
        where: {
          userId,
        },
        select: {
          currency: true,
        },
      }),

      /**
       * All invoices
       *
       * Used for:
       * - Total revenue
       * - Current/previous month revenue
       * - Outstanding
       * - Overdue
       * - Invoice statistics
       * - Outstanding trend
       */
      prisma.invoice.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          currency: true,
          issueDate: true,
          dueDate: true,
          paidAt: true,
          discount: true,
          taxRate: true,
          createdAt: true,

          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          lineItems: {
            select: {
              quantity: true,
              rate: true,
            },
          },
        },
      }),

      /**
       * Revenue invoices
       *
       * Only PAID invoices inside the selected
       * revenue period are fetched.
       */
      prisma.invoice.findMany({
        where: {
          userId,
          status: "PAID",
          paidAt: {
            gte: revenueStartDate,
          },
        },
        include: {
          lineItems: true,
        },
      }),

      /**
       * Total customers
       */
      prisma.customer.count({
        where: {
          userId,
        },
      }),

      /**
       * Recent invoices
       */
      prisma.invoice.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          currency: true,
          issueDate: true,
          dueDate: true,
          createdAt: true,
          discount: true,
          taxRate: true,

          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          lineItems: {
            select: {
              quantity: true,
              rate: true,
            },
          },
        },
      }),

      /**
       * Recent payments
       */
      prisma.payment.findMany({
        where: {
          invoice: {
            userId,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          provider: true,
          createdAt: true,

          invoice: {
            select: {
              id: true,
              invoiceNumber: true,

              customer: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),

      /**
       * Invoice status counts
       */
      prisma.invoice.groupBy({
        by: ["status", "currency"],
        where: {
          userId,
        },
        _count: {
          _all: true,
        },
      }),

      /**
       * Customers created within the last six months
       */
      prisma.customer.findMany({
        where: {
          userId,
          createdAt: {
            gte: startOfSixMonthsAgo,
          },
        },
        select: {
          createdAt: true,
        },
      }),

      //upcoming invoices

      prisma.invoice.findMany({
        where: {
          userId,
          dueDate: {
            gte: startOfToday,
          },
          status: {
            in: ["SENT", "DRAFT"],
          },
        },
        orderBy: {
          dueDate: "asc",
        },
        take: 5,
        select: {
          id: true,
          invoiceNumber: true,
          currency: true,
          dueDate: true,
          discount: true,
          taxRate: true,
          status: true,
          lineItems: {
            select: {
              id: true,
              name: true,
              quantity: true,
              rate: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ])

    /**
     * ---------------------------------------------------------
     * Available currencies
     * ---------------------------------------------------------
     */

    const invoiceCurrencies = invoices.map((invoice) =>
      invoice.currency.toUpperCase()
    )

    const availableCurrencies = Array.from(
      new Set(
        [businessProfile?.currency?.toUpperCase(), ...invoiceCurrencies].filter(
          Boolean
        )
      )
    ) as string[]

    const defaultCurrency =
      businessProfile?.currency?.toUpperCase() ||
      availableCurrencies[0] ||
      "NGN"

    const currency =
      requestedCurrency && availableCurrencies.includes(requestedCurrency)
        ? requestedCurrency
        : defaultCurrency

    /**
     * ---------------------------------------------------------
     * Currency-specific invoices
     * ---------------------------------------------------------
     */

    const currencyInvoices = invoices.filter(
      (invoice) => invoice.currency.toUpperCase() === currency
    )

    const invoiceTotals = currencyInvoices.map((invoice) => ({
      ...invoice,
      total: getInvoiceTotal(invoice),
    }))

    /**
     * Revenue invoices are already:
     * - PAID
     * - Within the selected revenue period
     *
     * We only need to filter by currency here.
     */
    const revenueInvoiceTotals = revenueInvoices
      .filter((invoice) => invoice.currency.toUpperCase() === currency)
      .map((invoice) => ({
        ...invoice,
        total: getInvoiceTotal(invoice),
      }))

    /**
     * ---------------------------------------------------------
     * Revenue statistics
     * ---------------------------------------------------------
     */

    const totalRevenue = invoiceTotals
      .filter((invoice) => invoice.status === "PAID")
      .reduce((sum, invoice) => sum + invoice.total, 0)

    const currentMonthRevenue = invoiceTotals
      .filter(
        (invoice) =>
          invoice.status === "PAID" &&
          invoice.paidAt &&
          invoice.paidAt >= startOfMonth &&
          invoice.paidAt < startOfNextMonth
      )
      .reduce((sum, invoice) => sum + invoice.total, 0)

    const previousMonthRevenue = invoiceTotals
      .filter(
        (invoice) =>
          invoice.status === "PAID" &&
          invoice.paidAt &&
          invoice.paidAt >= startOfPreviousMonth &&
          invoice.paidAt < startOfMonth
      )
      .reduce((sum, invoice) => sum + invoice.total, 0)

    /**
     * ---------------------------------------------------------
     * Outstanding / overdue
     * ---------------------------------------------------------
     */

    const outstanding = invoiceTotals
      .filter(
        (invoice) => invoice.status === "SENT" || invoice.status === "OVERDUE"
      )
      .reduce((sum, invoice) => sum + invoice.total, 0)

    const overdue = invoiceTotals
      .filter((invoice) => invoice.status === "OVERDUE")
      .reduce((sum, invoice) => sum + invoice.total, 0)

    /**
     * ---------------------------------------------------------
     * Invoice statistics
     * ---------------------------------------------------------
     */

    const totalInvoices = currencyInvoices.length

    const paidInvoices = currencyInvoices.filter(
      (invoice) => invoice.status === "PAID"
    ).length

    const currentMonthInvoices = currencyInvoices.filter(
      (invoice) =>
        invoice.createdAt >= startOfMonth &&
        invoice.createdAt < startOfNextMonth
    ).length

    const previousMonthInvoices = currencyInvoices.filter(
      (invoice) =>
        invoice.createdAt >= startOfPreviousMonth &&
        invoice.createdAt < startOfMonth
    ).length

    /**
     * ---------------------------------------------------------
     * Customer statistics
     * ---------------------------------------------------------
     *
     * Customers do not belong to a currency,
     * so these remain account-level metrics.
     */

    const currentMonthCustomers = monthlyCustomers.filter(
      (customer) =>
        customer.createdAt >= startOfMonth &&
        customer.createdAt < startOfNextMonth
    ).length

    const previousMonthCustomers = monthlyCustomers.filter(
      (customer) =>
        customer.createdAt >= startOfPreviousMonth &&
        customer.createdAt < startOfMonth
    ).length

    /**
     * ---------------------------------------------------------
     * Revenue chart
     * ---------------------------------------------------------
     *
     * This Month:
     *   Daily revenue from the beginning of this month
     *   through today.
     *
     * Last 6 Months:
     *   Monthly revenue for the last six months.
     *
     * This Year:
     *   Monthly revenue from January through the
     *   current month.
     */

    const revenueData =
      revenuePeriod === "month"
        ? Array.from(
            {
              length: now.getDate(),
            },
            (_, index) => {
              const dayStart = new Date(
                now.getFullYear(),
                now.getMonth(),
                index + 1
              )

              const nextDay = new Date(
                now.getFullYear(),
                now.getMonth(),
                index + 2
              )

              const revenue = revenueInvoiceTotals
                .filter(
                  (invoice) =>
                    invoice.paidAt &&
                    invoice.paidAt >= dayStart &&
                    invoice.paidAt < nextDay
                )
                .reduce((sum, invoice) => sum + invoice.total, 0)

              return {
                month: getDayLabel(dayStart),
                revenue,
              }
            }
          )
        : Array.from(
            {
              length: revenuePeriod === "year" ? now.getMonth() + 1 : 6,
            },
            (_, index) => {
              const monthDate =
                revenuePeriod === "year"
                  ? new Date(now.getFullYear(), index, 1)
                  : getMonthStart(now, 5 - index)

              const nextMonth = new Date(
                monthDate.getFullYear(),
                monthDate.getMonth() + 1,
                1
              )

              const revenue = revenueInvoiceTotals
                .filter(
                  (invoice) =>
                    invoice.paidAt &&
                    invoice.paidAt >= monthDate &&
                    invoice.paidAt < nextMonth
                )
                .reduce((sum, invoice) => sum + invoice.total, 0)

              return {
                month: getMonthLabel(monthDate),
                revenue,
              }
            }
          )

    /**
     * ---------------------------------------------------------
     * Six-month invoice chart
     * ---------------------------------------------------------
     */

    const monthlyInvoiceCount = Array.from({ length: 6 }, (_, index) => {
      const monthDate = getMonthStart(now, 5 - index)

      const nextMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        1
      )

      const count = currencyInvoices.filter(
        (invoice) =>
          invoice.createdAt >= monthDate && invoice.createdAt < nextMonth
      ).length

      return {
        month: getMonthLabel(monthDate),
        count,
      }
    })

    /**
     * ---------------------------------------------------------
     * Six-month customer chart
     * ---------------------------------------------------------
     */

    const monthlyCustomerCount = Array.from({ length: 6 }, (_, index) => {
      const monthDate = getMonthStart(now, 5 - index)

      const nextMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        1
      )

      const count = monthlyCustomers.filter(
        (customer) =>
          customer.createdAt >= monthDate && customer.createdAt < nextMonth
      ).length

      return {
        month: getMonthLabel(monthDate),
        count,
      }
    })

    /**
     * ---------------------------------------------------------
     * Outstanding trend
     * ---------------------------------------------------------
     */

    const outstandingTrend = Array.from({ length: 6 }, (_, index) => {
      const monthDate = getMonthStart(now, 5 - index)

      const nextMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        1
      )

      const amount = invoiceTotals
        .filter(
          (invoice) =>
            (invoice.status === "SENT" || invoice.status === "OVERDUE") &&
            invoice.dueDate >= monthDate &&
            invoice.dueDate < nextMonth
        )
        .reduce((sum, invoice) => sum + invoice.total, 0)

      return {
        month: getMonthLabel(monthDate),
        amount,
      }
    })

    /**
     * ---------------------------------------------------------
     * Invoice status counts
     * ---------------------------------------------------------
     */

    const invoiceStatus = {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0,
    }

    for (const item of invoiceStatusCounts) {
      if (item.currency.toUpperCase() !== currency) {
        continue
      }

      const status = item.status.toLowerCase()

      if (status in invoiceStatus) {
        invoiceStatus[status as keyof typeof invoiceStatus] = item._count._all
      }
    }

    /**
     * ---------------------------------------------------------
     * Recent invoices
     * ---------------------------------------------------------
     */

    const recentInvoiceData = recentInvoices
      .filter((invoice) => invoice.currency.toUpperCase() === currency)
      .map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customer,
        status: invoice.status,
        currency: invoice.currency,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        lineItems: invoice.lineItems,
        discount: invoice.discount,
        taxRate: invoice.taxRate,
        total: getInvoiceTotal(invoice),
        createdAt: invoice.createdAt,
      }))

    /**
     * ---------------------------------------------------------
     * Recent payments
     * ---------------------------------------------------------
     */

    const recentPaymentData = recentPayments
      .filter((payment) => payment.currency.toUpperCase() === currency)
      .map((payment) => ({
        id: payment.id,
        amount: decimalToNumber(payment.amount),
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
        createdAt: payment.createdAt,
        invoice: payment.invoice,
      }))

    /**
     * ---------------------------------------------------------
     * Activity
     * ---------------------------------------------------------
     */

    const activity = [
      ...recentInvoiceData.map((invoice) => ({
        id: `invoice-${invoice.id}`,
        type: "invoice",
        title: `Invoice ${invoice.invoiceNumber}`,
        description: `Invoice created for ${invoice.customer.name}`,
        date: invoice.createdAt,
        entityId: invoice.id,
      })),

      ...recentPaymentData.map((payment) => ({
        id: `payment-${payment.id}`,
        type: "payment",
        title: "Payment received",
        description: `${payment.invoice.invoiceNumber} payment from ${payment.invoice.customer.name}`,
        date: payment.createdAt,
        entityId: payment.id,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)

    //upcoming invoices

    const upcomingInvoiceData = upcomingInvoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      status: invoice.status,
      total: getInvoiceTotal(invoice),
    }))

    /**
     * ---------------------------------------------------------
     * Return dashboard
     * ---------------------------------------------------------
     */

    return NextResponse.json({
      currency,

      availableCurrencies,

      stats: {
        currency,

        totalRevenue,

        currentMonthRevenue,

        previousMonthRevenue,

        revenueChange: calculatePercentageChange(
          currentMonthRevenue,
          previousMonthRevenue
        ),

        outstanding,

        overdue,

        totalInvoices,

        paidInvoices,

        currentMonthInvoices,

        previousMonthInvoices,

        invoiceChange: calculatePercentageChange(
          currentMonthInvoices,
          previousMonthInvoices
        ),

        totalCustomers,

        currentMonthCustomers,

        previousMonthCustomers,

        customerChange: calculatePercentageChange(
          currentMonthCustomers,
          previousMonthCustomers
        ),
      },

      revenue: {
        period: revenuePeriod,
        currency,
        data: revenueData,
      },

      invoiceTrend: {
        period: "6months",
        currency,
        data: monthlyInvoiceCount,
      },

      customerTrend: {
        period: "6months",
        data: monthlyCustomerCount,
      },

      outstandingTrend: {
        period: "6months",
        currency,
        data: outstandingTrend,
      },

      recentInvoices: recentInvoiceData,

      invoiceStatus,

      recentPayments: recentPaymentData,

      activity,

      upcomingInvoices: upcomingInvoiceData,
    })
  } catch (error) {
    console.error("Dashboard overview error:", error)

    return NextResponse.json(
      {
        error: "Failed to load dashboard data",
      },
      {
        status: 500,
      }
    )
  }
}
