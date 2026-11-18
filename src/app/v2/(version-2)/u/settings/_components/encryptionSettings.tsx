"use client"

import { memo, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Key, ShieldCheck, Lock, Download, Sparkles } from "lucide-react"
import { useSettingsPersist } from "@/hooks/use-settings-persist"
import type { IEncryptionSettings } from "@/lib/types/get-user-settings-response"
import {
  SettingsPageHeader,
  SettingsSection,
  SettingToggleRow,
  SettingSelectRow,
  SaveSettingsBar,
} from "./shared"
import { Badge } from "@/components/ui/badge"

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

  const handleReset = () => {
    if (settings?.encryption) {
      setLocal(settings.encryption)
    } else {
      setLocal(DEFAULT_ENCRYPTION)
    }
    setDirty(false)
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-150">
      <SettingsPageHeader
        title="Encryption and keys"
        description="Configure automated PGP cryptographic verification, Key Transparency, and public key attachments."
        icon={<Key className="size-5" />}
        badge={<Badge variant="outline" className="text-xs font-normal">Security</Badge>}
      />

      <div className="space-y-6">
        {/* Address and key verification */}
        <SettingsSection
          title="Address & Key Verification"
          description="Protocols used to verify the authentic identity of email recipients"
          icon={<ShieldCheck className="size-4" />}
        >
          <SettingToggleRow
            label="Prompt before trusting new keys"
            description="Display an explicit prompt when an unknown public key is discovered for a contact"
            tooltip="Ask before trusting new encryption keys"
            checked={local.prompt_trust_keys}
            onCheckedChange={(v) => update("prompt_trust_keys", v)}
          />
          <SettingToggleRow
            label="Verify keys with Key Transparency"
            description="Use verifiable cryptographic transparency logs to auto-verify recipient public keys"
            tooltip="Use key transparency protocol to automatically verify encryption keys"
            checked={local.verify_key_transparency}
            onCheckedChange={(v) => update("verify_key_transparency", v)}
            badge={
              <Badge variant="secondary" className="text-[10px] font-medium bg-primary/10 text-primary">
                BETA
              </Badge>
            }
          />
        </SettingsSection>

        {/* External PGP settings */}
        <SettingsSection
          title="External PGP Interoperability"
          description="Settings governing messages exchanged with external PGP recipients"
          icon={<Lock className="size-4" />}
        >
          <SettingToggleRow
            label="Digitally sign external messages"
            description="Cryptographically sign outgoing emails with your private key to guarantee sender authenticity"
            tooltip="Digitally sign all outgoing messages to non-Proton recipients"
            checked={local.sign_external_messages}
            onCheckedChange={(v) => update("sign_external_messages", v)}
          />
          <SettingToggleRow
            label="Attach public key to outgoing emails"
            description="Include your public PGP key (.asc) as an attachment so external contacts can encrypt replies"
            tooltip="Include your public key as an attachment in outgoing emails"
            checked={local.attach_public_key}
            onCheckedChange={(v) => update("attach_public_key", v)}
          />
          <SettingSelectRow
            label="Default PGP encoding format"
            description="PGP/MIME is the modern standard for multipart attachments; PGP/INLINE is for legacy clients"
            tooltip="Choose the default PGP encryption scheme"
            value={local.default_pgp_scheme}
            onValueChange={(v) => update("default_pgp_scheme", v as IEncryptionSettings["default_pgp_scheme"])}
            options={[
              { value: "PGP/MIME", label: "PGP/MIME (Modern standard)" },
              { value: "PGP/INLINE", label: "PGP/INLINE (Legacy)" },
            ]}
          />
        </SettingsSection>

        {/* Email encryption keys */}
        <SettingsSection
          title="PGP Key Management"
          description="Export, generate, or manage active public and private encryption keys"
          icon={<Key className="size-4" />}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-foreground">Active Encryption Key</span>
              <p className="text-xs text-muted-foreground">
                Generate new 4096-bit RSA or Ed25519 ECC key pairs for this address
              </p>
            </div>
            <div className="flex items-center shrink-0">
              <Button variant="outline" size="sm" className="rounded-r-none h-9 text-xs sm:text-sm font-normal">
                <Sparkles className="size-3.5 mr-1.5 text-primary" />
                Generate new key
              </Button>
              <Button variant="outline" size="sm" className="border-l-0 px-2.5 rounded-l-none h-9">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SettingsSection>
      </div>

      <SaveSettingsBar onSave={handleSave} onReset={handleReset} show={dirty} isSaving={isSaving} />
    </div>
  )
}

export default memo(EncryptionSettings)
