"use client"

import { useEffect, useState } from "react"
import {
  Banknote,
  Check,
  CreditCard,
  Info,
  Landmark,
  Link2,
  Loader2,
  WalletCards,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"
import { PaystackConnectDialog } from "@/components/settings/paystack-connect-dialog"

import {
  useConnectStripe,
  useDisconnectPaystack,
  useDisconnectStripe,
  usePaymentProviderConnections,
} from "@/hooks/use-payment-provider-connections"

import {
  usePaymentSettings,
  useUpdatePaymentSettings,
} from "@/hooks/use-payment-settings"
import BackToSettings from "@/components/settings/back-to-settings"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

type PaymentProvider = "paystack" | "stripe" | "flutterwave"

interface Provider {
  id: PaymentProvider
  name: string
  description: string
  initials: string
}

const providers: Provider[] = [
  {
    id: "paystack",
    name: "Paystack",
    description:
      "Accept cards, bank transfers and other local payment methods.",
    initials: "P",
  },
  // {
  //   id: "stripe",
  //   name: "Stripe",
  //   description: "Accept cards and international payments from your customers.",
  //   initials: "S",
  // },
  // {
  //   id: "flutterwave",
  //   name: "Flutterwave",
  //   description: "Let customers pay using their Flutterwave account.",
  //   initials: "FW",
  // },
]

interface Bank {
  name: string
  code: string
}

export default function PaymentSettingsPage() {
  const { data, isLoading } = usePaymentSettings()
  const updatePaymentSettings = useUpdatePaymentSettings()

  const { data: providerConnections = [] } = usePaymentProviderConnections()

  const disconnectPaystack = useDisconnectPaystack()
  const connectStripe = useConnectStripe()
  const disconnectStripe = useDisconnectStripe()

  const [paystackDialogOpen, setPaystackDialogOpen] = useState(false)

  const [enabledProviders, setEnabledProviders] = useState<PaymentProvider[]>(
    []
  )

  const [paymentMethods, setPaymentMethods] = useState({
    card: true,
    bankTransfer: true,
    cash: false,
  })

  const [preferences, setPreferences] = useState({
    onlinePayments: true,
    paymentLinks: true,
    partialPayments: false,
    automaticPaymentConfirmation: true,
  })

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    bankCode: "",
    accountName: "",
    accountNumber: "",
    additionalInformation: "",
  })

  const [banks, setBanks] = useState<Bank[]>([])
  const [isLoadingBanks, setIsLoadingBanks] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  function isProviderConnected(providerId: PaymentProvider) {
    const providerName = providerId.toUpperCase()

    return providerConnections.some(
      (connection) =>
        connection.provider === providerName &&
        connection.status === "CONNECTED"
    )
  }

  function handleProviderAction(providerId: PaymentProvider) {
    const connected = isProviderConnected(providerId)

    if (providerId === "paystack") {
      if (connected) {
        disconnectPaystack.mutate()
      } else {
        setPaystackDialogOpen(true)
      }

      return
    }

    if (providerId === "stripe") {
      if (connected) {
        disconnectStripe.mutate()
      } else {
        connectStripe.mutate()
      }
      return
    }
  }

  /*
   * Populate the editable page state from the API.
   *
   * The state is kept locally because the user needs to be able
   * to make multiple changes before clicking "Save changes".
   */
  useEffect(() => {
    if (!data) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabledProviders(
      [
        data.paystackEnabled ? "paystack" : null,
        data.stripeEnabled ? "stripe" : null,
        data.flutterwaveEnabled ? "flutterwave" : null,
      ].filter((provider): provider is PaymentProvider => provider !== null)
    )

    setPaymentMethods({
      card: data.cardPayments,
      bankTransfer: data.bankTransfer,
      cash: data.cashPayments,
    })

    setPreferences({
      onlinePayments: data.onlinePayments,
      paymentLinks: data.paymentLinks,
      partialPayments: data.partialPayments,
      automaticPaymentConfirmation: data.automaticPaymentConfirmation,
    })

    setBankDetails({
      bankName: data.bankName ?? "",
      bankCode: data.bankCode ?? "",
      accountName: data.accountName ?? "",
      accountNumber: data.accountNumber ?? "",
      additionalInformation: data.additionalInformation ?? "",
    })
  }, [data])

  function updatePaymentMethod(
    method: keyof typeof paymentMethods,
    checked: boolean
  ) {
    setPaymentMethods((current) => ({
      ...current,
      [method]: checked,
    }))
  }

  function updatePreference(
    preference: keyof typeof preferences,
    checked: boolean
  ) {
    setPreferences((current) => ({
      ...current,
      [preference]: checked,
    }))
  }

  useEffect(() => {
    async function loadBanks() {
      try {
        const res = await fetch("/api/auth/verify-account") // Calls our new GET endpoint
        const data = await res.json()
        if (data.success) {
          setBanks(data.banks)
        } else {
          setErrorMsg("Could not render the bank list.")
        }
      } catch {
        setErrorMsg("Failed to connect to the bank server.")
      } finally {
        setIsLoadingBanks(false)
      }
    }
    loadBanks()
  }, [])

  useEffect(() => {
    if (bankDetails.accountNumber.length === 10 && bankDetails.bankCode) {
      const verifyAccount = async () => {
        setIsVerifying(true)
        setErrorMsg("")
        try {
          const response = await fetch("/api/auth/verify-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accountNumber: bankDetails.accountNumber,
              bankCode: bankDetails.bankCode,
            }),
          })
          const data = await response.json()
          if (data.success) {
            setBankDetails((prev) => ({
              ...prev,
              accountName: data.accountName,
            }))
          } else {
            setErrorMsg(data.error || "Verification mismatch.")
          }
        } catch {
          setErrorMsg("Network lookup timeout.")
        } finally {
          setIsVerifying(false)
        }
      }
      verifyAccount()
    } else {
      setBankDetails((prev) => ({ ...prev, accountName: "" }))
    }
  }, [bankDetails.accountNumber, bankDetails.bankCode])

  function handleSave() {
    updatePaymentSettings.mutate({
      paystackEnabled: enabledProviders.includes("paystack"),
      stripeEnabled: enabledProviders.includes("stripe"),
      flutterwaveEnabled: enabledProviders.includes("flutterwave"),

      cardPayments: paymentMethods.card,
      bankTransfer: paymentMethods.bankTransfer,
      cashPayments: paymentMethods.cash,

      onlinePayments: preferences.onlinePayments,
      paymentLinks: preferences.paymentLinks,
      partialPayments: preferences.partialPayments,
      automaticPaymentConfirmation: preferences.automaticPaymentConfirmation,

      bankName: bankDetails.bankName.trim() || null,
      accountName: bankDetails.accountName.trim() || null,
      accountNumber: bankDetails.accountNumber.trim() || null,
      additionalInformation: bankDetails.additionalInformation.trim() || null,
    })
  }

  if (isLoading) {
    return (
      <div className="w-full space-y-8">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded-md bg-muted" />
        </div>

        <div className="space-y-6">
          <SettingsSkeleton />
          <SettingsSkeleton />
          <SettingsSkeleton />
          <SettingsSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <BackToSettings />
        <h1 className="text-2xl font-bold tracking-tight">Payment settings</h1>

        <p className="text-sm text-muted-foreground">
          Configure how your customers can pay invoices and manage your payment
          preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Online payments */}
        <section className="rounded-2xl border bg-background">
          <div className="border-b px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">Online payments</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Connect a payment provider to let customers pay invoices
                  online.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y">
            {providers.map((provider) => {
              const connected = isProviderConnected(provider.id)

              const connecting =
                provider.id === "stripe" && connectStripe.isPending

              const disconnecting =
                (provider.id === "paystack" && disconnectPaystack.isPending) ||
                (provider.id === "stripe" && disconnectStripe.isPending)

              const processing = connecting || disconnecting

              return (
                <div
                  key={provider.id}
                  className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold",
                        connected
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {provider.initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{provider.name}</p>

                        {connected && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <Check className="h-3 w-3" />
                            Connected
                          </span>
                        )}
                      </div>

                      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                        {provider.description}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant={connected ? "outline" : "default"}
                    className="shrink-0"
                    disabled={
                      processing ||
                      provider.id === "stripe" ||
                      provider.id === "flutterwave"
                    }
                    onClick={() => handleProviderAction(provider.id)}
                  >
                    {processing && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}

                    {connecting
                      ? "Connecting..."
                      : disconnecting
                        ? "Disconnecting..."
                        : connected
                          ? "Disconnect"
                          : "Connect"}
                  </Button>
                </div>
              )
            })}
          </div>
        </section>

        <PaystackConnectDialog
          open={paystackDialogOpen}
          onOpenChange={setPaystackDialogOpen}
        />

        {/* Payment methods */}
        <section className="rounded-2xl border bg-background">
          <div className="border-b px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <WalletCards className="h-4 w-4 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">Payment methods</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Choose the payment methods you want to make available to
                  customers.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y">
            <PaymentMethodRow
              icon={CreditCard}
              title="Card payments"
              description="Accept payments using debit and credit cards."
              checked={paymentMethods.card}
              onCheckedChange={(checked) =>
                updatePaymentMethod("card", checked)
              }
            />

            <PaymentMethodRow
              icon={Landmark}
              title="Bank transfer"
              description="Show your bank details on invoices for manual transfers."
              checked={paymentMethods.bankTransfer}
              onCheckedChange={(checked) =>
                updatePaymentMethod("bankTransfer", checked)
              }
            />

            <PaymentMethodRow
              icon={Banknote}
              title="Cash payments"
              description="Allow invoices to be recorded as paid manually."
              checked={paymentMethods.cash}
              onCheckedChange={(checked) =>
                updatePaymentMethod("cash", checked)
              }
            />
          </div>
        </section>

        {/* Payment preferences */}
        <section className="rounded-2xl border bg-background">
          <div className="border-b px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Link2 className="h-4 w-4 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">Payment preferences</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Control how online payments and payment links work.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y">
            <PreferenceRow
              title="Accept online payments"
              description="Allow customers to pay invoices directly online."
              checked={preferences.onlinePayments}
              onCheckedChange={(checked) =>
                updatePreference("onlinePayments", checked)
              }
            />

            <PreferenceRow
              title="Payment links"
              description="Include a secure payment link on invoices sent to customers."
              checked={preferences.paymentLinks}
              onCheckedChange={(checked) =>
                updatePreference("paymentLinks", checked)
              }
            />

            <PreferenceRow
              title="Allow partial payments"
              description="Let customers pay an invoice in multiple payments."
              checked={preferences.partialPayments}
              onCheckedChange={(checked) =>
                updatePreference("partialPayments", checked)
              }
            />

            <PreferenceRow
              title="Automatic payment confirmation"
              description="Automatically mark an invoice as paid when a provider confirms the payment."
              checked={preferences.automaticPaymentConfirmation}
              onCheckedChange={(checked) =>
                updatePreference("automaticPaymentConfirmation", checked)
              }
            />
          </div>
        </section>

        {/* Bank transfer details */}
        <section className="rounded-2xl border bg-background">
          <div className="border-b px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Landmark className="h-4 w-4 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">Bank transfer details</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  These details can be displayed on invoices when bank transfer
                  is enabled.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank name</Label>

                <Select
                  value={bankDetails.bankName}
                  onValueChange={(value) => {
                    const selectedCode = banks.find(
                      (bank) => bank.name === value
                    )?.code

                    setBankDetails((prev) => ({
                      ...prev,
                      bankName: value ?? "",
                      bankCode: selectedCode ?? "",
                      accountName: "",
                    }))
                  }}
                >
                  <SelectTrigger
                    id="bank-name"
                    className="w-full data-[size=default]:h-12"
                  >
                    <SelectValue placeholder="Select a bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* 2. Map through the array dynamically */}
                    {banks.map((bank) => (
                      <SelectItem key={bank.name} value={bank.name}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* <Input
                  id="bank-name"
                  placeholder="e.g. First Bank"
                  value={bankDetails.bankName}
                  onChange={(event) =>
                    setBankDetails((current) => ({
                      ...current,
                      bankName: event.target.value,
                    }))
                  }
                /> */}
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-name">Account name</Label>

                <Input
                  id="account-name"
                  placeholder="Business account name"
                  value={bankDetails.accountName}
                  disabled
                  onChange={(event) =>
                    setBankDetails((current) => ({
                      ...current,
                      accountName: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="account-number">Account number</Label>

                <Input
                  id="account-number"
                  placeholder="Enter your account number"
                  inputMode="numeric"
                  value={bankDetails.accountNumber}
                  onChange={(event) =>
                    setBankDetails((current) => ({
                      ...current,
                      accountNumber: event.target.value,
                    }))
                  }
                />
              </div>

              {isVerifying && (
                <p className="animate-pulse text-xs text-muted-foreground">
                  Verifying account holder...
                </p>
              )}

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bank-information">
                  Additional instructions
                </Label>

                <Textarea
                  id="bank-information"
                  placeholder="Add any additional payment instructions..."
                  value={bankDetails.additionalInformation}
                  onChange={(event) =>
                    setBankDetails((current) => ({
                      ...current,
                      additionalInformation: event.target.value,
                    }))
                  }
                  className="min-h-24 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 rounded-xl border bg-muted/40 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

              <p className="text-sm leading-6 text-muted-foreground">
                Only include business bank account information that you want
                customers to use for invoice payments.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border bg-background/95 p-4 shadow-lg backdrop-blur">
        <div className="hidden sm:block">
          <p className="text-sm font-medium">Payment settings</p>

          <p className="text-xs text-muted-foreground">
            Changes will apply to new invoices.
          </p>
        </div>

        <Button
          type="button"
          className="ml-auto h-10 min-w-32"
          disabled={updatePaymentSettings.isPending}
          onClick={handleSave}
        >
          {updatePaymentSettings.isPending && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {updatePaymentSettings.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  )
}

interface PaymentMethodRowProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function PaymentMethodRow({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: PaymentMethodRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-5">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>

        <div>
          <p className="font-medium">{title}</p>

          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

interface PreferenceRowProps {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function PreferenceRow({
  title,
  description,
  checked,
  onCheckedChange,
}: PreferenceRowProps) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-5">
      <div className="min-w-0">
        <p className="font-medium">{title}</p>

        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-background">
      <div className="border-b px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />

          <div className="space-y-2">
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
            <div className="h-3 w-72 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="h-12 animate-pulse rounded-lg bg-muted" />
        <div className="h-12 animate-pulse rounded-lg bg-muted" />
        <div className="h-12 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}
