import { useUserConfigStore } from "@/store/settings/user-config"

/* ------------------------------------------------------------------ */
/*  useFeatureAccess — thin selector over the user-config store       */
/*  Use in components to conditionally show/hide features             */
/* ------------------------------------------------------------------ */

export function useFeatureAccess() {
    const isLoaded = useUserConfigStore((s) => s.isLoaded)
    const canAccessCalendar = useUserConfigStore((s) => s.canAccessCalendar)
    const canAccessWorkspace = useUserConfigStore((s) => s.canAccessWorkspace)
    const canAccessSettings = useUserConfigStore((s) => s.canAccessSettings)
    const isUnderOrg = useUserConfigStore((s) => s.isUnderOrg)
    const orgId = useUserConfigStore((s) => s.orgId)
    const orgName = useUserConfigStore((s) => s.orgName)
    const domainName = useUserConfigStore((s) => s.domainName)

    return {
        isLoaded,
        canAccessCalendar,
        canAccessWorkspace,
        canAccessSettings,
        isUnderOrg,
        orgId,
        orgName,
        domainName,
    }
}
