"use client"

import { useCallback, useRef, useState } from "react"
import { airsendDB } from "@/db"
import { useSettingsStore } from "@/store/settings"
import type { AccountSettings } from "@/lib/types/account-settings.interface"

type SettingsPath = `settings.${string}`

/**
 * Centralized hook for reading & writing settings.
 *
 * How the save flow works:
 * 1. Component calls `save(path, data)` or `saveMultiple(updates)`
 * 2. This writes to IDB via airsendDB
 * 3. dexie-observable fires a change event
 * 4. IdbSyncHookApi catches it and pushes the full payload to the API
 * 5. Zustand store is updated so the UI stays in sync
 *
 * @param email  The current user's email (IDB primary key)
 */
export function useSettingsPersist(email: string | undefined | null) {
    const setSettings = useSettingsStore((s) => s.setSettings)
    const settings = useSettingsStore((s) => s.settings)
    const [isSaving, setIsSaving] = useState(false)
    const savingRef = useRef(false)

    /**
     * Save a single nested settings path.
     * @example save("email_privacy", { autoShowImages: true, block_email_tracking: false })
     */
    const save = useCallback(
        async <K extends keyof AccountSettings>(
            key: K,
            data: AccountSettings[K],
        ) => {
            if (!email || savingRef.current) return
            savingRef.current = true
            setIsSaving(true)
            try {
                await airsendDB.updateNestedItem(
                    "settings",
                    email,
                    `settings.${key}` as any,
                    data as any,
                )
                setSettings({ [key]: data } as Partial<AccountSettings>)
            } finally {
                savingRef.current = false
                setIsSaving(false)
            }
        },
        [email, setSettings],
    )

    /**
     * Save multiple nested paths at once.
     * @example saveMultiple({ "settings.imap_config": {...}, "settings.smtp_config": {...} })
     */
    const saveMultiple = useCallback(
        async (
            updates: Record<string, any>,
            storeUpdates?: Partial<AccountSettings>,
        ) => {
            if (!email || savingRef.current) return
            savingRef.current = true
            setIsSaving(true)
            try {
                await airsendDB.updateMultipleNestedItems(
                    "settings",
                    email,
                    updates,
                )
                if (storeUpdates) {
                    setSettings(storeUpdates)
                }
            } finally {
                savingRef.current = false
                setIsSaving(false)
            }
        },
        [email, setSettings],
    )

    return {
        settings,
        setSettings,
        save,
        saveMultiple,
        isSaving,
    }
}
