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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ArrowLeft, ChevronDown, X, Mail, Copy, ExternalLink } from "lucide-react";
import { useState, useCallback, type KeyboardEvent, useEffect, useRef } from "react";
import { HtmlEditor } from "./plain-editor/htmlEditor";

import ComposeFooter from "./ComposeFooter";
import { useAppSelector } from "@/store/hooks";
import { airsendDB } from "@/db";
import { useDraftAutoSave } from "@/lib/event-bridge/useDraftAutoSave";

interface EmailChip {
  id: string;
  email: string;
  isValid: boolean;
}

/** Parse "Name <email>" format — returns { name, address } or just { address } for plain emails */
function parseEmailChip(raw: string): { name: string | null; address: string } {
  const match = raw.match(/^(.+?)\s*<([^\s@]+@[^\s@]+\.[^\s@]+)>$/);
  if (match) {
    return { name: match[1].trim(), address: match[2] };
  }
  return { name: null, address: raw };
}

/** Get display label for a chip */
function getChipDisplay(raw: string): string {
  const { name } = parseEmailChip(raw);
  return name || raw;
}

/** Get the first character for avatar */
function getChipInitial(raw: string): string {
  const { name, address } = parseEmailChip(raw);
  return (name || address).charAt(0).toUpperCase();
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
  return (
    <div className="w-full h-full flex flex-col bg-background text-foreground transition-colors">
      {showHeader && (
        <div className="flex items-center justify-between p-2 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-lg font-medium">
              New Email
            </h1>
          </div>
        </div>
      )}

      <div className={`${showHeader ? "container" : "px-2"} shrink-0`}>
        {/* Header */}

        {/* Email Details */}
        <div
          className="py-4 space-y-3 border-b border-border"
        >
          {/* From Field */}
          <div className="flex items-center gap-4 w-full">
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
              From
            </span>
            {
              accounts.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto px-0 pb-1 pt-0 justify-start gap-3 w-full border-0 border-b border-gray-300 dark:border-gray-700 
             rounded-none shadow-none focus-visible:ring-0 focus-visible:outline-none hover:bg-transparent"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <span
                          className="flex items-center gap-2 pl-1 pr-2 py-0.5 rounded-full border border-gray-300 dark:border-gray-700 
       bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-medium truncate max-w-full"
                        >
                          {/* Avatar inside pill, no separate border so it aligns */}
                          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 text-white text-[10px]">
                            {selectedAccount.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Name + email */}
                          <span className="truncate">
                            {selectedAccount.name}{" "}
                            <span className="text-gray-600 dark:text-gray-400 truncate">
                              {`<${selectedAccount.email}>`}
                            </span>
                          </span>
                        </span>
                      </div>

                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="start"
                    className="dark:bg-neutral-900 bg-neutral-100 border-none text-slate-900 dark:text-gray-200 w-64"
                  >
                    {accounts.map((account) => (
                      <DropdownMenuItem
                        key={account.email}
                        onClick={() => setSelectedAccount(account)}
                        className="flex items-center gap-2 dark:hover:bg-neutral-800 hover:bg-neutral-200 cursor-pointer"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-sm">
                            {account.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">
                            {account.name}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {account.email}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : <div className="flex items-center flex-1 min-w-0">
                <span
                  className="flex items-center gap-2 pl-1 pr-2 py-0.5 rounded-full border border-gray-300 dark:border-gray-700 
       bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-medium truncate max-w-full"
                >
                  {/* Avatar inside pill, no separate border so it aligns */}
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700 text-white text-[10px]">
                    {selectedAccount.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name + email */}
                  <span className="truncate">
                    {selectedAccount.name}{" "}
                    <span className="text-gray-600 dark:text-gray-400 truncate">
                      {`<${selectedAccount.email}>`}
                    </span>
                  </span>
                </span>
              </div>
            }

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCc(!showCc)}
                className={`text-xs text-gray-500 dark:text-gray-400 h-6 px-2 ${showCc ? "bg-gray-100 dark:bg-gray-800" : ""
                  }`}
              >
                Cc
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBcc(!showBcc)}
                className={`text-xs text-gray-500 dark:text-gray-400 h-6 px-2 ${showBcc ? "bg-gray-100 dark:bg-gray-800" : ""
                  }`}
              >
                Bcc
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12 mt-1.5">
              To
            </span>
            <div className="flex-1">
              <div
                className="flex flex-wrap gap-2 p-2 border-0 border-b border-gray-300 dark:border-gray-700 
      min-h-[36px] focus-within:ring-0 focus-within:border-purple-500"
              >
                {toChips.map((chip) => (
                  <Popover key={chip.id}>
                    <PopoverTrigger asChild>
                      <div
                        className={`flex items-center text-xs font-medium overflow-hidden border cursor-pointer
          ${chip.isValid
                            ? "bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200"
                            : "bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200"
                          } rounded-full`}
                      >
                        {/* Avatar pill */}
                        <div className="flex items-center">
                          <span
                            className={`w-5 h-5 flex items-center justify-center rounded-full text-white text-[10px]
              ${chip.isValid
                                ? "bg-purple-500 dark:bg-purple-700"
                                : "bg-red-500 dark:bg-red-700"
                              }`}
                          >
                            {getChipInitial(chip.email)}
                          </span>
                        </div>

                        {/* Display name or email */}
                        <span className="px-2 truncate text-xs">{getChipDisplay(chip.email)}</span>

                        {/* Remove button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeChip(chip.id, "to"); }}
                          className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 mr-1"
                          aria-label={`Remove ${chip.email}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" side="bottom" align="start">
                      <div className="flex flex-col items-center gap-2">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-pink-500 text-white text-lg">
                            {getChipInitial(chip.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          {parseEmailChip(chip.email).name && (
                            <p className="font-semibold text-sm">{parseEmailChip(chip.email).name}</p>
                          )}
                          <p className="text-xs text-muted-foreground">{parseEmailChip(chip.email).address}</p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}

                {/* Input */}
                <input
                  type="email"
                  id="to-input"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "to")}
                  onBlur={(e) => handleBlur(e.target.value, "to")}
                  placeholder={
                    toChips.length === 0 ? "Enter recipients..." : ""
                  }
                  className="flex-1 min-w-[120px] outline-none bg-transparent text-xs text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {showCc && (
            <div className="flex items-start gap-4">
              <span className="text-xs text-gray-600 dark:text-gray-400 w-12 mt-2">
                Cc
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 p-2 border-0 border-b border-gray-300 dark:border-gray-700 min-h-[36px] focus-within:ring-0 focus-within:border-purple-500">
                  {ccChips.map((chip) => (
                    <Popover key={chip.id}>
                      <PopoverTrigger asChild>
                        <div
                          className={`flex items-center text-xs font-medium overflow-hidden border cursor-pointer
              ${chip.isValid
                              ? "bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200"
                              : "bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200"
                            } rounded-full`}
                        >
                          <div className="flex items-center">
                            <span
                              className={`w-5 h-5 flex items-center justify-center rounded-full text-white text-[10px]
                  ${chip.isValid
                                  ? "bg-purple-500 dark:bg-purple-700"
                                  : "bg-red-500 dark:bg-red-700"
                                }`}
                            >
                              {getChipInitial(chip.email)}
                            </span>
                          </div>
                          <span className="px-2 truncate text-xs">{getChipDisplay(chip.email)}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeChip(chip.id, "cc"); }}
                            className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 mr-1"
                            aria-label={`Remove ${chip.email}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3" side="bottom" align="start">
                        <div className="flex flex-col items-center gap-2">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-pink-500 text-white text-lg">
                              {getChipInitial(chip.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-center">
                            {parseEmailChip(chip.email).name && (
                              <p className="font-semibold text-sm">{parseEmailChip(chip.email).name}</p>
                            )}
                            <p className="text-xs text-muted-foreground">{parseEmailChip(chip.email).address}</p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))}
                  <input
                    value={ccInput}
                    onChange={(e) => setCcInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "cc")}
                    onBlur={(e) => handleBlur(e.target.value, "cc")}
                    placeholder={
                      ccChips.length === 0 ? "Enter Cc recipients..." : ""
                    }
                    className="flex-1 min-w-[120px] outline-none bg-transparent text-xs text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          {showBcc && (
            <div className="flex items-start gap-4">
              {/* Label */}
              <span className="text-xs text-gray-600 dark:text-gray-400 w-12 mt-2">
                Bcc
              </span>

              <div className="flex-1">
                <div className="flex flex-wrap gap-2 p-2 border-0 border-b border-gray-300 dark:border-gray-700 min-h-[36px] focus-within:ring-0 focus-within:border-purple-500">
                  {bccChips.map((chip) => (
                    <Popover key={chip.id}>
                      <PopoverTrigger asChild>
                        <div
                          className={`flex items-center text-xs font-medium overflow-hidden border cursor-pointer
              ${chip.isValid
                              ? "bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200"
                              : "bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200"
                            } rounded-full`}
                        >
                          <div className="flex items-center">
                            <span
                              className={`w-5 h-5 flex items-center justify-center rounded-full text-white text-[10px]
                  ${chip.isValid
                                  ? "bg-purple-500 dark:bg-purple-700"
                                  : "bg-red-500 dark:bg-red-700"
                                }`}
                            >
                              {getChipInitial(chip.email)}
                            </span>
                          </div>
                          <span className="px-2 truncate text-xs">{getChipDisplay(chip.email)}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeChip(chip.id, "bcc"); }}
                            className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 mr-1"
                            aria-label={`Remove ${chip.email}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3" side="bottom" align="start">
                        <div className="flex flex-col items-center gap-2">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-pink-500 text-white text-lg">
                              {getChipInitial(chip.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-center">
                            {parseEmailChip(chip.email).name && (
                              <p className="font-semibold text-sm">{parseEmailChip(chip.email).name}</p>
                            )}
                            <p className="text-xs text-muted-foreground">{parseEmailChip(chip.email).address}</p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))}

                  {/* Input field */}
                  <input
                    value={bccInput}
                    onChange={(e) => setBccInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "bcc")}
                    onBlur={(e) => handleBlur(e.target.value, "bcc")}
                    placeholder={
                      bccChips.length === 0 ? "Enter Bcc recipients..." : ""
                    }
                    className="flex-1 min-w-[120px] outline-none bg-transparent text-xs text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400 w-12 shrink-0">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject..."
              className="flex-1 border-0 border-b border-gray-300 dark:border-gray-700
               bg-transparent text-sm text-gray-900 dark:text-gray-100
               focus:border-b-purple-500 focus:outline-none
               p-1 h-8"
            />
          </div>
        </div>

      </div>
      <div className="flex-1 min-h-0 flex flex-col">
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
