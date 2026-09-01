"use client"

import { useEffect } from "react"
import {
  useForm,
} from "react-hook-form"

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
  useProfile,
  useUpdateProfile,
} from "@/hooks/use-profile"
import { toast } from "@workspace/ui/components/toast"

interface ProfileFormValues {
  firstName: string
  middleName: string
  lastName: string
  email: string
  phoneNumber: string
}

export function ProfileSettings() {
  const profileQuery = useProfile()
  const updateProfileMutation = useUpdateProfile()

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  })

  useEffect(() => {
    if (!profileQuery.data) {
      return
    }

    form.reset({
      firstName: profileQuery.data.firstName,
      middleName:
        profileQuery.data.middleName ?? "",
      lastName: profileQuery.data.lastName,
      email: profileQuery.data.email,
      phoneNumber: profileQuery.data.phoneNumber,
    })
  }, [profileQuery.data, form])

  function onSubmit(values: ProfileFormValues) {
    updateProfileMutation.mutate(
      {
        firstName: values.firstName,
        middleName: values.middleName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Profile updated",
            description:
              "Your profile has been updated successfully.",
            type: "success",
          })
        },
        onError: (error) => {
          toast.add({
            title: "Failed to update profile",
            description:
              error instanceof Error
                ? error.message
                : "Something went wrong.",
            type: "error",
          })
        },
      }
    )
  }

  if (profileQuery.isLoading) {
    return (
      <div className="rounded-2xl border bg-background p-6">
        <p className="text-sm text-muted-foreground">
          Loading profile...
        </p>
      </div>
    )
  }

  if (profileQuery.isError) {
    return (
      <div className="rounded-2xl border bg-background p-6">
        <p className="text-sm text-destructive">
          {profileQuery.error.message}
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-2xl border bg-background p-6"
    >
      <div className="mb-6">
        <h2 className="font-semibold">
          Profile
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information.
        </p>
      </div>

      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="first-name">
            First name
          </FieldLabel>

          <Input
            id="first-name"
            {...form.register("firstName", {
              required: "First name is required",
            })}
          />

          {form.formState.errors.firstName && (
            <FieldError>
              {form.formState.errors.firstName.message}
            </FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="middle-name">
            Middle name
          </FieldLabel>

          <Input
            id="middle-name"
            {...form.register("middleName")}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="last-name">
            Last name
          </FieldLabel>

          <Input
            id="last-name"
            {...form.register("lastName", {
              required: "Last name is required",
            })}
          />

          {form.formState.errors.lastName && (
            <FieldError>
              {form.formState.errors.lastName.message}
            </FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="phone-number">
            Phone number
          </FieldLabel>

          <Input
            id="phone-number"
            type="tel"
            {...form.register("phoneNumber", {
              required: "Phone number is required",
            })}
          />

          {form.formState.errors.phoneNumber && (
            <FieldError>
              {form.formState.errors.phoneNumber.message}
            </FieldError>
          )}
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="email">
            Email
          </FieldLabel>

          <Input
            id="email"
            type="email"
            readOnly
            {...form.register("email")}
          />

          <FieldDescription>
            Your email address cannot be changed from
            this page.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <div className="mt-6 flex justify-end border-t pt-6">
        <Button
          type="submit"
          disabled={
            updateProfileMutation.isPending ||
            !form.formState.isDirty
          }
          className="bg-[#2EAFB4] text-white hover:bg-[#269ba0]"
        >
          {updateProfileMutation.isPending
            ? "Saving..."
            : "Save changes"}
        </Button>
      </div>
    </form>
  )
}