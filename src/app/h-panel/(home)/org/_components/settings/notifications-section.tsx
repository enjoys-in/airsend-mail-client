"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { FormSwitchField } from "./setting-row"

export function NotificationsSection() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormSwitchField name="notifications.new_email" label="New Email" description="Notify on new incoming emails" />
                <FormSwitchField name="notifications.delivery_failed" label="Delivery Failed" description="Notify when email delivery fails" />
                <FormSwitchField name="notifications.delivery_success" label="Delivery Success" description="Notify on successful delivery" />
                <FormSwitchField name="notifications.undelivered_email" label="Undelivered Email" description="Notify for undelivered emails" />
                <FormSwitchField name="notifications.push_notification" label="Push Notifications" description="Enable browser push notifications" />
            </CardContent>
        </Card>
    )
}
