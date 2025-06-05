"use client"
import React, { useRef, } from "react";
import { decode } from "@msgpack/msgpack";
import { useSockets } from "@/hooks/useSockets";
import { SocketEventConstants } from "@/lib/sockets/socket-constants";
import { Loader2 } from "lucide-react";
import useAudio from "@/hooks/useAudio";
import { triggerNotification } from "@/lib/helper";
import { airsendDB } from "@/db";
import { BaseMailData, MailData } from "@/lib/types/mail.interface";
import { useMailStore } from '../../store/mails/index';

const NewMailRecived = () => {
    const { socket } = useSockets()
    const audio = useAudio("/notification.mp3")
    const { all_emails, setAllEmails } = useMailStore()


    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [hasNewMessage, setHasNewMessage] = React.useState(false);
    const [ogTitle, setOgTitle] = React.useState('');
    const [toggleTitle, setToggleTitle] = React.useState(false);
    const [isNewReceived, setIsNewReceived] = React.useState(false)
    React.useEffect(() => {
        setOgTitle(document.title)
        socket.on(SocketEventConstants.NEW_MAIL_RECEIVED, async (data: Uint8Array) => {
            const obj = decode(data) as BaseMailData;
            setIsNewReceived(true);
            setHasNewMessage(true);
            audio.play()
            setAllEmails([obj as any, ...(all_emails || [])])

            if (document.hidden) {
                triggerNotification("New Mail", { body: `You recieved a new mail from ${obj.from}`, })
            }
            await airsendDB.addItem("mails", { ...obj, synced: false })
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