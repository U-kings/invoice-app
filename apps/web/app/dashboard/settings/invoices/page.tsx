import { InvoiceSettingsForm } from "@/components/settings/invoice-settings-form"
import BackToSettings from "@/components/settings/back-to-settings"

export default function InvoiceSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <BackToSettings />

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Invoice settings
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure defaults for invoices you create.
          </p>
        </div>
      </div>

      {/* Settings */}
      <InvoiceSettingsForm />
    </div>
  )
}
