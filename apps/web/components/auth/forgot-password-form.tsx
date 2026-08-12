"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  ForgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/validations/auth"

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/toast"

import { AuthBrand } from "./auth-brand"
import { AuthLoader } from "./auth-loader"
import { TrustBadge } from "./trust-badge"
import { useMutation } from "@tanstack/react-query"

async function forgotPassword(email: string) {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    const errorData = await res.json()

    toast.add({
      title: "Login failed",
      description: (errorData.error || "Invalid login details") as string,
      // description: (errorData.message || "Invalid login details") as string,
      type: "error",
    })

    throw new Error(errorData.message || "Invalid login details")
  }
  return res.json() // Expected response: { access_token: '...', user: {...} }
}

export function ForgotPasswordForm() {
  const router = useRouter()

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  // TanStack Mutation Setup
  const { mutate, isPending, error, isError, isSuccess } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      console.log(data)
      toast.add({
        title: "Reset link",
        description: data?.message || "Check your inbox for a reset link!",
        type: "success",
      })
      // 2. Redirect to dashboard or home page
      router.push("/verify-email")
    },
  })

  const onSubmit = async (values: ForgotPasswordValues) => {
    // Trigger mutation payload
    mutate(values?.email)
    // try {
    //   await new Promise((resolve) => setTimeout(resolve, 1500))

    //   console.log(values)

    //   toast.add({
    //     title: "Email sent",
    //     description: "Check your inbox for a reset link.",
    //   })

    //   router.push("/verify-email")
    // } catch {
    //   toast.add({
    //     title: "Unable to send email",
    //     description: "Please try again.",
    //   })
    // }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <AuthBrand
        title="Forgot your password?"
        subtitle="Enter your email address and we'll send you a reset link."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <Field>
          <FieldLabel>Email</FieldLabel>

          <FieldContent>
            <Input placeholder="john@example.com" {...form.register("email")} />

            <FieldError>{form.formState.errors.email?.message}</FieldError>
          </FieldContent>
        </Field>

        <Button
          type="submit"
          className="h-12 w-full bg-[#2EAFB4] hover:bg-[#289ca0]"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting || (isPending && <AuthLoader />)}
          Send Reset Link
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-[#2EAFB4]">
            Login
          </Link>
        </p>
      </form>

      <TrustBadge />
    </motion.div>
  )
}
