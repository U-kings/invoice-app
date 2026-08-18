import type { Invoice, InvoiceStatus } from "./invoice-data"

const STORAGE_KEY = "invoices"

export function getInvoices(): Invoice[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveInvoices(invoices: Invoice[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
}

export function initializeInvoices(defaultInvoices: Invoice[]): Invoice[] {
  const storedInvoices = getInvoices()

  if (storedInvoices.length > 0) {
    return storedInvoices
  }

  saveInvoices(defaultInvoices)
  notifyInvoiceStorageUpdated()

  return defaultInvoices
}

export function addInvoice(invoice: Invoice): Invoice[] {
  const currentInvoices = getInvoices()

  const alreadyExists = currentInvoices.some(
    (existingInvoice) => existingInvoice.id === invoice.id
  )

  if (alreadyExists) {
    return currentInvoices
  }

  const updatedInvoices = [...currentInvoices, invoice]

  saveInvoices(updatedInvoices)

  return updatedInvoices
}

export function deleteInvoice(invoiceId: string): Invoice[] {
  const currentInvoices = getInvoices()

  const updatedInvoices = currentInvoices.filter(
    (invoice) => invoice.id !== invoiceId
  )

  saveInvoices(updatedInvoices)

  return updatedInvoices
}

export function updateInvoice(updatedInvoice: Invoice): Invoice[] {
  const currentInvoices = getInvoices()

  const updatedInvoices = currentInvoices.map((invoice) =>
    invoice.id === updatedInvoice.id ? updatedInvoice : invoice
  )

  saveInvoices(updatedInvoices)

  return updatedInvoices
}

export function markInvoiceAsPaid(invoiceId: string) {
  const invoices = getInvoices()

  const updatedInvoices = invoices.map((invoice): Invoice => {
    if (invoice.id !== invoiceId) {
      return invoice
    }

    if (invoice.status === "Cancelled" || invoice.status === "Paid") {
      return invoice
    }

    return {
      ...invoice,
      status: "Paid",
      paidAt: new Date().toISOString(),
    }
  })

  saveInvoices(updatedInvoices)
  notifyInvoiceStorageUpdated()

  window.dispatchEvent(new Event(INVOICE_STORAGE_EVENT))

  return updatedInvoices
}

export function getEffectiveInvoiceStatus(invoice: Invoice): InvoiceStatus {
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

export function markInvoiceAsSent(invoiceId: string): Invoice | null {
  const invoices = getInvoices()

  const invoice = invoices.find((invoice) => invoice.id === invoiceId)

  if (!invoice) {
    return null
  }

  if (invoice.status === "Cancelled" || invoice.status === "Paid") {
    return invoice
  }

  const updatedInvoice: Invoice = {
    ...invoice,
    status: "Sent",
    sentAt: new Date().toISOString(),
  }

  const updatedInvoices = invoices.map((invoice) =>
    invoice.id === invoiceId ? updatedInvoice : invoice
  )

  saveInvoices(updatedInvoices)
  notifyInvoiceStorageUpdated()

  return updatedInvoice
}

export function cancelInvoice(invoiceId: string): Invoice | null {
  const invoices = getInvoices()

  const invoice = invoices.find((invoice) => invoice.id === invoiceId)

  if (!invoice) {
    return null
  }

  if (invoice.status === "Paid" || invoice.status === "Cancelled") {
    return invoice
  }

  const updatedInvoice: Invoice = {
    ...invoice,
    status: "Cancelled",
    cancelledAt: new Date().toISOString(),
  }

  const updatedInvoices = invoices.map((invoice) =>
    invoice.id === invoiceId ? updatedInvoice : invoice
  )

  saveInvoices(updatedInvoices)
  notifyInvoiceStorageUpdated()

  return updatedInvoice
}

export const INVOICE_STORAGE_EVENT = "invoice-storage-updated"

export function notifyInvoiceStorageUpdated() {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new CustomEvent(INVOICE_STORAGE_EVENT))
}
