"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

export interface InvoiceReminderSettings {
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

interface InvoiceReminderSettingsResponse {
  settings: InvoiceReminderSettings | null
}

interface UpdateInvoiceReminderSettingsResponse {
  message: string
  settings: InvoiceReminderSettings
}

export interface UpdateInvoiceReminderSettingsInput {
  enabled: boolean

  beforeDueEnabled: boolean
  beforeDueDays: number

  dueDateEnabled: boolean

  overdueEnabled: boolean
  overdueAfterDays: number
  overdueRepeatDays: number
  maxOverdueReminders: number

  emailSubject?: string | null
  emailMessage?: string | null
}

const invoiceReminderSettingsKey = [
  "invoice-reminder-settings",
]

export function useInvoiceReminderSettings() {
  return useQuery<InvoiceReminderSettingsResponse, Error>({
    queryKey: invoiceReminderSettingsKey,

    queryFn: async () => {
      const response = await fetch(
        "/api/dashboard/settings/invoice-reminders",
        {
          method: "GET",
          credentials: "include",
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to fetch invoice reminder settings"
        )
      }

      return data
    },
  })
}

export function useUpdateInvoiceReminderSettings() {
  const queryClient = useQueryClient()

  return useMutation<
    UpdateInvoiceReminderSettingsResponse,
    Error,
    UpdateInvoiceReminderSettingsInput
  >({
    mutationFn: async (values) => {
      const response = await fetch(
        "/api/dashboard/settings/invoice-reminders",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(values),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to update invoice reminder settings"
        )
      }

      return data
    },

    onSuccess: (data) => {
      queryClient.setQueryData(
        invoiceReminderSettingsKey,
        {
          settings: data.settings,
        }
      )

      queryClient.invalidateQueries({
        queryKey: invoiceReminderSettingsKey,
      })
    },
  })
}