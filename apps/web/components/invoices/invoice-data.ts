import { InvoiceItem } from "./invoice-schema"

export type InvoiceStatus =
  "Sent" | "Paid" | "Pending" | "Overdue" | "Draft" | "Cancelled"

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  // customer: string
  customerEmail: string
  currency: string
  issueDate: string
  dueDate: string
  paymentTerm: string
  // amount: number
  status: InvoiceStatus
  paidAt?: string
  sentAt?: string
  lastSentAt?: string
  cancelledAt?: string
  items: InvoiceItem[]
  discount: number
  taxRate: number
  notes: string | undefined
}

export const invoices: Invoice[] = [
  {
    id: "INV-1024",
    invoiceNumber: "INV-001",
    customerId: "customer-1",
    customerEmail: "billing@acme.com",
    currency: "NGN",
    issueDate: "Aug 13, 2026",
    dueDate: "Aug 27, 2026",
    paymentTerm: "Due-on-receipt",
    status: "Paid",
    items: [
      {
        id: "item-001",
        name: "Website Design",
        description: "UI/UX and website design",
        quantity: 1,
        rate: 1500,
      },
    ],
    discount: 0,
    taxRate: 0,
    notes: "",
  },
  {
    id: "INV-1023",
    invoiceNumber: "INV-002",
    customerId: "customer-2",
    customerEmail: "accounts@globex.com",
    currency: "NGN",
    issueDate: "Aug 12, 2026",
    dueDate: "Aug 26, 2026",
    paymentTerm: "Due-on-receipt",
    status: "Pending",
    items: [
      {
        id: "item-001",
        name: "Website Design",
        description: "UI/UX and website design",
        quantity: 1,
        rate: 1500,
      },
    ],
    discount: 0,
    taxRate: 0,
    notes: "",
  },
  {
    id: "INV-1022",
    invoiceNumber: "INV-003",
    customerId: "customer-3",
    customerEmail: "finance@waynecorp.com",
    currency: "NGN",
    issueDate: "Aug 10, 2026",
    dueDate: "Aug 24, 2026",
    paymentTerm: "Due-on-receipt",
    status: "Overdue",
    items: [
      {
        id: "item-001",
        name: "Website Design",
        description: "UI/UX and website design",
        quantity: 1,
        rate: 1500,
      },
    ],
    discount: 0,
    taxRate: 0,
    notes: "",
  },
  {
    id: "INV-1021",
    invoiceNumber: "INV-004",
    customerId: "customer-4",
    customerEmail: "billing@umbrella.com",
    currency: "NGN",
    issueDate: "Aug 8, 2026",
    dueDate: "Aug 22, 2026",
    paymentTerm: "Due-on-receipt",
    status: "Paid",
    items: [
      {
        id: "item-001",
        name: "Website Design",
        description: "UI/UX and website design",
        quantity: 1,
        rate: 1500,
      },
    ],
    discount: 0,
    taxRate: 0,
    notes: "",
  },
  {
    id: "INV-1020",
    invoiceNumber: "INV-005",
    customerId: "customer-5",
    customerEmail: "finance@stark.com",
    currency: "NGN",
    issueDate: "Aug 5, 2026",
    dueDate: "Aug 19, 2026",
    paymentTerm: "Due-on-receipt",
    status: "Pending",
    items: [
      {
        id: "item-001",
        name: "Website Design",
        description: "UI/UX and website design",
        quantity: 1,
        rate: 1500,
      },
    ],
    discount: 0,
    taxRate: 0,
    notes: "",
  },
  {
    id: "INV-1019",
    invoiceNumber: "INV-006",
    customerId: "customer-6",
    customerEmail: "accounts@cyberdyne.com",
    currency: "NGN",
    issueDate: "Aug 2, 2026",
    dueDate: "Aug 16, 2026",
    paymentTerm: "Due-on-receipt",
    status: "Draft",
    items: [
      {
        id: "item-001",
        name: "Website Design",
        description: "UI/UX and website design",
        quantity: 1,
        rate: 1500,
      },
    ],
    discount: 0,
    taxRate: 0,
    notes: "",
  },
]

interface Customer {
  id: string
  name: string
  email: string
}

export const customers: Customer[] = [
  {
    id: "customer-1",
    name: "Acme Corporation",
    email: "billing@acme.com",
  },
  {
    id: "customer-2",
    name: "Globex Inc.",
    email: "accounts@globex.com",
  },
  {
    id: "customer-3",
    name: "Stark Industries",
    email: "finance@stark.com",
  },
  {
    id: "customer-4",
    name: "Wayne Enterprises",
    email: "billing@wayne.com",
  },
  {
    id: "customer-5",
    name: "Streetwise Enterprises",
    email: "street@wise.com",
  },
  {
    id: "customer-6",
    name: "NBG Enterprises",
    email: "ngb-contact@customer.com",
  },
]
