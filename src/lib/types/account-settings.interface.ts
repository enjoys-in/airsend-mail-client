import { Prettify } from "."
import { AutoReply, EmailSettings, ICalenderConfig, IComposingSettings, IDisplay, IEncryptionSettings, IFoldersSettings, INotifications, DomainName, IPersonalization, ISignature, VacationSender } from "./get-user-settings-response"

type LabelVisibility = {
    showInLabelList: boolean
    showIfUnread: boolean
    showInMessageList?: boolean
    showInIMAP: boolean
}
export type DeepPrettify<T> =
    T extends (...args: any[]) => any ? T : // leave functions as-is
    T extends Array<infer U> ? DeepPrettifyArray<U> : // handle arrays
    T extends object ? { [K in keyof T]: DeepPrettify<T[K]> } : // recurse
    T; // primitives stay the same

type DeepPrettifyArray<T> = Array<DeepPrettify<T>>;

export interface UserMailAccountSettings {
    email: string;
    settings: DeepPrettify<AccountSettings>;
    updatedAt?: number;
    type?: "get" | "update"
}
export interface AccountSettings {
    usage: number;
    mailbox_size: number;
    quota_in_percent: string;

    notifications: INotifications
    security: {
        password_confirmation: boolean,
        password_expiration: {
            enabled: boolean,
            days: number
        },
        change_on_first_login: boolean
    }
    blocked_sent_domain: string[];
    blocked_recepient_domain: string[];
    aliases: string[];

    forwarding_rules: Array<{
        from: string;
        to: string;
    }>

    catch_emails: string[]

    smtp_config: {
        enable_smtp: boolean;
        enable_smtp_from_alias: boolean;
        allow_email_tracking: boolean;
    };

    auto_reply: AutoReply;

    vacationSender: VacationSender;

    user: {
        display_name: string | null;
        first_name: string | null;
        last_name: string | null;
        use_display_name: boolean;
        timezone: string;
    };

    personalization: IPersonalization

    email_settings: EmailSettings
    email_privacy: {
        autoShowImages: boolean;
        block_email_tracking: boolean;
    };

    imap_config: {
        enable_imap: boolean;
    };

    calender_config: ICalenderConfig;

    encryption: IEncryptionSettings;

    folders_settings: IFoldersSettings;

    composing: IComposingSettings;

    display: IDisplay

    auto_sync: {
        enabled: boolean;
        interval: number | string;
    };

    signatures: ISignature[];

    organization: DomainName ;

    last_synced_at: string | null;
    sync_error: string | null;
    sync_status: string | null;

}
export type EmailFooter = {
    footer_enabled: true,
    footer_text: string
} | {
    footer_enabled: false,
    footer_text?: null
}
export type SystemEmailType = {
    is_system_email: true,
    system_email_reply: string
} | {
    is_system_email: false,
    system_email_reply?: null
}