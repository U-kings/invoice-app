"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { CalendarDays, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
  invoiceItems,
  invoiceSchema,
  type InvoiceFormValues,
} from "./invoice-schema"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

interface Customer {
  id: string
  name: string
  email: string
}

const customers: Customer[] = [
  {
    id: "customer-1",
    name: "Acme Corporation",
    email: "billing@acme.com",
  },
  {
    id: "customer-2",
    name: "Globex Inc.",
    email: "accounts@globex.com",
  },
  {
    id: "customer-3",
    name: "Stark Industries",
    email: "finance@stark.com",
  },
  {
    id: "customer-4",
    name: "Wayne Enterprises",
    email: "billing@wayne.com",
  },
]

const paymentTerms = [
  {
    value: "due-on-receipt",
    label: "Due on receipt",
  },
  {
    value: "7",
    label: "Net 7",
  },
  {
    value: "14",
    label: "Net 14",
  },
  {
    value: "30",
    label: "Net 30",
  },
  {
    value: "60",
    label: "Net 60",
  },
]

const currencies = [
  {
    value: "USD",
    label: "USD — US Dollar",
    symbol: "$",
  },
  {
    value: "EUR",
    label: "EUR — Euro",
    symbol: "€",
  },
  {
    value: "GBP",
    label: "GBP — British Pound",
    symbol: "£",
  },
  {
    value: "NGN",
    label: "NGN — Nigerian Naira",
    symbol: "₦",
  },
]

