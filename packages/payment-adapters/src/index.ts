import { PaystackAdapter } from "./providers/paystack.adapter";
import { FlutterwaveAdapter } from "./providers/flutterwave.adapter";
import { StripeAdapter } from "./providers/stripe.adapter"; // Follow same pattern using Stripe SDK
import { PaymentProvider } from "./interfaces";

export * from "./interfaces";

class PaymentRouter {
  private providers: PaymentProvider[] = [
    new PaystackAdapter(),
    new FlutterwaveAdapter(),
    new StripeAdapter(),
  ];

  /**
   * Evaluates business criteria rules sequentially to select the optimal gateway.
   */
  resolve(criteria: { currency: string; businessCountry: string; customerCountry: string }): PaymentProvider {
    const matchedProvider = this.providers.find((provider) => provider.supports(criteria));

    if (!matchedProvider) {
      // Return Stripe as global fallback if no specific region adapter catches it
      const fallback = this.providers.find((p) => p.name === "paystack");
      // const fallback = this.providers.find((p) => p.name === "stripe");
      if (!fallback) throw new Error("No usable payment providers configured");
      return fallback;
    }

    return matchedProvider;
  }
}

export const paymentRouter = new PaymentRouter();
