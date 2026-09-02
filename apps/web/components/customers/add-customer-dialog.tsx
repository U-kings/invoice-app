"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { Button } from "@workspace/ui/components/button"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"

import { Input } from "@workspace/ui/components/input"

import { useCreateCustomer } from "@/hooks/use-create-customer"
import { useUpdateCustomer } from "@/hooks/use-update-customer"
import { useCustomers } from "@/hooks/use-customers"

import { toast } from "@workspace/ui/components/toast"
import { useRouter } from "next/navigation"

const customerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required"),

  email: z.string().trim().email("Enter a valid email address"),

  phone: z.string().trim().optional().or(z.literal("")),

  address: z.string().trim().optional().or(z.literal("")),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface AddCustomerDialogProps {
  open: boolean
  isEditing: boolean
  customerEmail: string
  customerId: string
  onOpenChange: (open: boolean) => void
}

export function AddCustomerDialog({
  open,
  isEditing,
  customerEmail,
  customerId,
  onOpenChange,
}: AddCustomerDialogProps) {
  const router = useRouter()

  const createCustomerMutation = useCreateCustomer()
  const updateCustomerMutation = useUpdateCustomer()

  const { data } = useCustomers({
    search: customerEmail,
  })

  const customer = data?.customers[0]

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),

    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },

    values: {
      name: isEditing ? (customer?.name ?? "") : "",
      email: isEditing ? (customer?.email ?? "") : "",
      phone: isEditing ? (customer?.phone ?? "") : "",
      address: isEditing ? (customer?.address ?? "") : "",
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  function onSubmit(values: CustomerFormValues) {
    if (isEditing) {
      const payload = {
        customerId,
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        address: values.address || null,
      }

      updateCustomerMutation.mutate(payload, {
        onSuccess: (customer) => {
          toast.add({
            title: "Customer Updated",
            description: `${customer.name} has been updated.`,
            type: "success",
          })

          reset()
          onOpenChange(false)

          router.replace(
            `/dashboard/customers?id=${customerId}&email=${customerEmail}&edit=false`
          )
        },

        onError: (error) => {
          toast.add({
            title: "Failed to Update Customer",
            description:
              error instanceof Error
                ? error.message
                : "Something went wrong while updating the customer.",
            type: "error",
          })
        },
      })
    } else {
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        address: values.address || null,
      }

      createCustomerMutation.mutate(payload, {
        onSuccess: (customer) => {
          toast.add({
            title: "Customer Created",
            description: `${customer.name} has been added to your customers.`,
            type: "success",
          })

          reset()
          onOpenChange(false)
        },

        onError: (error) => {
          toast.add({
            title: "Failed to Create Customer",
            description:
              error instanceof Error
                ? error.message
                : "Something went wrong while creating the customer.",
            type: "error",
          })
        },
      })
    }
  }

  const isPending =
    createCustomerMutation.isPending || updateCustomerMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)

        router.replace(
          `/dashboard/customers?id=${customerId}&email=${customerEmail}&edit=false`
        )
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit customer" : "Add customer"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update your customer's contact information."
              : "Add a customer to use when creating invoices."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-5">
            {/* ------------------------------------------------ */}
            {/* Name */}
            {/* ------------------------------------------------ */}

            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="customer-name">Name</FieldLabel>

              <Input
                id="customer-name"
                placeholder="Acme Ltd"
                autoComplete="organization"
                aria-invalid={!!errors.name}
                {...register("name")}
              />

              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            {/* ------------------------------------------------ */}
            {/* Email + Phone */}
            {/* ------------------------------------------------ */}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="customer-email">Email</FieldLabel>

                <Input
                  id="customer-email"
                  type="email"
                  placeholder="billing@acme.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />

                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor="customer-phone">Phone</FieldLabel>

                <Input
                  id="customer-phone"
                  type="tel"
                  placeholder="+234 801 234 5678"
                  autoComplete="tel"
                  aria-invalid={!!errors.phone}
                  {...register("phone")}
                />

                {errors.phone && (
                  <FieldError>{errors.phone.message}</FieldError>
                )}
              </Field>
            </div>

            {/* ------------------------------------------------ */}
            {/* Address */}
            {/* ------------------------------------------------ */}

            <Field data-invalid={!!errors.address}>
              <FieldLabel htmlFor="customer-address">Address</FieldLabel>

              <Input
                id="customer-address"
                placeholder="12 Admiralty Way, Lagos"
                autoComplete="street-address"
                aria-invalid={!!errors.address}
                {...register("address")}
              />

              {errors.address && (
                <FieldError>{errors.address.message}</FieldError>
              )}
            </Field>
          </FieldGroup>

          {/* -------------------------------------------------- */}
          {/* Footer */}
          {/* -------------------------------------------------- */}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                onOpenChange(false)

                router.replace(
                  `/dashboard/customers?id=${customerId}&email=${customerEmail}&edit=false`
                )
              }}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save changes"
                  : "Add customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
