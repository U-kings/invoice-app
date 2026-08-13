"use client"

import Link from "next/link"
import { MailCheck } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@workspace/ui/components/button"

interface PageType {
  pageType: "reset-password" | "signup"
  onResendApiCall?: (email: string) => void
  cooldown?: number
  isPending?: boolean
  message?: {
    type: "success" | "error"
    text: string
  } | null
  email?: string
}

export function VerifyEmail({
  pageType = "reset-password",
  onResendApiCall,
  cooldown,
  isPending,
  email,
  message,
}: PageType) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      className="flex flex-col items-center text-center"
    >
      <div className="mb-6 rounded-full bg-[#2EAFB4]/10 p-6">
        <MailCheck className="h-12 w-12 text-[#2EAFB4]" />
      </div>

      <h1 className="text-3xl font-bold">Check your email</h1>
      {pageType === "signup" ? (
        <p className="mt-4 text-muted-foreground">
          We sent a verification link to{" "}
          <strong className="text-[#1a202c] dark:text-gray-300">{email}</strong>. Please click
          the link in that email to activate your account.
        </p>
      ) : (
        <p className="mt-4 text-muted-foreground">
          We&apos;ve sent a password reset link to your email address.
        </p>
      )}

      <Button
        type="button"
        className="mt-8 w-full bg-[#2EAFB4] hover:bg-[#289ca0]"
      >
        <Link href="/login">Back to Login</Link>
      </Button>

      {pageType === "signup" ? (
        <Button
          onClick={() => onResendApiCall && onResendApiCall(email || "")}
          disabled={(cooldown || 0) > 0 || isPending}
          type="button"
          variant={"ghost"}
          className="mt-6 text-sm text-[#2EAFB4]"
        >
          {" "}
          {isPending
            ? "Sending..."
            : (cooldown || 0) > 0
              ? `Resend email in ${cooldown}s`
              : "Resend verification email"}
        </Button>
      ) : (
        <Button
          // onClick={() => onResendApiCall(email)}
          disabled={(cooldown || 0) > 0 || isPending}
          type="button"
          variant={"ghost"}
          className="mt-6 text-sm text-[#2EAFB4]"
        >
          {" "}
          {isPending
            ? "Sending..."
            : (cooldown || 0) > 0
              ? `Resend email in ${cooldown}s`
              : "Resend verification email"}
        </Button>
      )}

      {/* Contextual Feedback Messages */}
      {message && (
        <p
          style={{
            fontSize: "13px",
            marginTop: "12px",
            color: message.type === "success" ? "#16a34a" : "#dc2626",
            fontWeight: "500",
          }}
        >
          {message.text}
        </p>
      )}

      {/* Troubleshooting help */}
      <p
        style={{
          fontSize: "12px",
          color: "#718096",
          marginTop: "16px",
          textAlign: "center",
        }}
      >
        Can&apos;t find it? Check your spam folder or try a different email
        address.
      </p>
    </motion.div>
  )
}
