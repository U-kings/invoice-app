"use client"
"use no memo"

import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { toast } from "@workspace/ui/components/toast"

import {
  invoiceSettingsSchema,
  type InvoiceSettingsFormValues,
} from "./settings-schema"

type InvoiceSettings = {
  id: string
  userId: string
  invoiceNumberPrefix: string
  nextInvoiceNumber: number
  defaultCurrency: string
  defaultPaymentTerm: string
  defaultTaxRate: string | number
  defaultDiscount: string | number
  defaultNotes: string | null
  createdAt: string
  updatedAt: string
}

const defaultValues: InvoiceSettingsFormValues = {
  invoiceNumberPrefix: "INV-",
  nextInvoiceNumber: 1,
  defaultCurrency: "NGN",
  defaultPaymentTerm: "Due-on-receipt",
  defaultTaxRate: 0,
  defaultDiscount: 0,
  defaultNotes: "",
}

const paymentTerms = [
  {
    value: "Due-on-receipt",
    label: "Due on receipt",
  },
  {
    value: "Net-7",
    label: "Net 7",
  },
  {
    value: "Net-15",
    label: "Net 15",
  },
  {
    value: "Net-30",
    label: "Net 30",
  },
  {
    value: "Net-45",
    label: "Net 45",
  },
  {
    value: "Net-60",
    label: "Net 60",
  },
  {
    value: "Net-90",
    label: "Net 90",
  },
]

const currencies = [
  {
    code: "NGN",
    name: "Nigerian Naira",
  },
  {
    code: "USD",
    name: "US Dollar",
  },
  {
    code: "GBP",
    name: "British Pound",
  },
  {
    code: "EUR",
    name: "Euro",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
  },
  {
    code: "AUD",
    name: "Australian Dollar",
  },
  {
    code: "ZAR",
    name: "South African Rand",
  },
  {
    code: "GHS",
    name: "Ghanaian Cedi",
  },
  {
    code: "KES",
    name: "Kenyan Shilling",
  },
]

