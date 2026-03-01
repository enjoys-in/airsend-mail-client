"use client"

import { memo, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, LinkIcon } from "lucide-react"
import Link from "next/link"
import { useSettingsPersist } from "@/hooks/use-settings-persist"
import type { IEncryptionSettings } from "@/lib/types/get-user-settings-response"
import {
  SettingsPageHeader,
  SettingsSection,
  SettingToggleRow,
  SettingSelectRow,
  SaveSettingsBar,
} from "./shared"

const DEFAULT_ENCRYPTION: IEncryptionSettings = {
  prompt_trust_keys: true,
  verify_key_transparency: true,
  sign_external_messages: true,
  attach_public_key: true,
  default_pgp_scheme: "PGP/MIME",
}

function EncryptionSettings({ email }: { email: string }) {
  const { settings, save, isSaving } = useSettingsPersist(email)
  const [local, setLocal] = useState<IEncryptionSettings>(DEFAULT_ENCRYPTION)
  const [dirty, setDirty] = useState(false)

  // Sync from store when settings load
  useEffect(() => {
    if (settings?.encryption) {
      setLocal(settings.encryption)
    }
  }, [settings?.encryption])

  const update = <K extends keyof IEncryptionSettings>(
    key: K,
    value: IEncryptionSettings[K],
  ) => {
    setLocal((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const handleSave = () => {
    save("encryption", local)
    setDirty(false)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <SettingsPageHeader title="Encryption and keys" />

        {/* Address and key verification */}
        <SettingsSection title="Address and key verification">
          <SettingToggleRow
            label="Prompt to trust keys"
            tooltip="Ask before trusting new encryption keys"
            checked={local.prompt_trust_keys}
            onCheckedChange={(v) => update("prompt_trust_keys", v)}
          />
          <SettingToggleRow
            label="Verify keys with Key Transparency"
            tooltip="Use key transparency protocol to automatically verify encryption keys"
            checked={local.verify_key_transparency}
            onCheckedChange={(v) => update("verify_key_transparency", v)}
            badge={
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                BETA
              </span>
            }
          />
        </SettingsSection>

        {/* External PGP settings */}
        <SettingsSection
          title="External PGP settings"
          description="Only change these settings if you are using PGP with non-Proton recipients."
        >
          <SettingToggleRow
            label="Sign external messages"
            tooltip="Digitally sign all outgoing messages to non-Proton recipients"
            checked={local.sign_external_messages}
            onCheckedChange={(v) => update("sign_external_messages", v)}
          />
          <SettingToggleRow
            label="Attach public key"
            tooltip="Include your public key as an attachment in outgoing emails"
            checked={local.attach_public_key}
            onCheckedChange={(v) => update("attach_public_key", v)}
          />
          <SettingSelectRow
            label="Default PGP scheme"
            tooltip="Choose the default PGP encryption scheme"
            value={local.default_pgp_scheme}
            onValueChange={(v) => update("default_pgp_scheme", v as IEncryptionSettings["default_pgp_scheme"])}
            options={[
              { value: "PGP/MIME", label: "PGP/MIME" },
              { value: "PGP/INLINE", label: "PGP/INLINE" },
            ]}
          />
        </SettingsSection>

        {/* Email encryption keys */}
        <SettingsSection
          title="Email encryption keys"
          description="Download your PGP keys for use with other PGP-compatible services."
        >
          <div className="flex">
            <Button variant="outline" className="rounded-r-none">
              Generate key
            </Button>
            <Button variant="outline" className="border-l-0 px-2 rounded-l-none">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </SettingsSection>

        <SaveSettingsBar onSave={handleSave} show={dirty} isSaving={isSaving} />
      </div>
    </div>
  )
}

export default memo(EncryptionSettings)
