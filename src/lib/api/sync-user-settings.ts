import { API } from "@/lib/api/handler"
import { airsendDB } from "@/db"
import { useUserConfigStore } from "@/store/settings/user-config"
import type { AxiosResponse } from "axios"
import type { GetUserSettingsResponse } from "@/lib/types/get-user-settings-response"
import type { AccountSettings } from "@/lib/types/account-settings.interface"

/* ------------------------------------------------------------------ */
/*  syncUserSettings                                                   */
/*  Fetches settings from API, persists to IDB, hydrates Zustand.     */
/*  Call this in parallel with fetchCurrentUser() at app start.        */
/* ------------------------------------------------------------------ */

/**
 * Fetch user settings from the backend, upsert into IndexedDB,
 * and hydrate the `useUserConfigStore` Zustand store.
 *
 * Safe to call multiple times — latest response always wins.
 *
 * @param domainName  Optional domain from IUser.domain_name (pass when known)
 * @returns           The parsed AccountSettings or `null` on failure
 */
export async function syncUserSettings(
    domainName?: string | null,
): Promise<Partial<AccountSettings> | null> {
    try {
        const { data } = (await API.handleGetMailUserSetting()) as AxiosResponse<GetUserSettingsResponse>
        if (!data.success) return null

        const { id, email_id, ...rest } = data.result.settings

        /* Build the canonical AccountSettings shape.
           `domain_name` lives at the top-level response, not inside settings.
           We store it as `organization` in our local AccountSettings blob. */
        const settingsObj: Partial<AccountSettings> = {
            usage: +data.result.usage,
            mailbox_size: +data.result.mailbox_size,
            quota_in_percent: Number(
                (+data.result.usage / +data.result.mailbox_size) * 100,
            ).toFixed(4),
            ...rest,
            organization: data.result.domain_name ?? { id: "", current_org_id: null },
        }

        const email = data.result.email

        /* ---- Persist to IDB ---- */
        const exists = await airsendDB.has("settings", email)

        if (exists) {
            await airsendDB.updateNestedItem("settings", email, "settings", settingsObj as any)
        } else {
            await airsendDB.addNestedItem("settings", email, { settings: settingsObj as any })
        }

        /* ---- Hydrate Zustand feature-flag store ---- */
        useUserConfigStore.getState().hydrate(settingsObj, domainName)

        return settingsObj
    } catch (err) {
        console.error("[syncUserSettings] failed:", err)
        return null
    }
}

/**
 * Load settings from IDB only (offline / instant hydration).
 * Falls back to API if IDB is empty.
 */
export async function hydrateFromIdb(
    email: string,
    domainName?: string | null,
): Promise<Partial<AccountSettings> | null> {
    try {
        const { success, value } = await airsendDB.getNestedItem(
            "settings",
            email,
            "settings",
        )
        if (success && value) {
            useUserConfigStore.getState().hydrate(value as Partial<AccountSettings>, domainName)
            return value as Partial<AccountSettings>
        }
        /* IDB empty → fall back to network */
        return syncUserSettings(domainName)
    } catch {
        return syncUserSettings(domainName)
    }
}
