import { InvoiceItem } from "./invoice-schema"

const STORAGE_KEY = "invoice-item-catalog"

export function getCatalogItems(): InvoiceItem[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return []
    }

    return JSON.parse(stored) as InvoiceItem[]
  } catch {
    return []
  }
}

export function saveCatalogItems(items: InvoiceItem[]) {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function addCatalogItem(item: InvoiceItem): InvoiceItem[] {
  const currentItems = getCatalogItems()

  const normalizedName = item.name.trim().toLowerCase()

  const existingIndex = currentItems.findIndex(
    (existingItem) => existingItem.name.trim().toLowerCase() === normalizedName
  )

  if (existingIndex !== -1) {
    return currentItems
  }

  const updatedItems = [...currentItems, item]

  saveCatalogItems(updatedItems)

  return updatedItems
}
