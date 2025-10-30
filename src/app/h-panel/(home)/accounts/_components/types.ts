export interface User {
    name: string
    email: string
    password: string
    domain_name_id: string
}
export interface FetchAllUsersRootObject {
    id: number;
    name: null;
    email: string;
    usage: string;
    mailbox_size: string;
    status: string;
    created_at: string;
    settings: {
        imap_config: {
            enable_imap: boolean
        },
        allow_wildcard: boolean
        smtp_config: {   enable_smtp: boolean}
    }
}