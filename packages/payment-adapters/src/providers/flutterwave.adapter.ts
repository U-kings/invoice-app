import {
  PaymentProvider,
  PaymentProviderName,
  CreateCheckoutInput,
  CheckoutResult,
  CreateSubscriptionInput,
  SubscriptionCheckoutResult,
} from "../interfaces"

export class FlutterwaveAdapter implements PaymentProvider {
  readonly name: PaymentProviderName = "flutterwave"

  supports(input: {
    currency: string
    businessCountry: string
    customerCountry: string
  }): boolean {
    // Fallback engine for other Sub-Saharan African multi-currency transactions
    const africanCountries = ["GH", "KE", "ZA", "TZ", "UG"]
    return africanCountries.includes(input.businessCountry)
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
    const txRef = `FLW-${input.invoiceId}-${Date.now()}`

    const response = await fetch("https://flutterwave.com", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: input.amount,
        currency: input.currency,
        redirect_url: input.successUrl,
        customer: {
          email: input.customer.email,
          name: input.customer.name,
        },
        customizations: {
          title: `Invoice #${input.invoiceId}`,
        },
      }),
    })

    const result = await response.json()
    if (!response.ok || result.status !== "success") {
      throw new Error(result.message || "Flutterwave initialization failed")
    }

    return {
      provider: this.name,
      checkoutUrl: result.data.link,
      reference: txRef,
    }
  }

  async createSubscriptionCheckout(
    input: CreateSubscriptionInput
  ): Promise<SubscriptionCheckoutResult> {
    if (input.currency !== "NGN") {
      throw new Error("Paystack subscriptions currently support NGN only.")
    }

    // 🔒 Grab your global keys from process.env
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY
    const planCode = process.env.FLUTTERWAVE_PRO_PLAN_ID // e.g., PLN_xxxxxxxx

    if (!secretKey) {
      throw new Error(
        "System configuration error: FLUTTERWAVE_SECRET_KEY is missing."
      )
    }
    if (!planCode) {
      throw new Error(
        "System configuration error: FLUTTERWAVE_PRO_PLAN_CODE is missing."
      )
    }

    // Unique tracking reference for this specific checkout attempt
    const reference = `SUB-PRO-${input.userId}-${Date.now()}`

    const response = await fetch("https://flutterwave.com", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        plan: planCode, // Binding this transaction initialization directly to your Flutterwave dashboard subscription plan
        reference,
        callback_url: input.successUrl,
        metadata: {
          userId: input.userId,
          plan: input.plan,
        },
      }),
    })

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        `Paystack returned an invalid response format (HTTP ${response.status}).`
      )
    }

    const result = await response.json()

    if (!response.ok || !result.status) {
      console.error("Paystack subscription checkout failed:", result)
      throw new Error(
        result.message || "Paystack subscription initialization failed."
      )
    }

    if (!result.data?.authorization_url) {
      throw new Error(
        "Paystack did not return a valid checkout authorization URL."
      )
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
