import { Archive, File, Inbox, Send, Trash } from "lucide-react";

export const MAIL_LINKS = [
  {
    title: "Inbox",
    unreadCount: 1,
    icon: Inbox,
    href: "/u/inbox",
  },
  {
    title: "Sent",
    unreadCount: 0,
    icon: Send,
    href: "/u/sent",
  },
  {
    title: "Drafts",
    unreadCount: 0,
    icon: File,
    href: "/u/drafts",
  },
  {
    title: "Spam",
    unreadCount: 0,
    icon: Inbox,
    href: "/u/spam",
  },
  {
    title: "Trash",
    unreadCount: 0,
    icon: Trash,
    href: "/u/trash",
  },
  {
    title: "Archive",
    unreadCount: 0,
    icon: Archive,
    href: "/u/archive",
  },
];
export const PREFERENCE_LINKS = [   
  {
    title: "Account",
    href: "/u/settings/username/account",
  },
  {
    title: "Appearance",
    href: "/u/settings/username/appearance",
  },
  {
    title: "Notifications",
    href: "/u/settings/username/notifications",
  },
  {
    title: "Display",
    href: "/u/settings/username/display",
  },
];
