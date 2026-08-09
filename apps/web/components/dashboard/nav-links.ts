import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Receipt,
  Package,
  BarChart3,
  Settings,
} from "lucide-react";

export const navLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    title: "Estimates",
    href: "/estimates",
    icon: Receipt,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];