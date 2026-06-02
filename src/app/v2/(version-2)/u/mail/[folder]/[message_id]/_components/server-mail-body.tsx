import React from 'react'
import serverAxios from '@/lib/api/serverAxios'
import { ApiResponse } from '@/lib/types'
import { AxiosResponse } from 'axios'
import { Skeleton } from '@/components/ui/skeleton'
import { EncodedMessageResponse } from '@/lib/types/mail.interface'
import { redirect, RedirectType } from 'next/navigation'
import DecodingComponent from './decoding-component'

export async function SendNotificationLogs(message: string) {
  const prepareLOG = (message: string) => {
    const now = new Date()
    const date = now.toLocaleDateString("en-IN")
    const time = now.toLocaleTimeString("en-IN")

    // Escape MarkdownV2 special characters
    const safeMessage = message
      .replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1')

    return `Airsend Email Logs-${date} ${time} \n\n ⚠️ Message:${safeMessage}`
  }

  const text = prepareLOG(message)
  const encodedText = encodeURIComponent(text)
  const url = `https://api.telegram.org/bot8349858662:AAGkicIEEScr33_66YdQ8Wjsl_JjJ0KpG8c/sendMessage?chat_id=7690359227&text=${encodedText}`
  await fetch(url)
}

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


    } catch (error: any) {
        // Re-throw Next.js redirect/notFound errors so they aren't swallowed
        if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.digest?.startsWith('NEXT_NOT_FOUND')) {
            throw error;
        }
        SendNotificationLogs(`Error fetching encoded mail with ID ${message_id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
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