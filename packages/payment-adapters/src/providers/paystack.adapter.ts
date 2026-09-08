import {
  PaymentProvider,
  PaymentProviderName,
  CreateCheckoutInput,
  CheckoutResult,
  CreateSubscriptionInput,
  SubscriptionCheckoutResult,
} from "../interfaces"

const PAYSTACK_API_URL = "https://api.paystack.co"

const PAYSTACK_TRANSACTION_URL =
  `${PAYSTACK_API_URL}/transaction/initialize`

export class PaystackAdapter implements PaymentProvider {
  readonly name: PaymentProviderName = "paystack"

  supports(input: {
    currency: string
    businessCountry: string
    customerCountry?: string
  }): boolean {
    return (
      input.businessCountry === "NG" &&
      input.currency === "NGN"
    )
  }

  async createCheckout(
    input: CreateCheckoutInput,
  ): Promise<CheckoutResult> {
    if (input.currency !== "NGN") {
      throw new Error(
        "Paystack checkout currently supports NGN invoices only.",
      )
    }

    if (!input.paystackSecret) {
      throw new Error(
        "Paystack secret key is not configured for this account.",
      )
    }

    const amountInKobo = Math.round(input.amount * 100)
    const reference = `PAYSTACK-${input.invoiceId}-${Date.now()}`

    const response = await fetch(
      PAYSTACK_TRANSACTION_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${input.paystackSecret}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: input.customer.email,
          amount: amountInKobo,
          currency: input.currency,
          reference,
          callback_url: input.successUrl,
          metadata: {
            invoiceId: input.invoiceId,
          },
        }),
      },
    )

    const contentType = response.headers.get("content-type")

    if (
      !contentType ||
      !contentType.includes("application/json")
    ) {
      throw new Error(
        `Paystack returned an invalid response format (HTTP ${response.status}).`,
      )
    }

    const result = await response.json()

    if (!response.ok || !result.status) {
      throw new Error(
        result.message ||
          "Paystack transaction initialization failed.",
      )
    }

    if (!result.data?.authorization_url) {
      throw new Error(
        "Paystack did not return a valid checkout authorization URL.",
      )
    }

    return {
      provider: this.name,
      checkoutUrl: result.data.authorization_url,
      reference,
    }
  }

  async createSubscriptionCheckout(
    input: CreateSubscriptionInput,
  ): Promise<SubscriptionCheckoutResult> {
    if (input.currency !== "NGN") {
      throw new Error(
        "Paystack subscriptions currently support NGN only.",
      )
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    const planCode = process.env.PAYSTACK_PRO_PLAN_CODE

    if (!secretKey) {
      throw new Error(
        "System configuration error: PAYSTACK_SECRET_KEY is missing.",
      )
    }

    if (!planCode) {
      throw new Error(
        "System configuration error: PAYSTACK_PRO_PLAN_CODE is missing.",
      )
    }

    const reference = `SUB-PRO-${input.userId}-${Date.now()}`

    const response = await fetch(
      PAYSTACK_TRANSACTION_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: input.email,
          plan: planCode,
          reference,
          callback_url: input.successUrl,
          metadata: {
            userId: input.userId,
            plan: input.plan,
          },
        }),
      },
    )

    const contentType = response.headers.get("content-type")

    if (
      !contentType ||
      !contentType.includes("application/json")
    ) {
      throw new Error(
        `Paystack returned an invalid response format (HTTP ${response.status}).`,
      )
    }

    const result = await response.json()

    if (!response.ok || !result.status) {
      console.error(
        "Paystack subscription checkout failed:",
        result,
      )

      throw new Error(
        result.message ||
          "Paystack subscription initialization failed.",
      )
    }

    if (!result.data?.authorization_url) {
      throw new Error(
        "Paystack did not return a valid checkout authorization URL.",
      )
    }

    return {
      provider: this.name,
      checkoutUrl: result.data.authorization_url,
      providerCustomerId: `PENDING-${input.userId}`,
      providerSubscriptionId: reference,
    }
  }

  async manageSubscription(
    subscriptionCode: string,
  ): Promise<{ url: string }> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY

    if (!secretKey) {
      throw new Error(
        "System configuration error: PAYSTACK_SECRET_KEY is missing.",
      )
    }

    if (!subscriptionCode) {
      throw new Error(
        "Paystack subscription code is missing.",
      )
    }

    const response = await fetch(
      `${PAYSTACK_API_URL}/subscription/${encodeURIComponent(
        subscriptionCode,
      )}/manage/link`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          Accept: "application/json",
        },
      },
    )

    const contentType = response.headers.get("content-type")

    if (
      !contentType ||
      !contentType.includes("application/json")
    ) {
      throw new Error(
        `Paystack returned an invalid response format (HTTP ${response.status}).`,
      )
    }

    const result = await response.json()

    if (!response.ok || !result.status) {
      console.error(
        "Paystack subscription management link failed:",
        result,
      )

      throw new Error(
        result.message ||
          "Unable to generate subscription management link.",
      )
    }

    if (!result.data?.link) {
      throw new Error(
        "Paystack did not return a subscription management link.",
      )
    }

    return {
      url: result.data.link,
    }
  }
}