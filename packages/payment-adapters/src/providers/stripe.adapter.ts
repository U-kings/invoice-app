import { PaymentProvider, PaymentProviderName, CreateCheckoutInput, CheckoutResult } from "../interfaces";

export class StripeAdapter implements PaymentProvider {
  readonly name: PaymentProviderName = "stripe";

  supports(input: { currency: string; businessCountry: string; customerCountry: string }): boolean {
    // Global fallback default rule: If currency is USD/EUR or business is non-African (e.g., US, CA, GB)
    const internationalCurrencies = ["USD", "EUR", "GBP", "CAD", "AUD"];
    return internationalCurrencies.includes(input.currency.toUpperCase()) || 
           !["NG", "GH", "KE", "ZA"].includes(input.businessCountry);
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not defined");
    }

    // Stripe expects amount as integers in lowest denominations (e.g., Cents)
    const amountInCents = Math.round(input.amount * 100);

    // Using URLSearchParams because Stripe's REST API expects standard form-urlencoded request payloads
    const body = new URLSearchParams();
    body.append("mode", "payment");
    body.append("customer_email", input.customer.email);
    body.append("success_url", input.successUrl);
    body.append("cancel_url", input.cancelUrl);
    body.append("client_reference_id", input.invoiceId);
    
    // Constructing Stripe's array item params syntax natively
    body.append("line_items[0][price_data][currency]", input.currency.toLowerCase());
    body.append("line_items[0][price_data][product_data][name]", `Payment for Invoice #${input.invoiceId}`);
    body.append("line_items[0][price_data][unit_amount]", amountInCents.toString());
    body.append("line_items[0][quantity]", "1");

    const response = await fetch("https://stripe.com", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || "Stripe checkout session initialization failed");
    }

    return {
      provider: this.name,
      checkoutUrl: result.url,       // Safe redirect URL passed back to the customer client
      reference: result.id,          // Stripe Session ID (e.g., cs_test_...) used to confirm webhook payouts
    };
  }
}




// export class StripeProvider
//   implements PaymentProviderAdapter
// {
//   async createCheckout(
//     input: CreateCheckoutInput
//   ): Promise<CheckoutResult> {
//     // Stripe implementation

//     return {
//       provider: "STRIPE",
//       checkoutUrl: "...",
//       providerReference: "...",
//     }
//   }
// }