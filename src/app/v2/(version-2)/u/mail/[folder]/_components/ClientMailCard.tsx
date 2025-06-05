"use client"
import React, { Suspense, useEffect } from 'react'

import { airsendDB } from '@/db'
import { useParams } from 'next/navigation'
import { useMailStore } from '@/store/mails'

import { API } from '@/lib/api/handler'
import { MailCard } from '@/app/v2/(version-2)/_components/mail/MailCard'
import Loading from '../loading'
import { CustomEventKey, useCustomEvent } from '@/hooks/use-custom-event'


const ClientMailCard = () => {
    const { folder } = useParams() as { folder: string[] }
    const { all_emails, setAllEmails, loading, setLoading } = useMailStore()
    const { listen } = useCustomEvent(CustomEventKey.SyncMail)


    const storeInDB = async () => {
        try {
            setLoading(true)
            const { data } = await API.getAllMailData()
            if (!data.success) {
                throw new Error("Error fetching emails")
            }
            await airsendDB.bulkPutItems("mails", data.result as any)
            setAllEmails(data.result)
            setLoading(false)
        } catch (error) {


        }
    }
    const loadMailFromDB = async () => {
        const item = await airsendDB.getAllItems("mails")

        setAllEmails(item as any)
    }
    useEffect(() => {
        loadMailFromDB()
    }, [])

    useEffect(() => {
        const unsubscribe = listen(storeInDB)
        return unsubscribe
    }, [])

    return loading ? <Loading /> : <Suspense fallback={<Loading />}>
        {
            all_emails && all_emails.length > 0 ? all_emails.map((item, index) => (
                <MailCard key={index} item={item} />
            )) : (
                <div className='flex items-center justify-center h-full bg-background'>
                    <h1 className='text-2xl text-gray-500 items-center'>{folder} is empty</h1>
                </div>
            )
        }
    </Suspense>

}

export default ClientMailCard