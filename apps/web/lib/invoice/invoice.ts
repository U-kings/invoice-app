import { Invoice } from "@/components/invoices/invoice-data"

export function getInvoiceTotal(invoice: Invoice) {
  const subtotal = invoice.items.reduce(
    (total, item) => total + item.quantity * item.rate,
    0
  )
  const discountAmount = subtotal * (invoice.discount / 100)

  const taxableAmount = subtotal - discountAmount

  const taxAmount = taxableAmount * (invoice.taxRate / 100)

  return taxableAmount + taxAmount
}

export function getInvoiceTax(invoice: Invoice) {
  const subtotal = invoice.items.reduce(
    (total, item) => total + item.quantity * item.rate,
    0
  )
  const discountAmount = subtotal * (invoice.discount / 100)

  const taxableAmount = subtotal - discountAmount

  const taxAmount = taxableAmount * (invoice.taxRate / 100)

  return taxAmount
}

export function formatActivityDate(date?: string) {
  if (!date) {
    return ""
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}
