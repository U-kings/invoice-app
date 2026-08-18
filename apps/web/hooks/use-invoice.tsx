"use client"

import * as React from "react"

import {
  getInvoices,
  INVOICE_STORAGE_EVENT,
} from "@/components/invoices/invoice-storage"

import type { Invoice } from "@/components/invoices/invoice-data"

export function useInvoices() {
  const [invoices, setInvoices] =
    React.useState<Invoice[]>([])

  const refresh = React.useCallback(() => {
    setInvoices(getInvoices())
  }, [])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()

    window.addEventListener(
      INVOICE_STORAGE_EVENT,
      refresh
    )

    return () => {
      window.removeEventListener(
        INVOICE_STORAGE_EVENT,
        refresh
      )
    }
  }, [refresh])

  return {
    invoices,
    refresh,
  }
}