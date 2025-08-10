"use client"
import React, { Suspense, useEffect } from 'react'

import { airsendDB, db } from '@/db'
import { useParams } from 'next/navigation'
import { useMailStore } from '@/store/mails'

import { API } from '@/lib/api/handler'
import { MailCard } from '@/app/v2/(version-2)/_components/mail/MailCard'
import Loading from '../loading'
import { CustomEventKey, useCustomEvent } from '@/hooks/use-custom-event'
import { useAppSelector } from '@/store/hooks'


const ClientMailCard = () => {
    const { folder } = useParams() as { folder: string }
    const { all_emails, setAllEmails, loading, setLoading } = useMailStore()
    const { listen } = useCustomEvent(CustomEventKey.SyncMail)
    const currAccount = useAppSelector(state => state.accounts.currAccount)


    const storeInDB = async () => {
        try {
            setLoading(true)
            const { data } = await API.getAllMailData(`?is_refresh=1&folder=${folder}`)
            if (!data.success) {
                throw new Error("Error fetching emails")
            }
            await airsendDB.bulkPutItems("mails", data.result as any)
            setAllEmails(data.result)
            setLoading(false)
        } catch (error) {
            console.log(error)

        }
    }
    const loadMailFromDB = async () => {
        db.mails
            .where("[folder+receipient]")
            .equals([folder, currAccount?.email!])
            .toArray()
            // db.mails
            //     .where("receipient")
            //     .equals(currAccount?.email!)
            //     .and(mails => mails.folder === folder)
            //     .toArray()
            .then(items => {
                if (items.length === 0) {
                    return storeInDB()
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
        const unsubscribe = listen(storeInDB)
        return unsubscribe
    }, [])

    return <Suspense fallback={<Loading />}>
        {loading ? <Loading /> :
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