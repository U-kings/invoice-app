"use client"

import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Switch } from "@workspace/ui/components/switch"
import { Textarea } from "@workspace/ui/components/textarea"
import { toast } from "@workspace/ui/components/toast"
import {
  useInvoiceReminderSettings,
  useUpdateInvoiceReminderSettings,
} from "@/hooks/use-invoice-reminder-settings"

interface InvoiceReminderSettings {
  id: string
  userId: string

  enabled: boolean

  beforeDueEnabled: boolean
  beforeDueDays: number

  dueDateEnabled: boolean

  overdueEnabled: boolean
  overdueAfterDays: number
  overdueRepeatDays: number
  maxOverdueReminders: number

  emailSubject: string | null
  emailMessage: string | null

  createdAt: string
  updatedAt: string
}

interface ReminderFormValues {
  enabled: boolean

  beforeDueEnabled: boolean
  beforeDueDays: number

  dueDateEnabled: boolean

  overdueEnabled: boolean
  overdueAfterDays: number
  overdueRepeatDays: number
  maxOverdueReminders: number

  emailSubject: string
  emailMessage: string
}

export function InvoiceReminderSettingsForm() {
  const { data, isLoading, isError, error } = useInvoiceReminderSettings()

  const updateSettings = useUpdateInvoiceReminderSettings()
  const settings = data?.settings

  const form = useForm<ReminderFormValues>({
    defaultValues: {
      enabled: true,
      beforeDueEnabled: true,
      beforeDueDays: 3,
      dueDateEnabled: true,
      overdueEnabled: true,
      overdueAfterDays: 1,
      overdueRepeatDays: 7,
      maxOverdueReminders: 3,
      emailSubject: "",
      emailMessage: "",
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = form

  const enabled = useWatch({
    control: form.control,
    name: "enabled",
  })

  const beforeDueEnabled = useWatch({
    control: form.control,
    name: "beforeDueEnabled",
  })
  const dueDateEnabled = useWatch({
    control: form.control,
    name: "dueDateEnabled",
  })
  const overdueEnabled = useWatch({
    control: form.control,
    name: "overdueEnabled",
  })

  useEffect(() => {
    // Reserved for loading settings from the API.

    if (!data?.settings) {
      return
    }

    form.reset({
      enabled: data.settings.enabled,
      beforeDueEnabled: data.settings.beforeDueEnabled,
      beforeDueDays: data.settings.beforeDueDays,
      dueDateEnabled: data.settings.dueDateEnabled,
      overdueEnabled: data.settings.overdueEnabled,
      overdueAfterDays: data.settings.overdueAfterDays,
      overdueRepeatDays: data.settings.overdueRepeatDays,
      maxOverdueReminders: data.settings.maxOverdueReminders,
      emailSubject: data.settings.emailSubject ?? "",
      emailMessage: data.settings.emailMessage ?? "",
    })
  }, [data, form])

  function onSubmit(values: ReminderFormValues) {
    updateSettings.mutate(values, {
      onSuccess: () => {
        toast.add({
          title: "Settings saved",
          description:
            "Invoice reminder settings have been updated successfully.",
          type: "success",
        })
      },

      onError: (error) => {
        toast.add({
          title: "Unable to save settings",
          description: error.message,
          type: "error",
        })
      },
    })
  }

  function handleReset() {
    if (!settings) {
      reset()
      return
    }

    reset({
      enabled: settings.enabled,
      beforeDueEnabled: settings.beforeDueEnabled,
      beforeDueDays: settings.beforeDueDays,
      dueDateEnabled: settings.dueDateEnabled,
      overdueEnabled: settings.overdueEnabled,
      overdueAfterDays: settings.overdueAfterDays,
      overdueRepeatDays: settings.overdueRepeatDays,
      maxOverdueReminders: settings.maxOverdueReminders,
      emailSubject: settings.emailSubject ?? "",
      emailMessage: settings.emailMessage ?? "",
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Automatic reminders */}
      <section className="rounded-2xl border bg-background p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-1">
            <h2 className="font-semibold">Automatic reminders</h2>

            <p className="text-sm text-muted-foreground">
              Automatically send payment reminders to customers based on their
              invoice due dates.
            </p>
          </div>

          <Switch
            checked={enabled}
            onCheckedChange={(value) =>
              setValue("enabled", value, {
                shouldDirty: true,
              })
            }
            aria-label="Enable automatic invoice reminders"
          />
        </div>
      </section>

      {/* Before due date */}
      <section
        className={`rounded-2xl border bg-background p-6 transition-opacity ${
          !enabled ? "opacity-60" : ""
        }`}
      >
        <div className="mb-6 flex items-start justify-between gap-6">
          <div className="space-y-1">
            <h2 className="font-semibold">Before the due date</h2>

            <p className="text-sm text-muted-foreground">
              Remind customers before their invoice becomes due.
            </p>
          </div>

          <Switch
            checked={beforeDueEnabled}
            disabled={!enabled}
            onCheckedChange={(value) =>
              setValue("beforeDueEnabled", value, {
                shouldDirty: true,
              })
            }
            aria-label="Enable before due date reminders"
          />
        </div>

        {beforeDueEnabled && (
          <FieldGroup>
            <Field data-invalid={!!errors.beforeDueDays} className="max-w-sm">
              <FieldLabel htmlFor="before-due-days">Send reminder</FieldLabel>

              <div className="flex items-center gap-3">
                <Input
                  id="before-due-days"
                  type="number"
                  min={1}
                  max={90}
                  className="h-12"
                  disabled={!enabled}
                  {...register("beforeDueDays", {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message:
                        "Reminder must be at least 1 day before the due date.",
                    },
                    max: {
                      value: 90,
                      message:
                        "Reminder cannot be more than 90 days before the due date.",
                    },
                  })}
                />

                <span className="text-sm text-muted-foreground">
                  days before the due date
                </span>
              </div>

              <FieldDescription>
                For example, 3 means the customer receives a reminder three days
                before the invoice is due.
              </FieldDescription>

              {errors.beforeDueDays && (
                <FieldError>{errors.beforeDueDays.message}</FieldError>
              )}
            </Field>
          </FieldGroup>
        )}
      </section>

      {/* Due date */}
      <section
        className={`rounded-2xl border bg-background p-6 transition-opacity ${
          !enabled ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-1">
            <h2 className="font-semibold">On the due date</h2>

            <p className="text-sm text-muted-foreground">
              Send a reminder to customers on the day their invoice is due.
            </p>
          </div>

          <Switch
            checked={dueDateEnabled}
            disabled={!enabled}
            onCheckedChange={(value) =>
              setValue("dueDateEnabled", value, {
                shouldDirty: true,
              })
            }
            aria-label="Enable due date reminders"
          />
        </div>
      </section>

      {/* Overdue */}
      <section
        className={`rounded-2xl border bg-background p-6 transition-opacity ${
          !enabled ? "opacity-60" : ""
        }`}
      >
        <div className="mb-6 flex items-start justify-between gap-6">
          <div className="space-y-1">
            <h2 className="font-semibold">Overdue invoices</h2>

            <p className="text-sm text-muted-foreground">
              Follow up with customers when an invoice hasn&apos;t been paid by
              its due date.
            </p>
          </div>

          <Switch
            checked={overdueEnabled}
            disabled={!enabled}
            onCheckedChange={(value) =>
              setValue("overdueEnabled", value, {
                shouldDirty: true,
              })
            }
            aria-label="Enable overdue invoice reminders"
          />
        </div>

        {overdueEnabled && (
          <FieldGroup className="grid gap-5 md:grid-cols-3">
            <Field data-invalid={!!errors.overdueAfterDays}>
              <FieldLabel htmlFor="overdue-after-days">
                First reminder
              </FieldLabel>

              <div className="flex items-center gap-3">
                <Input
                  id="overdue-after-days"
                  type="number"
                  min={1}
                  max={90}
                  className="h-12"
                  disabled={!enabled}
                  {...register("overdueAfterDays", {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Must be at least 1 day.",
                    },
                    max: {
                      value: 90,
                      message: "Cannot exceed 90 days.",
                    },
                  })}
                />

                <span className="shrink-0 text-sm text-muted-foreground">
                  days after
                </span>
              </div>

              {errors.overdueAfterDays && (
                <FieldError>{errors.overdueAfterDays.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.overdueRepeatDays}>
              <FieldLabel htmlFor="overdue-repeat-days">
                Repeat every
              </FieldLabel>

              <div className="flex items-center gap-3">
                <Input
                  id="overdue-repeat-days"
                  type="number"
                  min={1}
                  max={90}
                  className="h-12"
                  disabled={!enabled}
                  {...register("overdueRepeatDays", {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Must be at least 1 day.",
                    },
                    max: {
                      value: 90,
                      message: "Cannot exceed 90 days.",
                    },
                  })}
                />

                <span className="shrink-0 text-sm text-muted-foreground">
                  days
                </span>
              </div>

              {errors.overdueRepeatDays && (
                <FieldError>{errors.overdueRepeatDays.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.maxOverdueReminders}>
              <FieldLabel htmlFor="max-overdue-reminders">
                Maximum reminders
              </FieldLabel>

              <Input
                id="max-overdue-reminders"
                type="number"
                min={1}
                max={20}
                className="h-12"
                disabled={!enabled}
                {...register("maxOverdueReminders", {
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: "There must be at least 1 reminder.",
                  },
                  max: {
                    value: 20,
                    message: "Maximum reminders cannot exceed 20.",
                  },
                })}
              />

              {errors.maxOverdueReminders && (
                <FieldError>{errors.maxOverdueReminders.message}</FieldError>
              )}
            </Field>
          </FieldGroup>
        )}
      </section>

      {/* Email content */}
      <section
        className={`rounded-2xl border bg-background p-6 transition-opacity ${
          !enabled ? "opacity-60" : ""
        }`}
      >
        <div className="mb-6">
          <h2 className="font-semibold">Reminder email</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Customize the message customers receive with their payment reminder.
          </p>
        </div>

        <FieldGroup className="space-y-5">
          <Field data-invalid={!!errors.emailSubject}>
            <FieldLabel htmlFor="email-subject">Email subject</FieldLabel>

            <Input
              id="email-subject"
              placeholder="Payment reminder for invoice {{invoiceNumber}}"
              className="h-12"
              disabled={!enabled}
              {...register("emailSubject", {
                maxLength: {
                  value: 200,
                  message: "Email subject cannot exceed 200 characters.",
                },
              })}
            />

            <FieldDescription>
              Leave this blank to use the default subject.
            </FieldDescription>

            {errors.emailSubject && (
              <FieldError>{errors.emailSubject.message}</FieldError>
            )}
          </Field>

          <Field data-invalid={!!errors.emailMessage}>
            <FieldLabel htmlFor="email-message">Email message</FieldLabel>

            <Textarea
              id="email-message"
              placeholder={`Hi {{customerName}},

This is a friendly reminder that invoice {{invoiceNumber}} for {{amount}} is due on {{dueDate}}.

Thank you for your business.`}
              className="min-h-40 resize-none"
              disabled={!enabled}
              {...register("emailMessage", {
                maxLength: {
                  value: 5000,
                  message: "Email message cannot exceed 5,000 characters.",
                },
              })}
            />

            <FieldDescription>
              Leave this blank to use the default reminder message.
            </FieldDescription>

            {errors.emailMessage && (
              <FieldError>{errors.emailMessage.message}</FieldError>
            )}
          </Field>
        </FieldGroup>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={!isDirty || isSubmitting}
          onClick={handleReset}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="h-10 bg-[#2EAFB4] text-white hover:bg-[#269ba0]"
          disabled={
            isSubmitting || isLoading || updateSettings.isPending || !isDirty
          }
        >
          {isSubmitting || updateSettings.isPending
            ? "Saving..."
            : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
