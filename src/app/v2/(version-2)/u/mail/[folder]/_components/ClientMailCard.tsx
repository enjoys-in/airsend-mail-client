"use client"
import React, { Suspense, useCallback, useEffect, useRef } from 'react'

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
    const all_emails = useMailStore((state) => state.all_emails)
    const setAllEmails = useMailStore((state) => state.setAllEmails)
    const loading = useMailStore((state) => state.loading)
    const setLoading = useMailStore((state) => state.setLoading)
    const { listen } = useCustomEvent(CustomEventKey.SyncMail)
    const { emit } = useCustomEvent(CustomEventKey.MailEvents)
    const currAccount = useAppSelector(state => state.accounts.currAccount)

    // Guard against concurrent / duplicate API calls
    const fetchingRef = useRef(false)
    // Track folders that returned empty from API (legitimately empty)
    const emptyFoldersRef = useRef<Set<string>>(new Set())

    const storeInDB = useCallback(async (is_refresh: number = 0) => {
        // Prevent concurrent duplicate calls
        if (fetchingRef.current) return
        fetchingRef.current = true
        try {
            setLoading(true)
            const { data } = await API.getAllMailData(`?is_refresh=${is_refresh}&folder=${folder}`)
            if (!data.success) {
                throw new Error("Error fetching emails")
            }
            const results = data.result ?? []
            if (results.length > 0) {
                await airsendDB.bulkPutItems("mails", results as any)
                emptyFoldersRef.current.delete(folder)
            } else {
                // Mark folder as legitimately empty so we don't re-fetch
                emptyFoldersRef.current.add(folder)
            }
            setAllEmails(results)
        } catch (error) {
            // handle error
        } finally {
            setLoading(false)
            fetchingRef.current = false
        }
    }, [folder, setAllEmails, setLoading])

    const loadMailFromDB = useCallback(async () => {
        if (!currAccount?.email) return
        db.mails
            .where("[folder+receipient]")
            .equals([folder, currAccount.email])
            .toArray()
            .then(items => {
                if (items.length === 0) {
                    // Don't re-fetch if this folder was already confirmed empty
                    if (emptyFoldersRef.current.has(folder)) {
                        setAllEmails([])
                        return
                    }
                    return storeInDB(1)
                }
                setAllEmails(items as any)
            });
    }, [folder, currAccount?.email, storeInDB, setAllEmails])

    useEffect(() => {
        if (currAccount?.email) {
            loadMailFromDB()
        }
    }, [currAccount?.email, folder, loadMailFromDB])

    useEffect(() => {
        const unsubscribe = listen(() => {
            // Manual sync: clear empty-folder cache so it always re-fetches
            emptyFoldersRef.current.delete(folder)
            storeInDB(1)
        })
        const messageId = searchParams.get('message_id')
        if (searchParams.get('no_data') && messageId) {
            emit({ action: "delete", message_id: [messageId] })
        }
        return unsubscribe
    }, [listen, storeInDB, searchParams, emit, folder])

    if (loading) return <Loading />

    return <Suspense fallback={<Loading />}>
        {all_emails && all_emails.length > 0 ? (
            <div className="divide-y-0">
                {all_emails.map((item) => (
                    <MailCard key={item.message_id} item={item} />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full py-24 bg-background">
                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{sentenceCase(folder)} is empty</p>
                <p className="text-xs text-muted-foreground/50 mt-1">Messages will appear here</p>
            </div>
        )}
    </Suspense>

}

export default ClientMailCard