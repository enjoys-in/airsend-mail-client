"use client"
import React, { Suspense, useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { useLiveQuery } from 'dexie-react-hooks'
import { db, mailKeyOf } from '@/db'
import { useParams, useSearchParams } from 'next/navigation'
import { useMailStore } from '@/store/mails'

import { API } from '@/lib/api/handler'
import { MailCard } from './MailCard'
import Loading from '../loading'
import { CustomEventKey, useCustomEvent } from '@/hooks/use-custom-event'
import { useAppSelector } from '@/store/hooks'
import { sentenceCase } from 'change-case'
import { GetAllMailsPayload } from '@/lib/types/mail.interface'
import { applyFolderCounts, markListSynced, needsListFetch } from '@/db/mailbox-sync'

/** Server default page size of GET /api/v1/get-mails (airsend-api MailDataController). */
const API_PAGE_LIMIT = 50

/** Whole-folder totals sent with every page; pages are counted in threads (one row per thread). */
type ListMeta = { page: number; limit: number; total_messages: number; unread: number; total_pages: number; has_more: boolean }

/** GET /get-mails result is { mails, meta }; an older server returned the bare array. */
function readList(result: any): { mails: any[]; meta: ListMeta | null } {
    if (Array.isArray(result)) return { mails: result, meta: null }
    return { mails: result?.mails ?? [], meta: result?.meta ?? null }
}

/**
 * Thread key — identical to the server's `COALESCE(thread_id, message_id)`.
 * /get-mails pages by THREADS (one row per thread = its latest message), so
 * grouping, de-duping and page math all use this key.
 */
const threadKey = (m: any) => (m?.thread_id || m?.message_id) as string

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
    const { emit, listen: listenMailEvents } = useCustomEvent(CustomEventKey.MailEvents)
    // Select the primitive only — selecting the whole account object
    // re-rendered the list whenever any account field changed.
    const email = useAppSelector(state => state.accounts.currAccount?.email)

    const viewKey = email ? `${email.toLowerCase()}::${folder.toLowerCase()}` : null

    // Guard against concurrent / duplicate API calls; a call made meanwhile runs once the current one ends
    const fetchingRef = useRef(false)
    const refetchPendingRef = useRef(false)
    // Folders already fetched from the API (so an empty folder isn't re-fetched in a loop)
    const fetchedKeysRef = useRef<Set<string>>(new Set())
    // Folders whose last page has been reached (no more threads on the server)
    const [exhausted, setExhausted] = useState<Record<string, boolean>>({})
    const [loadingMore, setLoadingMore] = useState(false)
    const loadingMoreRef = useRef(false)

    /**
     * Fetch the folder from the API and write it to Dexie.
     * The UI is driven by the live query below, so no manual Zustand updates here.
     */
    const storeInDB = useCallback(async (is_refresh: number = 0) => {
        if (!email) return
        if (fetchingRef.current) {
            refetchPendingRef.current = true
            return
        }
        fetchingRef.current = true
        const key = `${email.toLowerCase()}::${folder.toLowerCase()}`
        try {
            setLoading(true)
            const { data } = await API.getAllMailData(`?is_refresh=${is_refresh}&folder=${folder}&page=1&limit=${API_PAGE_LIMIT}`)
            if (!data.success) {
                throw new Error("Error fetching emails")
            }
            const { mails: results, meta } = readList(data.result)
            // Normalize folder field to match URL param (case-insensitive Dexie fix)
            const normalized = results.map((m: any) => ({ ...m, folder: folder }))
            const freshIds = new Set(normalized.map((m: any) => m.message_id))
            // /get-mails returns page 1 only: newest API_PAGE_LIMIT threads, ONE row
            // per thread (latest message). So we may only prune cached mails that
            // fall inside the returned window and aren't part of a returned thread —
            // otherwise older cached mails / thread siblings would be wiped.
            const freshThreads = new Set(normalized.map(threadKey))
            const mailTime = (m: any) => new Date(m.timestamp || m.created_at || 0).getTime()
            const isFullFolder = meta ? !meta.has_more : normalized.length < API_PAGE_LIMIT
            const oldestFresh = normalized.length > 0
                ? Math.min(...normalized.map(mailTime))
                : -Infinity

            await db.transaction('rw', db.mails, async () => {
                // Remove cached mails of this folder that no longer exist on the server
                const cached = await db.mails
                    .where('receipient').equalsIgnoreCase(email)
                    .filter((m) => (m.folder ?? '').toLowerCase() === folder.toLowerCase())
                    .toArray()
                const staleKeys = cached
                    .filter((m) => !freshIds.has(m.message_id as string))
                    .filter((m) => !freshThreads.has(threadKey(m)))
                    .filter((m) => isFullFolder || mailTime(m) >= oldestFresh)
                    .map(mailKeyOf)
                if (staleKeys.length > 0) await db.mails.bulkDelete(staleKeys as any)
                if (normalized.length > 0) await db.mails.bulkPut(normalized)
            })
            // The sidebar counts come with the list: no separate count request
            if (meta) await applyFolderCounts({ [folder]: { total_count: meta.total_messages, unread_count: meta.unread } })
            await markListSynced(email, folder)
            // The server says whether there is a page 2
            setExhausted((prev) => ({ ...prev, [key]: isFullFolder }))
        } catch (error) {
            // handle error
        } finally {
            // Mark as fetched even on failure so we show the empty state
            // instead of an endless skeleton / retry loop.
            fetchedKeysRef.current.add(key)
            setLoading(false)
            fetchingRef.current = false
            if (refetchPendingRef.current) {
                refetchPendingRef.current = false
                storeInDBRef.current(1)
            }
        }
    }, [email, folder, setLoading])
    // Latest storeInDB (current folder), for the queued re-run above
    const storeInDBRef = useRef(storeInDB)
    storeInDBRef.current = storeInDB

    /**
     * Load the next page of THREADS. The page number comes from how many
     * threads are on screen (50 threads → page 2, 100 → page 3, ...), so it
     * also works for a list restored from the Dexie cache. Results go to Dexie
     * only; the live query renders them, and grouping by thread key collapses
     * any thread that shows up on two pages (offsets shift as new mail arrives).
     */
    const loadMore = useCallback(async (shownThreadKeys: Set<string>) => {
        if (!email || !viewKey || loadingMoreRef.current || fetchingRef.current) return
        const page = Math.floor(shownThreadKeys.size / API_PAGE_LIMIT) + 1
        if (page < 2) return
        const key = viewKey
        loadingMoreRef.current = true
        setLoadingMore(true)
        try {
            const { data } = await API.getAllMailData(
                `?is_refresh=1&folder=${folder}&page=${page}&limit=${API_PAGE_LIMIT}`
            )
            if (!data.success) throw new Error("Error fetching emails")
            const { mails: results, meta } = readList(data.result)
            const normalized = results.map((m) => ({ ...m, folder }))
            const newThreads = normalized.filter((m) => !shownThreadKeys.has(threadKey(m))).length
            if (normalized.length > 0) await db.mails.bulkPut(normalized as any)
            // Last page reached, or nothing new came back (avoids re-requesting the same page)
            const lastPage = meta ? !meta.has_more : results.length < API_PAGE_LIMIT
            if (lastPage || newThreads === 0) {
                setExhausted((prev) => ({ ...prev, [key]: true }))
            }
        } catch (error) {
            // Not marked exhausted: scrolling to the bottom again retries
        } finally {
            loadingMoreRef.current = false
            setLoadingMore(false)
        }
    }, [email, viewKey, folder])

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

    // Folders whose "needs fetch" flag was already checked by this view
    const checkedKeysRef = useRef<Set<string>>(new Set())
    const [, rerender] = useReducer((n: number) => n + 1, 0)

    // Mirror into Zustand for other consumers (SpotToolbar select-all, actions). Cached
    // mails show at once; the API is called only when the cached list can't be trusted
    // (never fetched, marked stale, or too old: see db/mailbox-sync). New mail, moves and
    // read state are written to Dexie by the socket handlers, not refetched.
    useEffect(() => {
        if (!isReady || !all_emails || !viewKey || !email) return
        setAllEmails(all_emails)
        if (checkedKeysRef.current.has(viewKey)) return
        checkedKeysRef.current.add(viewKey)
        needsListFetch(email, folder).then((needed) => {
            if (needed) {
                storeInDB(1)
            } else {
                fetchedKeysRef.current.add(viewKey)
                rerender()
            }
        })
    }, [isReady, all_emails, viewKey, email, folder, setAllEmails, storeInDB])

    // Mail sent from another tab/device: refresh the Sent list when it is on screen
    useEffect(() => listenMailEvents((event: any) => {
        if (event?.type === 'message.sent' && folder.toLowerCase() === 'sent') storeInDB(1)
    }), [listenMailEvents, storeInDB, folder])

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

    // Group by thread key (same as the server), keep the latest message of each
    // thread, sort threads newest first. Mails without thread_id are their own thread.
    const sortedEmails = React.useMemo(() => {
        if (!all_emails || all_emails.length === 0) return []
        const time = (m: GetAllMailsPayload) => new Date(m.timestamp || m.created_at || 0).getTime()

        const latestByThread = new Map<string, GetAllMailsPayload>()
        for (const mail of all_emails) {
            const key = threadKey(mail)
            const current = latestByThread.get(key)
            if (!current || time(mail) > time(current)) latestByThread.set(key, mail)
        }
        return [...latestByThread.values()].sort((a, b) => time(b) - time(a))
    }, [all_emails])

    // ── Load more (infinite scroll by thread pages) ──
    const shownThreadKeys = React.useMemo(
        () => new Set(sortedEmails.map(threadKey)),
        [sortedEmails]
    )
    // A full page on screen and the server hasn't said "last page" yet
    const hasMore = !!viewKey && !exhausted[viewKey] && sortedEmails.length >= API_PAGE_LIMIT
    const sentinelRef = useRef<HTMLDivElement>(null)
    const loadMoreRef = useRef<() => void>(() => { })
    useEffect(() => {
        loadMoreRef.current = () => loadMore(shownThreadKeys)
    }, [loadMore, shownThreadKeys])

    useEffect(() => {
        const el = sentinelRef.current
        if (!hasMore || !el) return
        // Re-created when the list grows, so a still-visible sentinel
        // (short page / tall screen) triggers the next page too.
        const observer = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) loadMoreRef.current()
        })
        observer.observe(el)
        return () => observer.disconnect()
        // (not keyed on loadingMore: a failing request would retry in a tight loop)
    }, [hasMore, isReady, sortedEmails.length])

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
                {hasMore && (
                    <div
                        ref={sentinelRef}
                        className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground"
                    >
                        {loadingMore && (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Loading more…
                            </>
                        )}
                    </div>
                )}
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