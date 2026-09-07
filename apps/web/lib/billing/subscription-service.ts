import { prisma } from "@repo/db"

// import { getPaymentProvider } from "@/lib/payments/provider-router"
import { paymentRouter } from "@workspace/payment-adapters"

export async function createProCheckout({
  userId,
  successUrl,
  cancelUrl,
}: {
  userId: string
  successUrl: string
  cancelUrl: string
}) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      subscription: true,
      businessProfile: true,
      customers: true,
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (!user.businessProfile) {
    throw new Error("Please complete your business profile before upgrading")
  }

  if (
    user.subscription?.plan === "PRO" &&
    user.subscription.status === "ACTIVE"
  ) {
    throw new Error("You already have an active Pro subscription")
  }

  const provider = paymentRouter.resolve({
    currency: user.businessProfile.currency || "NGN",
    businessCountry : user.businessProfile.countryCode
  })

  const checkout = await provider.createSubscriptionCheckout({
    userId,
    email: user.email,
    plan: "PRO",
    currency: user.businessProfile.currency,
    countryCode: user.businessProfile.countryCode,
    successUrl,
    cancelUrl,
  })

  await prisma.subscription.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      plan: "FREE",
      status: "PENDING",
      provider: checkout.provider,
      providerCustomerId: checkout.providerCustomerId,
      providerSubscriptionId: checkout.providerSubscriptionId,
    },
    update: {
      plan: "FREE",
      status: "PENDING",
      provider: checkout.provider,
      providerCustomerId: checkout.providerCustomerId,
      providerSubscriptionId: checkout.providerSubscriptionId,
    },
  })

  return checkout
}
