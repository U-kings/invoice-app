import {
  Wallet,
  FileText,
  Users,
  CreditCard,
} from "lucide-react";

export const stats = [
  {
    title: "Total Revenue",
    value: "$88,455.12",
    change: "+12.5%",
    positive: true,
    icon: Wallet,
    color: "#2EAFB4",
    data: [15, 18, 17, 21, 20, 25, 30],
  },
  {
    title: "Invoices",
    value: "156",
    change: "+8.2%",
    positive: true,
    icon: FileText,
    color: "#3B82F6",
    data: [8, 12, 10, 11, 15, 17, 22],
  },
  {
    title: "Customers",
    value: "128",
    change: "+6.1%",
    positive: true,
    icon: Users,
    color: "#F59E0B",
    data: [5, 8, 9, 9, 12, 15, 18],
  },
  {
    title: "Outstanding",
    value: "$10,000.45",
    change: "-3.4%",
    positive: false,
    icon: CreditCard,
    color: "#EF4444",
    data: [30, 28, 25, 24, 20, 18, 15],
  },
];