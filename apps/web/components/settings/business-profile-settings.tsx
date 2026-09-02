"use client"

import { useEffect } from "react"
import { useRef, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react"

import {
  useRemoveBusinessLogo,
  useUploadBusinessLogo,
} from "@/hooks/use-business-profile"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
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
import { toast } from "@workspace/ui/components/toast"
import { businessProfileSchema } from "./settings-schema"
import { zodResolver } from "@hookform/resolvers/zod"

type BusinessProfileFormValues = {
  businessName: string
  countryCode: string
  currency: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  postalCode: string
  taxId: string
}

type BusinessProfile = BusinessProfileFormValues & {
  id: string
  userId: string
  logoUrl: string | null
  createdAt: string
  updatedAt: string
}

const countries = [
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "GH", name: "Ghana", currency: "GHS" },
  { code: "KE", name: "Kenya", currency: "KES" },
  { code: "ZA", name: "South Africa", currency: "ZAR" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "AU", name: "Australia", currency: "AUD" },
]

const currencies = [
  { code: "NGN", name: "Nigerian Naira" },
  { code: "GHS", name: "Ghanaian Cedi" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "ZAR", name: "South African Rand" },
  { code: "USD", name: "US Dollar" },
  { code: "GBP", name: "British Pound" },
  { code: "EUR", name: "Euro" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
]

const defaultValues: BusinessProfileFormValues = {
  businessName: "",
  countryCode: "",
  currency: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  taxId: "",
}

export function BusinessProfileSettings() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadBusinessLogo = useUploadBusinessLogo()
  const removeBusinessLogo = useRemoveBusinessLogo()

  const form = useForm<BusinessProfileFormValues>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = form

  const countryCode = useWatch({
    control: form.control,
    name: "countryCode",
  })

  const currency = useWatch({
    control: form.control,
    name: "currency",
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/settings/business")

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch business profile")
      }

      return result as {
        businessProfile: BusinessProfile | null
      }
    },
  })

  useEffect(() => {
    if (!data?.businessProfile) {
      return
    }

    const profile = data.businessProfile

    reset({
      businessName: profile.businessName ?? "",
      countryCode: profile.countryCode ?? "",
      currency: profile.currency ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      website: profile.website ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
      postalCode: profile.postalCode ?? "",
      taxId: profile.taxId ?? "",
    })
  }, [data, reset])

  const updateBusinessProfile = useMutation({
    mutationFn: async (values: BusinessProfileFormValues) => {
      const response = await fetch("/api/dashboard/settings/business", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update business profile")
      }

      return result
    },

    onSuccess: (result) => {
      if (result.businessProfile) {
        reset({
          businessName: result.businessProfile.businessName ?? "",
          countryCode: result.businessProfile.countryCode ?? "",
          currency: result.businessProfile.currency ?? "",
          email: result.businessProfile.email ?? "",
          phone: result.businessProfile.phone ?? "",
          website: result.businessProfile.website ?? "",
          address: result.businessProfile.address ?? "",
          city: result.businessProfile.city ?? "",
          state: result.businessProfile.state ?? "",
          postalCode: result.businessProfile.postalCode ?? "",
          taxId: result.businessProfile.taxId ?? "",
        })
      }

      queryClient.invalidateQueries({
        queryKey: ["business-profile"],
      })

      toast.add({
        title: "Success",
        description: result.message || "Business profile updated successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast.add({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update business profile",
        type: "error",
      })
    },
  })

  const onSubmit = (values: BusinessProfileFormValues) => {
    updateBusinessProfile.mutate(values)
  }

  const handleCountryChange = (value: string | null) => {
    if (!value) {
      setValue("countryCode", "", {
        shouldDirty: true,
        shouldValidate: true,
      })

      return
    }

    setValue("countryCode", value, {
      shouldDirty: true,
      shouldValidate: true,
    })

    const country = countries.find((item) => item.code === value)

    if (country) {
      setValue("currency", country.currency, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Business information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact information</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex min-h-40 items-center justify-center">
          <p className="text-sm text-destructive">
            Failed to load your business profile.
          </p>
        </CardContent>
      </Card>
    )
  }

  const hasBusinessProfile = !!data?.businessProfile

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!hasBusinessProfile && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">Set up your business profile</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Add your business details so they can appear on invoices and
            receipts.
          </p>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Business information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-xl border bg-muted/20 p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-background">
                  {data?.businessProfile?.logoUrl ? (
                    <img
                      src={data.businessProfile.logoUrl}
                      alt={`${data.businessProfile.businessName || "Business"} logo`}
                      className="size-full object-contain p-2"
                    />
                  ) : (
                    <ImagePlus className="size-7 text-muted-foreground" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium">Business logo</p>

                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Upload your logo to display it on invoices and other
                    business documents.
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    JPG, PNG or WEBP · Maximum 5 MB
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]

                    if (!file) return

                    uploadBusinessLogo.mutate(file, {
                      onSuccess: () => {
                        toast.add({
                          title: "Logo uploaded",
                          description:
                            "Your business logo has been updated successfully.",
                          type: "success",
                        })
                      },

                      onError: (error) => {
                        toast.add({
                          title: "Upload failed",
                          description:
                            error instanceof Error
                              ? error.message
                              : "Failed to upload business logo.",
                          type: "error",
                        })
                      },

                      onSettled: () => {
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      },
                    })
                  }}
                />

                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadBusinessLogo.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadBusinessLogo.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}

                  {uploadBusinessLogo.isPending
                    ? "Uploading..."
                    : data?.businessProfile?.logoUrl
                      ? "Change logo"
                      : "Upload logo"}
                </Button>

                {data?.businessProfile?.logoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={removeBusinessLogo.isPending}
                    onClick={() => {
                      removeBusinessLogo.mutate(undefined, {
                        onSuccess: () => {
                          toast.add({
                            title: "Logo removed",
                            description: "Your business logo has been removed.",
                            type: "success",
                          })
                        },

                        onError: (error) => {
                          toast.add({
                            title: "Failed to remove logo",
                            description:
                              error instanceof Error
                                ? error.message
                                : "Failed to remove business logo.",
                            type: "error",
                          })
                        },
                      })
                    }}
                    aria-label="Remove business logo"
                  >
                    {removeBusinessLogo.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Field>
            <FieldLabel htmlFor="businessName">Business name</FieldLabel>

            <Input
              id="businessName"
              placeholder="Acme Ltd."
              aria-invalid={!!errors.businessName}
              {...register("businessName", {
                required: "Business name is required",
              })}
            />

            {errors.businessName && (
              <FieldError>{errors.businessName.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="website">Website</FieldLabel>

            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              aria-invalid={!!errors.website}
              {...register("website")}
            />
            {errors.website && (
              <FieldError>{errors.website.message}</FieldError>
            )}
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="email">Business email</FieldLabel>

            <Input
              id="email"
              type="email"
              placeholder="hello@example.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />

            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>

            <Input
              id="phone"
              type="tel"
              placeholder="+234 800 000 0000"
              {...register("phone")}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business address</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <Field>
            <FieldLabel htmlFor="address">Address</FieldLabel>

            <Input
              id="address"
              placeholder="123 Business Street"
              aria-invalid={!!errors.address}
              {...register("address")}
            />

            {errors.address && (
              <FieldError>{errors.address.message}</FieldError>
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="city">City</FieldLabel>

              <Input id="city" placeholder="Lagos" {...register("city")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="state">State</FieldLabel>

              <Input id="state" placeholder="Lagos" {...register("state")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="postalCode">Postal code</FieldLabel>

              <Input
                id="postalCode"
                placeholder="100001"
                aria-invalid={!!errors.postalCode}
                {...register("postalCode")}
              />
              {errors.postalCode && (
                <FieldError>{errors.postalCode.message}</FieldError>
              )}
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax & billing</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="countryCode">Country</FieldLabel>

              <Select value={countryCode} onValueChange={handleCountryChange}>
                <SelectTrigger
                  aria-invalid={!!errors.countryCode}
                  id="countryCode"
                  className="data-[size=default]:h-12"
                >
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>

                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.countryCode && (
                <FieldError>{errors.countryCode.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="currency">Currency</FieldLabel>

              <Select
                value={currency}
                onValueChange={(value) =>
                  setValue("currency", value ?? "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  id="currency"
                  className="data-[size=default]:h-12"
                  aria-invalid={!!errors.currency}
                >
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>

                <SelectContent>
                  {currencies.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.code} — {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.currency && (
                <FieldError>{errors.currency.message}</FieldError>
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="taxId">Tax ID</FieldLabel>

            <Input
              id="taxId"
              placeholder="Enter your tax identification number"
              aria-invalid={!!errors.taxId}
              {...register("taxId")}
            />
            {errors.taxId && <FieldError>{errors.taxId.message}</FieldError>}
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isDirty || updateBusinessProfile.isPending}
        >
          {updateBusinessProfile.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}

          {updateBusinessProfile.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
