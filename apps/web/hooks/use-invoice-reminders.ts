import { useQuery, type UseQueryResult } from "@tanstack/react-query"

export type InvoiceReminderStatus =
  "SCHEDULED" | "PROCESSING" | "SENT" | "FAILED"

export type InvoiceReminderType = "BEFORE_DUE" | "DUE_DATE" | "OVERDUE"

export type InvoiceReminder = {
  id: string
  userId: string
  type: InvoiceReminderType

  scheduledFor: string
  processingAt: string | null
  sentAt: string | null

  attempts: number
  lastError: string | null

  invoice: {
    id: string
    invoiceNumber: string
    currency: string

    issueDate: string
    dueDate: string

    paymentTerm: string | null

    discount: string | number
    taxRate: string | number

    notes: string | null

    customer: {
      id: string
      name: string
      email: string
    }

    lineItems: Array<{
      name: string
      description: string
      quantity: number
      rate: string | number
    }>
  }

  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
}

export type InvoiceReminderStats = {
  scheduled: number
  processing: number
  sent: number
  failed: number
}

export type InvoiceRemindersResponse = {
  data: InvoiceReminder[]

  stats: InvoiceReminderStats

  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export type UseInvoiceRemindersParams = {
  page?: number
  pageSize?: number
  search?: string
  type?: InvoiceReminderType
}

async function fetchInvoiceReminders(
  params: UseInvoiceRemindersParams
): Promise<InvoiceRemindersResponse> {
  const searchParams = new URLSearchParams()

  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const search = params.search?.trim() ?? ""
  const type = params.type

  searchParams.set("page", String(page))
  searchParams.set("pageSize", String(pageSize))

  if (search) {
    searchParams.set("search", search)
  }

  if (type) {
    searchParams.set("type", type)
  }

  const response = await fetch(
    `/api/dashboard/invoice-reminders?${searchParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
    }
  )

  if (!response.ok) {
    const body = await response.json().catch(() => null)

    throw new Error(body?.error || "Failed to fetch invoice reminders.")
  }

  return response.json()
}

export function useInvoiceReminders(
  params: UseInvoiceRemindersParams = {}
): UseQueryResult<InvoiceRemindersResponse, Error> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const search = params.search?.trim() ?? ""
  const type = params.type

  return useQuery({
    queryKey: ["invoice-reminders", page, pageSize, search, type ?? null],

    queryFn: () =>
      fetchInvoiceReminders({
        page,
        pageSize,
        search,
        type,
      }),

    placeholderData: (previousData) => previousData,
  })
}

export type InvoiceReminderResponse = {
  data: InvoiceReminder
}

async function fetchInvoiceReminder(
  id: string
): Promise<InvoiceReminderResponse> {
  const response = await fetch(`/api/dashboard/invoice-reminders/${id}`, {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)

    throw new Error(body?.error || "Failed to fetch invoice reminder.")
  }

  return response.json()
}

export function useInvoiceReminder(
  id: string
): UseQueryResult<InvoiceReminderResponse, Error> {
  return useQuery({
    queryKey: ["invoice-reminder", id],

    queryFn: () => fetchInvoiceReminder(id),

    enabled: Boolean(id),
  })
}
