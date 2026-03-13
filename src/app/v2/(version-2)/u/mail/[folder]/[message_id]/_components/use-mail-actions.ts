"use client";
import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import { toast } from "sonner";

import { useMailStore } from "@/store/mails";
import { useMultiTabStore } from "@/store/settings/multiTabSystem";
import { API } from "@/lib/api/handler";
import { airsendDB } from "@/db";
import { CustomEventKey, useCustomEvent } from "@/hooks/use-custom-event";
import { Security } from "@/lib/security";
import { GetAllMailsPayload } from "@/lib/types/mail.interface";

import { useSettingsStore } from "@/store/settings";
import { useAppSelector } from "@/store/hooks";

const s = new Security();

/** Safely decrypt — returns raw value when decryption fails or input is not encrypted */
export function safeDecrypt(value: string | undefined | null): string {
    if (!value) return "";
    if (!value.includes(":")) return value;
    const result = s.decryptAES(value);
    return result || value;
}

/** Decrypted mail fields commonly needed by actions */
export interface DecryptedMailFields {
    fromEmail: string;
    /** Reply-To address if set, otherwise empty string */
    replyTo: string;
    subject: string;
    plainText: string;
    recipient: string;
    recipients: string[];
}

/** Extract & decrypt commonly used fields from a mail */
export function getDecryptedFields(mail: GetAllMailsPayload): DecryptedMailFields {
    // reply_to may exist at runtime even though the TS type doesn't declare it
    const rawReplyTo = (mail as any).reply_to;
    return {
        fromEmail: safeDecrypt(mail.from_email),
        replyTo: safeDecrypt(rawReplyTo),
        subject: safeDecrypt(mail.subject),
        plainText: safeDecrypt(mail.plain_text),
        recipient: safeDecrypt(mail.receipient),
        recipients: Array.isArray(mail.receipients)
            ? mail.receipients.map((r: string) => safeDecrypt(r))
            : [],
    };
}

/** Build quoted reply body (HTML) */
export function buildReplyBody(mail: GetAllMailsPayload, fields: DecryptedMailFields): string {
    return `<br/><br/>
<div style="border-left:2px solid #ccc; padding-left:12px; margin-left:4px; color:#666;">
<p>On ${moment(mail.timestamp).format("ddd, MMM DD, YYYY [at] hh:mm A")}, ${fields.fromEmail} wrote:</p>
${fields.plainText}
</div>`;
}

/** Build forwarded body (HTML) */
export function buildForwardBody(mail: GetAllMailsPayload, fields: DecryptedMailFields): string {
    return `<br/><br/>
<div style="border-left:2px solid #ccc; padding-left:12px; margin-left:4px; color:#666;">
<p>---------- Forwarded message ----------</p>
<p>From: ${fields.fromEmail}</p>
<p>Date: ${moment(mail.timestamp).format("ddd, MMM DD, YYYY [at] hh:mm A")}</p>
<p>Subject: ${fields.subject || ""}</p>
<p>To: ${fields.recipient || ""}</p>
<br/>
${fields.plainText}
</div>`;
}

export type ReplyMode = "reply" | "reply-all" | "forward";

/**
 * Reusable hook for all mail-detail actions.
 * Returns action callbacks that operate on the currently‑selected mail.
 */
