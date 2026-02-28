import { EmailFooter, SystemEmailType } from "./account-settings.interface"

export interface GetUserSettingsResponse {
    message: string
    result: UserSettingsResponse
    success: boolean
    "X-API-PLATFORM STATUS": string
}


export interface UserSettingsResponse {
    id: number
    name: string
    email: string
    mailbox_size: string
    usage: string
    type: string
    settings: Settings
    folders: any[]
    tags: any[]
    throttle_configs: ThrottleConfig[]
    smtp_configs: any[]
}

interface Settings {
    id: number
    email_id: string
    blocked_sent_domain: any[]
    blocked_recepient_domain: any[]
    aliases: string[]
    forwarding_rules: ForwardingRules
    notifications:INotifications
    catch_emails: string[]
    smtp_config: SmtpConfig
    auto_reply: AutoReply
    vacationSender: VacationSender
    user: User
    security: Security
    personalization: IPersonalization
    email_settings: EmailSettings
    email_privacy: EmailPrivacy
    imap_config: ImapConfig
    calender_config: ICalenderConfig
    display: IDisplay
    auto_sync: AutoSync
    signatures: ISignatures[]
    organization: IOrganizationInfo | null
    last_synced_at: string | null
    sync_error: string | null
    sync_status: string | null
}

export interface ICalenderConfig {
    enable_calender: boolean
    calender_sync_interval: number | string
    notifications: boolean
    sharing: boolean
    config: Array<{
        calendar_id: string
        calendar_name: string
        calender_url: string
        sync_status: string
        last_synced_at: Date | null
        sync_error: string | null
    }>
}

export interface IOrganizationInfo {
    org_id: string | null
    org_name: string | null
    domain_name: string | null
}
export type INotifications = {
    new_email: boolean,
    delivery_failed: boolean,
    delivery_success: boolean,
    undelivered_email: boolean,
    push_notification: boolean,
}
export type ISignatures = Array<{
    key: string;
    name: string;
    line: string;
    default: boolean;
    type: 'blob' | 'text' | 'upload';
}>;

type ForwardingRules = Array<{
    from: string;
    to: string;
}>

interface SmtpConfig {
    enable_smtp: boolean
    allow_email_tracking: boolean
    enable_smtp_from_alias: boolean
}

export interface AutoReply {
    enabled: boolean;
    ON_NEW_MESSAGE: { [key: string]: string };
    ON_REPLY_MESSAGE: { [key: string]: string };
}

export interface VacationSender {
    enabled: boolean;
    message?: string,
    startDate?: string
    endDate?: string,
}

interface User {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    use_display_name: boolean;
    timezone: string;
}

interface Security {
    password_expiration: PasswordExpiration
    change_on_first_login: boolean
    password_confirmation: boolean
}

interface PasswordExpiration {
    days: number
    enabled: boolean
}

export interface IPersonalization {
    theme: 'dark' | 'light';
    layout: 'grid' | 'list' | '2-column';
}

export type EmailSettings = {
    excludeSpam: boolean
    confirmLinks: boolean
    keepMessages: boolean
    stickyLabels: boolean
    monthly_limit: number | string
    autoShowImages: boolean
    thresold_limit: number | string
    autoDeleteUnwanted: boolean
    system_email_reply: any
    conversationGrouping: boolean
    secure_email_enabled: boolean
    email_footer: EmailFooter
    system_email: SystemEmailType
}

interface EmailPrivacy {
    autoShowImages: boolean
    block_email_tracking: boolean
}

interface ImapConfig {
    enable_imap: boolean;
}

export interface IDisplay {
    showQuota: boolean
    showCalendar: boolean
    showMeetings: boolean
    showRightSidebar: boolean
    settings: boolean
}

interface AutoSync {
    enabled: boolean
    interval: number
}

interface ThrottleConfig {
    id: number
    provider_name: string
    limit_per_minute: number
    limit_per_Hour: number
    limit_per_day: number
    email_id: string
}
