"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Check, Copy, ThumbsUp, ThumbsDown, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { type OtpInfo, OTP_DISCOVERED_EVENT, otpCache } from "@/lib/mail/otp-detector";

interface OtpCardProps {
  otp: OtpInfo;
  className?: string;
  onDismiss?: () => void;
}

/**
 * Gmail-style verification code banner card
 * Renders the prominent "Code Requested" banner with individual digit boxes,
 * "Copy code" button, and feedback controls.
 */
export function OtpCard({ otp, className, onDismiss }: OtpCardProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(otp.code);
      setCopied(true);
      toast.success(`Verification code copied: ${otp.code}`);
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      toast.error("Failed to copy code to clipboard");
    }
  }, [otp.code]);

  const handleFeedback = useCallback(
    (type: "up" | "down") => {
      setFeedback(type);
      if (type === "up") {
        toast.success("Thanks for your feedback!");
      } else {
        toast.info("Feedback noted. Hiding card...");
        setTimeout(() => {
          setDismissed(true);
          onDismiss?.();
        }, 800);
      }
    },
    [onDismiss]
  );

  if (dismissed) return null;

  return (
    <div className={cn("w-full transition-all duration-200 select-none", className)}>
      {/* Main Card Container */}
      <div className="rounded-2xl bg-[#edf2fa] dark:bg-[#1a2130] p-5 sm:p-6 border border-[#d3e3fd]/70 dark:border-slate-800 shadow-xs">
        {/* Header Label */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            {otp.title || "Code Requested"}
            {otp.service && (
              <span className="ml-1.5 font-normal text-muted-foreground/80">
                &middot; {otp.service}
              </span>
            )}
          </span>
          {otp.expiresIn && (
            <span className="text-[11px] text-muted-foreground/80 font-normal">
              {otp.expiresIn}
            </span>
          )}
        </div>

        {/* Code Digits Display: individual boxes */}
        <div className="flex items-center gap-2 sm:gap-2.5 my-3 flex-wrap">
          {otp.digits.map((digit, index) => (
            <div
              key={index}
              onClick={handleCopy}
              title="Click to copy code"
              className={cn(
                "w-10 h-12 sm:w-11 sm:h-14",
                "bg-white dark:bg-zinc-800",
                "border border-slate-200/90 dark:border-zinc-700/80",
                "rounded-lg sm:rounded-xl shadow-xs",
                "flex items-center justify-center",
                "font-mono font-bold text-xl sm:text-2xl text-slate-800 dark:text-zinc-100",
                "cursor-pointer transition-all duration-150",
                "hover:border-blue-400 dark:hover:border-sky-500 hover:shadow-sm hover:-translate-y-0.5",
                "active:scale-95"
              )}
            >
              {digit}
            </div>
          ))}
        </div>

        {/* Action Button: Copy Code */}
        <div className="mt-4 flex items-center gap-3">
          <Button
            type="button"
            onClick={handleCopy}
            className={cn(
              "rounded-full px-5 sm:px-6 py-2 h-9 sm:h-10 text-sm font-medium shadow-xs transition-all",
              "bg-[#0b57d0] hover:bg-[#0842a0] dark:bg-sky-600 dark:hover:bg-sky-500 text-white",
              "flex items-center gap-2 cursor-pointer active:scale-95"
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white stroke-[2.5]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 opacity-80" />
                <span>Copy code</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Sub-footer: Based on this email / Correct? Feedback */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 px-1">
        <span>Based on this email</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] sm:text-xs text-muted-foreground/80">Correct?</span>
          <button
            type="button"
            onClick={() => handleFeedback("up")}
            aria-label="Code is correct"
            className={cn(
              "p-1 rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
              feedback === "up" && "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
            )}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleFeedback("down")}
            aria-label="Code is incorrect"
            className={cn(
              "p-1 rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
              feedback === "down" && "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40"
            )}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact OTP chip for the inbox / mail list row
 */
export function OtpChip({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast.success(`Verification code copied: ${code}`);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy code"
      className={cn(
        "inline-flex h-5 flex-shrink-0 items-center gap-1 rounded border border-blue-200 dark:border-blue-900/60",
        "bg-blue-50/80 dark:bg-blue-950/40 px-1.5 text-[11px] font-mono font-medium text-blue-700 dark:text-blue-300",
        "hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer",
        className
      )}
    >
      <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
      <span>{code}</span>
      {copied ? (
        <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Copy className="w-2.5 h-2.5 opacity-60 hover:opacity-100" />
      )}
    </button>
  );
}

export default OtpCard;
