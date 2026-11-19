import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { DNSRecords, } from '@/lib/types/mail.interface';
import { dnsRecordsValue } from '@/lib/utils';
import { Pill } from '@/components/h-panel/kit';
import CopyToClipboard from '@/components/common/copyToClipboard';
const RecordsTable = ({ records }: { records: DNSRecords[] }) => {

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-5">Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Server / Content / Target</TableHead>
                        <TableHead>TTL</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="pr-5">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records?.map((record, index) => (
                        <React.Fragment key={index}>
                            {Array.isArray(record) ? record.length > 0 && record.map((record, index) => (
                                <TableRow key={index}>
                                    <CustomTableCell record={record} />
                                </TableRow>
                            )) :
                                <TableRow>
                                    <CustomTableCell record={record} />
                                </TableRow>}
                        </React.Fragment>
                    ))
                    }
                </TableBody>
            </Table>
        </div>

    )
}

export default RecordsTable
const CustomTableCell = ({ record }: { record: DNSRecords }) => {
    const value = record?.type === 15 ? record?.data.split(" ")[1] : record?.data
    return (
        <>
            <TableCell className="pl-5">
                <Pill>{dnsRecordsValue[record?.type]}</Pill>
            </TableCell>
            <TableCell className="font-mono text-sm">{record?.name}</TableCell>
            <TableCell>
                <div className="flex items-center gap-1">
                    <code className="max-w-[420px] break-all whitespace-pre-wrap font-mono text-sm">{value}</code>
                    <CopyToClipboard text={value} />
                </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{record?.ttl}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{record?.type === 15 ? record?.data.split(" ")[0] : "-"}</TableCell>
            <TableCell className="pr-5">
                <Pill tone={record.status ? "green" : "amber"}>{record.status ? "Verified" : "Not verified"}</Pill>
            </TableCell>
        </>
    )
}
