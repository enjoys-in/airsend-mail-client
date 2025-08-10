type MailAction =
    | "delete"
    | "delete_all"
    | "mark_as_read"
    | "mark_as_unread"
    | "mark_all_as_read"
    | "mark_all_as_unread"
    | "block"
    | "report"
    | "move"
    | "copy"
    | "move_all"
    | "copy_all"
    | "pin"
    | "unpin"
    | "archive"
    | "unarchive"
    | "spam"
    | "unspam"
    | "read"
    | "unread"
    | "flag"
    | "unflag"
    | "star"
    | "unstar"
    | "importance"
    | "unimportance"
    | "move-to-folder";
export interface MailEventData {
    action: MailAction;
    id?: number[]
    message_id?: string[]
}
