import {
  PaymentProvider,
  PaymentProviderName,
  CreateCheckoutInput,
  CheckoutResult,
  CreateSubscriptionInput,
  SubscriptionCheckoutResult,
} from "../interfaces"

export class StripeAdapter implements PaymentProvider {
  readonly name: PaymentProviderName = "stripe"

  supports(input: {
    currency: string
    businessCountry: string
    customerCountry: string
  }): boolean {
    // Global fallback default rule: If currency is USD/EUR or business is non-African (e.g., US, CA, GB)
    const internationalCurrencies = ["USD", "EUR", "GBP", "CAD", "AUD"]
    return (
      internationalCurrencies.includes(input.currency.toUpperCase()) ||
      !["NG", "GH", "KE", "ZA"].includes(input.businessCountry)
    )
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
    const stripeSecret = process.env.STRIPE_SECRET_KEY
    if (!stripeSecret) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not defined")
    }

    // Stripe expects amount as integers in lowest denominations (e.g., Cents)
    const amountInCents = Math.round(input.amount * 100)

    // Using URLSearchParams because Stripe's REST API expects standard form-urlencoded request payloads
    const body = new URLSearchParams()
    body.append("mode", "payment")
    body.append("customer_email", input.customer.email)
    body.append("success_url", input.successUrl)
    body.append("cancel_url", input.cancelUrl)
    body.append("client_reference_id", input.invoiceId)

    // Constructing Stripe's array item params syntax natively
    body.append(
      "line_items[0][price_data][currency]",
      input.currency.toLowerCase()
    )
    body.append(
      "line_items[0][price_data][product_data][name]",
      `Payment for Invoice #${input.invoiceId}`
    )
    body.append(
      "line_items[0][price_data][unit_amount]",
      amountInCents.toString()
    )
    body.append("line_items[0][quantity]", "1")

    const response = await fetch("https://stripe.com", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(
        result.error?.message || "Stripe checkout session initialization failed"
      )
    }

    return {
      provider: this.name,
      checkoutUrl: result.url, // Safe redirect URL passed back to the customer client
      reference: result.id, // Stripe Session ID (e.g., cs_test_...) used to confirm webhook payouts
    }
  }

  async createSubscriptionCheckout(
    input: CreateSubscriptionInput
  ): Promise<SubscriptionCheckoutResult> {
    // 💡 Stripe natively supports multi-currency subscriptions (USD, EUR, NGN, etc.)
    // You can remove or expand this restriction based on your business logic.
    if (input.currency !== "USD" && input.currency !== "NGN") {
      throw new Error(
        "Stripe configuration is currently restricted to USD or NGN."
      )
    }

    // 🔒 Grab your global keys from process.env
    const secretKey = process.env.STRIPE_SECRET_KEY
    const priceId = process.env.STRIPE_PRO_PRICE_ID // e.g., price_1Q2W3E...

    if (!secretKey) {
      throw new Error(
        "System configuration error: STRIPE_SECRET_KEY is missing."
      )
    }
    if (!priceId) {
      throw new Error(
        "System configuration error: STRIPE_PRO_PRICE_ID is missing."
      )
    }

    // Unique tracking reference for your database lookup
    const clientReferenceId = `SUB-PRO-${input.userId}-${Date.now()}`

    // Stripe expects form-urlencoded payloads instead of JSON strings for its raw REST API.
    // If you use the official 'stripe' npm package, this transforms into: stripe.checkout.sessions.create({...})
    const payload = new URLSearchParams({
      mode: "subscription", // 🔄 Instructs Stripe to create a recurring billing schedule
      success_url: input.successUrl,
      cancel_url: input.successUrl, // Or a dedicated cancellation URL if available
      client_reference_id: clientReferenceId, // Maps this session back to your DB reference
      customer_email: input.email,
      "line_items[0][price]": priceId, // 🏷️ The API identifier for your product price
      "line_items[0][quantity]": "1",
      "metadata[userId]": input.userId,
      "metadata[plan]": input.plan,
    })

    const response = await fetch("https://stripe.com", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    })

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        `Stripe returned an invalid response format (HTTP ${response.status}).`
      )
    }

    const result = await response.json()

    if (!response.ok || result.error) {
      console.error("Stripe subscription checkout failed:", result)
      throw new Error(
        result.error?.message || "Stripe subscription initialization failed."
      )
    }

    if (!result.url) {
      throw new Error("Stripe did not return a valid checkout session URL.")
    }

    return {
      provider: this.name,
      checkoutUrl: result.url, // Stripe returns 'url' at the root of the session object
      // Stripe provisions final customer and subscription records immediately upon session creation.
      // However, they won't be active until paid. You can update these asynchronously in your webhook.
      providerCustomerId: result.customer || `PENDING-${input.userId}`,
      providerSubscriptionId: result.subscription || clientReferenceId,
    }
  }

  async manageSubscription(subscriptionCode: string): Promise<{ url: string }> {
    return { url: "" }
  }
}
