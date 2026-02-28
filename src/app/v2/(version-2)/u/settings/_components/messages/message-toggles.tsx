"use client"

import { memo } from "react"
import { Input } from "@/components/ui/input"
import { SettingToggleRow, SettingSelectRow, SettingsSection } from "../shared"
import type { EmailSettings as EmailSettingsType } from "@/lib/types/get-user-settings-response"

interface MessageTogglesProps {
    local: EmailSettingsType | undefined
    onChange: <K extends keyof EmailSettingsType>(key: K, value: EmailSettingsType[K]) => void
}

/**
 * Toggles for: keepMessages, excludeSpam, confirmLinks, conversationGrouping,
 * autoDeleteUnwanted, stickyLabels, auto-unsubscribe, limits.
 */
function MessageToggles({ local, onChange }: MessageTogglesProps) {
    return (
        <SettingsSection title="Messages">
            <SettingToggleRow
                label="Keep messages in Sent/Drafts"
                tooltip="Retain a copy of sent and draft messages"
                checked={local?.keepMessages ?? false}
                onCheckedChange={(v) => onChange("keepMessages", v)}
            />
            <SettingToggleRow
                label="Exclude Spam/Trash from All mail"
                tooltip="Hide spam and trash messages from the all-mail view"
                checked={local?.excludeSpam ?? false}
                onCheckedChange={(v) => onChange("excludeSpam", v)}
            />
            <SettingToggleRow
                label="Confirm link URLs"
                tooltip="Show a confirmation dialog before opening external links"
                checked={local?.confirmLinks ?? false}
                onCheckedChange={(v) => onChange("confirmLinks", v)}
            />
            <SettingToggleRow
                label="Conversation grouping"
                tooltip="Group related messages into threaded conversations"
                checked={local?.conversationGrouping ?? false}
                onCheckedChange={(v) => onChange("conversationGrouping", v)}
            />
            <SettingToggleRow
                label="Auto-delete unwanted messages"
                tooltip="Automatically delete messages flagged as unwanted by AI"
                checked={local?.autoDeleteUnwanted ?? false}
                onCheckedChange={(v) => onChange("autoDeleteUnwanted", v)}
                badge={
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded">
                        AI
                    </span>
                }
            />
            <SettingToggleRow
                label="Sticky labels"
                tooltip="Keep applied labels even when messages are moved"
                checked={local?.stickyLabels ?? false}
                onCheckedChange={(v) => onChange("stickyLabels", v)}
            />

            {/* Auto-unsubscribe */}
            <SettingSelectRow
                label="Auto-unsubscribe"
                tooltip="How to handle unsubscribe requests from mailing lists"
                value="ask"
                onValueChange={() => { }}
                options={[
                    { value: "ask", label: "Ask each time" },
                    { value: "always", label: "Always" },
                    { value: "never", label: "Never" },
                ]}
            />

            {/* Limits */}
            <div className="flex items-center justify-between gap-4 py-1">
                <span className="text-sm">Monthly Limit</span>
                <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={Number(local?.thresold_limit) || 300}
                    className="w-[100px]"
                    value={local?.monthly_limit ?? 0}
                    onChange={(e) =>
                        onChange("monthly_limit", Number(e.target.value) || 0)
                    }
                />
            </div>
            <div className="flex items-center justify-between gap-4 py-1">
                <span className="text-sm">Threshold Limit</span>
                <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={300}
                    className="w-[100px]"
                    value={local?.thresold_limit ?? 0}
                    onChange={(e) =>
                        onChange("thresold_limit", Number(e.target.value) || 0)
                    }
                />
            </div>
        </SettingsSection>
    )
}

export default memo(MessageToggles)
