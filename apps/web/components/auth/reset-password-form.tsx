"use client"

import React, { useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "motion/react"

import {
  ResetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/validations/auth"

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"

import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/toast"

import { AuthBrand } from "./auth-brand"
import { PasswordInput } from "./password-input"
import { PasswordStrength } from "./password-strength"
import { AuthLoader } from "./auth-loader"
import { TrustBadge } from "./trust-badge"
import { AuthSuccess } from "./auth-success"
import { useMutation } from "@tanstack/react-query"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Extract the ?token= value safely from the URL string
  const token = searchParams.get("token")

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const password = useWatch({
    control: form.control,
    name: "password",
  })

  async function resetPassword(password: string) {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
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

  // TanStack Mutation Setup
  const { mutate, isPending, error, isError, isSuccess } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      console.log(data)
      toast.add({
        title: "Reset link",
        description: data?.message,
        type: "success",
      })
      // 2. Redirect to dashboard or home page
      router.push("/login")
    },
  })

  if (isSuccess) {
    return (
      <AuthSuccess
        title="Password Updated!"
        description="Redirecting you to the login page..."
      />
    )
  }

  const onSubmit = async (values: ResetPasswordValues) => {
    mutate(values?.password)
    // try {
    //   await new Promise((resolve) => setTimeout(resolve, 2000))

    //   console.log(values)

    //   toast.add({
    //     title: "Password Updated",
    //     description: "You can now sign in with your new password.",
    //   })

    //   setSuccess(true)

    //   setTimeout(() => {
    //     router.push("/login")
    //   }, 1500)
    // } catch {
    //   toast.add({
    //     title: "Something went wrong",
    //     description: "Unable to update your password.",
    //   })
    // }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <AuthBrand
        title="Create a new password"
        subtitle="Your new password must be different from your previous password."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel>New Password</FieldLabel>

            <FieldContent>
              <PasswordInput {...form.register("password")} />

              <PasswordStrength password={password ?? ""} />

              <FieldError>{form.formState.errors.password?.message}</FieldError>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Confirm Password</FieldLabel>

            <FieldContent>
              <PasswordInput {...form.register("confirmPassword")} />

              <FieldError>
                {form.formState.errors.confirmPassword?.message}
              </FieldError>
            </FieldContent>
          </Field>
        </FieldGroup>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="h-12 w-full bg-[#2EAFB4] hover:bg-[#289ca0]"
        >
          {form.formState.isSubmitting || (isPending && <AuthLoader />)}
          Update Password
        </Button>
      </form>

      <TrustBadge />
    </motion.div>
  )
}
