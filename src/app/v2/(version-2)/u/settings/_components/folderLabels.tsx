"use client"

import { memo, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import LabelSettings from "./labelSettings"
import { useSettingsPersist } from "@/hooks/use-settings-persist"
import type { IFoldersSettings } from "@/lib/types/get-user-settings-response"
import {
  SettingsPageHeader,
  SettingsSection,
  SettingToggleRow,
  SaveSettingsBar,
} from "./shared"

const DEFAULT_FOLDERS: IFoldersSettings = {
  use_folder_colors: true,
  inherit_parent_color: true,
}

function FoldersAndLabels({ email }: { email: string }) {
  const { settings, save, isSaving } = useSettingsPersist(email)
  const [local, setLocal] = useState<IFoldersSettings>(DEFAULT_FOLDERS)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (settings?.folders_settings) {
      setLocal(settings.folders_settings)
    }
  }, [settings?.folders_settings])

  const update = <K extends keyof IFoldersSettings>(key: K, value: IFoldersSettings[K]) => {
    setLocal((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const handleSave = () => {
    save("folders_settings", local)
    setDirty(false)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <SettingsPageHeader
          title="Folders and labels"
          description="Keep your inbox organized with folders and labels."
        />

        {/* Folders Section */}
        <SettingsSection title="Folders">
          <SettingToggleRow
            label="Use folder colors"
            checked={local.use_folder_colors}
            onCheckedChange={(v) => update("use_folder_colors", v)}
          />
          <SettingToggleRow
            label="Inherit color from parent folder"
            tooltip="Child folders will use the same color as their parent"
            checked={local.inherit_parent_color}
            onCheckedChange={(v) => update("inherit_parent_color", v)}
          />
          <div className="pt-2">
            <Button size="sm">Add folder</Button>
          </div>
        </SettingsSection>

        {/* Labels Section */}
        <SettingsSection title="Labels">
          <div>
            <Button size="sm">Add label</Button>
          </div>
        </SettingsSection>

        <SaveSettingsBar onSave={handleSave} show={dirty} isSaving={isSaving} />
      </div>
      {/* <LabelSettings/> */}
    </div>
  )
}

export default memo(FoldersAndLabels)
