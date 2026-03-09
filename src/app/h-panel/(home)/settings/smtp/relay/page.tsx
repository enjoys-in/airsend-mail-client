"use client"

import React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RelayForm } from "./_components/RelayForm"
import RelayTable from "./_components/RelayTable"

export type RelayConfig = {
    id: string
    name: string
    host: string
    port: string
    username: string
    password: string
    secure: boolean
    auth_method: "plain" | "login" | "cram-md5"
    allowed_domains: string[]
    max_connections: number
    rate_limit: number
    enabled: boolean
    created_at: string
}

const MOCK_RELAYS: RelayConfig[] = [
    {
        id: "1",
        name: "Primary Relay",
        host: "relay.airsend.dev",
        port: "587",
        username: "relay-user",
        password: "••••••••",
        secure: false,
        auth_method: "plain",
        allowed_domains: ["example.com", "mycompany.io"],
        max_connections: 10,
        rate_limit: 100,
        enabled: true,
        created_at: "2025-12-01T10:00:00Z",
    },
]

export default function RelayPage() {
    const [relays, setRelays] = React.useState<RelayConfig[]>(MOCK_RELAYS)
    const [editingRelay, setEditingRelay] = React.useState<RelayConfig | null>(null)

    const handleSave = (relay: RelayConfig) => {
        if (editingRelay) {
            setRelays(relays.map((r) => (r.id === relay.id ? relay : r)))
        } else {
            setRelays([...relays, { ...relay, id: crypto.randomUUID(), created_at: new Date().toISOString() }])
        }
        setEditingRelay(null)
    }

    const handleDelete = (id: string) => {
        setRelays(relays.filter((r) => r.id !== id))
        if (editingRelay?.id === id) setEditingRelay(null)
    }

    const handleToggle = (id: string) => {
        setRelays(relays.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <h1 className="text-lg font-semibold">SMTP Relay Configuration</h1>
            </header>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4 max-w-5xl">
                    <RelayTable
                        relays={relays}
                        onEdit={setEditingRelay}
                        onDelete={handleDelete}
                        onToggle={handleToggle}
                    />
                    <RelayForm
                        editingRelay={editingRelay}
                        onSave={handleSave}
                        onCancel={() => setEditingRelay(null)}
                    />
                </div>
            </ScrollArea>
        </div>
    )
}