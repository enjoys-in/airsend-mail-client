export interface NavItem {
  route: string;
  label: string;
}
export interface ApiResponse<T> {
  success: boolean
  result: T
  message: string
}
export interface IFeedback {
  avatar: string;
  fullname: string;
  bio: string;
  text: string;
}

export type IMAP_EVENTS = "create"
  | "rename"
  | "delete"
  | "subscribe"
  | "unsubscribe"
  | "status"
  | "quota";

export type IMAP_ACTIONS = "delete"
  | "markAsRead"
  | "markAsUnread"
  | "block"
  | "report"
  | "archive"
  | "move"
  | "copy"
  | "markAsSpam"
  | "markAsImportant"
  | "markAsNotSpam"
  | "markAsNotImportant"
  | "markAsStarred"
  | "markAsNotStarred"
  | "markAsDraft"
  | "markAsSent"
  | "markAsReceived"
  | "markAsReplied"
  | "markAsForwarded"
  | "markAsNotReplied"
  | "markAsNotForwarded"

type IMAP_EVENTS_WITH_MAILBOX = "create"
  | "delete"
  | "subscribe"
  | "unsubscribe"
  | "status"

export type IMAP_EVENTS_WITH_EMAILS = "mark_as_read"
  | "mark_as_unread"
  | "mark_all_as_read"
  | "mark_all_as_unread"


type CommonEvent = Exclude<IMAP_EVENTS, "rename">;

type MailboxOnly = {
  [K in CommonEvent]: { type: K; mailbox: string };
}[CommonEvent];


type RenameEvent = {
  type: "rename";
  mailbox: string;
  targetMailbox: string;
};
export type IsPlainObject<T> = T extends object
  ? T extends (...args: any[]) => any
  ? false
  : T extends any[]
  ? false
  : T extends Date
  ? false
  : true
  : false;
export type Prettify<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

export type DeepPrettify<T> = T extends object
  ? T extends (...args: any[]) => any
  ? T
  : T extends any[]
  ? { [K in keyof T]: DeepPrettify<T[K]> }
  : {
    [K in keyof T]: DeepPrettify<T[K]>;
  } extends infer O
  ? { [K in keyof O]: O[K] }
  : never
  : T;

export type IMAP_FOLDERS = MailboxOnly | RenameEvent;

