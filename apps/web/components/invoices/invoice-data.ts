export type InvoiceStatus =
  | "Paid"
  | "Pending"
  | "Overdue"
  | "Draft";

export interface Invoice {
  id: string;
  customer: string;
  email: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
}

export const invoices: Invoice[] = [
  {
    id: "INV-1024",
    customer: "Acme Inc.",
    email: "billing@acme.com",
    issueDate: "Aug 13, 2026",
    dueDate: "Aug 27, 2026",
    amount: 2450,
    status: "Paid",
  },
  {
    id: "INV-1023",
    customer: "Globex",
    email: "accounts@globex.com",
    issueDate: "Aug 12, 2026",
    dueDate: "Aug 26, 2026",
    amount: 860,
    status: "Pending",
  },
  {
    id: "INV-1022",
    customer: "Wayne Corp",
    email: "finance@waynecorp.com",
    issueDate: "Aug 10, 2026",
    dueDate: "Aug 24, 2026",
    amount: 5600,
    status: "Overdue",
  },
  {
    id: "INV-1021",
    customer: "Umbrella",
    email: "billing@umbrella.com",
    issueDate: "Aug 8, 2026",
    dueDate: "Aug 22, 2026",
    amount: 1250,
    status: "Paid",
  },
  {
    id: "INV-1020",
    customer: "Stark Industries",
    email: "finance@stark.com",
    issueDate: "Aug 5, 2026",
    dueDate: "Aug 19, 2026",
    amount: 7800,
    status: "Pending",
  },
  {
    id: "INV-1019",
    customer: "Cyberdyne",
    email: "accounts@cyberdyne.com",
    issueDate: "Aug 2, 2026",
    dueDate: "Aug 16, 2026",
    amount: 3200,
    status: "Draft",
  },
];