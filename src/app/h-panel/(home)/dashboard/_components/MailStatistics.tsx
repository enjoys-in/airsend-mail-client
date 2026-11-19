import React from "react"
import InfoCard, { type InfoCardIcon } from "./InfoCard"
import serverAxios from "@/lib/api/serverAxios"
import { ApiResponse } from "@/lib/types"
import { sentenceCase } from "change-case"
import { StatGrid, Panel, EmptyState } from "@/components/h-panel/kit"

export type MailStatisticsResponse = Root2[]

export interface Root2 {
    status: "received" | "bounced" | "failed" | "sent" | "delivered" | "undelivered"
    total: number
}
const getIcon = (status: string): InfoCardIcon => {
    switch (status) {
        case "received":
            return "mailCheck"
        case "bounced":
            return "alert"
        case "failed":
            return "failed"
        default:
            return "mail"
    }
}
const MailStatistics = async () => {

    try {
        const { data } = await serverAxios.get<ApiResponse<MailStatisticsResponse>>("/api/v1/admin/statistics")

        if (!data.success) {
            throw new Error(data.message)
        }
        if (!data.result.length) {
            return (
                <Panel>
                    <EmptyState title="No mail yet" description="Totals appear here once mail is sent or received." />
                </Panel>
            )
        }
        return (
            <StatGrid>
                {data.result.map((item: Root2) => (
                    <InfoCard key={item.status} title={`Mail ${sentenceCase(item.status).toLowerCase()}`} icon={getIcon(item.status)} value={item.total.toString()} />
                ))}
            </StatGrid>
        )
    } catch (error) {
        return (
            <Panel>
                <EmptyState title="Mail statistics are unavailable" description="They could not be loaded right now. Reload the page to try again." />
            </Panel>
        )
    }
}

export default MailStatistics
