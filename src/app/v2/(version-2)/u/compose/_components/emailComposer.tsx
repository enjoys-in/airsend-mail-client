"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import { useState, useCallback, type KeyboardEvent, useEffect, useRef } from "react";
import { HtmlEditor } from "./plain-editor/htmlEditor";

import ComposeFooter from "./ComposeFooter";
import RecipientChips from "./RecipientChips";
import { useAppSelector } from "@/store/hooks";
import { airsendDB } from "@/db";
import { useDraftAutoSave } from "@/lib/event-bridge/useDraftAutoSave";

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

export function EmailComposer({ showHeader, tabId, initialData }: { showHeader?: boolean; tabId?: number; initialData?: ComposeInitialData }) {
  const { currAccount, accounts } = useAppSelector((state) => state.accounts);

  // ─── Draft Auto-Save ───
  const { update: updateDraft, flush: flushDraft, discard: discardDraft, status: draftStatus } = useDraftAutoSave({
    initialData: {
      to: initialData?.to,
      cc: initialData?.cc,
      bcc: initialData?.bcc,
      subject: initialData?.subject,
      html: initialData?.body,
    },
  });

  const [selectedAccount, setSelectedAccount] = useState({
    email: currAccount?.email || "",
    name: currAccount?.name || "",
  });

  const makeChips = (emails: string[] | undefined): EmailChip[] =>
    (emails || []).map((e, i) => ({ id: `init-${Date.now()}-${i}`, email: e, isValid: validateEmail(e) }));

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
    // Support "Name <email>" format
    const namedEmailRegex = /^.+<([^\s@]+@[^\s@]+\.[^\s@]+)>$/;
    return emailRegex.test(email) || namedEmailRegex.test(email);
  }

  const addChip = useCallback((email: string, type: "to" | "cc" | "bcc") => {
    if (!email.trim()) return;

    const newChip: EmailChip = {
      id: `${type}-${Date.now()}-${Math.random()}`,
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

  const removeChip = useCallback(
    (chipId: string, type: "to" | "cc" | "bcc") => {
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
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, type: "to" | "cc" | "bcc") => {
      const input = e.currentTarget.value;

      if (e.key === "Enter" || e.key === " " || e.key === ",") {
        e.preventDefault();
        if (input.trim()) {
          addChip(input, type);
        }
      } else if (e.key === "Backspace" && !input) {
        // Remove last chip when backspacing on empty input
        switch (type) {
          case "to":
            if (toChips.length > 0) {
              setToChips((prev) => prev.slice(0, -1));
            }
            break;
          case "cc":
            if (ccChips.length > 0) {
              setCcChips((prev) => prev.slice(0, -1));
            }
            break;
          case "bcc":
            if (bccChips.length > 0) {
              setBccChips((prev) => prev.slice(0, -1));
            }
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
    airsendDB.getMultiNestedItem("settings", selectedAccount?.email as string,
      ["settings.user.display_name"]).then(res => {
        if (res.value?.settings) {

          setSelectedAccount({
            email: selectedAccount.email,
            name: (res.value?.settings as any)?.user?.display_name || selectedAccount?.name || ""
          })
        }
      })
  }, [selectedAccount?.email]);

  // ─── Push field changes to draft auto-save ───
  const draftUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Debounce slightly to avoid excessive calls during rapid typing
    if (draftUpdateTimer.current) clearTimeout(draftUpdateTimer.current);
    draftUpdateTimer.current = setTimeout(() => {
      updateDraft({
        to: toChips.map((c) => c.email),
        cc: ccChips.map((c) => c.email),
        bcc: bccChips.map((c) => c.email),
        subject,
        html: body,
      });
    }, 500);
    return () => {
      if (draftUpdateTimer.current) clearTimeout(draftUpdateTimer.current);
    };
  }, [toChips, ccChips, bccChips, subject, body, updateDraft]);

  const fromPill = (
    <span className="flex min-w-0 items-center gap-2 rounded-full border border-border bg-muted/60 py-0.5 pl-0.5 pr-3 text-xs font-medium">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[10px] font-semibold text-white">
        {(selectedAccount.name || selectedAccount.email).charAt(0).toUpperCase()}
      </span>
      <span className="truncate">
        {selectedAccount.name}{" "}
        <span className="text-muted-foreground">{`<${selectedAccount.email}>`}</span>
      </span>
    </span>
  );

  const toggleClass = (active: boolean) =>
    `h-6 rounded-md px-2 text-xs font-medium ${
      active
        ? "bg-violet-100 text-violet-700 hover:bg-violet-100 dark:bg-violet-500/20 dark:text-violet-200 dark:hover:bg-violet-500/20"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground transition-colors">
      {showHeader && (
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-base font-semibold tracking-tight">
              New Email
            </h1>
          </div>
        </div>
      )}

      <div className={`${showHeader ? "container" : ""} shrink-0 px-2 pt-2`}>
        {/* Email Details */}
        <div className="overflow-hidden rounded-xl border border-border bg-card/40 shadow-sm">
          {/* From Field */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-border/60">
            <span className="w-14 shrink-0 text-xs font-medium text-muted-foreground select-none">
              From
            </span>

            {accounts.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto min-w-0 flex-1 justify-start gap-2 rounded-full p-0 shadow-none hover:bg-transparent focus-visible:ring-0"
                  >
                    {fromPill}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-72">
                  {accounts.map((account) => (
                    <DropdownMenuItem
                      key={account.email}
                      onClick={() => setSelectedAccount(account)}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">
                          {account.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium">
                          {account.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {account.email}
                        </span>
                      </div>
                      {account.email === selectedAccount.email && (
                        <Check className="h-4 w-4 shrink-0 text-violet-500" />
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

          {/* Subject */}
          <div className="flex items-center gap-3 px-4 py-1.5 transition-colors focus-within:bg-muted/30">
            <label
              htmlFor="subject-input"
              className="w-14 shrink-0 text-xs font-medium text-muted-foreground select-none"
            >
              Subject
            </label>
            <input
              id="subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What is this email about?"
              className="h-8 flex-1 min-w-0 bg-transparent text-sm font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground/70 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-2 pb-2 pt-2">
        <HtmlEditor
          attachments={attachments}
          setAttachments={setAttachments}
          onChange={(html) => setBody(html)}
          tabId={tabId}
          footerElement={<ComposeFooter
            onDiscardDraft={discardDraft}
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
          />}
          defaultValue={initialData?.body || ``}
        />
      </div>
    </div>
  );
}

export default EmailComposer;
