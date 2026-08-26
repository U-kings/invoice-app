import { PaymentProvider, PaymentProviderName, CreateCheckoutInput, CheckoutResult } from "../interfaces";

export class PaystackAdapter implements PaymentProvider {
  readonly name: PaymentProviderName = "paystack";

  supports(input: { currency: string; businessCountry: string; customerCountry: string }): boolean {
    // Paystack is optimal for Nigerian merchants or NGN currency transactions
    return input.businessCountry === "NG" || input.currency === "NGN";
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
    const amountInKobo = Math.round(input.amount * 100);
    const reference = `PAYSTACK-${input.invoiceId}-${Date.now()}`;

    const response = await fetch("https://paystack.co", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.customer.email,
        amount: amountInKobo,
        currency: input.currency,
        reference,
        callback_url: input.successUrl,
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.status) {
      throw new Error(result.message || "Paystack initialization failed");
    }

    return {
      provider: this.name,
      checkoutUrl: result.data.authorization_url,
      reference,
    };
  }
}



// import type {
//   CreateCheckoutInput,
//   CheckoutResult,
//   PaymentProvider,
// } from "../interfaces"

// export class PaystackProvider implements PaymentProvider {
//   readonly name = "paystack" as const

//   supports({
//     currency,
//     businessCountry,
//   }: {
//     currency: string
//     businessCountry: string
//     customerCountry: string
//   }) {
//     return (
//       businessCountry === "NG" &&
//       currency === "NGN"
//     )
//   }

//   async createCheckout(
//     input: CreateCheckoutInput
//   ): Promise<CheckoutResult> {
//     // Paystack initialization will go here

//     throw new Error("Not implemented")
//   }
// }