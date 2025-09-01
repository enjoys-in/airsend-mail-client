import React from 'react'
import serverAxios from '@/lib/api/serverAxios'
import { ApiResponse } from '@/lib/types'
import { AxiosResponse } from 'axios'
import { Skeleton } from '@/components/ui/skeleton'
import { EncodedMessageResponse } from '@/lib/types/mail.interface'
import { redirect, RedirectType } from 'next/navigation'
import DecodingComponent from './decoding-component'



const ServerMailBody = async ({ folder, message_id }: { message_id: string, folder: string }) => {
    try {
        const { data } = await serverAxios.get(`/api/v1/get-encoded-mail/${message_id}`) as AxiosResponse<ApiResponse<EncodedMessageResponse>>
        if (!data.success) {
            if (data.message.includes("No data found")) {
                return redirect(`/v2/u/mail/${folder}?message_id=${message_id}&no_data=true`, RedirectType.replace);
            } else {
                throw new Error(data.message)
            }
        }

        return <DecodingComponent message_id={message_id} data={data.result} />


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