import { PageHeader } from "@/components/h-panel/kit"
import { NotificationsForm } from "./notifications-form"

export default function SettingsNotificationsPage() {

  return (
    <div className="max-w-3xl">
      <PageHeader title="Notifications" description="Configure how you receive notifications." />
      <NotificationsForm />
    </div>
  )
}
