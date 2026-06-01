"use client";

import React, { useState, useCallback, useRef, useEffect, type KeyboardEvent } from "react";
import {
    Forward,
    ExternalLink,
    Reply,
    Send,
    Trash2,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMailStore } from "@/store/mails";
import { useAppSelector } from "@/store/hooks";
import { API } from "@/lib/api/handler";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Security } from "@/lib/security";
import { } from "@/lib/utils";
import { airsendDB } from "@/db";
import {
    type ReplyMode,
    getDecryptedFields,
    buildReplyBody,
    buildForwardBody,
} from "./use-mail-actions";

const s = new Security();

// ─── Chip helpers ────────────────────────────────────────────────────────────

interface EmailChip {
    id: string;
    email: string;
    isValid: boolean;
}

function validateEmail(email: string) {
    const plain = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const named = /^.+<([^\s@]+@[^\s@]+\.[^\s@]+)>$/.test(email);
    return plain || named;
}

function ChipInput({
    label,
    chips,
    setChips,
}: {
    label: string;
    chips: EmailChip[];
    setChips: React.Dispatch<React.SetStateAction<EmailChip[]>>;
}) {
    const [input, setInput] = useState("");

    const addChip = useCallback(
        (raw: string) => {
            const email = raw.trim();
            if (!email) return;
            setChips((prev) => [
                ...prev,
                { id: `${Date.now()}-${Math.random()}`, email, isValid: validateEmail(email) },
            ]);
            setInput("");
        },
        [setChips]
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (["Enter", " ", ","].includes(e.key)) {
                e.preventDefault();
                addChip(e.currentTarget.value);
            }
            if (e.key === "Backspace" && !input && chips.length > 0) {
                setChips((prev) => prev.slice(0, -1));
            }
        },
        [addChip, chips.length, input, setChips]
    );

    return (
        <div className="flex items-start gap-2">
            <span className="text-xs text-muted-foreground w-8 pt-1.5 shrink-0">{label}</span>
            <div className="flex flex-wrap gap-1.5 flex-1 min-h-[28px] items-center">
                {chips.map((chip) => (
                    <span
                        key={chip.id}
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${chip.isValid
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-destructive/10 border-destructive/20 text-destructive"
                            }`}
                    >
                        {chip.email}
                        <button
                            type="button"
                            onClick={() => setChips((prev) => prev.filter((c) => c.id !== chip.id))}
                            className="hover:bg-black/10 rounded-full p-0.5"
                            aria-label={`Remove ${chip.email}`}
                        >
                            <X className="w-2.5 h-2.5" />
                        </button>
                    </span>
                ))}
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => addChip(input)}
                    placeholder={chips.length === 0 ? `${label} recipients...` : ""}
                    className="flex-1 min-w-[100px] outline-none bg-transparent text-xs"
                />
            </div>
        </div>
    );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface InlineReplyBoxProps {
    /** Called when user clicks "pop out" — opens in compose tab popup instead */
    onPopOut?: (mode: ReplyMode) => void;
}

export default function InlineReplyBox({ onPopOut }: InlineReplyBoxProps) {
    const selectedMail = useMailStore((s) => s.selectedMail);
    const currAccount = useAppSelector((s) => s.accounts.currAccount);

    const [displayName, setDisplayName] = useState(currAccount?.name || "");
    const [mode, setMode] = useState<ReplyMode | null>(null);
    const [toChips, setToChips] = useState<EmailChip[]>([]);
    const [ccChips, setCcChips] = useState<EmailChip[]>([]);
    const [subject, setSubject] = useState("");
    const [sending, setSending] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    // Clean up contentEditable children on unmount to prevent removeChild errors
    useEffect(() => {
        const editor = editorRef.current;
        return () => {
            if (editor) {
                while (editor.firstChild) editor.removeChild(editor.firstChild);
            }
        };
    }, []);

    // Fetch display_name from IDB settings on mount
    useEffect(() => {
        if (!currAccount?.email) return;
        airsendDB.getMultiNestedItem("settings", currAccount.email, [
            "settings.user.display_name",
        ]).then((res) => {
            const name = (res.value?.settings as any)?.user?.display_name;
            if (name) setDisplayName(name);
        });
    }, [currAccount?.email]);

    // Expand inline editor with pre-filled data
    const activate = useCallback(
        (m: ReplyMode) => {
            if (!selectedMail) return;
            const f = getDecryptedFields(selectedMail);

            setMode(m);
            setSubject(
                m === "forward"
                    ? (f.subject?.startsWith("Fwd:") ? f.subject : `Fwd: ${f.subject || ""}`)
                    : (f.subject?.startsWith("Re:") ? f.subject : `Re: ${f.subject || ""}`)
            );

            if (m === "forward") {
                setToChips([]);
            } else {
                // Use reply_to if available, otherwise fall back to from_email
                const replyAddress = f.replyTo || f.fromEmail;
                const to =
                    selectedMail.folder === "sent"
                        ? (f.recipients.length > 0 ? f.recipients : [f.recipient])
                        : [replyAddress];
                setToChips(
                    to.filter(Boolean).map((e) => ({
                        id: `init-${Date.now()}-${Math.random()}`,
                        email: e,
                        isValid: validateEmail(e),
                    }))
                );
            }
            setCcChips([]);

            // Set quoted body after a tick so the ref is mounted
            requestAnimationFrame(() => {
                if (!editorRef.current) return;
                const body =
                    m === "forward"
                        ? buildForwardBody(selectedMail, f)
                        : buildReplyBody(selectedMail, f);
                editorRef.current.innerHTML = body;
            });
        },
        [selectedMail]
    );

    const handleDiscard = useCallback(() => {
        setMode(null);
        setToChips([]);
        setCcChips([]);
        setSubject("");
        if (editorRef.current) editorRef.current.innerHTML = "";
    }, []);

    const handlePopOut = useCallback(() => {
        if (mode && onPopOut) {
            onPopOut(mode);
        }
        handleDiscard();
    }, [mode, onPopOut, handleDiscard]);

    const handleSend = useCallback(async () => {
        if (!selectedMail || !currAccount?.email) return;

        const toList = toChips.map((c) => c.email);
        const ccList = ccChips.map((c) => c.email);

        if (toList.length === 0) {
            toast.error("Please add at least one recipient");
            return;
        }

        // Block send if any recipient chip is invalid
        const hasInvalid = [...toChips, ...ccChips].some((c) => !c.isValid);
        if (hasInvalid) {
            toast.error("Please fix invalid email addresses before sending");
            return;
        }

        setSending(true);
        try {
            const html = editorRef.current?.innerHTML || "";
            const from = displayName ? `${displayName} <${currAccount.email}>` : currAccount.email;
            // Build threading fields for reply/reply-all
            const isReply = mode === "reply" || mode === "reply-all";
            const existingRefs = Array.isArray(selectedMail.references)
                ? selectedMail.references
                : selectedMail.references
                    ? [selectedMail.references]
                    : [];
            const replyRefs = [...existingRefs, selectedMail.uid].filter(Boolean);

            const payload: Record<string, any> = {
                from,
                to: toList,
                cc: ccList,
                bcc: [],
                subject: subject || "no subject",
                html,
                attachments: [],
                ...(isReply ? {
                    inReplyTo: selectedMail.uid,
                    references: replyRefs,
                    thread_id: selectedMail.thread_id,
                } : {}),
            };

            const res = await API.sendMailOG({
                payload,
                settings: {},
            });

            if (!res.data?.success) throw new Error(res.data?.message);

            // Store in sent
            const obj = {
                from: payload.from,
                to: payload.to,
                cc: payload.cc,
                bcc: [],
                subject: s.encryptAES(payload.subject),
                html: payload.html,
                attachments: false,
                trackers_detected: 0,
                flags: ["\\Unseen", "\\Recent"],
                folder: "sent",
                from_email: s.encryptAES(payload.from),
                has_attachments: false,
                id: Date.now(),
                is_forwarded: mode === "forward",
                is_important: false,
                is_pinned: false,
                is_read: true,
                is_replied: mode === "reply" || mode === "reply-all",
                is_starred: false,
                message_id: res.data.result.message_id,
                priority: "normal",
                receipient: currAccount?.email || "",
                receipients: payload.to.map((addr: string) => s.encryptAES(addr)),
                thread_id: res.data.result.thread_id,
                timestamp: new Date().toString(),
                plain_text: s.encryptAES(payload.html),
                uid: res.data.result.uid,
            };
            await airsendDB.addNestedItem("mails", res.data.result.message_id, obj as any);

            toast.success(mode === "forward" ? "Forwarded" : "Reply sent");
            handleDiscard();
        } catch (error: any) {
            if (error instanceof AxiosError && error.response?.data?.message === "Validation Error") {
                error.response.data.result?.forEach((msg: string) => toast.error(msg));
            } else {
                toast.error(error?.message || "Failed to send");
            }
        } finally {
            setSending(false);
        }
    }, [selectedMail, currAccount, toChips, ccChips, subject, mode, handleDiscard]);

    if (!selectedMail) return null;

    // ── Collapsed state: action buttons ──────────────────────────
    if (!mode) {
        return (
            <div className="px-4 py-4 flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-2 text-xs h-9 px-4"
                    onClick={() => activate("reply")}
                >
                    <Reply className="h-3.5 w-3.5" />
                    Reply
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-2 text-xs h-9 px-4"
                    onClick={() => activate("forward")}
                >
                    <Forward className="h-3.5 w-3.5" />
                    Forward
                </Button>
            </div>
        );
    }

    // ── Expanded state: inline compose ───────────────────────────
    return (
        <div className="mx-4 mb-4 border rounded-xl bg-background shadow-sm">
            {/* Header bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-xs font-medium text-muted-foreground capitalize">
                    {mode === "reply-all" ? "Reply all" : mode}
                </span>
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePopOut}>
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Pop out</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDiscard}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Discard</TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {/* Recipients */}
            <div className="px-3 py-2 space-y-1.5">
                <ChipInput label="To" chips={toChips} setChips={setToChips} />
                <ChipInput label="Cc" chips={ccChips} setChips={setCcChips} />
            </div>

            <Separator />

            {/* Editor area */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="px-4 py-3 min-h-[120px] max-h-[300px] overflow-y-auto text-sm focus:outline-none prose prose-sm max-w-none"
                data-placeholder="Write your reply..."
            />

            <Separator />

            {/* Footer */}
            <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-1">
                    {mode !== "forward" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1.5 h-7"
                            onClick={() => activate("forward")}
                        >
                            <Forward className="h-3 w-3" /> Switch to forward
                        </Button>
                    )}
                    {mode === "forward" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1.5 h-7"
                            onClick={() => activate("reply")}
                        >
                            <Reply className="h-3 w-3" /> Switch to reply
                        </Button>
                    )}
                </div>
                <Button
                    size="sm"
                    className="gap-2 h-8 px-4 rounded-lg"
                    onClick={handleSend}
                    disabled={sending}
                >
                    <Send className="h-3.5 w-3.5" />
                    {sending ? "Sending..." : "Send"}
                </Button>
            </div>
        </div>
    );
}
