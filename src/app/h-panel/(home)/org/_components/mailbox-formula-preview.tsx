"use client"

import * as React from "react"
import {
    Sparkles,
    CheckCircle2,
    Copy,
    Check,
    ArrowRight,
    KeyRound,
    Mail,
    Info,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface MailboxFormulaPreviewProps {
    orgSlug?: string
    externalEmail?: string
    targetDomain?: string
    role?: string
    className?: string
}

function cleanLocalPart(email: string): string {
    const raw = (email || "").split("@")[0] || "user"
    const cleaned = raw.toLowerCase().trim().replace(/[^a-z0-9.-]/g, "").replace(/^\.+|\.+$/g, "")
    return cleaned.slice(0, 32) || "user"
}

export const MailboxFormulaPreview = React.memo(function MailboxFormulaPreview({
    orgSlug = "org",
    externalEmail = "",
    targetDomain = "yourdomain.com",
    role = "member",
    className,
}: MailboxFormulaPreviewProps) {
    const [copied, setCopied] = React.useState(false)

    const safeOrgSlug = orgSlug || "org"
    const safeDomain = targetDomain || "yourdomain.com"
    const localPart = externalEmail.includes("@") ? cleanLocalPart(externalEmail) : "user"
    const fullPreviewEmail = `ext.${safeOrgSlug}.[id].${localPart}@${safeDomain}`

    const handleCopy = () => {
        navigator.clipboard.writeText(fullPreviewEmail)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <TooltipProvider>
            <div
                className={cn(
                    "rounded-xl border border-primary/20 bg-linear-to-b from-primary/5 via-card to-card p-4 sm:p-5 space-y-4 shadow-xs",
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                Generated Mailbox Format
                                <Badge variant="secondary" className="text-[10px] uppercase font-mono px-1.5 py-0">
                                    Auto-Provisioned
                                </Badge>
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                                Provisioned in Stalwart under target domain when invitation is accepted.
                            </div>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" /> Copy
                            </>
                        )}
                    </Button>
                </div>

                {/* Live Computed Email Address */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-background/80 rounded-lg border border-border/70">
                    <div className="font-mono text-xs sm:text-sm font-semibold text-foreground tracking-tight break-all">
                        {fullPreviewEmail}
                    </div>
                    <Badge
                        variant="outline"
                        className="text-[10px] font-mono capitalize self-start sm:self-auto shrink-0 border-primary/30 text-primary"
                    >
                        Role: {role}
                    </Badge>
                </div>

                {/* Pill Breakdown Formula */}
                <div className="space-y-1.5">
                    <div className="text-[11px] font-medium text-muted-foreground">Formula Anatomy:</div>
                    <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold border border-violet-500/20">
                            ext
                        </span>
                        <span className="text-muted-foreground">.</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20 cursor-help">
                                    {safeOrgSlug}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                                Organization slug identifier
                            </TooltipContent>
                        </Tooltip>
                        <span className="text-muted-foreground">.</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20 cursor-help">
                                    [id]
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                                Unique account ID assigned in database
                            </TooltipContent>
                        </Tooltip>
                        <span className="text-muted-foreground">.</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 cursor-help">
                                    {localPart}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                                Prefix from original external email
                            </TooltipContent>
                        </Tooltip>
                        <span className="text-muted-foreground">@</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold border border-sky-500/20 cursor-help">
                                    {safeDomain}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                                Verified organization domain
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Dual Login & Invitation Flow Note */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                    <div className="flex items-start gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>
                            Invite email dispatched to{" "}
                            <strong className="text-foreground">
                                {externalEmail || "external email address"}
                            </strong>
                        </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                            <strong>Dual Login:</strong> user can sign in using either their external email or new enterprise address.
                        </span>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
})
