"use client"
import React, { Suspense, useCallback, useEffect, useRef } from 'react'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { useParams, useSearchParams } from 'next/navigation'
import { useMailStore } from '@/store/mails'

import { API } from '@/lib/api/handler'
import { MailCard } from './MailCard'
import Loading from '../loading'
import { CustomEventKey, useCustomEvent } from '@/hooks/use-custom-event'
import { useAppSelector } from '@/store/hooks'
import { sentenceCase } from 'change-case'
import { GetAllMailsPayload } from '@/lib/types/mail.interface'

/** Server default page size of GET /api/v1/get-mails (airsend-api MailDataController). */
const API_PAGE_LIMIT = 50

/** Structural compare of two mail records (nested values compared by JSON). */
function isSameMail(a: any, b: any): boolean {
    if (a === b) return true
    if (!a || !b) return false
    const ka = Object.keys(a)
    if (ka.length !== Object.keys(b).length) return false
    for (const k of ka) {
        const va = a[k], vb = b[k]
        if (va === vb) continue
        if (va && vb && typeof va === 'object' && typeof vb === 'object') {
            if (JSON.stringify(va) !== JSON.stringify(vb)) return false
            continue
        }
        return false
    }
    return true
}

const ClientMailCard = () => {
    const { folder } = useParams() as { folder: string }
    const searchParams = useSearchParams()
    const setAllEmails = useMailStore((state) => state.setAllEmails)
    const loading = useMailStore((state) => state.loading)
    const setLoading = useMailStore((state) => state.setLoading)
    const { listen } = useCustomEvent(CustomEventKey.SyncMail)
    const { emit } = useCustomEvent(CustomEventKey.MailEvents)
    // Select the primitive only — selecting the whole account object
    // re-rendered the list whenever any account field changed.
    const email = useAppSelector(state => state.accounts.currAccount?.email)

    const viewKey = email ? `${email.toLowerCase()}::${folder.toLowerCase()}` : null

    // Guard against concurrent / duplicate API calls
    const fetchingRef = useRef(false)
    // Folders already fetched from the API (so an empty folder isn't re-fetched in a loop)
    const fetchedKeysRef = useRef<Set<string>>(new Set())

    /**
     * Fetch the folder from the API and write it to Dexie.
     * The UI is driven by the live query below, so no manual Zustand updates here.
     */
    const storeInDB = useCallback(async (is_refresh: number = 0) => {
        if (!email || fetchingRef.current) return
        fetchingRef.current = true
        const key = `${email.toLowerCase()}::${folder.toLowerCase()}`
        try {
            setLoading(true)
            const { data } = await API.getAllMailData(`?is_refresh=${is_refresh}&folder=${folder}`)
            if (!data.success) {
                throw new Error("Error fetching emails")
            }
            const results = data.result ?? []
            // Normalize folder field to match URL param (case-insensitive Dexie fix)
            const normalized = results.map((m: any) => ({ ...m, folder: folder }))
            const freshIds = new Set(normalized.map((m: any) => m.message_id))
            // /get-mails returns page 1 only: newest API_PAGE_LIMIT threads, ONE row
            // per thread (latest message). So we may only prune cached mails that
            // fall inside the returned window and aren't part of a returned thread —
            // otherwise older cached mails / thread siblings would be wiped.
            const threadKey = (m: any) => (m.thread_id || m.message_id) as string
            const freshThreads = new Set(normalized.map(threadKey))
            const mailTime = (m: any) => new Date(m.timestamp || m.created_at || 0).getTime()
            const isFullFolder = normalized.length < API_PAGE_LIMIT
            const oldestFresh = normalized.length > 0
                ? Math.min(...normalized.map(mailTime))
                : -Infinity

            await db.transaction('rw', db.mails, async () => {
                // Remove cached mails of this folder that no longer exist on the server
                const cached = await db.mails
                    .where('receipient').equalsIgnoreCase(email)
                    .filter((m) => (m.folder ?? '').toLowerCase() === folder.toLowerCase())
                    .toArray()
                const staleIds = cached
                    .filter((m) => !freshIds.has(m.message_id as string))
                    .filter((m) => !freshThreads.has(threadKey(m)))
                    .filter((m) => isFullFolder || mailTime(m) >= oldestFresh)
                    .map((m) => m.message_id as string)
                if (staleIds.length > 0) await db.mails.bulkDelete(staleIds)
                if (normalized.length > 0) await db.mails.bulkPut(normalized)
            })
        } catch (error) {
            // handle error
        } finally {
            // Mark as fetched even on failure so we show the empty state
            // instead of an endless skeleton / retry loop.
            fetchedKeysRef.current.add(key)
            setLoading(false)
            fetchingRef.current = false
        }
    }, [email, folder, setLoading])

    /**
     * Dexie is the source of truth: any write to `mails` (socket events, new
     * mail, star/read/delete actions, API sync) re-renders the list automatically.
     * Case-insensitive folder match so socket writes ("INBOX") show in "/inbox".
     */
    const live = useLiveQuery(async () => {
        if (!email) return null
        const mails = await db.mails
            .where('receipient').equalsIgnoreCase(email)
            .filter((m) => (m.folder ?? '').toLowerCase() === folder.toLowerCase())
            .toArray()
        return { key: `${email.toLowerCase()}::${folder.toLowerCase()}`, mails: mails as GetAllMailsPayload[] }
    }, [email, folder])

    // Only trust the live result when it belongs to the folder/account on screen
    // (avoids flashing the previous folder's mails after switching).
    const isReady = !!live && live.key === viewKey

    // Keep object identity for unchanged mails so memoized <MailCard>s don't
    // all re-render when a single record changes.
    const prevMailsRef = useRef<Map<string, GetAllMailsPayload>>(new Map())
    const all_emails = React.useMemo(() => {
        if (!isReady) return null
        const prev = prevMailsRef.current
        const next = live!.mails.map((m) => {
            const p = prev.get(m.message_id)
            return p && isSameMail(p, m) ? p : m
        })
        prevMailsRef.current = new Map(next.map((m) => [m.message_id, m]))
        return next
    }, [live, isReady])

    // Mirror into Zustand for other consumers (SpotToolbar select-all, actions)
    // and fetch from the API once if this folder has no cached mails yet.
    useEffect(() => {
        if (!isReady || !all_emails || !viewKey) return
        setAllEmails(all_emails)
        if (all_emails.length === 0 && !fetchedKeysRef.current.has(viewKey)) {
            storeInDB(1)
        }
    }, [isReady, all_emails, viewKey, setAllEmails, storeInDB])

    useEffect(() => {
        const unsubscribe = listen(() => {
            // Manual sync: always re-fetch
            storeInDB(1)
        })
        const messageId = searchParams.get('message_id')
        if (searchParams.get('no_data') && messageId) {
            emit({ action: "delete", message_id: [messageId] })
        }
        return unsubscribe
    }, [listen, storeInDB, searchParams, emit, folder])

    // Group by thread_id, sort threads by newest message, show latest per thread
    const sortedEmails = React.useMemo(() => {
        if (!all_emails || all_emails.length === 0) return []

        // Group mails by thread_id (mails without thread_id are standalone)
        const threadMap = new Map<string, typeof all_emails>()
        const standalone: typeof all_emails = []

        for (const mail of all_emails) {
            if (mail.thread_id) {
                const existing = threadMap.get(mail.thread_id) || []
                existing.push(mail)
                threadMap.set(mail.thread_id, existing)
            } else {
                standalone.push(mail)
            }
        }

        // For each thread, pick the latest message as the representative
        const representatives: typeof all_emails = []
        for (const [, threadMails] of threadMap) {
            const sorted = threadMails.sort((a, b) => {
                const dateA = new Date(a.timestamp || a.created_at || 0).getTime()
                const dateB = new Date(b.timestamp || b.created_at || 0).getTime()
                return dateB - dateA
            })
            representatives.push(sorted[0])
        }

        // Combine standalone + thread representatives, sort newest first
        return [...representatives, ...standalone].sort((a, b) => {
            const dateA = new Date(a.timestamp || a.created_at || 0).getTime()
            const dateB = new Date(b.timestamp || b.created_at || 0).getTime()
            return dateB - dateA
        })
    }, [all_emails])

    // Only show the skeleton when there is nothing to show yet. A background
    // sync (socket replay / sync button) no longer swaps the whole list for a
    // skeleton and back, which caused the list to flicker and remount.
    const awaitingFirstFetch = sortedEmails.length === 0 && !!viewKey && !fetchedKeysRef.current.has(viewKey)
    if (!isReady || (sortedEmails.length === 0 && (loading || awaitingFirstFetch))) return <Loading />

    return <Suspense fallback={<Loading />}>
        {sortedEmails.length > 0 ? (
            <div className="divide-y-0">
                {sortedEmails.map((item) => (
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