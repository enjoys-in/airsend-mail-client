"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { ClearDomainLogsButton } from "./ClearDomainLogsButton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getColor } from "@/lib/utils";
import moment from "moment";
export interface Log {
    id: number;
    timestamp: string;
    type: string;
    event: string;
    message: string;
}
export function LogViewer({ logs, domainId }: { logs: Log[]; domainId: string }) {
    const router = useRouter();

    // The page is rendered on the server once; this makes "updated every 1 Minute" true by re-running it.
    React.useEffect(() => {
        const timer = setInterval(() => router.refresh(), 60_000);
        return () => clearInterval(timer);
    }, [router]);

    return (
        <div className="w-full p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
                <h1 className="text-xl md:text-2xl text-foreground">
                    All Logs will be displayed here and will be updated in every 1 Minute
                </h1>
                <ClearDomainLogsButton domainId={domainId} disabled={logs.length === 0} />
            </div>
            <div className="rounded-md border overflow-hidden">
                <ScrollArea className="h-[600px] rounded-md border">
                    <div className="w-full overflow-x-auto">
                        <Table className="table-fixed min-w-[700px] w-full">
                            <TableHeader className="sticky top-0 z-10 bg-background">
                                <TableRow>
                                    <TableHead className="w-[180px] whitespace-nowrap">
                                        Timestamp
                                    </TableHead>
                                    <TableHead className="w-[110px] whitespace-nowrap">
                                        Type
                                    </TableHead>
                                    <TableHead className="w-[180px] whitespace-nowrap">
                                        Event
                                    </TableHead>
                                    <TableHead className="w-auto">Message</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="text-gray-400">
                                {logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">
                                            No logs found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow
                                            key={log.id}
                                            className="hover:bg-gray-50/5 hover:text-gray-100 transition-colors"
                                        >
                                            <TableCell className="font-mono text-sm whitespace-nowrap">
                                                {moment(log.timestamp).format("YYYY-MM-DD hh:mm:ss A")}
                                            </TableCell>

                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={`${getColor(log.type)} font-medium`}
                                                >
                                                    {log.type}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="font-medium whitespace-nowrap">
                                                {log.event}
                                            </TableCell>

                                            <TableCell className="font-mono text-sm whitespace-pre-wrap break-words">
                                                <pre className="whitespace-pre-wrap break-words max-w-full overflow-x-auto text-sm leading-relaxed">
                                                    <code className="block ">
                                                        {log.message}
                                                    </code>
                                                </pre>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </ScrollArea>

            </div>
        </div>
    );
}