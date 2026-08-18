import { InvoiceItem } from "./invoice-schema"

export const invoiceItems: InvoiceItem[] = [
  {
    id: "item-001",
    name: "Website Design",
    description: "UI/UX and website design",
    quantity: 1,
    rate: 1500,
  },
  {
    id: "item-002",
    name: "Web Development",
    description: "Frontend and backend development",
    quantity: 1,
    rate: 2500,
  },
  {
    id: "item-003",
    name: "SEO Optimization",
    description: "Search engine optimization",
    quantity: 1,
    rate: 800,
  },
]

// export const invoiceItems: InvoiceItem[] = [
//   {
//     id: "item-001",
//     name: "Website Design",
//     description: "UI/UX and website design",
//     rate: 1500,
//   },
//   {
//     id: "item-002",
//     name: "Web Development",
//     description: "Frontend and backend development",
//     rate: 2500,
//   },
//   {
//     id: "item-003",
//     name: "SEO Optimization",
//     description: "Search engine optimization",
//     rate: 800,
//   },
// ]
