"use client"

import * as React from "react"
import { Copy, Check, KeyRound, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Pill, Section } from "./kit"

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

/** The parts of the generated address, each with a quiet tint and a tooltip. */
function Part({ children, tip, className }: { children: React.ReactNode; tip: string; className: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className={cn("cursor-help rounded px-1.5 py-0.5", className)}>{children}</span>
            </TooltipTrigger>
            <TooltipContent className="text-xs">{tip}</TooltipContent>
        </Tooltip>
    )
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
            <Section
                className={className}
                title="Mailbox address"
                description="Created for them when they accept the invitation."
                actions={
                    <Button type="button" variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
                        {copied ? (
                            <>
                                <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-3.5 w-3.5" /> Copy
                            </>
                        )}
                    </Button>
                }
            >
                <div className="space-y-4">
                    <div className="flex flex-col items-stretch justify-between gap-2 rounded-lg border border-border/70 bg-muted/30 p-3 sm:flex-row sm:items-center">
                        <div className="break-all font-mono text-sm">{fullPreviewEmail}</div>
                        <Pill className="shrink-0 self-start capitalize sm:self-auto">Role: {role}</Pill>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
                        <Part tip="Marks an external member" className="bg-violet-500/10 text-violet-700 dark:text-violet-400">ext</Part>
                        <span className="text-muted-foreground">.</span>
                        <Part tip="Organization slug" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">{safeOrgSlug}</Part>
                        <span className="text-muted-foreground">.</span>
                        <Part tip="Unique account id, assigned when the mailbox is created" className="bg-amber-500/10 text-amber-700 dark:text-amber-400">[id]</Part>
                        <span className="text-muted-foreground">.</span>
                        <Part tip="Start of the original external email" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">{localPart}</Part>
                        <span className="text-muted-foreground">@</span>
                        <Part tip="Verified organization domain" className="bg-sky-500/10 text-sky-700 dark:text-sky-400">{safeDomain}</Part>
                    </div>

                    <div className="grid grid-cols-1 gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground sm:grid-cols-2">
                        <div className="flex items-start gap-2">
                            <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>
                                The invitation is sent to{" "}
                                <span className="text-foreground">{externalEmail || "the external email address"}</span>.
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>They can sign in with either their external email or the new address.</span>
                        </div>
                    </div>
                </div>
            </Section>
        </TooltipProvider>
    )
})
