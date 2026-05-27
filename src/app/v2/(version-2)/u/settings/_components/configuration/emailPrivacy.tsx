"use client"

import { memo } from "react"
import { useAppSelector } from "@/store/hooks"
import { useSettingsPersist } from "@/hooks/use-settings-persist"
import {
  SettingsPageHeader,
  SettingsSection,
  SettingToggleRow,
} from "../shared"

/**
 * Email Privacy settings — toggles save immediately on change
 * (no explicit save button needed since there are only 2 toggles).
 */
function EmailPrivacy() {
  const currAccount = useAppSelector((state) => state.accounts.currAccount)
  const { settings, save } = useSettingsPersist(currAccount?.email)

  const handleChange = (field: "autoShowImages" | "block_email_tracking" | "show_sender_favicon", checked: boolean) => {
    const updated = {
      autoShowImages: settings?.email_privacy?.autoShowImages ?? false,
      block_email_tracking: settings?.email_privacy?.block_email_tracking ?? false,
      show_sender_favicon: settings?.email_privacy?.show_sender_favicon ?? false,
      [field]: checked,
    }
    save("email_privacy", updated)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-10">
        <SettingsPageHeader title="Email Privacy" />

        <SettingsSection title="Privacy Controls">
          <SettingToggleRow
            label="Auto show remote images"
            tooltip="Automatically load external images in emails. Disabling improves privacy."
            checked={settings?.email_privacy?.autoShowImages ?? false}
            onCheckedChange={(v) => handleChange("autoShowImages", v)}
          />
          <SettingToggleRow
            label="Block email tracking"
            tooltip="Block tracking pixels and read receipts from external senders"
            checked={settings?.email_privacy?.block_email_tracking ?? false}
            onCheckedChange={(v) => handleChange("block_email_tracking", v)}
          />
          <SettingToggleRow
            label="Show sender favicon"
            description="Display the sender's domain favicon as avatar in mail list"
            tooltip="Fetches the favicon of the sender's email domain and shows it instead of initials. Cached in browser."
            checked={settings?.email_privacy?.show_sender_favicon ?? false}
            onCheckedChange={(v) => handleChange("show_sender_favicon", v)}
          />
        </SettingsSection>
      </div>
    </div>
  )
}

export default memo(EmailPrivacy)