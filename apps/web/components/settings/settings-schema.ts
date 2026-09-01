import { z } from "zod"

export const businessProfileSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, "Business name is required")
    .max(100, "Business name is too long"),

  countryCode: z
    .string()
    .trim()
    .length(2, "Select a valid country"),

  currency: z
    .string()
    .trim()
    .min(3, "Select a valid currency")
    .max(3, "Select a valid currency"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long"),

  website: z
    .string()
    .trim()
    .url("Enter a valid website URL")
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(200, "Address is too long"),

  city: z
    .string()
    .trim()
    .max(100, "City is too long"),

  state: z
    .string()
    .trim()
    .max(100, "State is too long"),

  postalCode: z
    .string()
    .trim()
    .max(20, "Postal code is too long"),

  taxId: z
    .string()
    .trim()
    .max(50, "Tax ID is too long"),
})

export type BusinessProfileFormValues = z.infer<
  typeof businessProfileSchema
>


export const invoiceSettingsSchema = z.object({
  invoiceNumberPrefix: z
    .string()
    .trim()
    .min(1, "Invoice number prefix is required")
    .max(20, "Prefix is too long"),

  nextInvoiceNumber: z
    .number()
    .int("Invoice number must be a whole number")
    .min(1, "Invoice number must be at least 1"),

  defaultCurrency: z
    .string()
    .trim()
    .length(3, "Select a valid currency"),

  defaultPaymentTerm: z
    .string()
    .trim()
    .min(1, "Payment term is required"),

  defaultTaxRate: z
    .number()
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100"),

  defaultDiscount: z
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100"),

  defaultNotes: z
    .string()
    .trim()
    .max(2000, "Notes are too long")
    .optional()
    .or(z.literal("")),
})

export type InvoiceSettingsFormValues = z.infer<
  typeof invoiceSettingsSchema
>