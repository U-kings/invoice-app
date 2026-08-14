import { Mail, User } from "lucide-react"

export function InvoiceSummary() {
  return (
    <div className="grid gap-6 rounded-2xl border bg-background p-6 md:grid-cols-2">
      {/* From */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          From
        </p>

        <div className="space-y-2">
          <p className="font-semibold">
            Your Company
          </p>

          <p className="text-sm text-muted-foreground">
            123 Business Street
          </p>

          <p className="text-sm text-muted-foreground">
            Lagos, Nigeria
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            hello@company.com
          </div>
        </div>
      </div>

      {/* To */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Bill to
        </p>

        <div className="space-y-2">
          <p className="font-semibold">
            Acme Corporation
          </p>

          <p className="text-sm text-muted-foreground">
            45 Market Street
          </p>

          <p className="text-sm text-muted-foreground">
            Lagos, Nigeria
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            billing@acme.com
          </div>
        </div>
      </div>
    </div>
  )
}