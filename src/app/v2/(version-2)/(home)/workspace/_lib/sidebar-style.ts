// Sidebar rows (channels, DMs): a conversation with messages I have not read yet is shown bold and in the
// foreground colour; once I read it (markRead resets its unread count) it goes back to normal.
export const unreadRowClass = (unread: number, active: boolean): string | undefined =>
  !active && unread > 0 ? "font-semibold text-foreground" : undefined;
