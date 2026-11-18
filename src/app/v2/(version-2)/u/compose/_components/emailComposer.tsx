"use client";

import React, { useState, useCallback, type KeyboardEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import { HtmlEditor } from "./plain-editor/htmlEditor";
import ComposeFooter from "./ComposeFooter";
import RecipientChips, { avatarColor } from "./RecipientChips";
import { useAppSelector } from "@/store/hooks";
import { airsendDB } from "@/db";
import { useDraftAutoSave } from "@/lib/event-bridge/useDraftAutoSave";
import { useSettingsStore } from "@/store/settings";
import { cn } from "@/lib/utils";

interface EmailChip {
  id: string;
  email: string;
  isValid: boolean;
}

export interface ComposeInitialData {
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  body?: string;
  inReplyTo?: string;
  references?: string[];
  thread_id?: string;
}

export interface EmailComposerProps {
  showHeader?: boolean;
  tabId?: number;
  initialData?: ComposeInitialData;
  className?: string;
  account?: { email: string; name: string };
  accountsList?: Array<{ email: string; name: string }>;
  onSend?: (payload: any) => Promise<void> | void;
  onDiscard?: () => Promise<void> | void;
  onClose?: () => void;
  defaultFont?: string;
  defaultFontSize?: string;
  footer?: React.ReactNode;
}

export function EmailComposer({
  showHeader,
  tabId,
  initialData,
  className,
  account: explicitAccount,
  accountsList: explicitAccountsList,
  onSend,
  onDiscard,
  onClose,
  defaultFont: explicitDefaultFont,
  defaultFontSize: explicitDefaultFontSize,
  footer,
}: EmailComposerProps) {
  // Redux account fallback
  const reduxAccounts = useAppSelector((state) => state.accounts);
  const accounts = explicitAccountsList ?? reduxAccounts.accounts;
  const initialCurrAccount = explicitAccount ?? reduxAccounts.currAccount;

  // Settings font preferences
  const settingsComposing = useSettingsStore((s) => s.settings?.composing);
  const resolvedFont = explicitDefaultFont || settingsComposing?.default_font || "Inter";
  const resolvedFontSize = explicitDefaultFontSize || (settingsComposing?.default_font_size ? `${settingsComposing.default_font_size}px` : "14px");

  // ─── Draft Auto-Save ───
  const {
    update: updateDraft,
    discard: discardDraft,
  } = useDraftAutoSave({
    initialData: {
      from: explicitAccount?.email || initialCurrAccount?.email,
      to: initialData?.to,
      cc: initialData?.cc,
      bcc: initialData?.bcc,
      subject: initialData?.subject,
      html: initialData?.body,
    },
  });

  const [selectedAccount, setSelectedAccount] = useState({
    email: initialCurrAccount?.email || "",
    name: initialCurrAccount?.name || "",
  });

  // Keep selectedAccount in sync if initialCurrAccount changes
  useEffect(() => {
    if (initialCurrAccount?.email && !selectedAccount.email) {
      setSelectedAccount({
        email: initialCurrAccount.email,
        name: initialCurrAccount.name || "",
      });
    }
  }, [initialCurrAccount, selectedAccount.email]);

  const makeChips = (emails: string[] | undefined): EmailChip[] =>
    (emails || []).map((e, i) => ({
      id: `init-${Date.now()}-${i}-${Math.random()}`,
      email: e,
      isValid: validateEmail(e),
    }));

  const [toChips, setToChips] = useState<EmailChip[]>(() => makeChips(initialData?.to));
  const [ccChips, setCcChips] = useState<EmailChip[]>(() => makeChips(initialData?.cc));
  const [bccChips, setBccChips] = useState<EmailChip[]>(() => makeChips(initialData?.bcc));

  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");

  const [subject, setSubject] = useState(initialData?.subject || "");
  const [body, setBody] = useState(initialData?.body || "");

  const [showCc, setShowCc] = useState((initialData?.cc?.length ?? 0) > 0);
  const [showBcc, setShowBcc] = useState((initialData?.bcc?.length ?? 0) > 0);
  const [attachments, setAttachments] = useState<any[]>([]);

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const namedEmailRegex = /^.+<([^\s@]+@[^\s@]+\.[^\s@]+)>$/;
    return emailRegex.test(email) || namedEmailRegex.test(email);
  }

  const addChip = useCallback((email: string, type: "to" | "cc" | "bcc") => {
    if (!email.trim()) return;

    const newChip: EmailChip = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      email: email.trim(),
      isValid: validateEmail(email.trim()),
    };

    switch (type) {
      case "to":
        setToChips((prev) => [...prev, newChip]);
        setToInput("");
        break;
      case "cc":
        setCcChips((prev) => [...prev, newChip]);
        setCcInput("");
        break;
      case "bcc":
        setBccChips((prev) => [...prev, newChip]);
        setBccInput("");
        break;
    }
  }, []);

  const removeChip = useCallback((chipId: string, type: "to" | "cc" | "bcc") => {
    switch (type) {
      case "to":
        setToChips((prev) => prev.filter((chip) => chip.id !== chipId));
        break;
      case "cc":
        setCcChips((prev) => prev.filter((chip) => chip.id !== chipId));
        break;
      case "bcc":
        setBccChips((prev) => prev.filter((chip) => chip.id !== chipId));
        break;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, type: "to" | "cc" | "bcc") => {
      const input = e.currentTarget.value;

      if (e.key === "Enter" || e.key === " " || e.key === ",") {
        e.preventDefault();
        if (input.trim()) {
          addChip(input, type);
        }
      } else if (e.key === "Backspace" && !input) {
        switch (type) {
          case "to":
            if (toChips.length > 0) setToChips((prev) => prev.slice(0, -1));
            break;
          case "cc":
            if (ccChips.length > 0) setCcChips((prev) => prev.slice(0, -1));
            break;
          case "bcc":
            if (bccChips.length > 0) setBccChips((prev) => prev.slice(0, -1));
            break;
        }
      }
    },
    [toChips.length, ccChips.length, bccChips.length, addChip]
  );

  const handleBlur = useCallback(
    (input: string, type: "to" | "cc" | "bcc") => {
      if (input.trim()) {
        addChip(input, type);
      }
    },
    [addChip]
  );

  useEffect(() => {
    if (!selectedAccount?.email) return;
    airsendDB
      .getMultiNestedItem("settings", selectedAccount.email, ["settings.user.display_name"])
      .then((res) => {
        if (res.value?.settings) {
          setSelectedAccount((prev) => ({
            email: prev.email,
            name:
              (res.value?.settings as any)?.user?.display_name ||
              prev.name ||
              "",
          }));
        }
      })
      .catch((e) => console.warn("Could not fetch user display name:", e));
  }, [selectedAccount?.email]);

  // ─── Push field changes to draft auto-save ───
  const draftUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (draftUpdateTimer.current) clearTimeout(draftUpdateTimer.current);
    draftUpdateTimer.current = setTimeout(() => {
      updateDraft({
        from: selectedAccount?.email,
        to: toChips.map((c) => c.email),
        cc: ccChips.map((c) => c.email),
        bcc: bccChips.map((c) => c.email),
        subject,
        html: body,
      });
    }, 400);
    return () => {
      if (draftUpdateTimer.current) clearTimeout(draftUpdateTimer.current);
    };
  }, [toChips, ccChips, bccChips, subject, body, selectedAccount?.email, updateDraft]);

  const fromInitial = (selectedAccount.name || selectedAccount.email || "U").charAt(0).toUpperCase();

  const fromPill = (
    <span className="flex min-w-0 items-center gap-2 rounded-full border border-border/80 bg-muted/50 py-0.5 pl-0.5 pr-2.5 text-xs font-medium transition-colors hover:bg-muted/80 shadow-xs">
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white shadow-xs",
          avatarColor(selectedAccount.email || "default")
        )}
      >
        {fromInitial}
      </span>
      <span className="truncate max-w-[200px] text-foreground font-medium">
        {selectedAccount.name || selectedAccount.email}
      </span>
      {selectedAccount.name && selectedAccount.email && (
        <span className="truncate text-muted-foreground/75 text-[11px] hidden sm:inline">
          {`<${selectedAccount.email}>`}
        </span>
      )}
    </span>
  );

  const toggleClass = (active: boolean) =>
    cn(
      "h-6 rounded-md px-2 text-xs font-medium transition-all duration-150",
      active
        ? "bg-primary/15 text-primary border border-primary/25 font-semibold"
        : "text-muted-foreground/80 hover:text-foreground hover:bg-muted/60"
    );

  const handleDiscardDraft = async () => {
    await discardDraft();
    if (onDiscard) await onDiscard();
  };

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col bg-background text-foreground transition-colors overflow-hidden",
        className
      )}
    >
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/70 shrink-0 bg-card/60 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-sm font-semibold tracking-tight text-foreground">
              New Message
            </h1>
          </div>
        </div>
      )}

      {/* Recipient and Subject Fields */}
      <div className="shrink-0 px-2 pt-2">
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card/40 shadow-xs">
          {/* From Field */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 border-b border-border/50">
            <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground/80 select-none tracking-tight">
              From
            </span>

            {accounts.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto min-w-0 flex-1 justify-start gap-1.5 rounded-full p-0 shadow-none hover:bg-transparent focus-visible:ring-0"
                  >
                    {fromPill}
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-72 p-1.5 rounded-xl shadow-lg border-border">
                  {accounts.map((account) => (
                    <DropdownMenuItem
                      key={account.email}
                      onClick={() => setSelectedAccount(account)}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 text-xs"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-semibold text-white",
                            avatarColor(account.email)
                          )}
                        >
                          {(account.name || account.email || "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-xs font-medium text-foreground">
                          {account.name || account.email}
                        </span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {account.email}
                        </span>
                      </div>
                      {account.email === selectedAccount.email && (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex min-w-0 flex-1 items-center">{fromPill}</div>
            )}

            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCc(!showCc)}
                className={toggleClass(showCc)}
              >
                Cc
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowBcc(!showBcc)}
                className={toggleClass(showBcc)}
              >
                Bcc
              </Button>
            </div>
          </div>

          {/* To Field */}
          <RecipientChips
            label="To"
            type="to"
            inputId="to-input"
            placeholder="Add recipients"
            chips={toChips}
            inputValue={toInput}
            setInputValue={setToInput}
            removeChip={removeChip}
            handleKeyDown={handleKeyDown}
            handleBlur={handleBlur}
          />

          {/* Cc Field */}
          {showCc && (
            <RecipientChips
              label="Cc"
              type="cc"
              placeholder="Add Cc recipients"
              chips={ccChips}
              inputValue={ccInput}
              setInputValue={setCcInput}
              removeChip={removeChip}
              handleKeyDown={handleKeyDown}
              handleBlur={handleBlur}
            />
          )}

          {/* Bcc Field */}
          {showBcc && (
            <RecipientChips
              label="Bcc"
              type="bcc"
              placeholder="Add Bcc recipients"
              chips={bccChips}
              inputValue={bccInput}
              setInputValue={setBccInput}
              removeChip={removeChip}
              handleKeyDown={handleKeyDown}
              handleBlur={handleBlur}
            />
          )}

          {/* Subject Field */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 transition-colors focus-within:bg-muted/20">
            <label
              htmlFor="subject-input"
              className="w-12 shrink-0 text-xs font-medium text-muted-foreground/80 select-none tracking-tight"
            >
              Subject
            </label>
            <input
              id="subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What is this email about?"
              className="h-7 flex-1 min-w-0 bg-transparent text-xs sm:text-sm font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground/60 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Rich Text Editor Body */}
      <div className="flex-1 min-h-0 flex flex-col px-2 pb-2 pt-2">
        <HtmlEditor
          fontFamily={resolvedFont}
          fontSize={resolvedFontSize}
          accountEmail={selectedAccount.email}
          attachments={attachments}
          setAttachments={setAttachments}
          onChange={(html) => setBody(html)}
          tabId={tabId}
          footerElement={
            footer ?? (
              <ComposeFooter
                accountEmail={selectedAccount.email}
                onDiscardDraft={handleDiscardDraft}
                onSendCustom={onSend}
                data={{
                  from: `${selectedAccount?.name} <${selectedAccount.email}>`,
                  to: toChips.map((chip) => chip.email),
                  cc: ccChips.map((chip) => chip.email),
                  bcc: bccChips.map((chip) => chip.email),
                  subject,
                  html: body,
                  attachments,
                  ...(initialData?.inReplyTo ? { inReplyTo: initialData.inReplyTo } : {}),
                  ...(initialData?.references ? { references: initialData.references } : {}),
                  ...(initialData?.thread_id ? { thread_id: initialData.thread_id } : {}),
                }}
              />
            )
          }
          defaultValue={initialData?.body || ""}
        />
      </div>
    </div>
  );
}

export default EmailComposer;
