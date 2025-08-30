import React from 'react'
import { MailChart } from './MailCharts'
import { SentReciveChart } from './SentReciveChart'
import serverAxios from '@/lib/api/serverAxios'
import { ApiResponse } from '@/lib/types'

const ChartsComponent = async () => {
    try {
        const { data } = await serverAxios.get<ApiResponse<any>>("/api/v1/admin/charts-data")

        if (!data.success) {
            throw new Error(data.message)
        }
        return (
            <div>
                {/* <MailChart /> */}
                <SentReciveChart chartData={data.result} />
            </div>
        )
    } catch (error) {
        return null
    }
}

export default ChartsComponent