/**
 * Tasks access, decided by the scopes airsend-api returns for the signed-in user
 * (GET /api/v1/workspace-access -> { allowed, scopes, reason }). Scopes are "feature:ro|w|rw".
 */
export interface WorkspaceAccessResult {
    allowed: boolean
    reason?: string
    scopes?: string[]
}

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

/** Does a `tasks:*` scope cover this HTTP method? ro => reads, w => writes, rw => both. */
export function tasksScopeAllows(scopes: string[] | undefined, method: string): boolean {
    const scope = (scopes ?? []).find((s) => s.startsWith("tasks:"))
    if (!scope) return false
    const perm = scope.split(":")[1]
    if (perm === "rw") return true
    return READ_METHODS.has(method.toUpperCase()) ? perm === "ro" : perm === "w"
}

/** Why a request is denied, in words the UI can show; null when it is allowed. */
export function tasksDenialReason(access: WorkspaceAccessResult | null, method: string): string | null {
    if (!access) return "Could not verify your access to tasks. Try again."
    if (!access.allowed) return access.reason || "Tasks are available to organization accounts only."
    if (!tasksScopeAllows(access.scopes, method)) {
        return READ_METHODS.has(method.toUpperCase())
            ? "Your workspace role does not include tasks access. Ask an organization admin to grant the tasks scope."
            : "Your workspace role has read-only tasks access."
    }
    return null
}
