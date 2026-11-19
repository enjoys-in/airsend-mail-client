import { useUserConfigStore } from "@/store/settings/user-config"
import { useAppSelector } from "@/store/hooks"
import { hasAccess } from "@/lib/workspace-utils"

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

    // Workspace access from the Redux profile (`/me`): a feature is available only when the profile carries a
    // scope for it. No scopes, no icon, no page.
    const account = useAppSelector((s) => s.accounts?.currAccount)
    const workspace = account?.workspace
    const profileReady = !!account
    const canAccessWorkspace = hasAccess(workspace, "workspace")
    const canAccessTasks = hasAccess(workspace, "tasks")
    const canAccessFiles = hasAccess(workspace, "files")

    return {
        isLoaded,
        canAccessCalendar,
        canAccessWorkspace,
        canAccessTasks,
        canAccessFiles,
        /** The profile has been fetched, so the scope flags above are final. */
        profileReady,
        canAccessSettings,
        isUnderOrg,
        orgId,
        orgName,
        domainName,
    }
}
