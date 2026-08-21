import { Invoice, InvoiceStatus } from "@/hooks/use-invoice"

export function getInvoiceTotal(invoice: Invoice | undefined) {
  const subtotal = invoice?.lineItems.reduce(
    (total, item) => total + item.quantity * item.rate,
    0
  )

  if (subtotal && invoice) {
    const discountAmount = subtotal * (invoice.discount / 100)

    const taxableAmount = subtotal - discountAmount

    const taxAmount = taxableAmount * (invoice.taxRate / 100)

    return taxableAmount + taxAmount
  }
}

export function getInvoiceTax(invoice: Invoice) {
  const subtotal = invoice.lineItems.reduce(
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

export function getEffectiveInvoiceStatus(
  invoice: Invoice | undefined
): InvoiceStatus {
  if (!invoice) {
    return "Draft"
  }

  const today = new Date()
  const dueDate = new Date(invoice.dueDate)

  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)

  if (dueDate < today) {
    return "Overdue"
  }

  if (invoice.status === "Paid") {
    return "Paid"
  }

  if (invoice.status === "Cancelled") {
    return "Cancelled"
  }

  return invoice.status
}
