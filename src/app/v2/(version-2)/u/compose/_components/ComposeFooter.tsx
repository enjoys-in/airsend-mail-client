import React, { useState, useEffect } from "react";
import { Pen, Eye, Clock, ChevronDown, Send, Loader2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { airsendDB } from "@/db";
import { useAppSelector } from "@/store/hooks";
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
import { useHtmlEditor } from "./plain-editor/htmlEditor";
import AiPromptButton from "./plain-editor/aiPromptButton";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useMultiTabStore } from "@/store/settings/multiTabSystem";
import { API } from "@/lib/api/handler";
import { Security } from "@/lib/security";
import { cn } from "@/lib/utils";

const s = new Security();

export interface EmailData {
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  html: string;
  attachments: any[];
  inReplyTo?: string;
  references?: string[];
  thread_id?: string;
}

export interface ComposeFooterProps {
  data: EmailData;
  onDiscardDraft?: () => Promise<void>;
  onSendCustom?: (payload: any) => Promise<void> | void;
  accountEmail?: string;
  className?: string;
}

export const ComposeFooter: React.FC<ComposeFooterProps> = ({
  data,
  onDiscardDraft,
  onSendCustom,
  accountEmail: explicitAccountEmail,
  className,
}) => {
  const { getHTML, setHTML, attachments } = useHtmlEditor();
  const reduxAccount = useAppSelector((state) => state.accounts.currAccount);
  const accountEmail = explicitAccountEmail || reduxAccount?.email || "";
  const { focusedTab, closeTab } = useMultiTabStore();

  const [signatures, setSignatures] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  const fetchSignatures = async () => {
    if (!accountEmail) return;
    try {
      const { success, value } = await airsendDB.getNestedItem(
        "settings",
        accountEmail,
        "settings.signatures"
      );
      if (success && value) setSignatures(value);
    } catch (e) {
      console.warn("fetchSignatures error:", e);
    }
  };

  const handleInsertSignature = (signature: string) => {
    const currentHTML = getHTML();
    setHTML(currentHTML + signature);
  };

  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    try {
      const newHTML = getHTML();

      const newObject = Object.assign(
        {},
        data,
        {
          html: newHTML,
          subject: data.subject === "" ? "no subject" : data.subject,
        },
        {
          attachments: (attachments || [])
            .filter((att) => att.uploaded)
            .map((att) => {
              const dir = att.id.replace(/^attachment-/, "");
              return `${dir}/${att.file.name}`;
            }),
        },
        data.inReplyTo ? { inReplyTo: data.inReplyTo } : {},
        data.references ? { references: data.references } : {},
        data.thread_id ? { thread_id: data.thread_id } : {}
      );

      if (newObject.to.concat(newObject.cc, newObject.bcc).length === 0) {
        const toInput = document.getElementById("to-input");
        if (toInput) {
          toInput.focus();
        }
        return toast.error("Please enter at least one recipient");
      }

      // Block send if any recipient is invalid
      const allChipEmails = [...data.to, ...data.cc, ...data.bcc];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const namedEmailRegex = /^.+<([^\s@]+@[^\s@]+\.[^\s@]+)>$/;
      const hasInvalid = allChipEmails.some(
        (e) => !emailRegex.test(e) && !namedEmailRegex.test(e)
      );
      if (hasInvalid) {
        return toast.error("Please fix invalid email addresses before sending");
      }

      // Custom onSend callback if provided by decoupled caller
      if (onSendCustom) {
        await onSendCustom(newObject);
        if (onDiscardDraft) await onDiscardDraft();
        toast.success("Email sent successfully");
        closeTab(focusedTab);
        return;
      }

      const res = await API.sendMailOG({
        payload: newObject,
        settings: {},
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to send email");
      }

      const obj = {
        from: newObject.from,
        to: newObject.to,
        cc: newObject.cc,
        bcc: newObject.bcc,
        subject: s.encryptAES(newObject.subject),
        html: newObject.html,
        attachments: newObject.attachments.length > 0,
        trackers_detected: 0,
        flags: ["\\Unseen", "\\Recent"],
        folder: "sent",
        from_email: s.encryptAES(newObject.from),
        has_attachments: false,
        id: Date.now(),
        is_forwarded: false,
        is_important: false,
        is_pinned: false,
        is_read: true,
        is_replied: false,
        is_starred: false,
        message_id: res.data.result.message_id,
        priority: "normal",
        receipient: accountEmail,
        receipients: newObject.to.map((addr: string) => s.encryptAES(addr)),
        thread_id: res.data.result.thread_id,
        timestamp: new Date().toString(),
        plain_text: s.encryptAES(newObject.html),
        uid: res.data.result.uid,
      };

      await airsendDB.addNestedItem("mails", res.data.result.message_id, obj as any);
      if (onDiscardDraft) await onDiscardDraft();
      toast.success("Email sent successfully");
      closeTab(focusedTab);
    } catch (error: any) {
      if (
        error instanceof AxiosError &&
        error.response?.data.message === "Validation Error"
      ) {
        error?.response?.data.result?.forEach((message: string) => {
          toast.error(message);
        });
        return;
      }
      toast.error(error.message || "An error occurred while sending");
    } finally {
      setSending(false);
    }
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to send email
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSend]);

  useEffect(() => {
    if (signatures.length === 0) fetchSignatures();
  }, [accountEmail]);

  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 mt-2 w-full rounded-xl border border-border/80 bg-card/70 px-3 py-2 flex items-center justify-between gap-2 shrink-0 shadow-xs backdrop-blur-md transition-all select-none",
        className
      )}
    >
      {/* LEFT: AI Button */}
      <div className="flex items-center gap-2">
        <AiPromptButton />
      </div>

      {/* RIGHT: Signature & Send Split Button */}
      <div className="flex items-center gap-2">
        {/* Signature popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Insert Signature"
              className="h-8.5 w-8.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              <Pen size={15} />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="end"
            className="w-64 p-2.5 rounded-xl shadow-lg border border-border bg-popover"
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <h4 className="text-xs font-semibold text-foreground">Signatures</h4>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {signatures?.length ?? 0}
              </span>
            </div>

            {signatures?.length > 0 ? (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {signatures.map((signature, index) => (
                  <div
                    key={index}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleInsertSignature(signature.line)}
                    className="px-2.5 py-2 rounded-lg border border-border/60 hover:bg-muted/70 hover:border-border cursor-pointer text-xs transition-colors"
                  >
                    <p className="font-medium text-foreground truncate">{signature.name}</p>
                    {signature.preview && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {signature.preview}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">
                No signatures found
              </p>
            )}
          </PopoverContent>
        </Popover>

        {/* Send Split Button */}
        <DropdownMenu>
          <div className="inline-flex shrink-0 items-center overflow-hidden rounded-xl shadow-xs border border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSend}
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 rounded-none text-xs sm:text-sm font-semibold h-8.5 px-3.5 bg-transparent text-primary-foreground hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/15 disabled:opacity-60 transition-colors"
            >
              {sending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              <span>{sending ? "Sending..." : "Send Now"}</span>
            </Button>

            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                aria-label="More send options"
                disabled={sending}
                className="inline-flex items-center justify-center rounded-none h-8.5 px-2 border-l border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/15 transition-colors"
              >
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
          </div>

          <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border-border">
            <DropdownMenuItem
              className="flex items-center gap-2 text-xs py-2 cursor-pointer"
              onClick={() => toast.info("Email preview available in full-screen view")}
            >
              <Eye size={14} className="text-muted-foreground" />
              <span>Preview Email</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 text-xs py-2 cursor-pointer"
              onClick={() => toast.info("Schedule send coming soon")}
            >
              <Clock size={14} className="text-muted-foreground" />
              <span>Schedule Send...</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ComposeFooter;
