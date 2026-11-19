"use client"

import * as React from "react"
import moment from "moment"
import { Activity, Clock, KeyRound, Plus, Trash2 } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { EmptyState, PageHeader, PageShell, Pill, Section, Stat, StatGrid } from "@/components/h-panel/kit"
import { APIKeyForm } from "./APIKeyForm"
import ServerButton from "./server-button"
import { KeyCell } from "./key-cell"

export interface ApiKeyRow {
    id: number
    name: string
    api_key: string
    key_hash?: string
    created_at?: string
    createdAt?: string
    used_times: number
    updated_at: string
    domain: { id: string }
}

const when = (value?: string) => (value ? moment(value) : null)

/** The "create key" side sheet; the same trigger is used in the header and in the empty state. */
function CreateKeySheet({ children }: { children: React.ReactNode }) {
    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="overflow-y-auto sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5" />
                        Generate API credentials
                        <Pill tone="amber">Beta</Pill>
                    </SheetTitle>
                    <SheetDescription>Create a new API key and secret for your application.</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                    <APIKeyForm />
                </div>
            </SheetContent>
        </Sheet>
    )
}

export function ApiKeysView({ keys }: { keys: ApiKeyRow[] }) {
    const totalRequests = keys.reduce((sum, k) => sum + (Number(k.used_times) || 0), 0)
    const lastUsed =
        keys
            .map((k) => when(k.updated_at))
            .filter((m): m is moment.Moment => m !== null)
            .sort((a, b) => b.valueOf() - a.valueOf())[0] ?? null

    const createButton = (
        <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create key
        </Button>
    )

    return (
        <PageShell>
            <PageHeader
                title="API keys"
                description="Credentials for sending mail through the API. Each key is tied to a domain and its linked mailboxes."
                actions={<CreateKeySheet>{createButton}</CreateKeySheet>}
            />

            <div className="space-y-5">
                <StatGrid className="lg:grid-cols-3">
                    <Stat label="Keys" value={keys.length} icon={KeyRound} />
                    <Stat label="Total requests" value={totalRequests.toLocaleString()} icon={Activity} />
                    <Stat
                        label="Last used"
                        value={<span suppressHydrationWarning>{lastUsed ? lastUsed.fromNow() : "Never"}</span>}
                        icon={Clock}
                    />
                </StatGrid>

                <Section flush title="Credentials" description="The secret is masked here; only its hash can be copied.">
                    {keys.length === 0 ? (
                        <EmptyState
                            icon={KeyRound}
                            title="No API keys yet"
                            description="Create a key to send mail from your own application."
                            action={<CreateKeySheet>{createButton}</CreateKeySheet>}
                        />
                    ) : (
                        <div className="max-h-[560px] overflow-auto">
                            <Table>
                                <TableHeader className="sticky top-0 z-10 bg-card">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-5">Name</TableHead>
                                        <TableHead>API key</TableHead>
                                        <TableHead>Secret</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Requests</TableHead>
                                        <TableHead>Last used</TableHead>
                                        <TableHead className="w-12 pr-5 text-right">
                                            <span className="sr-only">Actions</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {keys.map((item) => {
                                        const created = when(item.created_at ?? item.createdAt)
                                        const used = when(item.updated_at)
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="pl-5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                            <KeyRound className="h-4 w-4" />
                                                        </span>
                                                        <span className="text-sm font-medium">{item.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <KeyCell value={item.api_key} reveal />
                                                </TableCell>
                                                <TableCell>
                                                    <KeyCell value="" copyValue={item.key_hash ?? ""} />
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground" title={created?.format("YYYY-MM-DD hh:mm:ss A")}>
                                                    <span suppressHydrationWarning>{created ? created.format("YYYY-MM-DD") : "-"}</span>
                                                </TableCell>
                                                <TableCell className="text-right text-sm tabular-nums text-muted-foreground">{item.used_times}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground" title={used?.format("YYYY-MM-DD hh:mm:ss A")}>
                                                    <span suppressHydrationWarning>{used ? used.fromNow() : "-"}</span>
                                                </TableCell>
                                                <TableCell className="pr-5 text-right">
                                                    <ServerButton key_id={String(item.id)} name={item.name} domain_id={item.domain.id}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </ServerButton>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Section>
            </div>
        </PageShell>
    )
}
