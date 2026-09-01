import BackToSettings from "@/components/settings/back-to-settings";
import { InvoiceReminderSettingsForm } from "@/components/settings/invoice-reminder-settings-form";

export default function InvoiceReminderSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <BackToSettings />
        <h1 className="text-2xl font-bold tracking-tight">Invoice reminders</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Automatically remind customers about upcoming and overdue invoices.
        </p>
      </div>

      <InvoiceReminderSettingsForm />
    </div>
  )
}
