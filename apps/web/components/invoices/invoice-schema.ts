import { z } from "zod"

export const invoiceItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Please select an item"),
  description: z.string().trim().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  rate: z.number().min(0, "Rate cannot be negative"),
})

export const invoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1, "Invoice number is required"),

  customerId: z.string().min(1, "Please select a customer"),

  customerEmail: z.string().email("Enter a valid email address"),

  currency: z.string().min(1, "Please select a currency"),

  issueDate: z.string().min(1, "Issue date is required"),

  paymentTerm: z.string().min(1, "Please select payment terms"),

  dueDate: z.string().min(1, "Due date is required"),

  status: z.enum(["Draft", "Sent"]),

  items: z.array(invoiceItemSchema).min(1, "Add at least one invoice item"),

  discount: z.number().min(0).max(100),

  taxRate: z.number().min(0).max(100),

  notes: z
    .string()
    .max(2000, "Notes cannot exceed 2,000 characters")
    .optional(),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>

export interface InvoiceItem {
  id: string
  name: string
  description: string
  rate: number
}

export const invoiceItems: InvoiceItem[] = [
  {
    id: "item-001",
    name: "Website Design",
    description: "UI/UX and website design",
    rate: 1500,
  },
  {
    id: "item-002",
    name: "Web Development",
    description: "Frontend and backend development",
    rate: 2500,
  },
  {
    id: "item-003",
    name: "Consulting",
    description: "Professional consulting services",
    rate: 150,
  },
  {
    id: "item-004",
    name: "SEO Optimization",
    description: "Technical and on-page SEO optimization",
    rate: 750,
  },
]
