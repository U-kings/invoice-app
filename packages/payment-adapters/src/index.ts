import { PaystackAdapter } from "./providers/paystack.adapter"
import { FlutterwaveAdapter } from "./providers/flutterwave.adapter"
import { StripeAdapter } from "./providers/stripe.adapter"
import { PaymentProvider } from "./interfaces"

export * from "./interfaces"

class PaymentRouter {
  private providers: PaymentProvider[] = [
    new PaystackAdapter(),
    new FlutterwaveAdapter(),
    new StripeAdapter(),
  ]

  resolve(criteria: {
    currency: string
    businessCountry: string
    customerCountry?: string
  }): PaymentProvider {
    const matchedProvider = this.providers.find((provider) =>
      provider.supports(criteria)
    )

    if (!matchedProvider) {
      throw new Error(
        `No payment provider supports ${criteria.currency} payments for this business.`
      )
    }

    return matchedProvider
  }
}

export const paymentRouter = new PaymentRouter()
