"use client";

import {
  LayoutDashboard,
  FileText,
  Users,
  Wallet,
  RefreshCw,
  Receipt,
  BarChart3,
  Settings,
} from "lucide-react";

const items = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    active: true,
  },
  {
    icon: FileText,
    title: "Invoices",
  },
  {
    icon: Users,
    title: "Clients",
  },
  {
    icon: Wallet,
    title: "Payments",
  },
  {
    icon: RefreshCw,
    title: "Recurring",
  },
  {
    icon: Receipt,
    title: "Expenses",
  },
  {
    icon: BarChart3,
    title: "Reports",
  },
  {
    icon: Settings,
    title: "Settings",
  },
];

export function DashboardSidebar() {
  return (
    <aside className="hidden w-64 border-r border-border/50 p-6 xl:block">

      <div className="mb-10 text-xl font-bold">
        InvoiceFlow
      </div>

      <nav className="space-y-2">

        {items.map((item) => (
          <button
            key={item.title}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all

            ${
              item.active
                ? "bg-[#2EAFB4]/15 text-[#2EAFB4]"
                : "hover:bg-muted"
            }`}
          >
            <item.icon className="h-5 w-5" />

            {item.title}
          </button>
        ))}

      </nav>

    </aside>
  );
}