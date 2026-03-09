"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { EmailProviderForm } from "./_components/email-provider-form"

export default function ProvidersPage() {
    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <h1 className="text-lg font-semibold">Multi-SMTP Providers</h1>
            </header>
            <ScrollArea className="flex-1">
                <div className="p-4 max-w-5xl">
                    <EmailProviderForm />
                </div>
            </ScrollArea>
        </div>
    )
}
