"use client"

import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"

import { Camera, Trash2, Upload } from "lucide-react"

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
  useRemoveProfileImage,
  useUpdateProfile,
  useUploadProfileImage,
} from "@/hooks/use-profile"

import { toast } from "@workspace/ui/components/toast"
import Image from "next/image"

interface ProfileFormValues {
  firstName: string
  middleName: string
  lastName: string
  email: string
  phoneNumber: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"]

export function ProfileSettings() {
  const profileQuery = useProfile()

  const updateProfileMutation = useUpdateProfile()

  const uploadProfileImageMutation = useUploadProfileImage()

  const removeProfileImageMutation = useRemoveProfileImage()

  const fileInputRef = useRef<HTMLInputElement>(null)

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
      middleName: profileQuery.data.middleName ?? "",
      lastName: profileQuery.data.lastName,
      email: profileQuery.data.email,
      phoneNumber: profileQuery.data.phoneNumber ?? "",
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
            description: "Your profile has been updated successfully.",
            type: "success",
          })
        },

        onError: (error) => {
          toast.add({
            title: "Failed to update profile",
            description:
              error instanceof Error ? error.message : "Something went wrong.",
            type: "error",
          })
        },
      }
    )
  }

  function handleSelectImage() {
    fileInputRef.current?.click()
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    // Allow selecting the same file again later.
    event.target.value = ""

    if (!file) {
      return
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.add({
        title: "Invalid image",
        description: "Please upload a JPG, PNG, or WEBP image.",
        type: "error",
      })

      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.add({
        title: "Image is too large",
        description: "Please choose an image smaller than 5 MB.",
        type: "error",
      })

      return
    }

    uploadProfileImageMutation.mutate(file, {
      onSuccess: () => {
        toast.add({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully.",
          type: "success",
        })
      },

      onError: (error) => {
        toast.add({
          title: "Failed to update profile picture",
          description:
            error instanceof Error ? error.message : "Something went wrong.",
          type: "error",
        })
      },
    })
  }

  function handleRemoveImage() {
    removeProfileImageMutation.mutate(undefined, {
      onSuccess: () => {
        toast.add({
          title: "Profile picture removed",
          description: "Your profile picture has been removed.",
          type: "success",
        })
      },

      onError: (error) => {
        toast.add({
          title: "Failed to remove profile picture",
          description:
            error instanceof Error ? error.message : "Something went wrong.",
          type: "error",
        })
      },
    })
  }

  if (profileQuery.isLoading) {
    return (
      <div className="rounded-2xl border bg-background p-6">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (profileQuery.isError) {
    return (
      <div className="rounded-2xl border bg-background p-6">
        <p className="text-sm text-destructive">{profileQuery.error.message}</p>
      </div>
    )
  }

  const profileImageUrl = profileQuery.data?.profileImageUrl

  const initials =
    `${profileQuery.data?.firstName?.[0] ?? ""}${profileQuery.data?.lastName?.[0] ?? ""}`.toUpperCase()

  const isImageUploading = uploadProfileImageMutation.isPending

  const isImageRemoving = removeProfileImageMutation.isPending

  const isImageBusy = isImageUploading || isImageRemoving

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-2xl border bg-background p-6"
    >
      <div className="mb-6">
        <h2 className="font-semibold">Profile</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information.
        </p>
      </div>

      {/* Profile picture */}

      <div className="mb-8 flex flex-col gap-5 border-b pb-8 sm:flex-row sm:items-center">
        <div className="relative">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
            {profileImageUrl ? (
              <Image
                width={50}
                height={50}
                src={profileImageUrl}
                alt={`${profileQuery.data?.firstName} ${profileQuery.data?.lastName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-muted-foreground">
                {initials || "U"}
              </span>
            )}
          </div>

          {isImageUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <span className="text-xs font-medium text-white">
                Uploading...
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-medium">Profile picture</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Upload a photo to personalize your account.
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG or WEBP · Maximum 5 MB
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              disabled={isImageBusy}
              onClick={handleSelectImage}
            >
              <Upload className="mr-2 h-4 w-4" />

              {isImageUploading
                ? "Uploading..."
                : profileImageUrl
                  ? "Change photo"
                  : "Upload photo"}
            </Button>

            {profileImageUrl && (
              <Button
                type="button"
                variant="ghost"
                disabled={isImageBusy}
                onClick={handleRemoveImage}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />

                {isImageRemoving ? "Removing..." : "Remove"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Personal information */}

      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="first-name">First name</FieldLabel>

          <Input
            id="first-name"
            {...form.register("firstName", {
              required: "First name is required",
            })}
          />

          {form.formState.errors.firstName && (
            <FieldError>{form.formState.errors.firstName.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="middle-name">Middle name</FieldLabel>

          <Input id="middle-name" {...form.register("middleName")} />
        </Field>

        <Field>
          <FieldLabel htmlFor="last-name">Last name</FieldLabel>

          <Input
            id="last-name"
            {...form.register("lastName", {
              required: "Last name is required",
            })}
          />

          {form.formState.errors.lastName && (
            <FieldError>{form.formState.errors.lastName.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="phone-number">Phone number</FieldLabel>

          <Input
            id="phone-number"
            type="tel"
            {...form.register("phoneNumber", {
              required: "Phone number is required",
            })}
          />

          {form.formState.errors.phoneNumber && (
            <FieldError>{form.formState.errors.phoneNumber.message}</FieldError>
          )}
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="email">Email</FieldLabel>

          <Input id="email" type="email" readOnly {...form.register("email")} />

          <FieldDescription>
            Your email address cannot be changed from this page.
          </FieldDescription>
        </Field>
      </FieldGroup>

      {/* Save */}

      <div className="mt-6 flex justify-end border-t pt-6">
        <Button
          type="submit"
          disabled={updateProfileMutation.isPending || !form.formState.isDirty}
          className="bg-[#2EAFB4] text-white hover:bg-[#269ba0]"
        >
          {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
