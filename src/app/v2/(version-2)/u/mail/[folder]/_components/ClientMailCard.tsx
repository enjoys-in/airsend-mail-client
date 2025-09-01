"use client"
import React, { Suspense, useEffect } from 'react'

import { airsendDB, db } from '@/db'
import { useParams, useSearchParams } from 'next/navigation'
import { useMailStore } from '@/store/mails'

import { API } from '@/lib/api/handler'
import { MailCard } from './MailCard'
import Loading from '../loading'
import { CustomEventKey, useCustomEvent } from '@/hooks/use-custom-event'
import { useAppSelector } from '@/store/hooks'
import { sentenceCase } from 'change-case'


const ClientMailCard = () => {
    const { folder } = useParams() as { folder: string }
    const searchParams = useSearchParams()
    const { all_emails, setAllEmails, loading, setLoading } = useMailStore()
    const { listen } = useCustomEvent(CustomEventKey.SyncMail)
    const { emit } = useCustomEvent(CustomEventKey.MailEvents)
    const currAccount = useAppSelector(state => state.accounts.currAccount)


    const storeInDB = async (is_refresh: number = 0) => {
        try {
            setLoading(true)
            const { data } = await API.getAllMailData(`?is_refresh=${is_refresh}&folder=${folder}`)
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
        db.mails
            .where("[folder+receipient]")
            .equals([folder, currAccount?.email!])
            .toArray()
            .then(items => {

                if (items.length === 0) {
                    return storeInDB(1)
                }
                setAllEmails(items as any)
            });

    }
    useEffect(() => {
        if (currAccount?.email!) {
            loadMailFromDB()
        }
    }, [])

    useEffect(() => {
        const unsubscribe = listen(() => storeInDB(1))
        if (searchParams.get('no_data')) {
            searchParams.has('message_id') && emit({ action: "delete", message_id: [searchParams.get('message_id')] })
        }
        return unsubscribe
    }, [])

    return <Suspense fallback={<Loading />}>
        {loading ? <Loading /> :
            all_emails && all_emails.length > 0 ? all_emails.map((item, index) => (
                <MailCard key={index} item={item} />
            )) : (
                <div className='flex items-center justify-center h-full bg-background'>
                    <h1 className='text-2xl text-gray-500 items-center'>{sentenceCase(folder)} is empty</h1>
                </div>
            )
        }
    </Suspense>

}

export default ClientMailCard