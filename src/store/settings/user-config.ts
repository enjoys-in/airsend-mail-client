import { create } from "zustand"
import type { AccountSettings } from "@/lib/types/account-settings.interface"

/* ------------------------------------------------------------------ */
/*  User-config store — single source of truth for feature flags      */
/*  Hydrated once at app start from API → IDB, then read everywhere   */
/* ------------------------------------------------------------------ */

interface UserConfigState {
    /** Has the initial fetch + IDB sync completed? */
    isLoaded: boolean

    /** Organization the user belongs to (null = personal account) */
    orgId: string | null
    orgName: string | null

    /** Feature flags derived from settings */
    calendarEnabled: boolean

    /** Current account domain */
    domainName: string | null

    /* ---- Computed convenience getters ---- */

    /** User belongs to an org → can access org settings page */
    isUnderOrg: boolean

    /** No org  → allowed into workspace */
    canAccessWorkspace: boolean

    /** Calendar enabled in settings */
    canAccessCalendar: boolean

    /** Under an org → can access org-level settings */
    canAccessSettings: boolean

    /* ---- Actions ---- */
    hydrate: (settings: Partial<AccountSettings>, domainName?: string | null) => void
    reset: () => void
}

const initialState = {
    isLoaded: false,
    orgId: null as string | null,
    orgName: null as string | null,
    calendarEnabled: false,
    domainName: null as string | null,
    isUnderOrg: false,
    canAccessWorkspace: false,
    canAccessCalendar: false,
    canAccessSettings: true,
}

export const useUserConfigStore = create<UserConfigState>()((set) => ({
    ...initialState,

    hydrate: (settings, domainName) => {
        const orgId = settings.organization?.org_id ?? null
        const isUnderOrg = orgId !== null
        const calendarEnabled = settings.calender_config?.enable_calender ?? false

        set({
            isLoaded: true,
            orgId,
            orgName: settings.organization?.org_name ?? null,
            calendarEnabled,
            domainName: domainName ?? settings.organization?.domain_name ?? null,
            isUnderOrg,
            canAccessWorkspace: isUnderOrg,
            canAccessCalendar: calendarEnabled,
            canAccessSettings: isUnderOrg,
        })
    },

    reset: () => set(initialState),
}))
