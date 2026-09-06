import { Invoice, InvoiceStatus } from "@/hooks/use-invoice"

export type InvoiceTotalInput = {
  lineItems: Array<{
    quantity: number
    rate: unknown
  }>
  discount: unknown
  taxRate: unknown
}

export function getInvoiceTotal(
  invoice: InvoiceTotalInput | undefined
) {
  if (!invoice) {
    return 0
  }

  const subtotal = invoice.lineItems.reduce(
    (total, item) =>
      total + item.quantity * Number(item.rate),
    0
  )

  const discountAmount =
    subtotal * (Number(invoice.discount) / 100)

  const taxableAmount =
    subtotal - discountAmount

  const taxAmount =
    taxableAmount * (Number(invoice.taxRate) / 100)

  return taxableAmount + taxAmount
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
  const newStatus = invoice
    ? invoice?.status?.charAt(0)?.toUpperCase() +
      invoice?.status.slice(1).toLowerCase()
    : "Draft"

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

  if (newStatus === "Paid") {
    return "Paid"
  }

  if (newStatus === "Cancelled") {
    return "Cancelled"
  }

  return invoice.status
}
