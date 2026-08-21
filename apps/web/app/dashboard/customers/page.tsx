import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Users, UserCheck, UserX, Landmark, Search, Layers, SlidersHorizontal } from "lucide-react"
import { prisma } from "@repo/db"
import { DataTable } from "@/components/invoices/data-table"

export default async function CustomersPage() {
  // 1. Fetch your clean customer entries from your Supabase instance concurrently
  const customers = await prisma.customer.findMany({
    include: {
      invoices: {
        select: {
          id: true,
          status: true,
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  // 2. Compute exact dashboard statistics aggregations
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.invoices.some(i => i.status === "PAID")).length
  const inactiveCustomers = totalCustomers - activeCustomers

  return (
    <div className="flex flex-col gap-6 p-8 rounded-2xl dark:bg-[#09090b] bg-accent-foreground min-h-screen text-zinc-50 w-full max-w-[1600px] mx-auto">
      
      {/* Page Title Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-xs text-zinc-400 font-normal">Create, manage and track all your directory clients.</p>
        </div>
        <Button className="bg-[#14b8a6] hover:bg-[#0d9488] text-black text-xs font-semibold px-4 h-9 rounded-md">
          + Add customer
        </Button>
      </div>

      {/* Identical Structural Metric Card Row Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Customers */}
        <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-400">Total customers</span>
            <span className="text-2xl font-bold tracking-tight mt-1">{totalCustomers}</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">All clients</span>
          </div>
          <div className="p-2 bg-[#18181b] border border-zinc-800 rounded-lg text-zinc-400">
            <Users className="h-4 w-4" />
          </div>
        </div>

        {/* Active Accounts */}
        <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-400">Active</span>
            <span className="text-2xl font-bold tracking-tight mt-1">{activeCustomers || "—"}</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">With paid invoices</span>
          </div>
          <div className="p-2 bg-[#18181b] border border-zinc-800 rounded-lg text-zinc-400">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>

        {/* Inactive Accounts */}
        <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-400">Inactive</span>
            <span className="text-2xl font-bold tracking-tight mt-1">{inactiveCustomers || "—"}</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">No recent collections</span>
          </div>
          <div className="p-2 bg-[#18181b] border border-zinc-800 rounded-lg text-zinc-400">
            <UserX className="h-4 w-4" />
          </div>
        </div>

        {/* Enterprise Accounts */}
        <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-400">Retention</span>
            <span className="text-2xl font-bold tracking-tight mt-1">
              {totalCustomers > 0 ? `${Math.round((activeCustomers / totalCustomers) * 100)}%` : "—"}
            </span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Account health</span>
          </div>
          <div className="p-2 bg-[#18181b] border border-zinc-800 rounded-lg text-zinc-400">
            <Landmark className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters Layout Workspace */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between gap-4">
          
          {/* Custom Search Input Matching the Dashboard Layout exactly */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search customers..." 
              className="pl-9 bg-[#121214] border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 h-9 focus-visible:ring-zinc-700 w-full"
            />
          </div>

          {/* Filtering Control Action Pillars */}
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-zinc-800 bg-[#0c0c0e] text-xs font-medium h-9 text-zinc-300 gap-1.5 hover:bg-[#121214] hover:text-zinc-100">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Status
            </Button>
            <Button variant="outline" className="border-zinc-800 bg-[#0c0c0e] text-xs font-medium h-9 text-zinc-300 gap-1.5 hover:bg-[#121214] hover:text-zinc-100">
              <Layers className="h-3.5 w-3.5" />
              Columns
            </Button>
          </div>
        </div>

        {/* Conditional Layout Table Display Handling */}
        {customers.length === 0 ? (
          /* Exact Structural Match for your Empty State Components */
          <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 bg-[#0c0c0e] rounded-xl p-16 text-center mt-2 min-h-[320px]">
            <div className="p-3 bg-[#121214] border border-zinc-800 rounded-full text-zinc-500 mb-4">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium text-zinc-200">No customers yet</h3>
            <p className="text-xs text-zinc-500 max-w-[280px] mt-1 mb-4 leading-normal">
              Add your first customer to begin tracking ledger details.
            </p>
            <Button className="bg-zinc-50 text-black text-xs font-semibold px-4 h-9 rounded-md hover:bg-zinc-200">
              Add customer
            </Button>
          </div>
        ) : (
          /* Encapsulated data container matrix layout */
          <div className="border border-zinc-800 bg-[#0c0c0e] rounded-xl overflow-hidden mt-1">
            {/* <DataTable data={customers} /> */}
          </div>
        )}
      </div>

    </div>
  )
}