export function InvoiceSettingsForm() {
  const queryClient = useQueryClient()

  const form = useForm<InvoiceSettingsFormValues>({
    resolver: zodResolver(invoiceSettingsSchema),
    defaultValues,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isDirty },
  } = form

  const invoiceNumberPrefix = useWatch({
    control,
    name: "invoiceNumberPrefix",
  })

  const nextInvoiceNumber = useWatch({
    control,
    name: "nextInvoiceNumber",
  })

  const defaultCurrency = useWatch({
    control,
    name: "defaultCurrency",
  })

  const defaultPaymentTerm = useWatch({
    control,
    name: "defaultPaymentTerm",
  })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["invoice-settings"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/settings/invoices")

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch invoice settings")
      }

      return result as {
        invoiceSettings: InvoiceSettings | null
      }
    },
  })

  useEffect(() => {
    if (!data) {
      return
    }

    if (!data.invoiceSettings) {
      reset(defaultValues)
      return
    }

    const settings = data.invoiceSettings

    reset({
      invoiceNumberPrefix: settings.invoiceNumberPrefix || "INV-",

      nextInvoiceNumber: Number(settings.nextInvoiceNumber ?? 1),

      defaultCurrency: settings.defaultCurrency || "NGN",

      defaultPaymentTerm: settings.defaultPaymentTerm || "Due-on-receipt",

      defaultTaxRate: Number(settings.defaultTaxRate ?? 0),

      defaultDiscount: Number(settings.defaultDiscount ?? 0),

      defaultNotes: settings.defaultNotes || "",
    })
  }, [data, reset])

  const updateInvoiceSettings = useMutation({
    mutationFn: async (values: InvoiceSettingsFormValues) => {
      const response = await fetch("/api/dashboard/settings/invoices", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceNumberPrefix: values.invoiceNumberPrefix,

          nextInvoiceNumber: Number(values.nextInvoiceNumber),

          defaultCurrency: values.defaultCurrency,

          defaultPaymentTerm: values.defaultPaymentTerm,

          defaultTaxRate: Number(values.defaultTaxRate),

          defaultDiscount: Number(values.defaultDiscount),

          defaultNotes: values.defaultNotes || "",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update invoice settings")
      }

      return result as {
        message: string
        invoiceSettings: InvoiceSettings
      }
    },

    onSuccess: (result) => {
      const settings = result.invoiceSettings

      reset({
        invoiceNumberPrefix: settings.invoiceNumberPrefix,

        nextInvoiceNumber: Number(settings.nextInvoiceNumber),

        defaultCurrency: settings.defaultCurrency,

        defaultPaymentTerm: settings.defaultPaymentTerm,

        defaultTaxRate: Number(settings.defaultTaxRate),

        defaultDiscount: Number(settings.defaultDiscount),

        defaultNotes: settings.defaultNotes || "",
      })

      queryClient.invalidateQueries({
        queryKey: ["invoice-settings"],
      })

      toast.add({
        title: "Success",
        description: result.message || "Invoice settings updated successfully",
        type: "success",
      })
    },

    onError: (error) => {
      toast.add({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update invoice settings",
        type: "error",
      })
    },
  })

  const onSubmit = (values: InvoiceSettingsFormValues) => {
    updateInvoiceSettings.mutate(values)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded bg-muted" />
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="h-10 animate-pulse rounded-md bg-muted" />
              <div className="h-10 animate-pulse rounded-md bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded bg-muted" />
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="h-10 animate-pulse rounded-md bg-muted" />
              <div className="h-10 animate-pulse rounded-md bg-muted" />
              <div className="h-10 animate-pulse rounded-md bg-muted" />
              <div className="h-10 animate-pulse rounded-md bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          </CardHeader>

          <CardContent>
            <div className="h-32 animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-4">
          <div className="text-center">
            <p className="font-medium">Unable to load invoice settings</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Something went wrong while loading your invoice preferences.
            </p>
          </div>

          <Button type="button" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Invoice numbering */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice numbering</CardTitle>

          <CardDescription>
            Configure how invoice numbers are generated for new invoices.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="invoiceNumberPrefix">
                Invoice number prefix
              </FieldLabel>

              <Input
                id="invoiceNumberPrefix"
                placeholder="INV-"
                aria-invalid={!!errors.invoiceNumberPrefix}
                {...register("invoiceNumberPrefix")}
              />

              {errors.invoiceNumberPrefix && (
                <FieldError>{errors.invoiceNumberPrefix.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="nextInvoiceNumber">
                Next invoice number
              </FieldLabel>

              <Input
                id="nextInvoiceNumber"
                type="number"
                min="1"
                step="1"
                aria-invalid={!!errors.nextInvoiceNumber}
                {...register("nextInvoiceNumber", {
                  valueAsNumber: true,
                })}
              />

              {errors.nextInvoiceNumber && (
                <FieldError>{errors.nextInvoiceNumber.message}</FieldError>
              )}
            </Field>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              New invoices will start at
            </p>

            <p className="mt-1 text-lg font-semibold">
              {invoiceNumberPrefix || "INV-"}
              {nextInvoiceNumber || 1}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Invoice defaults */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice defaults</CardTitle>

          <CardDescription>
            These values will be pre-filled when you create a new invoice.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="defaultCurrency">
                Default currency
              </FieldLabel>

              <Select
                value={defaultCurrency}
                onValueChange={(value) =>
                  setValue("defaultCurrency", value ?? "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="defaultCurrency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>

                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} — {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.defaultCurrency && (
                <FieldError>{errors.defaultCurrency.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="defaultPaymentTerm">
                Default payment terms
              </FieldLabel>

              <Select
                value={defaultPaymentTerm}
                onValueChange={(value) =>
                  setValue("defaultPaymentTerm", value ?? "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="defaultPaymentTerm">
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>

                <SelectContent>
                  {paymentTerms.map((term) => (
                    <SelectItem key={term.value} value={term.value}>
                      {term.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.defaultPaymentTerm && (
                <FieldError>{errors.defaultPaymentTerm.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="defaultTaxRate">Default tax rate</FieldLabel>

              <div className="relative">
                <Input
                  id="defaultTaxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  className="pr-10"
                  aria-invalid={!!errors.defaultTaxRate}
                  {...register("defaultTaxRate", {
                    valueAsNumber: true,
                  })}
                />

                <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                  %
                </span>
              </div>

              {errors.defaultTaxRate && (
                <FieldError>{errors.defaultTaxRate.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="defaultDiscount">
                Default discount
              </FieldLabel>

              <div className="relative">
                <Input
                  id="defaultDiscount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  className="pr-10"
                  aria-invalid={!!errors.defaultDiscount}
                  {...register("defaultDiscount", {
                    valueAsNumber: true,
                  })}
                />

                <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                  %
                </span>
              </div>

              {errors.defaultDiscount && (
                <FieldError>{errors.defaultDiscount.message}</FieldError>
              )}
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Default content */}
      <Card>
        <CardHeader>
          <CardTitle>Default content</CardTitle>

          <CardDescription>
            Add notes that should be automatically included on new invoices.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Field>
            <FieldLabel htmlFor="defaultNotes">Invoice notes</FieldLabel>

            <Textarea
              id="defaultNotes"
              rows={5}
              placeholder="Thank you for your business."
              aria-invalid={!!errors.defaultNotes}
              {...register("defaultNotes")}
            />

            {errors.defaultNotes && (
              <FieldError>{errors.defaultNotes.message}</FieldError>
            )}
          </Field>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isDirty || updateInvoiceSettings.isPending}
        >
          {updateInvoiceSettings.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}

          {updateInvoiceSettings.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
