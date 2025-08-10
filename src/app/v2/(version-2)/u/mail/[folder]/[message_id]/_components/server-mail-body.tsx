import React from 'react'
import serverAxios from '@/lib/api/serverAxios'
import { ApiResponse } from '@/lib/types'
import { AxiosResponse } from 'axios'
import { Skeleton } from '@/components/ui/skeleton'

const ServerMailBody = async ({ folder, message_id }: { message_id: string, folder: string }) => {
    try {
        const { data } = await serverAxios.get(`/api/v1/get-encoded-mail/${message_id}`) as AxiosResponse<ApiResponse<{ chiper_text: string }>>

        if (!data.success) {
            throw new Error(data.message)
        }

        return (
            <div>{data.result.chiper_text}</div>
        )
    } catch (error) {
        return (
            <div className="space-y-4 p-4">
                <div className="flex flex-col space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[95%]" />
                </div>
                <div className="flex flex-col space-y-2">
                    <Skeleton className="h-4 w-[92%]" />
                    <Skeleton className="h-4 w-[88%]" />
                    <Skeleton className="h-4 w-[85%]" />
                </div>
                <div className="flex flex-col space-y-2">
                    <Skeleton className="h-4 w-[88%]" />
                    <Skeleton className="h-4 w-[92%]" />
                    <Skeleton className="h-4 w-[85%]" />
                </div>
            </div>
        )
    }
}

export default ServerMailBody