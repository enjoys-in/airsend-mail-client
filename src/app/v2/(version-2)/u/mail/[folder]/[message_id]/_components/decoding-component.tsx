"use client"
import { EncodedMessageResponse } from '@/lib/types/mail.interface'
import React from 'react'
import { MailIframe } from './mail-iframe'
import { useKeyStore } from '@/store/keys'
import { useMailStore } from '@/store/mails'
import PostalMime from "postal-mime"
import { Security } from '@/lib/security';
import { DecryptEncryptedMail } from '@/lib/pgp-service';
import FileAttachment from '../../../_components/file-attachment'
import { Separator } from '@/components/ui/separator'
const s = new Security()
const DecodingComponent = ({ message_id, data }: { message_id: string, data: EncodedMessageResponse }) => {
    const { setEncryptedData } = useKeyStore()
    const { rawData, setRawData } = useMailStore()
    const [html, setHtml] = React.useState("");
    const [attachments, setAttachments] = React.useState<any[]>([]);

    const handleDecryptiion = async (data: EncodedMessageResponse) => {
        try {


            if (rawData[message_id]) {
                const email = await PostalMime.parse(rawData[message_id]);
                setAttachments(email.attachments)
                return setHtml(email.html! || "No HTML content")
            }


            const decrypted = await DecryptEncryptedMail({
                encrypted: s.decryptAES(data.chiper_text),
                privateKeyArmored: s.decryptAES(data.open_pgp.privateKey),
                publicKeyArmored: s.decryptAES(data.open_pgp.publicKey),
                password: data.k
            })
            const email = await PostalMime.parse(decrypted);
            setAttachments(email.attachments)
            setRawData({ ...rawData, [message_id]: decrypted })

            return setHtml(email.html! || "No HTML content")
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