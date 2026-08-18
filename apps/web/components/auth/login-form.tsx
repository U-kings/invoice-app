"use client"

import Link from "next/link"
import { motion } from "motion/react"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "@workspace/ui/components/toast"

import { LoginSchema, type LoginValues } from "@/lib/validations/auth"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@workspace/ui/components/field"

import { AuthBrand } from "./auth-brand"
import { Divider } from "./divider"
import { PasswordInput } from "./password-input"
import { SocialLogin } from "./social-login"
import { TrustBadge } from "./trust-badge"
import { PasswordStrength } from "./password-strength"
import { AuthLoader } from "./auth-loader"
import { useEffect, useState } from "react"
import { AuthSuccess } from "./auth-success"
import { useAuthStore } from "@/app/store/useAuthStore"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { LoginCredentials } from "@/app/types/auth"

async function loginUser(credentials: LoginCredentials) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
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

export function LoginForm() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  })

  const password = useWatch({
    control: form.control,
    name: "password",
  })

  const remember = useWatch({
    control: form.control,
    name: "remember",
  })

  // TanStack Mutation Setup
  const { mutate, isPending, error, isError, isSuccess } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // 1. Update your global Zustand state
      setAuth(data.user, data.access_token)
      toast.add({
        title: "Welcome back 👋",
        description: "You have successfully signed in.",
        type: "success",
      })
      // 2. Redirect to dashboard or home page
      router.push("/dashboard")
    },
  })

  // useEffect(() => {

  if (isSuccess) {
    return <AuthSuccess />
  }
  //   return () => {
  //   }
  // }, [success])

  async function onSubmit(values: LoginValues) {
    const credentials: LoginCredentials = {
      email: values.email,
      password: values.password,
    }
    // Trigger mutation payload
    mutate(credentials)
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
    >
      <AuthBrand
        title="Welcome Back"
        subtitle="Login to your account to continue."
      />

      {/* <Divider /> */}

      <SocialLogin />

      <Divider />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FieldSet className="w-full">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>

              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...form.register("email")}
                  className="py-2"
                />

                <FieldError>{form.formState.errors.email?.message}</FieldError>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>

              <FieldContent>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  {...form.register("password")}
                />

                {/* <PasswordStrength password={password ?? ""} /> */}

                <FieldError>
                  {form.formState.errors.password?.message}
                </FieldError>
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="flex items-center justify-between">
            <Field orientation="horizontal">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) =>
                  form.setValue("remember", checked === true)
                }
              />

              <FieldLabel htmlFor="remember">Remember me</FieldLabel>
            </Field>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-nowrap text-[#2EAFB4]"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="group relative h-12 w-full overflow-hidden bg-[#2EAFB4] hover:bg-[#289ca0]"
          >
            <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />
            {form.formState.isSubmitting || (isPending && <AuthLoader />)}
            Sign In
            {/* {form.formState.isSubmitting
      ? "Signing In..."
      : "Login"} */}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#2EAFB4]">
              Create an account
            </Link>
          </p>
        </FieldSet>
      </form>

      <TrustBadge />
    </motion.div>
  )
}
