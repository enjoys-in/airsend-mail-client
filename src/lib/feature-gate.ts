import type { ScopeFeature } from "@/lib/types/workspace.interface"
import { hasAccess } from "@/lib/workspace-utils"

/** Workspace features the sidebar, the middleware and the API proxies gate on the scopes `/me` returns. */
export type GatedFeature = Extract<ScopeFeature, "tasks" | "files" | "workspace">

const PREFIXES: { prefix: string; feature: GatedFeature }[] = [
    { prefix: "/v2/tasks", feature: "tasks" },
    { prefix: "/v2/files", feature: "files" },
    { prefix: "/v2/workspace", feature: "workspace" },
    { prefix: "/v2/meet", feature: "workspace" },
]

/** The feature a page path belongs to, or null when the path is not gated. */
export function featureForPath(pathname: string): GatedFeature | null {
    for (const { prefix, feature } of PREFIXES) {
        if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return feature
    }
    return null
}

/** Does the scope list (as in `/me` -> workspace.scopes) include any permission for the feature? */
export function scopesAllow(scopes: readonly string[] | null | undefined, feature: GatedFeature): boolean {
    return hasAccess({ scopes: scopes ? [...scopes] : undefined }, feature)
}

export const FEATURE_LABEL: Record<GatedFeature, string> = {
    tasks: "Tasks",
    files: "Files",
    workspace: "Workspace",
}
