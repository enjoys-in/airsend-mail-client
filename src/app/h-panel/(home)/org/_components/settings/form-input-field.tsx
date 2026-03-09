"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormContext, type FieldPath } from "react-hook-form"
import type { AccountSettings } from "@/lib/types/account-settings.interface"

interface FormInputFieldProps {
    name: FieldPath<AccountSettings>
    label: string
    type?: string
    placeholder?: string
    className?: string
    transformValue?: (raw: string) => any
}

export function FormInputField({
    name,
    label,
    type = "text",
    placeholder,
    className,
    transformValue,
}: FormInputFieldProps) {
    const { watch, setValue } = useFormContext<AccountSettings>()
    const value = watch(name) ?? ""

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input
                type={type}
                placeholder={placeholder}
                className={className}
                value={value as string | number}
                onChange={(e) => {
                    const raw = e.target.value
                    const transformed = transformValue ? transformValue(raw) : raw
                    setValue(name, transformed as any, { shouldDirty: true })
                }}
            />
        </div>
    )
}
