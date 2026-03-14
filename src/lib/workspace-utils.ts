import type { ScopeFeature, ScopePermission, WorkspaceInfo } from "@/lib/types/workspace.interface"

/**
 * Check if user has access to a feature at a given permission level.
 * - 'ro': any permission grants read
 * - 'w': requires 'w' or 'rw'
 * - 'rw': requires 'rw'
 */
export function hasAccess(
    workspace: Pick<WorkspaceInfo, "scopes"> | null | undefined,
    feature: ScopeFeature,
    level: ScopePermission
): boolean {
    if (!workspace?.scopes) return false
    const scope = workspace.scopes.find(s => s.startsWith(feature + ":"))
    if (!scope) return false
    const perm = scope.split(":")[1] as ScopePermission
    if (level === "ro") return true
    if (level === "w") return perm === "w" || perm === "rw"
    return perm === "rw"
}

/** Parse "feature:perm" string into parts */
export function parseScope(scope: string): { feature: ScopeFeature; permission: ScopePermission } {
    const [feature, permission] = scope.split(":") as [ScopeFeature, ScopePermission]
    return { feature, permission }
}

/** Build scope string from parts */
export function buildScope(feature: ScopeFeature, permission: ScopePermission): string {
    return `${feature}:${permission}`
}
