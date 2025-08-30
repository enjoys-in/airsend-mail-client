import React from 'react'
import InfoCard from './InfoCard'
import { Users, Globe, CheckCircle, UserCheck } from 'lucide-react';
import serverAxios from '@/lib/api/serverAxios';
import { ApiResponse } from '@/lib/types';
import { StatCardSkeleton } from './CardSkelton';

interface AccountStatisticsResponse {
    totaldomains: string
    activedomains: string
    totalaccounts: string
    activeaccounts: string
}

const AccountStatistics = async () => {
    try {
        const { data } = await serverAxios.get<ApiResponse<AccountStatisticsResponse>>("/api/v1/admin/analytics")

        if (!data.success) {
            throw new Error(data.message)
        }
        return (
            <div className="grid auto-rows-min gap-4 md:grid-cols-4 mb-2">
                <InfoCard title="Total Accounts" icon={<Users className="h-4 w-4 text-muted-foreground" />} value={data.result.totalaccounts} />
                <InfoCard title="Total Domains" icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} value={data.result.totaldomains} />
                <InfoCard title="Active Domains" icon={<Globe className="h-4 w-4 text-muted-foreground" />} value={data.result.activedomains} />
                <InfoCard title="Active Accounts" icon={<UserCheck className="h-4 w-4 text-muted-foreground" />} value={data.result.activeaccounts} />
            </div>
        )
    } catch (error) {
        return (
            <StatCardSkeleton />

        )
    }
}

export default AccountStatistics