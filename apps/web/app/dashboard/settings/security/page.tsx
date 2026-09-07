"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Smartphone,
  LogOut,
  Copy,
  Loader2,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/toast"
import BackToSettings from "@/components/settings/back-to-settings"
import Image from "next/image"
import { Label } from "@workspace/ui/components/label"

type PasswordFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>

      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="pr-10"
          autoComplete="current-password"
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

export default function SecuritySettingsPage() {
  const queryClient = useQueryClient()

  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [qrCode, setQrCode] = useState("")
  const [manualSecret, setManualSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showDisableTwoFactor, setShowDisableTwoFactor] = useState(false)

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        "/api/dashboard/settings/security/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to change password")
      }

      return result
    },

    onSuccess: (result) => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      toast.add({
        title: "Password updated",
        description:
          result.message || "Your password has been changed successfully.",
        type: "success",
      })
    },

    onError: (error) => {
      toast.add({
        title: "Unable to change password",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong while changing your password.",
        type: "error",
      })
    },
  })

  const passwordError =
    newPassword && newPassword.length < 8
      ? "Password must be at least 8 characters."
      : undefined

  const confirmPasswordError =
    confirmPassword && newPassword !== confirmPassword
      ? "Passwords do not match."
      : undefined

  const canSubmit =
    currentPassword.trim().length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword === newPassword &&
    !changePasswordMutation.isPending

  const handleChangePassword = () => {
    if (!canSubmit) {
      return
    }

    changePasswordMutation.mutate()
  }

  const setupTwoFactor = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        "/api/dashboard/settings/security/2fa/setup",
        {
          method: "POST",
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to start two-factor authentication"
        )
      }

      return result as {
        qrCode: string
        secret: string
      }
    },

    onSuccess: (result) => {
      setQrCode(result.qrCode)
      setManualSecret(result.secret)
      setVerificationCode("")
      setShowTwoFactorSetup(true)
    },

    onError: (error) => {
      toast.add({
        title: "Unable to enable 2FA",
        description:
          error instanceof Error
            ? error.message
            : "Failed to start two-factor authentication",
        type: "error",
      })
    },
  })

  const twoFactorQuery = useQuery({
    queryKey: ["two-factor-status"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/settings/security/2fa")

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch 2FA status")
      }

      return result as {
        enabled: boolean
      }
    },
  })

  const verifyTwoFactor = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch(
        "/api/dashboard/settings/security/2fa/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to verify two-factor authentication"
        )
      }

      return result as {
        message: string
        recoveryCodes: string[]
      }
    },

    onSuccess: (result) => {
      setRecoveryCodes(result.recoveryCodes)
      setShowTwoFactorSetup(false)
      setVerificationCode("")

      queryClient.invalidateQueries({
        queryKey: ["two-factor-status"],
      })

      toast.add({
        title: "Two-factor authentication enabled",
        description:
          "Your account is now protected with two-factor authentication.",
        type: "success",
      })
    },

    onError: (error) => {
      toast.add({
        title: "Verification failed",
        description:
          error instanceof Error ? error.message : "Invalid verification code",
        type: "error",
      })
    },
  })

  const disableTwoFactorMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        "/api/dashboard/settings/security/2fa/disable",
        {
          method: "POST",
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to disable two-factor authentication"
        )
      }

      return data as {
        message: string
      }
    },

    onSuccess: (data) => {
      setShowDisableTwoFactor(false)
      setRecoveryCodes([])

      queryClient.invalidateQueries({
        queryKey: ["two-factor-status"],
      })

      toast.add({
        title: "Two-factor authentication disabled",
        description: data.message,
        type: "success",
      })
    },

    onError: (error) => {
      toast.add({
        title: "Failed to disable 2FA",
        description: error.message,
        type: "error",
      })
    },
  })

  const regenerateRecoveryCodesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        "/api/dashboard/settings/security/2fa/recovery-codes",
        {
          method: "POST",
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to regenerate recovery codes")
      }

      return data as {
        message: string
        recoveryCodes: string[]
      }
    },

    onSuccess: (data) => {
      setRecoveryCodes(data.recoveryCodes)

      toast.add({
        title: "Recovery codes regenerated",
        description:
          "Your previous recovery codes are no longer valid. Save your new codes somewhere secure.",
        type: "success",
      })
    },

    onError: (error) => {
      toast.add({
        title: "Failed to regenerate recovery codes",
        description: error.message,
        type: "error",
      })
    },
  })

  const sessionsQuery = useQuery({
    queryKey: ["active-sessions"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/settings/security/sessions")

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load active sessions")
      }

      return data as {
        sessions: Array<{
          id: string
          browser: string
          browserVersion: string | null
          operatingSystem: string
          createdAt: string
          lastActiveAt: string
          expiresAt: string
          isCurrent: boolean
        }>
      }
    },
  })

  const revokeAllSessionsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        "/api/dashboard/settings/security/sessions/revoke-all",
        {
          method: "POST",
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to sign out of other devices")
      }

      return data as {
        message: string
        revokedCount: number
      }
    },

    onSuccess: (data) => {
      sessionsQuery.refetch()

      toast.add({
        title: "Signed out of other devices",
        description: data.message,
        type: "success",
      })
    },

    onError: (error) => {
      toast.add({
        title: "Failed to sign out",
        description: error.message,
        type: "error",
      })
    },
  })

  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(
        `/api/dashboard/settings/security/sessions/${sessionId}`,
        {
          method: "DELETE",
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to sign out of this session")
      }

      return data as {
        message: string
      }
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["active-sessions"],
      })

      toast.add({
        title: "Session signed out",
        description: data.message,
        type: "success",
      })
    },

    onError: (error) => {
      toast.add({
        title: "Failed to sign out",
        description: error.message,
        type: "error",
      })
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <BackToSettings />
        <h1 className="text-2xl font-bold tracking-tight">Security</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your password, authentication, and account security.
        </p>
      </div>

      {/* Change password */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <KeyRound className="size-5" />
            </div>

            <div>
              <CardTitle>Change password</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Update your password regularly to keep your account secure.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="max-w-xl space-y-5">
            <PasswordField
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Enter your current password"
            />

            <PasswordField
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Enter your new password"
              error={passwordError}
            />

            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm your new password"
              error={confirmPasswordError}
            />

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium">Password requirements</p>

              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• At least 8 characters</li>
                <li>• Avoid using common or easily guessed passwords</li>
                <li>• Do not reuse a password from another account</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                disabled={!canSubmit}
                onClick={handleChangePassword}
              >
                {changePasswordMutation.isPending
                  ? "Updating..."
                  : "Update password"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-factor authentication */}
      <Card>
        <CardHeader>
          {/* <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Smartphone className="size-5" />
            </div>

            <div>
              <CardTitle>Two-factor authentication</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Add an additional layer of protection to your account.
              </p>
            </div>
          </div> */}

          <div className="">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Smartphone className="size-5" />
                {/* <ShieldCheck className="size-5" /> */}
              </div>

              <div className="flex-1">
                <CardTitle>Two-factor authentication</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add an extra layer of security by requiring an authenticator
                  code when signing in.
                </p>
              </div>

              {twoFactorQuery.data?.enabled && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="size-4" />
                  Enabled
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* <section className="bg-background"> */}
          <section className="rounded-xl border bg-background">
            <div className="p-4">
              {twoFactorQuery.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Checking security status...
                </div>
              ) : twoFactorQuery.data?.enabled ? (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">Authenticator app enabled</p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Your account is protected with two-factor
                        authentication.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => regenerateRecoveryCodesMutation.mutate()}
                        disabled={regenerateRecoveryCodesMutation.isPending}
                      >
                        {regenerateRecoveryCodesMutation.isPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <KeyRound className="size-4" />
                            Regenerate codes
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setShowDisableTwoFactor(true)}
                        disabled={disableTwoFactorMutation.isPending}
                      >
                        Disable 2FA
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground">
                      If you lose access to your authenticator app, you can use
                      one of your recovery codes to sign in.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {!showTwoFactorSetup ? (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">Protect your account</p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Use an authenticator app such as Google Authenticator,
                          Microsoft Authenticator, or 1Password.
                        </p>
                      </div>

                      <Button
                        onClick={() => setupTwoFactor.mutate()}
                        disabled={setupTwoFactor.isPending}
                      >
                        {setupTwoFactor.isPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Setting up...
                          </>
                        ) : (
                          <>
                            <Smartphone className="size-4" />
                            Enable 2FA
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium">
                          Set up your authenticator
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Scan the QR code with your authenticator app, then
                          enter the 6-digit code it generates.
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-4 rounded-xl border bg-muted/30 p-6">
                        {qrCode && (
                          <Image
                            src={qrCode}
                            width={30}
                            height={30}
                            alt="Two-factor authentication QR code"
                            className="size-48 rounded-lg border bg-white p-2"
                          />
                        )}

                        <div className="text-center">
                          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Can&apos;t scan the QR code?
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <code className="rounded-md border bg-background px-3 py-2 text-sm">
                              {manualSecret}
                            </code>

                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                navigator.clipboard.writeText(manualSecret)

                                toast.add({
                                  title: "Secret copied",
                                  description:
                                    "The authenticator secret was copied to your clipboard.",
                                  type: "success",
                                })
                              }}
                            >
                              <Copy className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="two-factor-code">
                          Verification code
                        </Label>

                        <Input
                          id="two-factor-code"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          placeholder="000000"
                          value={verificationCode}
                          onChange={(event) => {
                            const value = event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6)

                            setVerificationCode(value)
                          }}
                        />

                        <p className="text-xs text-muted-foreground">
                          Enter the 6-digit code currently shown in your
                          authenticator app.
                        </p>
                      </div>

                      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowTwoFactorSetup(false)
                            setQrCode("")
                            setManualSecret("")
                            setVerificationCode("")
                          }}
                          disabled={verifyTwoFactor.isPending}
                        >
                          Cancel
                        </Button>

                        <Button
                          type="button"
                          onClick={() =>
                            verifyTwoFactor.mutate(verificationCode)
                          }
                          disabled={
                            verificationCode.length !== 6 ||
                            verifyTwoFactor.isPending
                          }
                        >
                          {verifyTwoFactor.isPending ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="size-4" />
                              Verify and enable
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {showDisableTwoFactor && (
            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium">
                    Disable two-factor authentication?
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    This will remove your authenticator configuration and
                    permanently invalidate all of your existing recovery codes.
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDisableTwoFactor(false)}
                    disabled={disableTwoFactorMutation.isPending}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => disableTwoFactorMutation.mutate()}
                    disabled={disableTwoFactorMutation.isPending}
                  >
                    {disableTwoFactorMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Disabling...
                      </>
                    ) : (
                      "Yes, disable 2FA"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            Two-factor authentication adds an additional layer of protection to
            your account. Keep your recovery codes somewhere safe in case you
            lose access to your authenticator app.
          </p>
        </CardContent>
      </Card>

      {recoveryCodes.length > 0 && (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5">
          <div className="border-b border-amber-500/20 p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <KeyRound className="size-5 text-amber-600" />
              </div>

              <div>
                <h2 className="font-semibold">Save your recovery codes</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  These codes can be used to access your account if you lose
                  access to your authenticator app.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {recoveryCodes.map((code) => (
                <code
                  key={code}
                  className="rounded-md border bg-background px-4 py-3 text-center font-mono text-sm"
                >
                  {code}
                </code>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(recoveryCodes.join("\n"))

                  toast.add({
                    title: "Recovery codes copied",
                    description: "Store these codes somewhere safe.",
                    type: "success",
                  })
                }}
              >
                <Copy className="size-4" />
                Copy codes
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const content = [
                    "Invoice Flow — Two-Factor Recovery Codes",
                    "",
                    ...recoveryCodes,
                    "",
                    "Each recovery code can be used once.",
                  ].join("\n")

                  const blob = new Blob([content], {
                    type: "text/plain",
                  })

                  const url = URL.createObjectURL(blob)
                  const anchor = document.createElement("a")

                  anchor.href = url
                  anchor.download = "invoice-flow-recovery-codes.txt"
                  anchor.click()

                  URL.revokeObjectURL(url)
                }}
              >
                Download codes
              </Button>
            </div>

            <p className="text-xs text-amber-700 dark:text-amber-400">
              Make sure you save these codes now. For security, they won&apos;t
              be displayed again.
            </p>
          </div>
        </section>
      )}

      {/* Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <LogOut className="size-5" />
            </div>

            <div>
              <CardTitle>Active sessions</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage where your account is currently signed in.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Sign out of all devices</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  End all active sessions except the one you are currently
                  using.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => revokeAllSessionsMutation.mutate()}
                disabled={
                  revokeAllSessionsMutation.isPending ||
                  (sessionsQuery.data?.sessions?.length ?? 0) <= 1
                }
              >
                {revokeAllSessionsMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  "Sign out everywhere"
                )}
              </Button>
            </div>

            {sessionsQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading active sessions...
              </div>
            ) : sessionsQuery.data?.sessions.length ? (
              <div className="space-y-2">
                {sessionsQuery.data?.sessions.map((session) => {
                  const isRevoking =
                    revokeSessionMutation.isPending &&
                    revokeSessionMutation.variables === session.id

                  return (
                    <div key={session.id} className="rounded-lg border p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{session.browser}</p>

                            {session.isCurrent && (
                              <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                Current
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {session.operatingSystem}
                            {session.browserVersion
                              ? ` · Version ${session.browserVersion}`
                              : ""}
                          </p>

                          <p className="mt-3 text-xs text-muted-foreground">
                            {session.isCurrent
                              ? "This is the device you are currently using."
                              : "Active session"}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Last active{" "}
                            {new Date(session.lastActiveAt).toLocaleString()}
                          </p>
                        </div>

                        {!session.isCurrent && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              revokeSessionMutation.mutate(session.id)
                            }
                            disabled={revokeSessionMutation.isPending}
                          >
                            {isRevoking ? (
                              <>
                                <Loader2 className="size-4 animate-spin" />
                                Signing out...
                              </>
                            ) : (
                              "Sign out"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No active sessions found.
                </p>
              </div>
            )}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Signing out of another device immediately invalidates that session.
            Your current session will remain active.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
