"use client"

import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Separator } from "@/components/ui/separator"
import { FormSwitchField } from "./setting-row"
import { FormInputField } from "./form-input-field"
import type { AccountSettings } from "@/lib/types/account-settings.interface"

export function SecuritySection() {
    const { watch } = useFormContext<AccountSettings>()
    const expirationEnabled = watch("security.password_expiration.enabled")

    return (
        <Card>
            <CardHeader>
                <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormSwitchField name="security.password_confirmation" label="Password Confirmation" description="Require password for sensitive actions" />
                <FormSwitchField name="security.change_on_first_login" label="Change on First Login" description="Force password change on first login" />
                <Separator />
                <FormSwitchField name="security.password_expiration.enabled" label="Password Expiration" description="Enable password expiration policy" />
                {expirationEnabled && (
                    <div className="ml-1 border-l border-border/70 pl-4">
                        <FormInputField
                            name="security.password_expiration.days"
                            label="Expiration Days"
                            type="number"
                            className="max-w-[150px]"
                            transformValue={(v) => parseInt(v) || 0}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
