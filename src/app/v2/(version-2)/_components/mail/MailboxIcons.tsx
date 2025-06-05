
import { Archive, File, Inbox, Send, Trash, Folder, Mailbox } from "lucide-react";

export const MailBoxIcon = ({name}:{name: string}) => {
    let Icon = Folder
    name = name.toLocaleLowerCase()
    switch (name) {
        case "inbox":
            Icon = Inbox
            break;
        case "sent":
        case "sent items":
        case "outbox":
            Icon = Send
            break;
        case "drafts":
            Icon = File
            break;
        case "junk":
        case "spam":
            Icon = Mailbox
            break;
        case "archive":
            Icon = Archive
            break;
        case "trash":
        case "deleted":
        case "delete items":
        case "bin":
            Icon = Trash
            break;
        default:
            break;
    }
    return <Icon  className="mr-2 h-4 w-4" />
}