import { prisma } from "@repo/db"

export async function getPaymentProviderConnection(
  userId: string,
  provider: "PAYSTACK" | "STRIPE" | "FLUTTERWAVE"
) {
  return prisma.paymentProviderConnection.findUnique({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
  })
}
