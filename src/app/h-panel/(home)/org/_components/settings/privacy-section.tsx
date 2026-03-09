"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormSwitchField } from "./setting-row"

export function PrivacySection() {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Email Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormSwitchField name="email_privacy.autoShowImages" label="Auto Show Images" description="Automatically display images in emails" />
                    <FormSwitchField name="email_privacy.block_email_tracking" label="Block Email Tracking" description="Block tracking pixels and read receipts" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Display Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormSwitchField name="display.showMeetings" label="Show Meetings" description="Display meeting invites in sidebar" />
                    <FormSwitchField name="display.showRightSidebar" label="Show Right Sidebar" description="Show the right sidebar panel" />
                    <FormSwitchField name="display.showCalendar" label="Show Calendar" description="Display calendar in sidebar" />
                    <FormSwitchField name="display.showQuota" label="Show Quota" description="Display storage quota info" />
                </CardContent>
            </Card>
        </div>
    )
}
