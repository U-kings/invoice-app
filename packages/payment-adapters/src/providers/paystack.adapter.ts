import {
  PaymentProvider,
  PaymentProviderName,
  CreateCheckoutInput,
  CheckoutResult,
} from "../interfaces"

export class PaystackAdapter implements PaymentProvider {
  readonly name: PaymentProviderName = "paystack"

  supports(input: {
    currency: string
    businessCountry: string
    customerCountry: string
  }): boolean {
    return (
      input.businessCountry === "NG" &&
      input.currency === "NGN"
    )
  }

  async createCheckout(
    input: CreateCheckoutInput
  ): Promise<CheckoutResult> {
    if (input.currency !== "NGN") {
      throw new Error(
        "Paystack checkout currently supports NGN invoices only."
      )
    }

    /*
     * The Paystack secret must be supplied by the caller.
     *
     * Do not use process.env.PAYSTACK_SECRET_KEY here when
     * merchant-specific Paystack connections are enabled.
     */
    if (!input.paystackSecret) {
      throw new Error(
        "Paystack secret key is not configured for this account."
      )
    }

    const amountInKobo = Math.round(input.amount * 100)

    const reference = `PAYSTACK-${input.invoiceId}-${Date.now()}`

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
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
      }
    )

    const contentType = response.headers.get("content-type")

    if (
      !contentType ||
      !contentType.includes("application/json")
    ) {
      const rawText = await response.text()

      console.error(
        `Paystack returned a non-JSON response. HTTP ${response.status}`
      )

      console.error(
        "Paystack response:",
        rawText.slice(0, 400)
      )

      throw new Error(
        `Paystack initialization failed with status ${response.status}.`
      )
    }

    const result = await response.json()

    if (!response.ok || !result.status) {
      console.error(
        "Paystack initialization failed:",
        result
      )

      throw new Error(
        result.message ||
          "Paystack transaction initialization failed."
      )
    }

    if (!result.data?.authorization_url) {
      throw new Error(
        "Paystack did not return a checkout URL."
      )
    }

    return {
      provider: this.name,
      checkoutUrl: result.data.authorization_url,
      reference,
    }
  }
}
