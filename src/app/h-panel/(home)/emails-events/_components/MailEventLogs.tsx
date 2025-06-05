import { Eye, Search } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCaption,
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
import React from 'react'
import moment from 'moment'
import { getEmailStatusColor } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface MailEvents {
    id: string;
    status: string;
    type: string;
    from: string;
    to: string;
    message: string;
    timestamp: string;
}
export function MailEventsLogs({ data }: { data: MailEvents[] | [] }) {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-200">Emails</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rounded-none" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="pl-8 bg-background rounded-none"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 sm:w-auto w-full rounded-none">
                        <Select defaultValue="3days">
                            <SelectTrigger className="w-[140px] rounded-none">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3days">Last 3 days</SelectItem>
                                <SelectItem value="7days">Last 7 days</SelectItem>
                                <SelectItem value="30days">Last 30 days</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[140px] rounded-none">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>

                    </div>
                </div>


                {
                    data.length > 0 ?
                        <ScrollArea className="h-[600px] rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="text-gray-400 text-xs uppercase">
                                        <TableHead>Status</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>From</TableHead>
                                        <TableHead>To</TableHead>
                                        <TableHead>Message</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((event) => (
                                        <TableRow key={event.id} className="hover:bg-gray-800/50">
                                            <TableCell>
                                                <Badge className={`${event?.status && getEmailStatusColor(event?.status)} uppercase text-xs font-medium`}>
                                                    {event?.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-400">{moment(event?.timestamp).format("YYYY-MM-DD hh:mm:ss A")}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={event?.type === "incoming" ? "default" : "secondary"} >{event?.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-100 font-medium">{event?.from}</span>

                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-400">{event?.to}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-400">{event?.message}</span>
                                            </TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                        : (
                            <div className="flex flex-col items-center justify-center p-6 text-center rounded-none">
                                <h2 className="text-xl font-semibold mb-2">
                                    No results found
                                </h2>
                                <p className="text-muted-foreground">
                                    Try adjusting your search or filters.
                                </p>
                            </div>
                        )
                }

            </div>
        </div>
    )
}
