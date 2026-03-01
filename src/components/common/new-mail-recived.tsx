"use client"
import React, { useRef, } from "react";
import { decode } from "@msgpack/msgpack";
import { useSockets } from "@/hooks/useSockets";
import { SocketEventConstants } from "@/lib/sockets/socket-constants";
import { Loader2 } from "lucide-react";
import useAudio from "@/hooks/useAudio";
import { airsendDB } from "@/db";
import { GetAllMailsPayload } from "@/lib/types/mail.interface";
import { useMailStore } from '../../store/mails/index';
import { db } from "@/db";


const NewMailRecived = () => {
    const { socket } = useSockets()
    const audio = useAudio("/notification.mp3")
    // Use granular selector — only subscribe to what's needed
    const setAllEmails = useMailStore((s) => s.setAllEmails)
    const setAllMailbox = useMailStore((s) => s.setAllMailbox)

    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [hasNewMessage, setHasNewMessage] = React.useState(false);
    const [ogTitle, setOgTitle] = React.useState('');
    const [toggleTitle, setToggleTitle] = React.useState(false);
    const [isNewReceived, setIsNewReceived] = React.useState(false)
    React.useEffect(() => {
        setOgTitle(document.title)
        socket.on(SocketEventConstants.NEW_MAIL_RECEIVED, async (data: Uint8Array) => {          
            const obj = decode(data) as GetAllMailsPayload;
            // Ensure timestamp is always set
            if (!obj.timestamp) {
                obj.timestamp = obj.created_at || new Date().toISOString();
            }
            setIsNewReceived(true);
            setHasNewMessage(true);
            audio.play()

            // Store in IDB first
            await airsendDB.addItem("mails", obj)

            // Only prepend to the mail list if the incoming mail belongs
            // to the folder the user is currently viewing
            const currentFolder = useMailStore.getState().selected_mailbox
            if (currentFolder && obj.folder?.toLowerCase() === currentFolder.toLowerCase()) {
                const currentEmails = useMailStore.getState().all_emails
                setAllEmails([obj as any, ...(currentEmails || [])])
            }

            // Manually increment mailbox counts (+1 total, +1 unread) in Zustand + Dexie
            const mailFolder = (obj.folder || "INBOX").toUpperCase()
            const latestMailbox = useMailStore.getState().all_mailbox
            setAllMailbox(
                latestMailbox.map((m) =>
                    m.path?.toUpperCase() === mailFolder
                        ? {
                            ...m,
                            total_count: (m.total_count ?? 0) + 1,
                            unread_count: (m.unread_count ?? 0) + 1,
                        }
                        : m
                ) as any
            )
            // Also update Dexie cache
            db.mailboxes
                .where("path")
                .equalsIgnoreCase(obj.folder || "INBOX")
                .modify((mbox: any) => {
                    mbox.total_count = (mbox.total_count ?? 0) + 1
                    mbox.unread_count = (mbox.unread_count ?? 0) + 1
                })
                .catch(() => { })
        })
        const handleChangeToDefault = () => {
            if (document.visibilityState === 'visible') {
                setHasNewMessage(false);
                setIsNewReceived(false);
            }
        }

        document.addEventListener('visibilitychange', handleChangeToDefault);
        return () => {
            socket.off(SocketEventConstants.NEW_MAIL_RECEIVED);
            document.removeEventListener('visibilitychange', handleChangeToDefault)
        }
    }, [])

    React.useEffect(() => {
        if (hasNewMessage) {
            timeoutRef.current = setTimeout(() => {
                setIsNewReceived(false)
            }, 2000)
            const interval = setInterval(() => {
                setToggleTitle((prev) => !prev);
            }, 1000);

            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current)
                }
                clearInterval(interval);
            }
        } else {
            document.title = ogTitle;
        }
    }, [hasNewMessage]);

    React.useEffect(() => {
        if (hasNewMessage) {
            document.title = toggleTitle ? "1 New Mail" : ogTitle;
        }
    }, [toggleTitle]);

    return isNewReceived ? <div className="fixed bottom-5 right-2">
        <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-emerald-700" >
            <Loader2 className="-ms-1 me-1.5 h-4 w-4 animate-spin" />
            <p className="whitespace-nowrap text-sm">New Mail Received</p>
        </span>
    </div> : null

}

export default NewMailRecived