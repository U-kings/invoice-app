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
  paystackSecret?: string
}

export interface CheckoutResult {
  provider: PaymentProviderName
  checkoutUrl: string
  reference: string
  url?: string
}

export interface CreateSubscriptionInput {
  userId: string
  email: string
  plan: "PRO"
  currency: string
  countryCode: string
  successUrl: string
  cancelUrl: string
}

export interface SubscriptionCheckoutResult {
  provider: PaymentProviderName
  checkoutUrl: string
  providerCustomerId: string
  providerSubscriptionId: string
}

export interface PaymentProvider {
  readonly name: PaymentProviderName

  supports(input: {
    currency: string
    businessCountry: string
    customerCountry?: string
  }): boolean

  createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult>
  createSubscriptionCheckout(
    input: CreateSubscriptionInput
  ): Promise<SubscriptionCheckoutResult>
}
