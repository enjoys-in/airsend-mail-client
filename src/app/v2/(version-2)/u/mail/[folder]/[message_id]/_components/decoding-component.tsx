"use client"
import { EncodedMessageResponse } from '@/lib/types/mail.interface'
import React from 'react'
import { MailIframe } from './mail-iframe'
import { useKeyStore } from '@/store/keys'
import { useMailStore } from '@/store/mails'
import PostalMime from "postal-mime"
import { decryptEncodedMail } from '@/lib/mail/load-raw-mail';
import FileAttachment from '../../../_components/file-attachment'
import { Separator } from '@/components/ui/separator'
import { findCalendarPart } from '@/lib/calendar/ics-invite'
import InviteCard from './invite-card'
import { detectOtp, notifyOtpDiscovered } from '@/lib/mail/otp-detector'
const DecodingComponent = ({ message_id, data }: { message_id: string, data: EncodedMessageResponse }) => {
    // Selectors only — subscribing to the whole store re-rendered the mail
    // iframe on every unrelated mail-store update (list sync, checkboxes, ...).
    const setEncryptedData = useKeyStore((s) => s.setEncryptedData)
    const [html, setHtml] = React.useState("");
    const [attachments, setAttachments] = React.useState<any[]>([]);
    // Calendar invitation (text/calendar part or .ics attachment), shown as a card
    const inviteIcs = React.useMemo(() => findCalendarPart(attachments), [attachments]);

    const handleDecryptiion = async (data: EncodedMessageResponse) => {
        try {
            const rawData = useMailStore.getState().rawData

            if (rawData[message_id]) {
                const email = await PostalMime.parse(rawData[message_id]);
                setAttachments(email.attachments);
                const detected = detectOtp(email.subject, email.text, email.html, email.from?.address);
                if (detected) notifyOtpDiscovered(message_id, detected);
                return setHtml(email.html! || "No HTML content");
            }


            const decrypted = await decryptEncodedMail(message_id, data);
            const email = await PostalMime.parse(decrypted);
            setAttachments(email.attachments);
            const detected = detectOtp(email.subject, email.text, email.html, email.from?.address);
            if (detected) notifyOtpDiscovered(message_id, detected);

            return setHtml(email.html! || "No HTML content");
        } catch (e) {
            return setHtml("Message could not be decrypted")
        }
    }
    React.useEffect(() => {
        setEncryptedData(data)
        handleDecryptiion(data)
    }, []);

    return (
        <div>

            {inviteIcs && <InviteCard ics={inviteIcs} />}
            <MailIframe html={html} />
            {
                attachments.length > 0 &&
                <>
                    <Separator className='border border-amber-200' />
                    <FileAttachment
                        attachments={attachments}
                        messageId={message_id}
                    />
                </>

            }
        </div>
    )
}

export default DecodingComponent