import { useUserConfigStore } from "@/store/settings/user-config"
import { useAppSelector } from "@/store/hooks"

/* ------------------------------------------------------------------ */
/*  useFeatureAccess — combines Zustand config + Redux profile         */
/*  Use in components to conditionally show/hide features             */
/* ------------------------------------------------------------------ */

export function useFeatureAccess() {
    const isLoaded = useUserConfigStore((s) => s.isLoaded)
    const canAccessCalendar = useUserConfigStore((s) => s.canAccessCalendar)
    const canAccessSettings = useUserConfigStore((s) => s.canAccessSettings)
    const isUnderOrg = useUserConfigStore((s) => s.isUnderOrg)
    const orgId = useUserConfigStore((s) => s.orgId)
    const orgName = useUserConfigStore((s) => s.orgName)
    const domainName = useUserConfigStore((s) => s.domainName)

    // Workspace access from Redux profile — no duplication
    const workspace = useAppSelector((s) => s.accounts?.currAccount?.workspace)
    const canAccessWorkspace = isUnderOrg || !!workspace

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