export function useMailActions() {
    const router = useRouter();
    const params = useParams();
    const folder = (params?.folder as string) ?? "";

    const selectedMail = useMailStore((s) => s.selectedMail);
    const all_emails = useMailStore((s) => s.all_emails);
    const setAllEmails = useMailStore((s) => s.setAllEmails);
    const setSelectedMail = useMailStore((s) => s.setSelectedMail);
    const createTabWithData = useMultiTabStore((s) => s.createTabWithData);
    const { emit: emitSyncCounts } = useCustomEvent(CustomEventKey.SyncMailCounts);
    const { emit: emitMailEvent } = useCustomEvent(CustomEventKey.MailEvents);
    const settings = useSettingsStore((s) => s.settings);
    const setSettings = useSettingsStore((s) => s.setSettings);
    const currAccount = useAppSelector((s) => s.accounts.currAccount);

    // ── Reply / Reply‑all / Forward (popup compose tab) ──────────────────

    const openCompose = useCallback(
        (mode: ReplyMode) => {
            if (!selectedMail) return;
            const f = getDecryptedFields(selectedMail);

            if (mode === "forward") {
                const body = buildForwardBody(selectedMail, f);
                createTabWithData(`Fwd: ${f.subject || "(no subject)"}`, {
                    to: [],
                    subject: f.subject?.startsWith("Fwd:") ? f.subject : `Fwd: ${f.subject || ""}`,
                    body,
                });
                return;
            }

            // reply or reply-all
            const body = buildReplyBody(selectedMail, f);
            // Use reply_to if available, otherwise fall back to from_email
            const replyAddress = f.replyTo || f.fromEmail;
            let to: string[];
            if (selectedMail.folder === "sent") {
                to = f.recipients.length > 0 ? f.recipients : [f.recipient];
            } else {
                to = [replyAddress];
            }
            let cc: string[] = [];
            if (mode === "reply-all" && f.recipients.length > 0) {
                // Include all recipients except myself as CC
                cc = f.recipients.filter((r) => r !== f.recipient);
            }

            // Build references chain: existing references + current uid
            const existingRefs = Array.isArray(selectedMail.references)
                ? selectedMail.references
                : selectedMail.references
                    ? [selectedMail.references]
                    : [];
            const replyRefs = [...existingRefs, selectedMail.uid].filter((r): r is string => Boolean(r));

            createTabWithData(`Re: ${f.subject || "(no subject)"}`, {
                to: to.filter(Boolean),
                cc: cc.length > 0 ? cc : undefined,
                subject: f.subject?.startsWith("Re:") ? f.subject : `Re: ${f.subject || ""}`,
                body,
                inReplyTo: selectedMail.uid,
                references: replyRefs,
                thread_id: selectedMail.thread_id,
            });
        },
        [selectedMail, createTabWithData]
    );

    const handleReply = useCallback(() => openCompose("reply"), [openCompose]);
    const handleReplyAll = useCallback(() => openCompose("reply-all"), [openCompose]);
    const handleForward = useCallback(() => openCompose("forward"), [openCompose]);

    // ── Mark as read ─────────────────────────────────────────────────────

    const handleMarkRead = useCallback(async () => {
        if (!selectedMail || selectedMail.is_read) return;
        try {
            const currentFolder = folder || (params?.folder as string);
            await API.handleMailEvents(
                { action: "mark_as_read", message_id: [selectedMail.message_id] },
                currentFolder
            );
            // Update Zustand store
            const updated = all_emails?.map((m) =>
                m.message_id === selectedMail.message_id ? { ...m, is_read: true } : m
            ) || [];
            setAllEmails(updated);
            setSelectedMail({ ...selectedMail, is_read: true } as any);
            // Update IDB
            await airsendDB.updateItem("mails", selectedMail.message_id, { is_read: true });
            emitSyncCounts(currentFolder);
        } catch {
            // Silently fail — non-critical
        }
    }, [selectedMail, folder, params?.folder, all_emails, setAllEmails, setSelectedMail, emitSyncCounts]);

    // ── Delete ───────────────────────────────────────────────────────────

    const handleDelete = useCallback(async () => {
        if (!selectedMail) return;
        try {
            const currentFolder = folder || (params?.folder as string);
            const { data } = await API.handleMailEvents(
                { action: "delete", message_id: [selectedMail.message_id] },
                currentFolder
            );
            if (!data?.success) {
                toast.error(data?.message || "Delete failed");
                return;
            }
            const updated = all_emails?.filter((m) => m.message_id !== selectedMail.message_id) || [];
            setAllEmails(updated);
            await airsendDB.bulkDeleteItems("mails", [selectedMail.message_id]);
            emitSyncCounts(currentFolder);
            setSelectedMail(null as any);
            toast.success("Mail deleted");
            router.push(`/v2/u/mail/${currentFolder}`);
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete");
        }
    }, [selectedMail, folder, params?.folder, all_emails, setAllEmails, emitSyncCounts, setSelectedMail, router]);

    // ── Archive ──────────────────────────────────────────────────────────

    const handleArchive = useCallback(async () => {
        if (!selectedMail) return;
        try {
            const currentFolder = folder || (params?.folder as string);
            const { data } = await API.handleMailEvents(
                { action: "archive", message_id: [selectedMail.message_id] },
                currentFolder
            );
            if (!data?.success) {
                toast.error(data?.message || "Archive failed");
                return;
            }
            const updated = all_emails?.filter((m) => m.message_id !== selectedMail.message_id) || [];
            setAllEmails(updated);
            await airsendDB.bulkDeleteItems("mails", [selectedMail.message_id]);
            emitSyncCounts(currentFolder);
            setSelectedMail(null as any);
            toast.success("Archived");
            router.push(`/v2/u/mail/${currentFolder}`);
        } catch (err: any) {
            toast.error(err?.message || "Failed to archive");
        }
    }, [selectedMail, folder, params?.folder, all_emails, setAllEmails, emitSyncCounts, setSelectedMail, router]);

    // ── Mark as unread ───────────────────────────────────────────────────

    const handleMarkUnread = useCallback(async () => {
        if (!selectedMail) return;
        try {
            const currentFolder = folder || (params?.folder as string);
            const { data } = await API.handleMailEvents(
                { action: "mark_as_unread", message_id: [selectedMail.message_id] },
                currentFolder
            );
            if (!data?.success) {
                toast.error(data?.message || "Failed");
                return;
            }
            // Update local state
            const updated = all_emails?.map((m) =>
                m.message_id === selectedMail.message_id ? { ...m, is_read: false } : m
            ) || [];
            setAllEmails(updated);
            await airsendDB.updateItem("mails", selectedMail.message_id, { is_read: false });
            emitSyncCounts(currentFolder);
            toast.success("Marked as unread");
            router.push(`/v2/u/mail/${currentFolder}`);
        } catch (err: any) {
            toast.error(err?.message || "Failed");
        }
    }, [selectedMail, folder, params?.folder, all_emails, setAllEmails, emitSyncCounts, router]);

    // ── Mark as spam ─────────────────────────────────────────────────────

    const handleSpam = useCallback(async () => {
        if (!selectedMail) return;
        try {
            const currentFolder = folder || (params?.folder as string);
            const { data } = await API.handleMailEvents(
                { action: "spam", message_id: [selectedMail.message_id] },
                currentFolder
            );
            if (!data?.success) {
                toast.error(data?.message || "Failed");
                return;
            }
            const updated = all_emails?.filter((m) => m.message_id !== selectedMail.message_id) || [];
            setAllEmails(updated);
            await airsendDB.bulkDeleteItems("mails", [selectedMail.message_id]);
            emitSyncCounts(currentFolder);
            setSelectedMail(null as any);
            toast.success("Reported as spam");
            router.push(`/v2/u/mail/${currentFolder}`);
        } catch (err: any) {
            toast.error(err?.message || "Failed");
        }
    }, [selectedMail, folder, params?.folder, all_emails, setAllEmails, emitSyncCounts, setSelectedMail, router]);

    // ── Move to folder ───────────────────────────────────────────────────

    const handleMoveTo = useCallback(
        async (targetFolder: string) => {
            if (!selectedMail) return;
            try {
                const currentFolder = folder || (params?.folder as string);
                const { data } = await API.handleMailEvents(
                    { action: "move" as any, message_id: [selectedMail.message_id] },
                    `${currentFolder}&destination=${targetFolder}`
                );
                if (!data?.success) {
                    toast.error(data?.message || "Move failed");
                    return;
                }
                const updated = all_emails?.filter((m) => m.message_id !== selectedMail.message_id) || [];
                setAllEmails(updated);
                await airsendDB.bulkDeleteItems("mails", [selectedMail.message_id]);
                emitSyncCounts(currentFolder);
                setSelectedMail(null as any);
                toast.success(`Moved to ${targetFolder}`);
                router.push(`/v2/u/mail/${currentFolder}`);
            } catch (err: any) {
                toast.error(err?.message || "Failed to move");
            }
        },
        [selectedMail, folder, params?.folder, all_emails, setAllEmails, emitSyncCounts, setSelectedMail, router]
    );

    // ── Star / unstar ────────────────────────────────────────────────────

    const handleToggleStar = useCallback(async () => {
        if (!selectedMail) return;
        const action = selectedMail.is_starred ? "unstar" : "star";
        try {
            const currentFolder = folder || (params?.folder as string);
            const { data } = await API.handleMailEvents(
                { action, message_id: [selectedMail.message_id] },
                currentFolder
            );
            if (!data?.success) {
                toast.error(data?.message || "Failed");
                return;
            }
            const updated = all_emails?.map((m) =>
                m.message_id === selectedMail.message_id ? { ...m, is_starred: !selectedMail.is_starred } : m
            ) || [];
            setAllEmails(updated);
            setSelectedMail({ ...selectedMail, is_starred: !selectedMail.is_starred } as any);
            await airsendDB.updateItem("mails", selectedMail.message_id, { is_starred: !selectedMail.is_starred });
            toast.success(action === "star" ? "Starred" : "Unstarred");
        } catch (err: any) {
            toast.error(err?.message || "Failed");
        }
    }, [selectedMail, folder, params?.folder, all_emails, setAllEmails, setSelectedMail]);

    // ── Block sender / domain ────────────────────────────────────────────

    /** Adds the full sender email to blocked_sent_domain and persists to IDB */
    const handleBlockSender = useCallback(async () => {
        if (!selectedMail || !currAccount?.email) return;
        const f = getDecryptedFields(selectedMail);
        const sender = f.fromEmail;
        if (!sender) return;

        const existing = settings?.blocked_sent_domain ?? [];
        if (existing.includes(sender)) {
            toast.info(`${sender} is already blocked`);
            return;
        }

        const updated = [...existing, sender];
        try {
            await airsendDB.updateNestedItem(
                "settings",
                currAccount.email,
                "settings.blocked_sent_domain" as any,
                updated as any,
            );
            setSettings({ blocked_sent_domain: updated });
            toast.success(`Blocked sender: ${sender}`);
        } catch (err: any) {
            toast.error(err?.message || "Failed to block sender");
        }
    }, [selectedMail, currAccount?.email, settings?.blocked_sent_domain, setSettings]);

    /** Adds the sender's domain to blocked_sent_domain and persists to IDB */
    const handleBlockDomain = useCallback(async () => {
        if (!selectedMail || !currAccount?.email) return;
        const f = getDecryptedFields(selectedMail);
        const domain = f.fromEmail?.split("@")[1];
        if (!domain) return;

        const existing = settings?.blocked_sent_domain ?? [];
        if (existing.includes(domain)) {
            toast.info(`${domain} is already blocked`);
            return;
        }

        const updated = [...existing, domain];
        try {
            await airsendDB.updateNestedItem(
                "settings",
                currAccount.email,
                "settings.blocked_sent_domain" as any,
                updated as any,
            );
            setSettings({ blocked_sent_domain: updated });
            toast.success(`Blocked domain: ${domain}`);
        } catch (err: any) {
            toast.error(err?.message || "Failed to block domain");
        }
    }, [selectedMail, currAccount?.email, settings?.blocked_sent_domain, setSettings]);

    return {
        selectedMail,
        folder,
        openCompose,
        handleReply,
        handleReplyAll,
        handleForward,
        handleDelete,
        handleArchive,
        handleMarkRead,
        handleMarkUnread,
        handleSpam,
        handleMoveTo,
        handleToggleStar,
        handleBlockSender,
        handleBlockDomain,
        safeDecrypt,
        getDecryptedFields,
    };
}
