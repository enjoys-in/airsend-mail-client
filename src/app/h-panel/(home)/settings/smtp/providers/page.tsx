"use client"

import { PageHeader } from "@/components/h-panel/kit"
import { EmailProviderForm } from "./_components/email-provider-form"

export default function ProvidersPage() {
    return (
        <div>
            <PageHeader
                title="SMTP providers"
                description="Turn providers on, set their credentials and drag them into send-priority order."
            />
            <EmailProviderForm />
        </div>
    )
}
