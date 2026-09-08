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
import { toast } from "@workspace/ui/components/toast"
import { useUpdateCustomer } from "@/hooks/use-update-customer"

const customerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required"),

  email: z.email("Enter a valid email address"),

  phone: z.string().trim().optional().or(z.literal("")),

  address: z.string().trim().optional().or(z.literal("")),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface EditCustomerDialogProps {
  customer: {
    id: string
    name: string
    email: string
    phone: string
    address: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCustomerDialog({
  customer,
  open,
  onOpenChange,
}: EditCustomerDialogProps) {
  const updateCustomerMutation = useUpdateCustomer()

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),

    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
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
    updateCustomerMutation.mutate(
      {
        customerId: customer.id,
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        address: values.address || null,
      },
      {
        onSuccess: (updatedCustomer) => {
          toast.add({
            title: "Customer updated",
            description: `${updatedCustomer.name} has been updated successfully.`,
            type: "success",
          })

          onOpenChange(false)
        },

        onError: (error) => {
          toast.add({
            title: "Failed to update customer",
            description:
              error instanceof Error
                ? error.message
                : "Something went wrong while updating the customer.",
            type: "error",
          })
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add customer</DialogTitle>

          <DialogDescription>
            Add a customer to use when creating invoices.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="customer-name">Name</FieldLabel>

              <Input
                id="customer-name"
                placeholder="Acme Ltd"
                aria-invalid={!!errors.name}
                {...register("name")}
              />

              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="customer-email">Email</FieldLabel>

              <Input
                id="customer-email"
                type="email"
                placeholder="billing@acme.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />

              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={updateCustomerMutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={updateCustomerMutation.isPending}>
              {updateCustomerMutation.isPending
                ? "Creating..."
                : "Add customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
