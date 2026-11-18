"use client"

import { memo } from "react"
import { useAppSelector } from "@/store/hooks"
import { useSettingsPersist } from "@/hooks/use-settings-persist"
import {
  SettingsPageHeader,
  SettingsSection,
  SettingToggleRow,
} from "../shared"
import { Shield, EyeOff, Image as ImageIcon, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"

/**
 * Email Privacy settings — toggles save immediately on change.
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
    <div className="w-full space-y-8 animate-in fade-in duration-150">
      <SettingsPageHeader
        title="Email privacy"
        description="Shield your identity, prevent senders from knowing when you open emails, and block third-party web trackers."
        icon={<Shield className="size-5" />}
        badge={<Badge variant="outline" className="text-xs font-normal">Privacy Shield</Badge>}
      />

      <div className="space-y-6">
        <SettingsSection
          title="Remote Content & Tracker Protections"
          description="Control how external assets and tracking pixels are handled when reading incoming messages"
          icon={<EyeOff className="size-4" />}
        >
          <SettingToggleRow
            label="Auto-load remote images"
            description="Automatically display images hosted on external servers. Disabling prevents senders from logging your IP address."
            tooltip="Automatically load external images in emails. Disabling improves privacy."
            icon={<ImageIcon className="size-4 text-primary" />}
            checked={settings?.email_privacy?.autoShowImages ?? false}
            onCheckedChange={(v) => handleChange("autoShowImages", v)}
          />

          <SettingToggleRow
            label="Block email tracking pixels"
            description="Strip 1x1 tracking pixels, spy pixels, and read-receipt triggers before emails render"
            tooltip="Block tracking pixels and read receipts from external senders"
            icon={<Shield className="size-4 text-emerald-500" />}
            checked={settings?.email_privacy?.block_email_tracking ?? false}
            onCheckedChange={(v) => handleChange("block_email_tracking", v)}
            badge={
              <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Recommended
              </Badge>
            }
          />

          <SettingToggleRow
            label="Show sender domain favicon"
            description="Display the sender's authentic domain favicon as their contact avatar in the thread list"
            tooltip="Fetches the favicon of the sender's email domain and shows it instead of initials. Cached locally in browser."
            icon={<Globe className="size-4 text-blue-500" />}
            checked={settings?.email_privacy?.show_sender_favicon ?? false}
            onCheckedChange={(v) => handleChange("show_sender_favicon", v)}
          />
        </SettingsSection>
      </div>
    </div>
  )
}

export default memo(EmailPrivacy)
