
export interface EmailResponseResult {
  email: string
  mailboxList: MailboxList[]
  messages: Messages
}

export interface MailboxList {
  path: string
  pathAsListed: string
  flags: Flags
  delimiter: string
  listed: boolean
  parentPath: string
  parent: any[]
  name: string
  subscribed: boolean
  specialUse?: string
  specialUseSource?: string
}

export interface Flags { }

export interface Messages {
  [key: string]: MessageInBoundBody
}

export interface MessageInBoundBody {
  info: MailboxList
  total_count: number
  unseen_count: number
  emails: any[]
  hasMore: boolean
}

export interface SingleEmailResponse {
  emails: EmailOnly[]
  totalCount: number
  hasMore: boolean
  uidNext: number
  uidValidity: string
  flags: Flags
}

export interface EmailOnly {
  message_id: string
  uid: number
  type: string
  size: number
  subject: string
  from: string
  to: string
  date: string
  flags: Flags
  attachments: any[]
}

export interface Flags {}

export interface Flags { }


