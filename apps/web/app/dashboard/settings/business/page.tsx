import BackToSettings from "@/components/settings/back-to-settings"
import { BusinessProfileSettings } from "@/components/settings/business-profile-settings"

export default function BusinessProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <BackToSettings />
        <h1 className="text-2xl font-semibold tracking-tight">
          Business profile
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage the business information that appears on your invoices.
        </p>
      </div>

      <BusinessProfileSettings />
    </div>
  )
}
