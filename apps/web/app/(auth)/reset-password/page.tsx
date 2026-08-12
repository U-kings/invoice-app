import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { ResetPasswordSkeleton } from "@/components/auth/reset-password-skeleton"
import { Suspense } from "react"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
