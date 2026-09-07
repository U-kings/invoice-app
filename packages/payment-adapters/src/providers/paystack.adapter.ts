import {
  PaymentProvider,
  PaymentProviderName,
  CreateCheckoutInput,
  CheckoutResult,
  CreateSubscriptionInput,
  SubscriptionCheckoutResult,
} from "../interfaces"

export class PaystackAdapter implements PaymentProvider {
  readonly name: PaymentProviderName = "paystack"

  supports(input: {
    currency: string
    businessCountry: string
    customerCountry?: string
  }): boolean {
    return input.businessCountry === "NG" && input.currency === "NGN"
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
    // ... your existing createCheckout logic for single payments (unchanged)
    if (input.currency !== "NGN") {
      throw new Error("Paystack checkout currently supports NGN invoices only.")
    }
    if (!input.paystackSecret) {
      throw new Error("Paystack secret key is not configured for this account.")
    }
    const amountInKobo = Math.round(input.amount * 100)
    const reference = `PAYSTACK-${input.invoiceId}-${Date.now()}`
    const response = await fetch(
      "https://paystack.co",
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
          metadata: { invoiceId: input.invoiceId },
        }),
      }
    )
    const result = await response.json()
    if (!response.ok || !result.status) {
      throw new Error(result.message || "Paystack transaction initialization failed.")
    }
    return {
      provider: this.name,
      checkoutUrl: result.data.authorization_url,
      reference,
    }
  }

  // ✨ Clean subscription implementation using system environment variables
  async createSubscriptionCheckout(
    input: CreateSubscriptionInput
  ): Promise<SubscriptionCheckoutResult> {
    if (input.currency !== "NGN") {
      throw new Error("Paystack subscriptions currently support NGN only.")
    }

    // 🔒 Grab your global keys from process.env
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    const planCode = process.env.PAYSTACK_PRO_PLAN_CODE // e.g., PLN_xxxxxxxx

    if (!secretKey) {
      throw new Error("System configuration error: PAYSTACK_SECRET_KEY is missing.")
    }
    if (!planCode) {
      throw new Error("System configuration error: PAYSTACK_PRO_PLAN_CODE is missing.")
    }

    // Unique tracking reference for this specific checkout attempt
    const reference = `SUB-PRO-${input.userId}-${Date.now()}`

    const response = await fetch(
      "https://paystack.co",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: input.email,
          plan: planCode, // Binding this transaction initialization directly to your Paystack dashboard subscription plan
          reference,
          callback_url: input.successUrl,
          metadata: {
            userId: input.userId,
            plan: input.plan,
          },
        }),
      }
    )

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Paystack returned an invalid response format (HTTP ${response.status}).`)
    }

    const result = await response.json()

    if (!response.ok || !result.status) {
      console.error("Paystack subscription checkout failed:", result)
      throw new Error(result.message || "Paystack subscription initialization failed.")
    }

    if (!result.data?.authorization_url) {
      throw new Error("Paystack did not return a valid checkout authorization URL.")
    }

    return {
      provider: this.name,
      checkoutUrl: result.data.authorization_url,
      // Paystack provisions official customer/subscription tokens AFTER successful authorization.
      // We pass the unique reference up to your Prisma upsert handler as a temporary placeholder identifier.
      providerCustomerId: `PENDING-${input.userId}`,
      providerSubscriptionId: reference, 
    }
  }
}
