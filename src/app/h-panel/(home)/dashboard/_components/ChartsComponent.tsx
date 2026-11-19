import React from "react"
import { SentReciveChart } from "./SentReciveChart"
import serverAxios from "@/lib/api/serverAxios"
import { ApiResponse } from "@/lib/types"

const ChartsComponent = async () => {
    try {
        const { data } = await serverAxios.get<ApiResponse<any>>("/api/v1/admin/charts-data")

        if (!data.success) {
            throw new Error(data.message)
        }
        return <SentReciveChart chartData={data.result} />
    } catch (error) {
        return null
    }
}

export default ChartsComponent
