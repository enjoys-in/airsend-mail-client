"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useFormContext, type FieldPath } from "react-hook-form"
import type { AccountSettings } from "@/lib/types/account-settings.interface"

interface SettingRowProps {
    label: string
    description: string
    checked: boolean
    onChange: (value: boolean) => void
    disabled?: boolean
}

export function SettingRow({ label, description, checked, onChange, disabled }: SettingRowProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} className="shrink-0" disabled={disabled} />
        </div>
    )
}

/**
 * Bound to react-hook-form context — automatically reads/writes to a boolean field path.
 * Use this instead of SettingRow when the field is a direct boolean in AccountSettings.
 */
interface FormSwitchFieldProps {
    name: FieldPath<AccountSettings>
    label: string
    description: string
    disabled?: boolean
}

export function FormSwitchField({ name, label, description, disabled }: FormSwitchFieldProps) {
    const { watch, setValue } = useFormContext<AccountSettings>()
    const checked = watch(name) as boolean

    return (
        <SettingRow
            label={label}
            description={description}
            checked={checked}
            onChange={(v) => setValue(name, v as any, { shouldDirty: true })}
            disabled={disabled}
        />
    )
}
