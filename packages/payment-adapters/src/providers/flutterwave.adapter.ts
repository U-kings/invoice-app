import { PaymentProvider, PaymentProviderName, CreateCheckoutInput, CheckoutResult } from "../interfaces";

export class FlutterwaveAdapter implements PaymentProvider {
  readonly name: PaymentProviderName = "flutterwave";

  supports(input: { currency: string; businessCountry: string; customerCountry: string }): boolean {
    // Fallback engine for other Sub-Saharan African multi-currency transactions
    const africanCountries = ["GH", "KE", "ZA", "TZ", "UG"];
    return africanCountries.includes(input.businessCountry);
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
    const txRef = `FLW-${input.invoiceId}-${Date.now()}`;

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
    });

    const result = await response.json();
    if (!response.ok || result.status !== "success") {
      throw new Error(result.message || "Flutterwave initialization failed");
    }

    return {
      provider: this.name,
      checkoutUrl: result.data.link,
      reference: txRef,
    };
  }
}
