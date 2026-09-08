import { Prisma } from "@repo/db"

const FREE_INVOICE_LIMIT = 5

export async function checkInvoiceCreationLimit(
  tx: Prisma.TransactionClient,
  userId: string
) {
  const subscription = await tx.subscription.findUnique({
    where: {
      userId,
    },
    select: {
      plan: true,
      status: true,
    },
  })

  const isPro =
    subscription?.plan === "PRO" &&
    subscription.status === "ACTIVE"

  // PRO users have unlimited invoice creation.
  if (isPro) {
    return {
      allowed: true,
      isPro: true,
      count: null,
      limit: null,
    }
  }

  // Use UTC calendar months because createdAt is stored as UTC.
  const now = new Date()

  const monthStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1,
      0,
      0,
      0,
      0
    )
  )

  const nextMonthStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1,
      1,
      0,
      0,
      0,
      0
    )
  )

  const invoiceCount = await tx.invoice.count({
    where: {
      userId,
      createdAt: {
        gte: monthStart,
        lt: nextMonthStart,
      },
    },
  })

  return {
    allowed: invoiceCount < FREE_INVOICE_LIMIT,
    isPro: false,
    count: invoiceCount,
    limit: FREE_INVOICE_LIMIT,
  }
}