export function InvoiceForm() {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),

    defaultValues: {
      invoiceNumber: "INV-001",
      customerId: "",
      customerEmail: "",
      currency: "NGN",
      issueDate: new Date().toISOString().split("T")[0],
      paymentTerm: "Net 30",
      dueDate: "",
      status: "Draft",

      items: [
        {
          id: "initial-item",
          name: "",
          description: "",
          quantity: 1,
          rate: 0,
        },
      ],

      discount: 0,
      taxRate: 0,
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const items = useWatch({
    control: form.control,
    name: "items",
  })

  const currency = useWatch({
    control: form.control,
    name: "currency",
  })

  const taxRate = useWatch({
    control: form.control,
    name: "taxRate",
  })
  const discount = useWatch({
    control: form.control,
    name: "discount",
  })

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  const subtotal = items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0
    const rate = Number(item.rate) || 0

    return total + quantity * rate
  }, 0)

  const discountAmount = subtotal * (Number(discount) / 100)

  const taxableAmount = Math.max(0, subtotal - discountAmount)

  const tax = taxableAmount * (Number(taxRate) / 100)

  const total = taxableAmount + tax

  function addItem() {
    append({
      //   id: crypto.randomUUID(),
      id: "",
      name: "",
      description: "",
      quantity: 1,
      rate: 0,
    })
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value)
  }

  function handleSaveDraft(values: InvoiceFormValues) {
    console.log("Saving invoice as draft", values)
  }

  async function onSubmit(values: InvoiceFormValues) {
    console.log(values)
  }

  return (
    <form
      id="invoice-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Invoice information */}
      <section className="rounded-2xl border bg-background p-6">
        <div className="mb-6">
          <h2 className="font-semibold">Invoice information</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Add the basic information for this invoice.
          </p>
        </div>

        <FieldGroup className="grid gap-5 md:grid-cols-2">
          <Field data-invalid={!!errors.invoiceNumber}>
            <FieldLabel htmlFor="invoice-number">Invoice number</FieldLabel>

            <Input
              id="invoice-number"
              placeholder="INV-001"
              aria-invalid={!!errors.invoiceNumber}
              {...register("invoiceNumber")}
            />

            {errors.invoiceNumber && (
              <FieldError>{errors.invoiceNumber.message}</FieldError>
            )}

            <FieldDescription>
              A unique identifier for this invoice.
            </FieldDescription>
          </Field>

          <Controller
            name="customerId"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="customer">Customer</FieldLabel>

                <Select
                  value={field.value}
                  //   onValueChange={(value) => {
                  //     field.onChange(value ?? "")
                  //   }}
                  onValueChange={(value) => {
                    const customer = customers.find(
                      (customer) => customer.id === value
                    )

                    if (!customer) {
                      return
                    }

                    field.onChange(customer.name)

                    form.setValue("customerEmail", customer.email, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }}
                >
                  <SelectTrigger
                    id="customer"
                    aria-invalid={fieldState.invalid}
                    className="data-[size=default]:h-12"
                  >
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>

                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex flex-col">
                          <span>{customer.name}</span>

                          <span className="text-xs text-muted-foreground">
                            {customer.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="customerEmail"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="customer-email">Customer email</FieldLabel>

                <Input
                  {...field}
                  id="customer-email"
                  type="email"
                  placeholder="billing@example.com"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="currency"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="currency">Currency</FieldLabel>

                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value ?? "")
                  }}
                >
                  <SelectTrigger
                    id="currency"
                    aria-invalid={fieldState.invalid}
                    className="data-[size=default]:h-12"
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Field data-invalid={!!errors.issueDate}>
            <FieldLabel htmlFor="issue-date">Issue date</FieldLabel>

            <Input
              id="issue-date"
              type="date"
              aria-invalid={!!errors.issueDate}
              {...register("issueDate")}
            />

            {errors.issueDate && (
              <FieldError>{errors.issueDate.message}</FieldError>
            )}
          </Field>
          <Controller
            control={form.control}
            name="paymentTerm"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="payment-terms">Payment terms</FieldLabel>

                <Select
                  value={field.value || null}
                  onValueChange={(value) => {
                    field.onChange(value ?? "")
                  }}
                >
                  <SelectTrigger
                    id="payment-terms"
                    className="data-[size=default]:h-12"
                    aria-invalid={fieldState.invalid}
                  >
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

                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="status">Status</FieldLabel>

                <Select
                  value={field.value || null}
                  onValueChange={(value) => {
                    if (value) {
                      field.onChange(value)
                    }
                  }}
                >
                  <SelectTrigger
                    id="status"
                    className="data-[size=default]:h-12"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>

                    <SelectItem value="Sent">Sent</SelectItem>
                  </SelectContent>
                </Select>

                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </section>

      {/* Line items */}
      <section className="rounded-2xl border bg-background p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Invoice items</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add the products or services included in this invoice.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add item
          </Button>
        </div>

        <FieldGroup className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium">Item {index + 1}</p>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove item ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* <FieldGroup className="grid gap-4 md:grid-cols-[1fr_120px_160px_140px]"> */}
              <FieldGroup className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_100px_140px_160px]">
                <Controller
                  control={form.control}
                  name={`items.${index}`}
                  render={({ field: itemField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor={`item-${index}`}
                        className="opacity-0"
                      >
                        Item {index + 1}
                      </FieldLabel>

                      <Select
                        value={itemField.value.name || null}
                        onValueChange={(value) => {
                          const selectedItem = invoiceItems.find(
                            (item) => item.id === value
                          )

                          if (!selectedItem) return

                          itemField.onChange({
                            ...selectedItem,
                            quantity: itemField.value.quantity,
                          })
                        }}
                      >
                        <SelectTrigger
                          id={`item-${index}`}
                          aria-invalid={fieldState.invalid}
                          className="data-[size=default]:h-12"
                        >
                          <SelectValue placeholder="Select an item" />
                        </SelectTrigger>

                        <SelectContent>
                          {invoiceItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{item.name}</span>

                                <span className="text-xs text-muted-foreground">
                                  {item.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {itemField.value.description && (
                        <FieldDescription className="pl-2">
                          {itemField.value.description}
                        </FieldDescription>
                      )}

                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field: quantityField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`item-${index}-quantity`}>
                        Quantity
                      </FieldLabel>

                      <Input
                        id={`item-${index}-quantity`}
                        type="number"
                        min="1"
                        value={quantityField.value}
                        aria-invalid={fieldState.invalid}
                        onChange={(event) => {
                          quantityField.onChange(
                            Math.max(1, Number(event.target.value))
                          )
                        }}
                      />

                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`items.${index}.rate`}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="w-full min-w-0 text-right tabular-nums"
                    >
                      <FieldLabel htmlFor={`invoice-item-${index}-rate`}>
                        Rate
                      </FieldLabel>

                      <Input
                        id={`invoice-item-${index}-rate`}
                        type="text"
                        inputMode="decimal"
                        value={field.value}
                        className="h-12 w-full min-w-0 overflow-hidden text-left"
                        onChange={(event) => {
                          const value = event.target.value

                          // Allow only numbers and one decimal point
                          if (!/^\d*\.?\d*$/.test(value)) {
                            return
                          }

                          // Allow only numbers and one decimal point
                          if (value?.length > 13) {
                            return
                          }

                          field.onChange(value === "" ? 0 : Number(value))
                        }}
                        aria-invalid={fieldState.invalid}
                      />

                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
                <Field className="min-w-0">
                  <FieldLabel>Amount</FieldLabel>

                  <div className="flex h-12 min-w-0 items-center justify-end overflow-hidden rounded-md border bg-muted/30 px-3 text-sm font-medium tabular-nums">
                    <span className="truncate">
                      {formatCurrency(
                        (items[index]?.quantity ?? 0) *
                          (items[index]?.rate ?? 0)
                      )}
                    </span>
                  </div>
                </Field>
                {/* (items[index]?.quantity ?? 0) * (items[index]?.rate ?? 0) */}
              </FieldGroup>
            </div>
          ))}
        </FieldGroup>
      </section>

      {/* Notes + totals */}
      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border bg-background p-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>

              <FieldDescription>
                Add a message or payment instructions for your customer.
              </FieldDescription>

              <Textarea
                id="notes"
                placeholder="Thank you for your business..."
                className="min-h-32 resize-none"
              />
            </Field>
          </FieldGroup>
        </div>

        <div className="rounded-2xl border bg-background p-6">
          <h2 className="mb-1 font-semibold">Summary</h2>

          <p className="mb-6 text-sm text-muted-foreground">
            Review the amounts before creating the invoice.
          </p>

          <FieldGroup>
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>

              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            {/* Discount */}
            <Controller
              control={form.control}
              name="discount"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-1">
                      <FieldLabel htmlFor="discount">Discount</FieldLabel>

                      <FieldDescription>
                        Optional discount applied to the subtotal.
                      </FieldDescription>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Input
                        {...field}
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={field.value}
                        onChange={(event) => {
                          const value = Number(event.target.value)

                          field.onChange(
                            Number.isNaN(value)
                              ? 0
                              : Math.max(0, Math.min(100, value))
                          )
                        }}
                        className="h-9 w-20 text-right"
                        aria-invalid={fieldState.invalid}
                      />

                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>

                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            {/* Discount amount */}
            {discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount amount</span>

                <span className="font-medium text-green-600">
                  −{formatCurrency(discountAmount)}
                </span>
              </div>
            )}

            {/* Tax */}
            <Controller
              control={form.control}
              name="taxRate"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-1">
                      <FieldLabel htmlFor="tax-rate">Tax</FieldLabel>

                      <FieldDescription>
                        Applied after the discount.
                      </FieldDescription>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Input
                        {...field}
                        id="tax-rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={field.value}
                        onChange={(event) => {
                          const value = Number(event.target.value)

                          field.onChange(
                            Number.isNaN(value)
                              ? 0
                              : Math.max(0, Math.min(100, value))
                          )
                        }}
                        className="h-9 w-20 text-right"
                        aria-invalid={fieldState.invalid}
                      />

                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>

                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            {/* Tax amount */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax amount</span>

              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>

            {/* Total */}
            <div className="overflow-hidden border-t pt-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-semibold">Total</p>

                  <p className="mt-1 text-xs whitespace-pre-line text-muted-foreground">
                    {currency} · {items.length}{" "}
                    {items.length === 1 ? "item" : "items"}
                  </p>
                </div>

                <span className="text-2xl font-semibold tracking-tight">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </FieldGroup>
        </div>
      </section>
      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" className="h-10" variant="ghost">
          <Link href="/dashboard/invoices">Cancel</Link>
          Cancel
        </Button>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            type="button"
            className="h-10"
            variant="outline"
            onClick={handleSubmit(handleSaveDraft)}
          >
            Save as draft
          </Button>

          <Button
            type="submit"
            className="h-10 bg-[#2EAFB4] text-white hover:bg-[#269ba0]"
          >
            Create invoice
          </Button>
        </div>
      </div>
    </form>
  )
}
