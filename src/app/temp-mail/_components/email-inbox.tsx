"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Inbox, RefreshCw, Copy, ArrowLeft, } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { format } from "date-fns"
import EmailContent from "./email-content"
import { useSockets } from "@/hooks/useSockets"
import { SocketEventConstants } from "@/lib/sockets/socket-constants"
import { BaseMailData } from "@/lib/types/mail.interface"
import { decode } from "@msgpack/msgpack"
import useAudio from "@/hooks/useAudio"
import { airsendDB } from "@/db"
import { API } from "@/lib/api/handler"
import { Alert } from "@/components/ui/alert"
import { MailIframe } from "@/components/common/mail-iframe"



interface EmailInboxProps {
    emailAddress: string
    onReset: () => void
}

export default function EmailInbox({ emailAddress, onReset }: EmailInboxProps) {
    const { socket } = useSockets()
    const audio = useAudio("/notification.mp3")

    const [emails, setEmails] = useState<BaseMailData[]>([])
    const [selectedEmail, setSelectedEmail] = useState<BaseMailData | null>(null)
    const [isCopied, setIsCopied] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [newMail, setNewMail] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(emailAddress)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    const refreshMailbox = async () => {
        try {
            setIsRefreshing(true)
            const { data } = await API.getTempMails(`?email=${emailAddress}`)
            if (!data.success) {
                throw new Error(data.message)
            }


            await airsendDB.bulkAddItems("temp_mails", data.result)

            setEmails([...emails, ...data.result as any[]] as BaseMailData[])
            setIsRefreshing(false)
        } catch (error) {
            setIsRefreshing(false)
        }
    }
    const fetchMailWithId = async (message_id: string) => {
        try {
            const mails = await airsendDB.getItemByKey("temp_mails", message_id as string)
            if (mails && mails.synced) {
                setSelectedEmail(mails as any)
                return
            }
            setIsRefreshing(true)
            const { data } = await API.getTempMails(`/${message_id}?email=${emailAddress}`)
            if (!data.success) {
                throw new Error(data.message)
            }
            await airsendDB.updateItem("temp_mails", message_id as string, { ...data.result, synced: true })
            setSelectedEmail(data.result)
            setIsRefreshing(false)
        } catch (error) {
            setIsRefreshing(false)
        }
    }



    useEffect(() => {
        let timer: NodeJS.Timeout

        socket.on(SocketEventConstants.NEW_MAIL_RECEIVED, async (data: Uint8Array) => {
            const obj = decode(data) as BaseMailData;
            audio.play()
            setEmails((emails) => [...emails, obj])
            await airsendDB.addItem("temp_mails", { ...obj, synced: false })
            setNewMail(true)
            timer = setTimeout(() => {
                setNewMail(false)
            }, 2500);
        })

        socket.emit(SocketEventConstants.REGISTER_CLIENT, emailAddress)

        return () => {
            socket.off(SocketEventConstants.REGISTER_CLIENT);
            socket.off(SocketEventConstants.NEW_MAIL_RECEIVED);
            clearTimeout(timer)
        }
    }, [socket])
    useEffect(() => {
        airsendDB.getItemsByIndex("temp_mails", "to", emailAddress as string).then((data) => {
            if (data) {
                setEmails([...data as any[]] as BaseMailData[])
            }
        })
    }, [])

    return (
        <div className="space-y-4 ">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={onReset}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-xl font-semibold">Your Temporary Mailbox</h2>
                </div>
                <Button variant="outline" onClick={refreshMailbox} disabled={isRefreshing} className="flex items-center gap-2">
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>
            {newMail && <Alert variant="default" className="mb-4 rounded-none">New Mail Received</Alert>}

            <Card className="p-4 flex items-center justify-between bg-muted/50" onClick={copyToClipboard} >
                <Badge className="font-lg truncate cursor-pointer">{emailAddress}</Badge>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Copy className="h-4 w-4" />
                    {isCopied ? "Copied!" : "Copy"}
                </Button>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
                <Card className="col-span-1 overflow-hidden">
                    <ScrollArea className="h-[600px]">
                        <div className="p-1">
                            {emails.length > 0 ? (
                                emails.map((email) => (
                                    <div key={email.message_id}>
                                        <div
                                            className={`p-3 cursor-pointer hover:bg-muted/50 rounded-md ${selectedEmail?.message_id === email.message_id ? "bg-muted" : ""} ${!email.synced ? "font-medium" : ""}`}
                                            onClick={() => {
                                                setSelectedEmail(email)
                                                fetchMailWithId(email.message_id)
                                            }}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8 text-xs">
                                                        <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center">
                                                            {email.from.charAt(0).toUpperCase()}
                                                        </div>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-sm">{email.from}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {format(email.timestamp as string, "MMM d, h:mm a")}
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="text-sm font-medium truncate">Subject: {email.subject}</div>

                                        </div>
                                        <Separator className="my-1" />
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <Inbox className="h-10 w-10 text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No emails found</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Card>

                <Card className="col-span-2 overflow-hidden">
                    {selectedEmail ? (
                        <div className="h-[600px] flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h3 className="text-lg font-semibold">{selectedEmail.subject}</h3>
                            </div>
                            <div className="p-4 border-b">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center">
                                            {selectedEmail.from.charAt(0).toUpperCase()}
                                        </div>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{selectedEmail.from}</div>
                                        <div className="text-sm text-muted-foreground">{selectedEmail.from}</div>
                                    </div>
                                    <div className="ml-auto text-sm text-muted-foreground">{format(selectedEmail.timestamp as string, "PPP p")}</div>
                                </div>
                            </div>
                            <ScrollArea className="flex-1 p-4">
                                <div className="h-fit w-full p-0">
                                    {selectedEmail.html ? (
                                        <MailIframe html={selectedEmail.html as string} senderEmail={selectedEmail.from} />
                                    ) : (
                                        <div
                                            className="flex h-[500px] w-full items-center justify-center"
                                            style={{ minHeight: '500px' }}
                                        >
                                            <div className="bg-secondary h-32 w-32 animate-pulse rounded-full" />
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    ) : (
                        <div className="h-[600px] flex flex-col items-center justify-center text-center p-4">
                            <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No messages yet</h3>
                            <p className="text-muted-foreground mt-1 max-w-md">New emails will appear here when they arrive
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}

