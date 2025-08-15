import { EditorAttachments } from "./editor";
export interface BaseMailData {
    message_id: string;
    from: string;
    to: string;
    display_name: string;
    hasAttachment: boolean | FileAttachmentInterface[];
    timestamp: string | undefined;
    content: string;
    subject: string;
    synced: boolean
    html?: string;
}

export interface MailData extends BaseMailData {
    headers: Map<string, any>;
    receipients: string[];
    headersLine: readonly {
        key: string;
        line: string;
    }[]
    flags: string[];
    tags: string[];
    folder: string[];
    is_reply: boolean;
    trackers_detected: number
    uid: string
    reply_to?: string
    refrences?: string[]

}
export interface FileAttachmentInterface {
    type: string;
    content: Buffer;
    contentType: string;
    partId: string;
    release: string | null;
    contentDisposition: string;
    filename: string;
    headers: Map<string, any>;
    checksum: string;
    size: number;
}

export enum DOMAIN_STATUS {
    NOT_STARTED = 'NOT STARTED',
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED'
}
export interface DomainVerificationResponse {
    id: string;
    domain_name: string;
    status: DOMAIN_STATUS;
    records: DNSRecords[];
    created_at: string | Date;
}

export type ExpectedDNSRecordType = {
    SPF: Answer,
    DKIM: Answer,
    DMARC: Answer
    MX: Answer,
}
export type HasRecords = {
    DKIM: Answer
} & Omit<ExpectedDNSRecordType, "DKIM">


interface Answer {
    name: string;
    type: number;
    TTL: number;
    data: string;
}
export interface MailOptions {
    from: string;
    to: Array<string>;
    cc?: Array<string>;
    bcc?: Array<string>;
    subject: string;
    text?: string;
    html: string;
}
export type CustomMailOptions = Omit<MailOptions, "text"> & {
    attachments?: Array<EditorAttachments>,
}
// export interface DNSRecords {
//     MX: Answer[];
//     SPF: Answer;
//     DKIM: Answer;
//     DMARC: Answer;
// }
export interface DNSRecords extends Answer { }

interface Answer {
    ttl: number;
    data: string;
    name: string;
    type: number;
    status: boolean;
}
export interface GetAllMailsPayload {
    id: number|string;
    from_email: string;
    message_id: string;
    receipient: string;
    subject: string;
    flags: string[];
    folder: string;
    folder_path: string;
    tags: string[];
    is_read: boolean;
    is_replied: boolean;
    in_replied_to: string;
    references: string | string[];
    trackersDetected: number;
    plain_text: string;
    thread_id: null;
    uid: string | undefined;
    content: string;
    hasAttachment: boolean | {
        related: boolean;
        type: "attachment";
        contentType: string;
        contentDisposition: string;
        filename?: string | undefined;
        headers: Headers;
        headerLines: any;
        checksum: string;
        size: number;
        contentId?: string | undefined;
        cid?: string | undefined;
    }[];
    timestamp: string | undefined;
}

export interface PGPKeyPair {
    publicKey: string;
    privateKey: string;
    revocationCertificate?: string;
}

export interface EncodedMessageResponse {
    chiper_text: string, k: string, open_pgp: PGPKeyPair
}