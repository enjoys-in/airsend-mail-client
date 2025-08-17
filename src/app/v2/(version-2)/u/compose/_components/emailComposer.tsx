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

import { ArrowLeft, ChevronDown, X } from "lucide-react";
import { useState, useCallback, type KeyboardEvent } from "react";
import { HtmlEditor } from "./plain-editor/htmlEditor";

import ComposeFooter from "./ComposeFooter";
import { useAppSelector } from "@/store/hooks";

interface EmailChip {
  id: string;
  email: string;
  isValid: boolean;
}



export function EmailComposer({ showHeader }: { showHeader?: boolean }) {
  const { currAccount, accounts } = useAppSelector((state) => state.accounts);

  const [selectedAccount, setSelectedAccount] = useState({
    email: currAccount?.email || "",
    name: currAccount?.name || "",
  });

  const [toChips, setToChips] = useState<EmailChip[]>([]);
  const [ccChips, setCcChips] = useState<EmailChip[]>([]);
  const [bccChips, setBccChips] = useState<EmailChip[]>([]);

  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

  return (
    <div className="w-full bg-white dark:bg-neutral-900 transition-colors">
      {showHeader && (
        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              New Email
            </h1>
          </div>
        </div>
      )}

      <div className={`${showHeader ? "container" : "px-2"}`}>
        {/* Header */}

        {/* Email Details */}
        <div
          className={`py-6 space-y-4 border-b border-gray-200 dark:border-gray-700`}
        >
          {/* From Field */}
          <div className="flex items-center gap-4 w-full">
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
              From
            </span>
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
                  <div
                    key={chip.id}
                    className={`flex items-center text-xs font-medium overflow-hidden border 
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
                        {chip.email.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Email text */}
                    <span className="px-2 truncate text-xs">{chip.email}</span>

                    {/* Remove button */}
                    <button
                      onClick={() => removeChip(chip.id, "to")}
                      className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 mr-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Input */}
                <input
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
                    <div
                      key={chip.id}
                      className={`flex items-center text-xs font-medium overflow-hidden border 
              ${chip.isValid
                          ? "bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200"
                          : "bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200"
                        } rounded-full`}
                    >
                      {/* Avatar pill start */}
                      <div className="flex items-center">
                        <span
                          className={`w-5 h-5 flex items-center justify-center rounded-full text-white text-[10px]
                  ${chip.isValid
                              ? "bg-purple-500 dark:bg-purple-700"
                              : "bg-red-500 dark:bg-red-700"
                            }`}
                        >
                          {chip.email.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Email text */}
                      <span className="px-2 truncate text-xs">
                        {chip.email}
                      </span>

                      {/* Remove button */}
                      <button
                        onClick={() => removeChip(chip.id, "cc")}
                        className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 mr-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
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
                    <div
                      key={chip.id}
                      className={`flex items-center text-xs font-medium overflow-hidden border 
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
                          {chip.email.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Email text */}
                      <span className="px-2 truncate text-xs">
                        {chip.email}
                      </span>

                      {/* Remove button */}
                      <button
                        onClick={() => removeChip(chip.id, "bcc")}
                        className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 mr-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
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

        <div className=""></div>
      </div>
      <HtmlEditor
        onChange={(html) => setBody(html)}
        footerElement={<ComposeFooter data={{
          from: selectedAccount.email,
          to: toChips.map((chip) => chip.email),
          cc: ccChips.map((chip) => chip.email),
          bcc: bccChips.map((chip) => chip.email),
          subject,
          html: body,
          attachments: [],
        }} />}
        defaultValue={``}
      />
    </div>
  );
}

export default EmailComposer;
