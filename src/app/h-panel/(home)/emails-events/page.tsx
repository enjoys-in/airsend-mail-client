import React from 'react'
import serverAxios from '@/lib/api/serverAxios'
import { SomethingWentWrong } from '@/components/common/SomethingWentWrong'
import { MailEventsLogs } from './_components/MailEventLogs'

export default async function EmailDashboard() {
    try {
        const { data } = await serverAxios.get("/api/v1/admin/mail-events")
        if (!data.success) {
            throw new Error(data.message)
        }

        return (
            <MailEventsLogs data={data.result} />
        )
    } catch (error) {
        return (
            <SomethingWentWrong />
        )
    }

}
