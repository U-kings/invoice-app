export type PaymentProviderName = "stripe" | "paystack" | "flutterwave"

export interface CreateCheckoutInput {
  invoiceId: string
  amount: number
  currency: string
  customer: {
    name: string
    email: string
  }
  successUrl: string
  cancelUrl: string
}

export interface CheckoutResult {
  provider: PaymentProviderName
  checkoutUrl: string
  reference: string
  url?: string
}

export interface PaymentProvider {
  readonly name: PaymentProviderName

  supports(input: {
    currency: string
    businessCountry: string
    customerCountry: string
  }): boolean

  createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult>
}
