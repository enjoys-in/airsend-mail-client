export type ScopePermission = "ro" | "w" | "rw"
export type ScopeFeature = "mail" | "calendar" | "tasks" | "workspace" | "files" | "contacts"
export type Scope = `${ScopeFeature}:${ScopePermission}`

export const DEFAULT_SCOPES: Scope[] = [
    "mail:rw",
    "calendar:rw",
]

export const SCOPE_FEATURES: ScopeFeature[] = ["mail", "calendar", "tasks", "workspace", "files", "contacts"]
export const SCOPE_PERMISSIONS: { label: string; value: ScopePermission }[] = [
    { label: "Read Only", value: "ro" },
    { label: "Write Only", value: "w" },
    { label: "Read & Write", value: "rw" },
]

export interface WorkspaceInfo {
    id: string
    name: string
    description: string | null
    enabled: boolean
    domain_id: string
    created_at: string
    updated_at: string
    members: WorkspaceMember[]
}

export interface WorkspaceMember {
    id: number
    workspace_id: string
    email: string
    scopes: Scope[]
    active: boolean
    created_at: string
    updated_at: string
}

export interface AvailableAccount {
    id: number
    email: string
    name: string
}

export interface WorkspaceResponse {
    workspace: WorkspaceInfo | null
    available_accounts: AvailableAccount[]
}

export interface AddMemberPayload {
    email: string
    scopes?: Scope[]
}
