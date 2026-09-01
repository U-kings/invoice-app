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
import { toast } from "@workspace/ui/components/toast"
import { useRouter } from "next/navigation"
import { useCustomers } from "@/hooks/use-customers"
import { useUpdateCustomer } from "@/hooks/use-update-customer"

const customerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required"),

  email: z.string().trim().email("Enter a valid email address"),
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

  const { data, isLoading } = useCustomers({
    search: customerEmail,
  })

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),

    defaultValues: {
      name: "",
      email: "",
    },
    // 2. Add 'values' to reactively update when async data loads
    values: {
      name: isEditing ? (data?.customers[0]?.name ?? "") : "",
      email: isEditing ? (data?.customers[0]?.email ?? "") : "",
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
        customerId: customerId,
        name: values.name,
        email: values.email,
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
            title: "Failed to Update customer",
            description:
              error instanceof Error
                ? error.message
                : "Something went wrong while updating the customer.",
            type: "error",
          })
        },
      })
    } else {
      createCustomerMutation.mutate(values, {
        onSuccess: (customer) => {
          toast.add({
            title: "Customer created",
            description: `${customer.name} has been updated to your customers.`,
            type: "success",
          })

          reset()
          onOpenChange(false)
        },

        onError: (error) => {
          toast.add({
            title: "Failed to create customer",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit" : "Add"} customer</DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Edit customer details"
              : "Add a customer to use when creating invoices."}
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
              disabled={
                createCustomerMutation.isPending ||
                updateCustomerMutation.isPending
              }
              onClick={() => {
                onOpenChange(false)
                router.replace(
                  `/dashboard/customers?id=${customerId}&email=${customerEmail}&edit=false`
                )
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                createCustomerMutation.isPending ||
                updateCustomerMutation.isPending
              }
            >
              {createCustomerMutation.isPending ||
              updateCustomerMutation.isPending
                ? isEditing
                  ? "Editing..."
                  : "Creating..."
                : isEditing
                  ? "Edit customer"
                  : "Add customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
