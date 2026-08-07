import { z } from "zod"
import { isValidPhoneNumber } from "libphonenumber-js"

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),

  password: z.string().min(8, "Password must be at least 8 characters"),

  remember: z.boolean().optional(),
})

export type LoginValues = z.infer<typeof LoginSchema>

export const SignupSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),

    lastName: z.string().min(2, "Last name is required"),

    email: z.string().email("Please enter a valid email"),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .refine((value) => isValidPhoneNumber(value), {
        message: "Please enter a valid international phone number",
      }),

    password: z.string().min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string(),

    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

export type SignupValues = z.infer<typeof SignupSchema>

export const ForgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
})

export type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

export type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>
