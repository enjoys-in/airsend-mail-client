"use client"

import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FormSwitchField } from "./setting-row"
import { FormInputField } from "./form-input-field"
import type { AccountSettings } from "@/lib/types/account-settings.interface"

export function AdvancedSection() {
    const { watch, setValue } = useFormContext<AccountSettings>()
    const autoSyncEnabled = watch("auto_sync.enabled")
    const calenderEnabled = watch("calender_config.enable_calender")
    const lastSyncedAt = watch("last_synced_at")
    const syncError = watch("sync_error")
    const personalization = watch("personalization")

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Auto Sync</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormSwitchField name="auto_sync.enabled" label="Enable Auto Sync" description="Automatically sync mailbox" />
                    {autoSyncEnabled && (
                        <div className="ml-4">
                            <FormInputField
                                name="auto_sync.interval"
                                label="Sync Interval (seconds)"
                                type="number"
                                className="max-w-[150px]"
                                transformValue={(v) => parseInt(v) || 0}
                            />
                        </div>
                    )}
                    {lastSyncedAt && (
                        <p className="text-xs text-muted-foreground">Last synced: {new Date(lastSyncedAt).toLocaleString()}</p>
                    )}
                    {syncError && (
                        <p className="text-xs text-destructive">Sync error: {syncError}</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Calendar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormSwitchField name="calender_config.enable_calender" label="Enable Calendar" description="Enable calendar integration" />
                    {calenderEnabled && (
                        <div className="ml-4 space-y-4">
                            <FormInputField
                                name="calender_config.calender_sync_interval"
                                label="Sync Interval (seconds)"
                                type="number"
                                className="max-w-[150px]"
                                transformValue={(v) => parseInt(v) || 0}
                            />
                            <FormSwitchField name="calender_config.notifications" label="Notifications" description="Enable calendar notifications" />
                            <FormSwitchField name="calender_config.sharing" label="Sharing" description="Allow calendar sharing" />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">User Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInputField name="user.first_name" label="First Name" transformValue={(v) => v || null} />
                        <FormInputField name="user.last_name" label="Last Name" transformValue={(v) => v || null} />
                    </div>
                    <FormInputField name="user.display_name" label="Display Name" transformValue={(v) => v || null} />
                    <FormSwitchField name="user.use_display_name" label="Use Display Name" description="Use display name instead of email address" />
                    <FormInputField name="user.timezone" label="Timezone" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Personalization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Theme</Label>
                        <Select value={personalization.theme}
                            onValueChange={(v) => setValue("personalization.theme", v as "dark" | "light", { shouldDirty: true })}>
                            <SelectTrigger className="max-w-[200px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="light">Light</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Layout</Label>
                        <Select value={personalization.layout}
                            onValueChange={(v) => setValue("personalization.layout", v as "grid" | "list" | "2-column", { shouldDirty: true })}>
                            <SelectTrigger className="max-w-[200px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="list">List</SelectItem>
                                <SelectItem value="grid">Grid</SelectItem>
                                <SelectItem value="2-column">2 Column</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
