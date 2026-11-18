"use client"

import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SettingToggleRow, SettingSelectRow, SettingsSection } from "../shared"
import type { EmailSettings as EmailSettingsType } from "@/lib/types/get-user-settings-response"
import { MessageSquare, ShieldAlert, Sparkles, Layers, Sliders, Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MessageTogglesProps {
    local: EmailSettingsType | undefined
    onChange: <K extends keyof EmailSettingsType>(key: K, value: EmailSettingsType[K]) => void
}

/**
 * Message behaviors: threading, link verification, auto-delete, monthly & threshold quotas.
 */
function MessageToggles({ local, onChange }: MessageTogglesProps) {
    return (
        <div className="space-y-6">
            <SettingsSection
                title="Message Handling & Threading"
                description="Manage conversation threading, drafts, and trash organization"
                icon={<Layers className="size-4" />}
            >
                <SettingToggleRow
                    label="Conversation grouping (threading)"
                    description="Group related emails with the same subject into unified threads"
                    tooltip="Group related messages into threaded conversations"
                    checked={local?.conversationGrouping ?? false}
                    onCheckedChange={(v) => onChange("conversationGrouping", v)}
                />
                <SettingToggleRow
                    label="Keep messages in Sent & Drafts"
                    description="Retain copies of outgoing messages and unfinished drafts"
                    tooltip="Retain a copy of sent and draft messages"
                    checked={local?.keepMessages ?? false}
                    onCheckedChange={(v) => onChange("keepMessages", v)}
                />
                <SettingToggleRow
                    label="Exclude Spam/Trash from 'All Mail'"
                    description="Hide filtered spam and trashed emails from general search"
                    tooltip="Hide spam and trash messages from the all-mail view"
                    checked={local?.excludeSpam ?? false}
                    onCheckedChange={(v) => onChange("excludeSpam", v)}
                />
                <SettingToggleRow
                    label="Sticky labels"
                    description="Keep custom labels attached even when messages are moved across folders"
                    tooltip="Keep applied labels even when messages are moved"
                    checked={local?.stickyLabels ?? false}
                    onCheckedChange={(v) => onChange("stickyLabels", v)}
                />
            </SettingsSection>

            <SettingsSection
                title="Safety & Intelligent Actions"
                description="Link safeguards and automated spam cleanup"
                icon={<ShieldAlert className="size-4" />}
            >
                <SettingToggleRow
                    label="Confirm external link URLs"
                    description="Show a protective warning before navigating to suspicious external URLs"
                    tooltip="Show a confirmation dialog before opening external links"
                    checked={local?.confirmLinks ?? false}
                    onCheckedChange={(v) => onChange("confirmLinks", v)}
                />
                <SettingToggleRow
                    label="Auto-delete unwanted messages"
                    description="Intelligently prune spam and unwanted automated emails"
                    tooltip="Automatically delete messages flagged as unwanted by AI"
                    checked={local?.autoDeleteUnwanted ?? false}
                    onCheckedChange={(v) => onChange("autoDeleteUnwanted", v)}
                    badge={
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                            <Sparkles className="size-2.5" />
                            AI Smart
                        </span>
                    }
                />
                <SettingSelectRow
                    label="Mailing list auto-unsubscribe"
                    description="Specify how unsubscribe headers are handled when viewing bulk emails"
                    tooltip="How to handle unsubscribe requests from mailing lists"
                    value="ask"
                    onValueChange={() => { }}
                    options={[
                        { value: "ask", label: "Ask each time" },
                        { value: "always", label: "Always unsubscribe" },
                        { value: "never", label: "Never prompt" },
                    ]}
                />
            </SettingsSection>

            <SettingsSection
                title="Sending Quotas & Rate Limits"
                description="Configure monthly and per-minute safety caps on outgoing messages"
                icon={<Sliders className="size-4" />}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="p-3.5 rounded-xl border border-border/70 bg-background/50 space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="monthly_limit" className="text-xs sm:text-sm font-medium">
                                Monthly Sending Limit
                            </Label>
                            <Badge variant="outline" className="text-[10px] font-mono">
                                Messages / mo
                            </Badge>
                        </div>
                        <Input
                            id="monthly_limit"
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={Number(local?.thresold_limit) || 300}
                            className="h-9 text-xs sm:text-sm bg-background/80"
                            value={local?.monthly_limit ?? 0}
                            onChange={(e) =>
                                onChange("monthly_limit", Number(e.target.value) || 0)
                            }
                        />
                        <p className="text-[11px] text-muted-foreground">
                            Max messages permitted in a 30-day billing period
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/70 bg-background/50 space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="thresold_limit" className="text-xs sm:text-sm font-medium">
                                Threshold Alert Cap
                            </Label>
                            <Badge variant="outline" className="text-[10px] font-mono">
                                Max 300
                            </Badge>
                        </div>
                        <Input
                            id="thresold_limit"
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={300}
                            className="h-9 text-xs sm:text-sm bg-background/80"
                            value={local?.thresold_limit ?? 0}
                            onChange={(e) =>
                                onChange("thresold_limit", Number(e.target.value) || 0)
                            }
                        />
                        <p className="text-[11px] text-muted-foreground">
                            Notification triggered when quota reaches this threshold
                        </p>
                    </div>
                </div>
            </SettingsSection>
        </div>
    )
}

export default memo(MessageToggles)
