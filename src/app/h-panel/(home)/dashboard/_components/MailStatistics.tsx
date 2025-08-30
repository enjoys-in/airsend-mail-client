import React from 'react'
import InfoCard from './InfoCard'
import { Mail, MailCheck, AlertCircle, XCircle } from 'lucide-react';
import serverAxios from '@/lib/api/serverAxios';
import { ApiResponse } from '@/lib/types';
import { sentenceCase } from 'change-case';
import { StatCardSkeleton } from './CardSkelton';

export type MailStatisticsResponse = Root2[]

export interface Root2 {
    status: "received" | "bounced" | "failed" | "sent" | "delivered" | "undelivered";
    total: number
}
const getIcon = (status: string) => {
    switch (status) {
        case "received":
            return <MailCheck className="h-4 w-4 text-muted-foreground" />
        case "bounced":
            return <AlertCircle className="h-4 w-4 text-muted-foreground" />
        case "failed":
            return <XCircle className="h-4 w-4 text-muted-foreground" />
        default:
            return <Mail className="h-4 w-4 text-muted-foreground" />
    }
}
const MailStatistics = async () => {

    try {
        const { data } = await serverAxios.get<ApiResponse<MailStatisticsResponse>>("/api/v1/admin/statistics")

        if (!data.success) {
            throw new Error(data.message)
        }
        return (
            <div className="grid auto-rows-min gap-4 md:grid-cols-4 mb-2">


                {data.result.map((item: Root2) => (
                    <div key={item.status}>
                        <InfoCard title={`Total Mail ${sentenceCase(item.status)}`} icon={getIcon(item.status)} value={item.total.toString()} />
                    </div>
                ))}
            </div>
        )
    } catch (error) {
        <StatCardSkeleton />
    }
}

export default MailStatistics