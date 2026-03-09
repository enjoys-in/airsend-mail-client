// ─── Organization (OrganizationEntity) ──────────────────────────
export interface IOrganization {
    id: string
    name: string
    title: string | null
    phone: string | null
    address: string | null
    report_email: string | null
    logo_url: string | null
    bimi_record: string | null
    settings?: Record<string, unknown> | null
    domains?: IDomain[]
    created_by: string | null
    domain_org_histories?: IDomainOrgHistory[]
    created_at: string
    updated_at: string
}

// ─── Domain ─────────────────────────────────────────────────────
export type DomainStatus = "active" | "pending" | "inactive" | "suspended"

export interface IDomain {
    id: string
    domain_name: string
    org_id: string | null
    org_name: string | null
    status: DomainStatus
    dns_verified: boolean
    mx_verified: boolean
    spf_verified: boolean
    dkim_verified: boolean
    dmarc_verified: boolean
    accounts_count: number
    created_at: string
    updated_at: string
}

// ─── Domain-Org History (DomainOrgHistoryEntity) ────────────────
export interface IDomainOrgHistory {
    id: string
    domain_id: string
    org_id: string
    assigned_at: string
    revoked_at: string | null
    changed_by: string | null
    // Relations (loaded on demand)
    domain?: IDomain
    org?: IOrganization
    // Computed / joined fields
    domain_name?: string
    org_name?: string
}

// ─── Member ─────────────────────────────────────────────────────
export type MemberStatus = "active" | "inactive" | "banned" | "invited"

export interface IMember {
    id: string
    name: string
    email: string
    role: string
    organization: string
    org_id: string
    domain: string
    status: MemberStatus
    avatar_url: string | null
    joined_at: string
    last_active: string
}

// ─── Role ───────────────────────────────────────────────────────
export interface IRole {
    id: string
    name: string
    description: string
    permissions: string[]
    is_default: boolean
    is_system: boolean
    user_count: number
    created_at: string
}

// ─── Permissions (grouped by category) ──────────────────────────
export const PERMISSION_CATEGORIES = {
    organization: {
        label: "Organization",
        permissions: ["org_view", "org_add", "org_edit", "org_delete"],
    },
    domain: {
        label: "Domain",
        permissions: ["domain_view", "domain_add", "domain_delete"],
    },
    member: {
        label: "Member",
        permissions: ["member_view", "member_add", "member_edit", "member_delete"],
    },
    roles: {
        label: "Roles",
        permissions: ["roles_view", "roles_manage"],
    },
    settings_general: {
        label: "Settings — General",
        permissions: ["settings_view", "settings_email", "settings_composing", "settings_folders"],
    },
    settings_security: {
        label: "Settings — Security",
        permissions: ["settings_pgp_keys", "settings_encryption"],
    },
    settings_mail: {
        label: "Settings — Mail Server",
        permissions: ["settings_imap", "settings_smtp"],
    },
    settings_other: {
        label: "Settings — Other",
        permissions: ["settings_calendar"],
    },
    system: {
        label: "System",
        permissions: ["view_logs", "manage_billing"],
    },
} as const

export const ALL_PERMISSIONS = Object.values(PERMISSION_CATEGORIES).flatMap(
    (cat) => cat.permissions
)

export type Permission = (typeof ALL_PERMISSIONS)[number]

// ─── Log ────────────────────────────────────────────────────────
export type LogLevel = "info" | "warn" | "error" | "debug"

export interface ILog {
    id: string
    timestamp: string
    level: LogLevel
    message: string
    source: string
    actor: string
    org_id: string | null
    metadata: Record<string, unknown> | null
}

// ─── Account Settings (MailsAccountsSettingsEntity) ─────────────
export type EmailFooterConfig =
    | { footer_enabled: true; footer_text: string }
    | { footer_enabled: false; footer_text?: null }

export type SystemEmailConfig =
    | { is_system_email: true; system_email_reply: string }
    | { is_system_email: false; system_email_reply?: null }

export interface IAccountSettings {
    notifications: {
        new_email: boolean
        delivery_failed: boolean
        delivery_success: boolean
        undelivered_email: boolean
        push_notification: boolean
    }
    security: {
        password_confirmation: boolean
        password_expiration: { enabled: boolean; days: number }
        change_on_first_login: boolean
    }
    blocked_sent_domain: string[]
    blocked_recepient_domain: string[]
    aliases: string[]
    forwarding_rules: Array<{ from: string; to: string }>
    catch_emails: string[]
    smtp_config: {
        enable_smtp: boolean
        enable_smtp_from_alias: boolean
        allow_email_tracking: boolean
    }
    auto_reply: {
        enabled: boolean
        ON_NEW_MESSAGE: Record<string, string>
        ON_REPLY_MESSAGE: Record<string, string>
    }
    vacationSender: {
        enabled: boolean
        message: string
        startDate: string
        endDate: string
    }
    user: {
        display_name: string | null
        first_name: string | null
        last_name: string | null
        use_display_name: boolean
        timezone: string
    }
    personalization: {
        theme: "dark" | "light"
        layout: "grid" | "list" | "2-column"
    }
    email_settings: {
        autoShowImages: boolean
        keepMessages: boolean
        excludeSpam: boolean
        confirmLinks: boolean
        conversationGrouping: boolean
        autoDeleteUnwanted: boolean
        stickyLabels: boolean
        monthly_limit: number | string
        thresold_limit: number | string
        secure_email_enabled: boolean
        email_footer: EmailFooterConfig
        system_email: SystemEmailConfig
    }
    email_privacy: {
        autoShowImages: boolean
        block_email_tracking: boolean
    }
    imap_config: { enable_imap: boolean }
    calender_config: { enable_calender: boolean }
    display: {
        showMeetings: boolean
        showRightSidebar: boolean
        showCalendar: boolean
        showQuota: boolean
        settings: boolean
    }
    auto_sync: { enabled: boolean; interval: number | string }
    signatures: Array<{
        key: string
        name: string
        line: string
        default: boolean
        type: "blob" | "text" | "upload"
    }>
    sieve_filters?: Record<string, unknown[]>
    last_synced_at: Date | null
    sync_error: string | null
    sync_status: string | null
}
