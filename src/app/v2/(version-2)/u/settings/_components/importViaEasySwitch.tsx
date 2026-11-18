"use client"

import { Import, Mail, ArrowRight, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SettingsPageHeader, SettingsSection } from "./shared"

export default function ImportViaEasySwitch({ email }: { email: string }) {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-150">
      <SettingsPageHeader
        title="Import via Easy Switch"
        description="Seamlessly migrate emails, folders, contacts, and calendar entries from your existing providers."
        icon={<Import className="size-5" />}
        badge={<Badge variant="secondary" className="text-xs font-normal">Migration Tool</Badge>}
      />

      <div className="space-y-6">
        {/* Continuous Sync / Auto-Forwarding Section */}
        <SettingsSection
          title="Live Account Forwarding"
          description="Forward incoming mail from external accounts directly to your Airsend inbox"
          icon={<Mail className="size-4" />}
        >
          <div className="py-2 space-y-3">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Keep receiving emails from legacy mailboxes while migrating your workflow to Airsend.
            </p>
            <Button
              variant="outline"
              disabled
              className="w-full sm:w-auto h-9 text-xs sm:text-sm rounded-xl gap-2 font-normal"
            >
              <span className="size-4 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs">
                G
              </span>
              <span>Connect Google auto-forwarding</span>
              <Badge variant="outline" className="text-[10px] ml-1">Coming Soon</Badge>
            </Button>
          </div>
        </SettingsSection>

        {/* One Time Import Section */}
        <SettingsSection
          title="One-Time Mailbox Import"
          description="Import your complete email archives, folder structures, and contacts securely into Airsend"
          icon={<ShieldCheck className="size-4" />}
          badge={<Badge variant="outline" className="text-[10px]">Encrypted Transfer</Badge>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Google */}
            <div className="p-4 rounded-xl border border-border/70 bg-background/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-base">
                  G
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground">Google Workspace</h4>
                  <p className="text-[11px] text-muted-foreground">Gmail, Drive, Contacts</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">Soon</Badge>
            </div>

            {/* Microsoft 365 / Outlook */}
            <div className="p-4 rounded-xl border border-border/70 bg-background/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-base">
                  O
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground">Microsoft 365</h4>
                  <p className="text-[11px] text-muted-foreground">Outlook & Exchange</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">Soon</Badge>
            </div>

            {/* Yahoo */}
            <div className="p-4 rounded-xl border border-border/70 bg-background/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-base">
                  Y
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground">Yahoo Mail</h4>
                  <p className="text-[11px] text-muted-foreground">Mail & address book</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">Soon</Badge>
            </div>

            {/* Custom IMAP */}
            <div className="p-4 rounded-xl border border-border/70 bg-background/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                  @
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground">Standard IMAP</h4>
                  <p className="text-[11px] text-muted-foreground">Any generic IMAP/Mbox</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">Soon</Badge>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}
