export enum MailLablesType {
    ALL="ALL",
    FOLDER = "FOLDER",
    LABEL = "LABEL",
    CATEGORY = "CATEGORY",
    MAILBOX = "MAILBOX",
}
export interface ListResponse {
    path: string;
    name: string;
    delimiter: string;
    listed: boolean;
    subscribed: boolean;
    status: boolean;
    type: MailLablesType
}
export type MailBoxListResponse = {
    total_count: number;
    unseen_count: number;

} & ListResponse

export type MailBoxListAPIResponse = {
    id: number
    path: string
    title: string
    delimiter: string
    listed: boolean
    subscribed: boolean
    status: MailLablesType
    type: string
    is_system: boolean
    is_deleted: boolean
    created_at: string
    updated_at: string
    deleted_at: any
} & {
    total_count: number;
    unseen_count: number;
} 
