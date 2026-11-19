import React from "react"
import InfoCard from "./InfoCard"
import serverAxios from "@/lib/api/serverAxios"
import { ApiResponse } from "@/lib/types"
import { StatGrid, Panel, EmptyState } from "@/components/h-panel/kit"

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
            <StatGrid>
                <InfoCard title="Total accounts" icon="users" value={data.result.totalaccounts} />
                <InfoCard title="Active accounts" icon="userCheck" value={data.result.activeaccounts} />
                <InfoCard title="Total domains" icon="domains" value={data.result.totaldomains} />
                <InfoCard title="Active domains" icon="globe" value={data.result.activedomains} />
            </StatGrid>
        )
    } catch (error) {
        return (
            <Panel>
                <EmptyState title="Account statistics are unavailable" description="They could not be loaded right now. Reload the page to try again." />
            </Panel>
        )
    }
}

export default AccountStatistics
