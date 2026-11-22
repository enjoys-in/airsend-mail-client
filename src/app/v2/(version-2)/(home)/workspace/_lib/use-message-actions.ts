"use client";

// Handlers behind every message action, used by both the right-click menu and
// the hover toolbar so they behave identically. Permissions come from
// useMessagePermissions; the server re-checks each call.

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useChatStore } from "./chat-store";
import { useMessagePermissions, settingsPath, type MessagePermissions } from "./use-access";
import { kickMember, timeoutMember, formatUntil } from "./member-actions";
import { confirmAction, confirmWithReason } from "../_components/ConfirmHost";
import { useSelection } from "./selection-store";
import type { ChatMessage } from "./chat-types";

export interface MessageActionHandlers {
  react: (emoji: string) => void;
  reply: () => void;
  replyInThread: () => void;
  /** Forward this message to other conversations. */
  forward: () => void;
  /** Enter select mode with this message selected. */
  select: () => void;
  edit: () => void;
  copyText: () => void;
  copyLink: () => void;
  copyId: () => void;
  togglePin: () => Promise<void>;
  remove: () => Promise<void>;
  timeoutAuthor: (minutes: number, label: string) => Promise<void>;
  clearAuthorTimeout: () => Promise<void>;
  kickAuthor: () => Promise<void>;
  manageAuthor: () => void;
  copyAuthorEmail: () => void;
}

function preview(text: string) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > 140 ? `${t.slice(0, 140)}…` : t;
}

export function useMessageActions(message: ChatMessage): MessagePermissions & MessageActionHandlers {
  const router = useRouter();
  const perms = useMessagePermissions(message);
  const store = useChatStore;
  const authorName = perms.author?.displayName || message.authorName || message.authorId;

  const copy = (text: string, what: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${what} copied`))
      .catch(() => toast.error("Could not copy to the clipboard"));
  };

  return {
    ...perms,

    react: (emoji) => {
      if (!perms.canReact) return;
      store.getState().addReaction(message.id, emoji);
    },
    reply: () => perms.canReply && store.getState().setReplyingTo(message),
    replyInThread: () => perms.canReplyThread && store.getState().openThread(message.id),
    forward: () => useSelection.getState().openForward(message.channelId, [message.id]),
    select: () => useSelection.getState().start(message.channelId, message.id),
    edit: () => perms.canEdit && store.getState().setEditingMessage(message.id),
    copyText: () => copy(message.content, "Message"),
    copyLink: () => {
      const url = new URL(window.location.href);
      url.hash = `msg-${message.id}`;
      copy(url.toString(), "Message link");
    },
    copyId: () => copy(message.id, "Message ID"),

    togglePin: async () => {
      if (!perms.canPin) return;
      const s = store.getState();
      const ok = message.isPinned ? await s.unpinMessage(message.id) : await s.pinMessage(message.id, true);
      if (ok) toast.success(message.isPinned ? "Message unpinned" : "Message pinned");
      else toast.error("You don't have permission to pin messages here.");
    },

    remove: async () => {
      if (!perms.canDelete) return;
      const confirmed = await confirmAction({
        title: perms.deletesAsModerator ? `Delete ${authorName}'s message?` : "Delete message?",
        description: (
          // Rendered by ConfirmHost; plain text keeps this file free of JSX.
          `"${preview(message.content)}"` +
          (perms.deletesAsModerator ? " — this is logged as a moderation action." : "")
        ),
        confirmLabel: "Delete",
        destructive: true,
      });
      if (!confirmed) return;
      const ok = await store.getState().deleteMessage(message.id);
      if (ok) toast.success("Message deleted");
      else toast.error("You don't have permission to delete this message.");
    },

    timeoutAuthor: async (minutes, label) => {
      if (!perms.canTimeoutAuthor || !perms.teamId || !perms.author) return;
      const reason = await confirmWithReason({
        title: `Timeout ${authorName} for ${label}?`,
        description:
          "They can still read, but can't send messages, react, join voice or start calls until the timeout ends.",
        confirmLabel: "Timeout",
        destructive: true,
      });
      if (reason === null) return;
      const r = await timeoutMember(perms.teamId, perms.author.email, minutes, reason);
      if (r.ok) toast.success(`${authorName} is timed out for ${label}`);
      else toast.error(r.error);
    },

    clearAuthorTimeout: async () => {
      if (!perms.canTimeoutAuthor || !perms.teamId || !perms.author) return;
      const r = await timeoutMember(perms.teamId, perms.author.email, 0);
      if (r.ok) toast.success(`Removed ${authorName}'s timeout`);
      else toast.error(r.error);
    },

    kickAuthor: async () => {
      if (!perms.canKickAuthor || !perms.teamId || !perms.author) return;
      const confirmed = await confirmAction({
        title: `Remove ${authorName} from the team?`,
        description: "They lose access to every channel in this team. They can be invited again later.",
        confirmLabel: "Remove",
        destructive: true,
      });
      if (!confirmed) return;
      const r = await kickMember(perms.teamId, perms.author.email);
      if (r.ok) toast.success(`Removed ${authorName}`);
      else toast.error(r.error);
    },

    manageAuthor: () => {
      if (perms.teamId && perms.author) router.push(settingsPath.member(perms.teamId, perms.author.email));
    },
    copyAuthorEmail: () => copy(message.authorId, "Email"),
  };
}

export { formatUntil };
