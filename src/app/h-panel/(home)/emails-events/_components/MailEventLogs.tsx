"use client"

import React from 'react'
import Link from 'next/link'
import moment from 'moment'
import { Mail, Search } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { EmptyState, PageHeader, PageShell, Pill, Section, type Tone } from '@/components/h-panel/kit'
import { ClearLogsButton } from './ClearLogsButton'

interface MailEvents {
    id: string;
    status: string;
    type: string;
    from: string;
    to: string;
    message: string;
    timestamp: string;
}

/** Event status -> pill tone. Delivery is green, trouble is red, in-flight is amber, engagement is blue. */
const statusTone = (status?: string): Tone => {
    switch ((status ?? "").toUpperCase()) {
        case "DELIVERED":
            return "green"
        case "OPENED":
        case "CLICKED":
            return "blue"
        case "SENT":
        case "RECEIVED":
            return "violet"
        case "QUEUED":
        case "PENDING":
        case "SENDING":
        case "PROCESSING":
        case "DEFERRED":
            return "amber"
        case "FAILED":
        case "BOUNCED":
        case "COMPLAINT":
        case "REJECTED":
        case "SPAM":
            return "red"
        default:
            return "neutral"
    }
}

const PERIOD_DAYS: Record<string, number> = { "3days": 3, "7days": 7, "30days": 30 }

export function MailEventsLogs({ data }: { data: MailEvents[] | [] }) {
    const [search, setSearch] = React.useState("")
    const [period, setPeriod] = React.useState("30days")
    const [status, setStatus] = React.useState("all")

    // The server returns the latest 1,000 events; search, period and status narrow them down here.
    const visible = React.useMemo(() => {
        const q = search.trim().toLowerCase()
        const since = moment().subtract(PERIOD_DAYS[period] ?? 30, "days")
        return (data as MailEvents[]).filter((event) => {
            if (status !== "all" && (event.status ?? "").toLowerCase() !== status) return false
            if (event.timestamp && moment(event.timestamp).isBefore(since)) return false
            if (!q) return true
            return [event.from, event.to, event.message, event.status, event.type].some((v) => (v ?? "").toLowerCase().includes(q))
        })
    }, [data, search, period, status])

    return (
        <PageShell>
            <PageHeader
                title="Email events"
                description={
                    <>
                        We don&apos;t store more than 1,000 logs. Every night at midnight, anything over the latest 1,000 is cleared
                        automatically. Need longer retention? Please{" "}
                        <Link href="/about" className="underline underline-offset-2 hover:text-foreground">
                            let us know
                        </Link>
                        .
                    </>
                }
                actions={<ClearLogsButton disabled={data.length === 0} />}
            />

            <Section flush>
                <div className="flex flex-col gap-2 border-b border-border/70 p-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by address, message or status"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 pl-8 text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="h-9 w-[140px] text-sm">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3days">Last 3 days</SelectItem>
                                <SelectItem value="7days">Last 7 days</SelectItem>
                                <SelectItem value="30days">Last 30 days</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="h-9 w-[140px] text-sm">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="queued">Queued</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="deferred">Deferred</SelectItem>
                                <SelectItem value="bounced">Bounced</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {visible.length > 0 ? (
                    <div className="max-h-[640px] overflow-auto">
                        <Table>
                            <TableHeader className="sticky top-0 z-10 bg-card">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[120px]">Status</TableHead>
                                    <TableHead className="w-[100px]">Type</TableHead>
                                    <TableHead className="w-[190px]">Time</TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Message</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visible.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell>
                                            <Pill tone={statusTone(event.status)} className="capitalize">
                                                {(event.status ?? "unknown").toLowerCase()}
                                            </Pill>
                                        </TableCell>
                                        <TableCell>
                                            <Pill tone={event.type === "incoming" ? "blue" : "neutral"} className="capitalize">
                                                {event.type}
                                            </Pill>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                            {moment(event.timestamp).format("YYYY-MM-DD hh:mm:ss A")}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{event.from}</TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{event.to}</TableCell>
                                        <TableCell className="max-w-[420px] truncate text-sm text-muted-foreground" title={event.message}>
                                            {event.message}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <EmptyState
                        icon={Mail}
                        title={data.length === 0 ? "No email events yet" : "No results found"}
                        description={
                            data.length === 0
                                ? "Events appear here as your domains send and receive mail."
                                : "Try adjusting your search or filters."
                        }
                    />
                )}
            </Section>
        </PageShell>
    )
}
