import { ReactNode } from "react"

import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { CommandMenu } from "./command-menu"

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <CommandMenu />

      <Sidebar />

      <div className="lg:ml-72">
        <Header />

        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
