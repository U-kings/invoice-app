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
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
  InvoiceItem,
  invoiceItems,
  invoiceSchema,
  type InvoiceFormValues,
} from "./invoice-schema"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { InvoiceItemField } from "./invoice-item-field"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { getCatalogItems, saveCatalogItems } from "./item-catalog"
import { addInvoice, updateInvoice } from "./invoice-storage"
import { Invoice } from "./invoice-data"
import { useRouter } from "next/navigation"
import { formatDateForInput } from "@/lib/dateFormatter"

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
  {
    id: "customer-5",
    name: "Streetwise Enterprises",
    email: "street@wise.com",
  },
  {
    id: "customer-6",
    name: "NBG Enterprises",
    email: "ngb-contact@customer.com",
  },
]

const paymentTerms = [
  {
    value: "Due-on-receipt",
    label: "Due on receipt",
  },
  {
    value: "Net-7",
    label: "Net-7",
  },
  {
    value: "Net-14",
    label: "Net-14",
  },
  {
    value: "Net-30",
    label: "Net-30",
  },
  {
    value: "Net-60",
    label: "Net-60",
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

interface InvoiceFormProps {
  invoice?: Invoice
}

export function InvoiceFormEdit({ invoice }: InvoiceFormProps) {
  const router = useRouter()
  const [saveToCatalog, setSaveToCatalog] = useState<Record<string, boolean>>(
    {}
  )
  const [catalogItems, setCatalogItems] = useState<InvoiceItem[]>(() => {
    const storedItems = getCatalogItems()

    return storedItems.length > 0 ? storedItems : invoiceItems
  })

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),

    defaultValues: {
      invoiceNumber: invoice?.invoiceNumber ?? "INV-001",
      customerId: invoice?.customerId ?? "",
      customerEmail: invoice?.customerEmail ?? "",
      currency: invoice?.currency ?? "NGN",
      issueDate:
        formatDateForInput(invoice?.issueDate) ??
        new Date().toISOString().split("T")[0],
      paymentTerm: invoice?.paymentTerm ?? "Due-on-receipt",
      dueDate: formatDateForInput(invoice?.dueDate),
      status: invoice?.status ?? "Draft",

      items: invoice?.items?.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
      })) ?? [
        {
          id: "",
          name: "",
          description: "",
          quantity: 1,
          rate: 0,
        },
      ],

      discount: invoice?.discount ?? 0,
      taxRate: invoice?.taxRate ?? 0,
      notes: invoice?.notes ?? "",
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

  const issueDate = useWatch({
    control: form.control,
    name: "issueDate",
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

  const toggleSaveToCatalog = (index: number) => {
    setSaveToCatalog((current) => ({
      ...current,
      [index]: !current[index],
    }))
  }

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

  //   const invoiceId = useRef(crypto.randomUUID())

  async function onSubmit(values: InvoiceFormValues) {
    console.log(values)
    // const itemsToSave = values.items.filter((_, index) => saveToCatalog[index])
    // --------------------------------
    // 1. Save selected new items to catalog
    // --------------------------------

    let updatedCatalog = [...catalogItems]

    values.items.forEach((item, index) => {
      if (!saveToCatalog[index]) {
        return
      }

      const catalogItem: InvoiceItem = {
        id: item.id || crypto.randomUUID(),
        name: item.name.trim(),
        description: item.description.trim(),
        quantity: item.quantity,
        rate: item.rate,
      }

      const alreadyExists = updatedCatalog.some(
        (existingItem) =>
          existingItem.name.trim().toLowerCase() ===
          catalogItem.name.trim().toLowerCase()
      )

      if (alreadyExists) {
        return
      }

      updatedCatalog = [...updatedCatalog, catalogItem]
    })

    saveCatalogItems(updatedCatalog)
    setCatalogItems(updatedCatalog)

    // --------------------------------
    // 2. Create the invoice
    // --------------------------------

    const invoiceData: Invoice = {
      id: invoice?.id ?? crypto.randomUUID(),

      invoiceNumber: values.invoiceNumber,
      customerId: values.customerId,
      customerEmail: values.customerEmail,
      currency: values.currency,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      paymentTerm: values.paymentTerm,
      status: values.status,

      items: values.items.map((item) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
      })),

      discount: values.discount,
      taxRate: values.taxRate,
      notes: values.notes,
    }

    // --------------------------------
    // 3. Save the invoice
    // --------------------------------

    if (invoiceData) {
      updateInvoice(invoiceData)
    } else {
      addInvoice(invoiceData)
    }

    // --------------------------------
    // 4. Continue with your existing
    //    success / redirect logic
    // --------------------------------

    router.push("/dashboard/invoices")
  }

  return (
    <form
      id="invoice-form"
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.log("Invoice validation errors:", errors)
      })}
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
            render={({ field, fieldState }) => {
              const selectedCustomer = customers.find(
                (customer) => customer.id === invoice?.customerId
              )

              console.log(selectedCustomer)
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="customer">Customer</FieldLabel>

                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      const customer = customers.find(
                        (customer) => customer.id === value
                      )

                      if (!customer) {
                        return
                      }

                      field.onChange(customer.id)

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
                      <SelectValue placeholder="Select a customer">
                        {selectedCustomer?.name}
                      </SelectValue>
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
              )
            }}
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
                    if (!value) return

                    field.onChange(value)

                    if (value === "Due-on-receipt") {
                      form.setValue("dueDate", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      })

                      return
                    }

                    const days = Number(value.replace("Net-", ""))

                    const issueDate = form.getValues("issueDate")

                    if (!issueDate) return

                    const date = new Date(`${issueDate}T00:00:00`)

                    date.setDate(date.getDate() + days)

                    const formattedDate = date.toISOString().split("T")[0] ?? ""

                    form.setValue("dueDate", formattedDate, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                    // field.onChange(value ?? "")
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
            name="dueDate"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="due-date">Due date</FieldLabel>

                <Input
                  {...field}
                  id="due-date"
                  type="date"
                  min={issueDate}
                  value={field.value ?? ""}
                  aria-invalid={fieldState.invalid}
                />

                <FieldDescription>
                  Required when payment terms are set to due on receipt.
                </FieldDescription>

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
                  disabled
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
              <FieldGroup className="grid min-w-0 gap-4 md:grid-cols-[minmax(180px,1.2fr)_minmax(220px,1.8fr)_90px_130px_160px]">
                <Controller
                  control={form.control}
                  name={`items.${index}.name`}
                  render={({ field, fieldState }) => {
                    // const currentItemId = form.getValues(`items.${index}.id`)

                    // const isCatalogItem = catalogItems.some(
                    //   (item) => item.id === currentItemId
                    // )
                    return (
                      <Field data-invalid={fieldState.invalid}>
                        <InvoiceItemField
                          id={`invoice-item-${index}`}
                          value={field.value}
                          items={catalogItems}
                          onChange={field.onChange}
                          onSelect={(selectedItem) => {
                            form.setValue(
                              `items.${index}.id`,
                              selectedItem.id,
                              {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              }
                            )

                            form.setValue(
                              `items.${index}.name`,
                              selectedItem.name,
                              {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              }
                            )

                            form.setValue(
                              `items.${index}.description`,
                              selectedItem.description,
                              {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              }
                            )

                            form.setValue(
                              `items.${index}.rate`,
                              selectedItem.rate,
                              {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              }
                            )

                            setSaveToCatalog((current) => {
                              const next = { ...current }
                              delete next[index]
                              return next
                            })
                          }}
                        />

                        {fieldState.error && (
                          <FieldError>{fieldState.error.message}</FieldError>
                        )}

                        {/* {!isCatalogItem && ( */}
                        <Controller
                          control={form.control}
                          name={`items.${index}`}
                          render={() => (
                            <Field orientation="horizontal">
                              <Checkbox
                                id={`item-${index}-save-to-catalog`}
                                checked={saveToCatalog[index] ?? false}
                                onCheckedChange={() => {
                                  toggleSaveToCatalog(index)
                                }}
                              />

                              <div className="space-y-1">
                                <FieldLabel
                                  htmlFor={`item-${index}-save-to-catalog`}
                                >
                                  Save this item to your item catalog
                                </FieldLabel>

                                <FieldDescription>
                                  Make this item available for future invoices.
                                </FieldDescription>
                              </div>
                            </Field>
                          )}
                        />
                        {/* )} */}
                      </Field>
                    )
                  }}
                />

                <Controller
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`item-${index}-description`}>
                        Description
                      </FieldLabel>

                      <Input
                        {...field}
                        id={`item-${index}-description`}
                        placeholder="Describe this item"
                        aria-invalid={fieldState.invalid}
                      />

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
                        value={field.value ?? ""}
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
                (optional)
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
            disabled={form.formState.isSubmitting}
            type="button"
            className="h-10"
            variant="outline"
            onClick={handleSubmit(handleSaveDraft)}
          >
            {form.formState.isSubmitting
              ? "Saving to draft..."
              : "Save as draft"}
          </Button>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="h-10 bg-[#2EAFB4] text-white hover:bg-[#269ba0]"
          >
            {form.formState.isSubmitting ? "Updating..." : "Update Invoice"}
          </Button>
        </div>
      </div>
    </form>
  )
}
