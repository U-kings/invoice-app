const currencySymbols: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  CAD: "CA$",
  AUD: "A$",
  CHF: "CHF",
  INR: "₹",
  ZAR: "R",
  GHS: "₵",
  KES: "KSh",
}

function getCurrencySymbol(currency: string) {
  return currencySymbols[currency.toUpperCase()] ?? currency
}

export function formatCurrency(amount: number, currency: string) {
  const symbol = getCurrencySymbol(currency)

  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
