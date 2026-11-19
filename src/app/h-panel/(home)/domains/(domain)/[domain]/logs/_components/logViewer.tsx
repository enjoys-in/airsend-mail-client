"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { ScrollText, Search } from "lucide-react";
import { ClearDomainLogsButton } from "./ClearDomainLogsButton";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import moment from "moment";
import { EmptyState, PageHeader, PageShell, Pill, Section, type Tone } from "@/components/h-panel/kit";
import { DomainTabs } from "../../_components.tsx/domain-tabs";

export interface Log {
    id: number;
    timestamp: string;
    type: string;
    event: string;
    message: string;
}

const typeTone = (type: string): Tone => {
    switch (String(type).toUpperCase()) {
        case "INFO":
            return "green";
        case "WARN":
        case "ALERT":
            return "amber";
        case "ERROR":
        case "CRIT":
            return "red";
        case "DEBUG":
            return "blue";
        default:
            return "neutral";
    }
};

export function LogViewer({ logs, domainId }: { logs: Log[]; domainId: string }) {
    const router = useRouter();
    const [search, setSearch] = React.useState("");
    const [typeFilter, setTypeFilter] = React.useState("all");

    // The page is rendered on the server once; this makes "updated every 1 Minute" true by re-running it.
    React.useEffect(() => {
        const timer = setInterval(() => router.refresh(), 60_000);
        return () => clearInterval(timer);
    }, [router]);

    const types = React.useMemo(() => Array.from(new Set(logs.map((l) => l.type))).sort(), [logs]);

    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        return logs.filter((log) => {
            if (typeFilter !== "all" && log.type !== typeFilter) return false;
            if (!q) return true;
            return `${log.event} ${log.message}`.toLowerCase().includes(q);
        });
    }, [logs, search, typeFilter]);

    return (
        <PageShell>
            <PageHeader
                back={{ href: `/h-panel/domains/${domainId}`, label: "Domain" }}
                title="Domain logs"
                description="Delivery and verification events for this domain. Updated every minute."
                actions={<ClearDomainLogsButton domainId={domainId} disabled={logs.length === 0} />}
            />

            <DomainTabs domainId={domainId} active="logs" />

            <Section flush>
                <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-3">
                    <div className="relative min-w-[200px] max-w-sm flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events and messages"
                            className="h-9 pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="h-9 w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            {types.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="ml-auto text-xs text-muted-foreground">
                        {filtered.length} log{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        icon={ScrollText}
                        title="No logs found"
                        description={logs.length === 0 ? "Events for this domain will show up here." : "Try a different search or type."}
                    />
                ) : (
                    <div className="max-h-[calc(100vh-24rem)] min-h-[320px] overflow-auto">
                        <Table className="min-w-[700px] table-fixed">
                            <TableHeader className="sticky top-0 z-10 bg-card">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[190px] whitespace-nowrap pl-5">Timestamp</TableHead>
                                    <TableHead className="w-[100px] whitespace-nowrap">Type</TableHead>
                                    <TableHead className="w-[180px] whitespace-nowrap">Event</TableHead>
                                    <TableHead className="w-auto pr-5">Message</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((log) => (
                                    <TableRow key={log.id} className="align-top">
                                        <TableCell className="whitespace-nowrap pl-5 font-mono text-xs text-muted-foreground">
                                            {moment(log.timestamp).format("YYYY-MM-DD hh:mm:ss A")}
                                        </TableCell>
                                        <TableCell>
                                            <Pill tone={typeTone(log.type)}>{log.type}</Pill>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm">{log.event}</TableCell>
                                        <TableCell className="pr-5">
                                            <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-muted-foreground">
                                                <code>{log.message}</code>
                                            </pre>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Section>
        </PageShell>
    );
}
