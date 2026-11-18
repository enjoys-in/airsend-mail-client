"use client"

import { ChevronRight, Filter, ShieldBan, Code2, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddFilterDialog } from "./addFilterDialog"
import { SieveFilterDialog } from "./sieveFilterDialog"
import { useSettingsStore } from "@/store/settings"
import { SettingsPageHeader, SettingsSection } from "../shared"
import { Badge } from "@/components/ui/badge"

export default function EmailFilters({ email }: { email: string }) {
  const setActiveItem = useSettingsStore((s) => s.setActiveItem)

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-150">
      <SettingsPageHeader
        title="Filters"
        description="Create automated email triage rules, conditional routing, and advanced Sieve scripts."
        icon={<Filter className="size-5" />}
        badge={<Badge variant="outline" className="text-xs font-normal">Rules Engine</Badge>}
      />

      <div className="space-y-6">
        {/* Custom Filters Section */}
        <SettingsSection
          title="Automated Rule Filters"
          description="Automatically label, archive, star, or route incoming messages matching defined conditions"
          icon={<Sparkles className="size-4" />}
          action={
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 rounded-xl text-xs sm:text-sm gap-1.5">
                    <Plus className="size-3.5" />
                    Add Filter
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                  onPointerDownOutside={(e) => e.preventDefault()}
                  onInteractOutside={(e) => e.preventDefault()}
                >
                  <DialogHeader>
                    <DialogTitle>Add Custom Email Filter</DialogTitle>
                    <DialogDescription>
                      Define IF conditions and THEN actions to automatically process incoming emails.
                    </DialogDescription>
                  </DialogHeader>
                  <AddFilterDialog />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs sm:text-sm gap-1.5">
                    <Code2 className="size-3.5" />
                    Sieve Script
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                  onPointerDownOutside={(e) => e.preventDefault()}
                  onInteractOutside={(e) => e.preventDefault()}
                >
                  <DialogHeader>
                    <DialogTitle>Add Custom Sieve Script</DialogTitle>
                    <DialogDescription>
                      Write an RFC 5228 Sieve script for fine-grained server-side email filtering.
                    </DialogDescription>
                  </DialogHeader>
                  <SieveFilterDialog />
                </DialogContent>
              </Dialog>
            </div>
          }
        >
          <div className="py-4 text-center sm:text-left space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Filters execute in real-time as messages land on the mail server. You can create rules using the visual builder or raw Sieve syntax.
            </p>
          </div>
        </SettingsSection>

        {/* Spam, Block & Allow Lists */}
        <SettingsSection
          title="Spam, Block & Allow Lists"
          description="Take control over sender reputations and domain delivery policies"
          icon={<ShieldBan className="size-4" />}
        >
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-border/70 bg-background/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Spam List</span>
                  <Badge variant="secondary" className="text-[10px]">Filter</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Prevents junk mail and promotional noise from filling your inbox
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border/70 bg-background/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Block List</span>
                  <Badge variant="destructive" className="text-[10px]">Reject</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Stops phishing, fraudulent, or unwanted domains before delivery
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border/70 bg-background/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Allow List</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Trusted</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Ensures mission-critical messages never end up in spam
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveItem("email-config")}
                className="h-9 rounded-xl text-xs sm:text-sm gap-1.5 font-normal"
              >
                <span>Manage sender & domain lists in Email Config</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}
