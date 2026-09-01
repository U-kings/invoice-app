import BackToSettings from "@/components/settings/back-to-settings"
import { ProfileSettings } from "@/components/settings/profile-settings"

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <BackToSettings />
        <h1 className="text-2xl font-bold tracking-tight">
          Profile
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage your personal account information.
        </p>
      </div>

      <ProfileSettings />
    </div>
  )
}