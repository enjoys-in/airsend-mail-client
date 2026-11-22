"use client";

// ============================================================================
// Desktop notifications for incoming chat messages.
//
// Shown only when the user has notifications enabled: the browser permission
// is granted and they did not turn them off in the app prompt
// (localStorage `notificationPreference` = "denied"). Never for my own
// messages, and never for the conversation I am looking at right now.
// ============================================================================

import type { ChatMessage } from "./chat-types";

const BODY_MAX = 140;

export function notificationsEnabled(): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  try {
    return window.localStorage.getItem("notificationPreference") !== "denied";
  } catch {
    return true;
  }
}

function bodyOf(message: ChatMessage): string {
  const text = message.content.replace(/\s+/g, " ").trim();
  if (message.attachments.length && (!text || message.attachments.some((a) => a.name === text))) {
    return `📎 ${message.attachments.map((a) => a.name).join(", ") || text}`;
  }
  return text.length > BODY_MAX ? `${text.slice(0, BODY_MAX)}…` : text;
}

/**
 * Shows a notification for `message`. `title` names the conversation ("#general", "Alice"); clicking the
 * notification focuses the tab and calls `onOpen` (open that conversation). One notification per conversation:
 * a newer message replaces the older one (same tag).
 */
export function notifyIncoming(message: ChatMessage, title: string, onOpen: () => void): void {
  if (!notificationsEnabled()) return;
  const options: NotificationOptions = {
    body: `${message.authorName || message.authorId}: ${bodyOf(message)}`,
    tag: `airsend-chat-${message.channelId}`,
    icon: "/favicon.ico",
  };
  try {
    const n = new Notification(title, options);
    n.onclick = () => {
      window.focus();
      onOpen();
      n.close();
    };
  } catch {
    // Android Chrome only allows notifications from a service worker.
    void navigator.serviceWorker?.ready.then((r) => r.showNotification(title, options)).catch(() => {});
  }
}
