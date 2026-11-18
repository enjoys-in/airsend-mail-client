"use client"

import React, { lazy } from 'react'
import { useSettingsStore } from '@/store/settings'
import { CustomEventKey, useCustomEvent } from '@/hooks/use-custom-event'
import { airsendDB } from '@/db'
import { syncUserSettings } from '@/lib/api/sync-user-settings'
import { useAppSelector } from '@/store/hooks'
import { MobileSettingsNav } from './mobile-settings-nav'
import { Skeleton } from '@/components/ui/skeleton'
import { Settings2 } from 'lucide-react'

// Module-level lazy map – created once, never re-created on re-render
const componentMap: Record<string, React.LazyExoticComponent<React.ComponentType<{ email: string }>>> = {
    "account-and-password": lazy(() => import("./profileSettings")),
    "signatures": lazy(() => import("./signatures/display-signature")),
    "notifications": lazy(() => import("./notificationsSettings")),
    "appearance": lazy(() => import("./mailAppearance")),
    "calendar": lazy(() => import("./calendarSettings")),
    "identity-and-addresses": lazy(() => import("./identitySection")),
    "import-via-easy-switch": lazy(() => import("./importViaEasySwitch")),
    "messages-and-composing": lazy(() => import("./emailSettings")),
    "email-forwarding": lazy(() => import("./emailForwarding")),
    "folders-and-labels": lazy(() => import("./folderLabels")),
    "encryption-and-keys": lazy(() => import("./encryptionSettings")),
    "email-privacy": lazy(() => import("./configuration/emailPrivacy")),
    "imap-smtp": lazy(() => import("./configuration/imapSmtp")),
    "filters": lazy(() => import("./filters/emailFilter")),
    "email-config": lazy(() => import("./configuration/emailConfig")),
}

export const DisplayTabComponent = () => {
    const activeItem = useSettingsStore((s) => s.activeItem)
    const setSettings = useSettingsStore((s) => s.setSettings)
    const settings = useSettingsStore((s) => s.settings)
    const keys = useSettingsStore((s) => s.keys)
    const currAccount = useAppSelector((state) => state.accounts.currAccount)

    const { listen } = useCustomEvent(CustomEventKey.SyncSettings)

    const TabComponent = componentMap[activeItem]
    const updateSettingsToStore = React.useCallback(
        async () => {
            if (!currAccount?.email) return
            const { success, value } = await airsendDB.getNestedItem("settings", currAccount?.email as string, "settings")
            if (success && value) {
                setSettings(value)
            }
        },
        [currAccount?.email, setSettings],
    )

    const fetchUser = async () => {
        const result = await syncUserSettings(currAccount?.domain_name)
        if (result) {
            setSettings(result)
        }
    }

    React.useEffect(() => {
        if (!settings) {
            updateSettingsToStore()
        }
    }, [currAccount?.email, settings, updateSettingsToStore])

    React.useEffect(() => {
        const unsubscribe = listen(fetchUser)
        return unsubscribe
    }, [listen])

    return (
        <div className="w-full">
            {/* Mobile / Tablet Tab Switcher */}
            <MobileSettingsNav />

            {/* Active Settings Tab View */}
            <React.Suspense fallback={<SettingsSkeleton title={keys[activeItem] || activeItem} />}>
                {TabComponent ? (
                    <TabComponent email={currAccount?.email ?? ""} />
                ) : (
                    <SettingsSkeleton title={keys[activeItem] || activeItem} />
                )}
            </React.Suspense>
        </div>
    )
}

function SettingsSkeleton({ title }: { title: string }) {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
            {/* Header skeleton */}
            <div className="sticky top-0 md:top-12 md:group-has-[[data-collapsible=icon]]/sidebar-wrapper:top-11 z-30 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 pt-3 pb-4 sm:pt-4 sm:pb-5 border-b border-border/50 space-y-2 -mx-1 px-1 sm:-mx-2 sm:px-2">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-muted/70 flex items-center justify-center animate-pulse">
                        <Settings2 className="size-4 text-muted-foreground/60" />
                    </div>
                    <Skeleton className="h-8 w-48 sm:w-64 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-72 sm:w-96 rounded-md ml-11" />
            </div>

            {/* Section card 1 */}
            <div className="rounded-2xl border border-border/60 bg-card/60 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <Skeleton className="h-5 w-36 rounded-md" />
                    <Skeleton className="h-4 w-12 rounded-md" />
                </div>
                <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between py-2">
                        <div className="space-y-1.5 flex-1 max-w-md">
                            <Skeleton className="h-4 w-40 rounded" />
                            <Skeleton className="h-3 w-60 rounded" />
                        </div>
                        <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div className="space-y-1.5 flex-1 max-w-md">
                            <Skeleton className="h-4 w-36 rounded" />
                            <Skeleton className="h-3 w-52 rounded" />
                        </div>
                        <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Section card 2 */}
            <div className="rounded-2xl border border-border/60 bg-card/60 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <Skeleton className="h-5 w-44 rounded-md" />
                </div>
                <div className="space-y-3 pt-1">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}
