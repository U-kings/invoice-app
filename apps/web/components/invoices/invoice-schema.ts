import { z } from "zod"

export const invoiceItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Please select an item"),
  description: z.string().trim().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  rate: z.number().min(0, "Rate cannot be negative"),
})

export const invoiceSchema = z
  .object({
    invoiceNumber: z.string().trim().min(1, "Invoice number is required"),

    customerId: z.string().min(1, "Please select a customer"),

    customerEmail: z.string().email("Enter a valid email address"),

    currency: z.string().min(1, "Please select a currency"),

    issueDate: z.string().min(1, "Issue date is required"),

    paymentTerm: z.string().min(1, "Please select payment terms"),

    dueDate: z.string(),

    status: z.enum(["Draft", "Sent", "Paid", "Pending", "Overdue", "Cancelled"]),

    items: z.array(invoiceItemSchema).min(1, "Add at least one invoice item"),

    discount: z.number().min(0).max(100),

    taxRate: z.number().min(0).max(100),

    notes: z
      .string()
      .max(2000, "Notes cannot exceed 2,000 characters")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentTerm === "Due-on-receipt" && !data.dueDate.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDate"],
        message: "Due date is required when payment is due on receipt.",
      })
    }
  })

export type InvoiceFormValues = z.infer<typeof invoiceSchema>

export interface InvoiceItem {
  id: string
  name: string
  description: string
  quantity: number
  rate: number
}

export const invoiceItems: InvoiceItem[] = [
  {
    id: "item-001",
    name: "Website Design",
    description: "UI/UX and website design",
    quantity: 1,
    rate: 1500,
  },
  {
    id: "item-002",
    name: "Web Development",
    description: "Frontend and backend development",
    quantity: 1,
    rate: 2500,
  },
  {
    id: "item-003",
    name: "Consulting",
    description: "Professional consulting services",
    quantity: 1,
    rate: 150,
  },
  {
    id: "item-004",
    name: "SEO Optimization",
    description: "Technical and on-page SEO optimization",
    quantity: 1,
    rate: 750,
  },
]
