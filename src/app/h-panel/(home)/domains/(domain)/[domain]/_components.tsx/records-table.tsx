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
import Badge from '@/components/common/badges';
import CopyToClipboard from '@/components/common/copyToClipboard';
const RecordsTable = ({ records }: { records: DNSRecords[] }) => {

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Server / Content / Target</TableHead>
                        <TableHead>TTL</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records?.map((record, index) => (
                        <TableRow key={index}>
                            {Array.isArray(record) ? record.length > 0 && record.map((record, index) => (
                                <CustomTableCell record={record} key={index} />
                            )) :
                                <CustomTableCell record={record} key={index} />}
                        </TableRow>
                    ))
                    }
                </TableBody>
            </Table>
        </div>

    )
}

export default RecordsTable
const CustomTableCell = ({ record }: { record: DNSRecords }) => (
    <>
        <TableCell>{dnsRecordsValue[record?.type]}</TableCell>
        <TableCell>{record?.name}</TableCell>
        <TableCell className='flex gap-2 items-center'>
            <pre>
                <code className="break-all whitespace-pre-wrap font-mono">
                    {record?.type === 15 ? record?.data.split(" ")[1] : record?.data}
                </code>
            </pre>
            <CopyToClipboard text={record?.type === 15 ? record?.data.split(" ")[1] : record?.data} />
        </TableCell>
        <TableCell>{record?.ttl}</TableCell>
        <TableCell>{record?.type === 15 ? record?.data.split(" ")[0] : "-"}</TableCell>
        <TableCell className='items-center'><Badge className='w-24' text={record.status ? "Verified" : "Not Verified"} variant={record.status ? "teal" : "yellow"} /></TableCell>
    </>
)