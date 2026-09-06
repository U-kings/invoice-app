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
import { AuthLoader } from "./auth-loader"
import { useState } from "react"
import { AuthSuccess } from "./auth-success"
import { useAuthStore } from "@/app/store/useAuthStore"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { LoginCredentials } from "@/app/types/auth"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@workspace/ui/components/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

// 💡 1. Updated fetch function to support conditional endpoints based on the payload
async function loginUser(
  payload: LoginCredentials | { code: string; is2FA: true }
) {
  const endpoint =
    "is2FA" in payload ? "/api/auth/login/verify-2fa" : "/api/auth/login"

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify("is2FA" in payload ? { code: payload.code } : payload),
  })

  const responseData = await res.json()

  if (!res.ok) {
    toast.add({
      title: "Authentication failed",
      description: (responseData.error ||
        "Invalid dynamic execution details") as string,
      type: "error",
    })
    throw new Error(responseData.error || "Invalid authentication details")
  }

  return responseData
}

export function LoginForm() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  // 💡 2. UI Conditional State Hooks for 2FA redirection
  const [show2FA, setShow2FA] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState("")

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  })

  const remember = useWatch({
    control: form.control,
    name: "remember",
  })

  // TanStack Mutation Setup
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // 💡 3. Trap the 2FA intercept flag before assigning final dashboard storage tokens
      if (data.requires2FA) {
        setShow2FA(true)
        toast.add({
          title: "Two-Factor Required",
          description:
            "Please enter your 6-digit verification code or backup code.",
          type: "info",
        })
        return
      }

      setAuth(data.user, data.access_token)
      toast.add({
        title: "Welcome back 👋",
        description: "You have successfully signed in.",
        type: "success",
      })
      router.push("/dashboard")
    },
  })

  if (isSuccess && !show2FA) {
    return <AuthSuccess />
  }

  async function onSubmit(values: LoginValues) {
    const credentials: LoginCredentials = {
      email: values.email,
      password: values.password,
    }
    mutate(credentials)
  }

  // 💡 4. Form intercept block specifically handling code submissions
  async function handle2FASubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!twoFactorCode.trim()) {
      return toast.add({
        title: "Code Required",
        description: "Verification code input cannot be empty.",
        type: "error",
      })
    }
    mutate({ code: twoFactorCode, is2FA: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AuthBrand
        title={show2FA ? "Two-Factor Authentication" : "Welcome Back"}
        subtitle={
          show2FA
            ? "Enter your app generator code or emergency backup array key to authenticate."
            : "Login to your account to continue."
        }
      />

      {!show2FA && (
        <>
          <SocialLogin />
          <Divider />
        </>
      )}

      {/* 💡 5. Conditional view rendering based on the show2FA checkpoint status */}
      {show2FA ? (
        <form onSubmit={handle2FASubmit} className="space-y-6">
          <FieldSet className="w-full">
            <FieldGroup>
              <Field>
                <FieldLabel
                  htmlFor="twoFactorCode"
                  className="mb-2 block w-full text-center"
                >
                  Verification Code
                </FieldLabel>
                <FieldContent className="flex flex-col items-center justify-center">
                  {/* 🌟 SHADCN INPUT OTP IMPLEMENTATION 🌟 */}
                  <InputOTP
                    maxLength={12} // Accommodates either 6 digits or standard alphanumeric backup recovery keys
                    value={twoFactorCode}
                    onChange={setTwoFactorCode}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  >
                    {/* First 3 Digits Group */}
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>

                    <InputOTPSeparator />

                    {/* Second 3 Digits Group */}
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>

                  <p className="mt-3 max-w-70 text-center text-xs text-muted-foreground">
                    Tip: If pasting a recovery code, you can type it out
                    directly into the slots above.
                  </p>
                </FieldContent>
              </Field>
            </FieldGroup>

            <Button
              type="submit"
              disabled={isPending}
              className="group relative mt-4 h-12 w-full overflow-hidden bg-[#2EAFB4] hover:bg-[#289ca0]"
            >
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />
              {isPending && <AuthLoader />}
              Verify Code
            </Button>

            <button
              type="button"
              onClick={() => {
                setShow2FA(false)
                setTwoFactorCode("")
              }}
              className="mt-4 w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              ← Back to standard credentials
            </button>
          </FieldSet>
        </form>
      ) : (
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
                  <FieldError>
                    {form.formState.errors.email?.message}
                  </FieldError>
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
              disabled={form.formState.isSubmitting || isPending}
              className="group relative h-12 w-full overflow-hidden bg-[#2EAFB4] text-primary hover:bg-[#289ca0]"
            >
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />
              {(form.formState.isSubmitting || isPending) && <AuthLoader />}
              Sign In
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-[#2EAFB4]">
                Create an account
              </Link>
            </p>
          </FieldSet>
        </form>
      )}

      <TrustBadge />
    </motion.div>
  )
}
