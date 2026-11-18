"use client"

import { memo, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Folder, Tag, Plus, Palette } from "lucide-react"
import { useSettingsPersist } from "@/hooks/use-settings-persist"
import type { IFoldersSettings } from "@/lib/types/get-user-settings-response"
import {
  SettingsPageHeader,
  SettingsSection,
  SettingToggleRow,
  SaveSettingsBar,
} from "./shared"
import { Badge } from "@/components/ui/badge"

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
    <div className="w-full space-y-8 animate-in fade-in duration-150">
      <SettingsPageHeader
        title="Folders and labels"
        description="Organize your mailbox with custom nested folders, color markers, and labels."
        icon={<Folder className="size-5" />}
        badge={<Badge variant="outline" className="text-xs font-normal">Organization</Badge>}
      />

      <div className="space-y-6">
        {/* Folders Section */}
        <SettingsSection
          title="Folder Color Markers"
          description="Customize the visual badge colors for custom mail folders"
          icon={<Palette className="size-4" />}
          action={
            <Button size="sm" className="h-8 rounded-xl text-xs sm:text-sm gap-1.5">
              <Plus className="size-3.5" />
              New Folder
            </Button>
          }
        >
          <SettingToggleRow
            label="Enable custom folder colors"
            description="Display personalized colored indicator dots next to folder names in the sidebar"
            checked={local.use_folder_colors}
            onCheckedChange={(v) => update("use_folder_colors", v)}
          />
          <SettingToggleRow
            label="Inherit color from parent folder"
            description="Subfolders automatically adopt the accent color assigned to their parent directory"
            tooltip="Child folders will use the same color as their parent"
            checked={local.inherit_parent_color}
            onCheckedChange={(v) => update("inherit_parent_color", v)}
          />
        </SettingsSection>

        {/* Labels Section */}
        <SettingsSection
          title="Message Labels & Tags"
          description="Tags that can be applied to any message regardless of its current folder"
          icon={<Tag className="size-4" />}
          action={
            <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs sm:text-sm gap-1.5">
              <Plus className="size-3.5" />
              New Label
            </Button>
          }
        >
          <div className="py-3 px-2 space-y-3">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Labels allow you to tag messages across multiple categories without moving them from your inbox.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-1">
                Work
              </Badge>
              <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs px-2.5 py-1">
                Personal
              </Badge>
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-1">
                Finance
              </Badge>
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs px-2.5 py-1">
                Receipts
              </Badge>
            </div>
          </div>
        </SettingsSection>
      </div>

      <SaveSettingsBar onSave={handleSave} show={dirty} isSaving={isSaving} />
    </div>
  )
}

export default memo(FoldersAndLabels)
