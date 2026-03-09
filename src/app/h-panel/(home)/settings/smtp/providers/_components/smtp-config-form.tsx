"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import type { SmtpConfig } from "./email-provider-form"

export interface SmtpConfigFormProps {
    providerId: string
    providerName?: string
    defaultValues?: {
        host?: string
        port?: string
        username?: string
        password?: string
        senderName?: string
        fromEmail?: string
        secure?: boolean
    }
    onSave: (providerId: string, config: SmtpConfig) => void
}

export function SmtpConfigForm({ providerId, providerName, defaultValues, onSave }: SmtpConfigFormProps) {
    const [host, setHost] = useState(defaultValues?.host || "")
    const [port, setPort] = useState(defaultValues?.port || "")
    const [username, setUsername] = useState(defaultValues?.username || "")
    const [password, setPassword] = useState(defaultValues?.password || "")
    const [senderName, setSenderName] = useState(defaultValues?.senderName || "")
    const [fromEmail, setFromEmail] = useState(defaultValues?.fromEmail || "")
    const [isSecure, setIsSecure] = useState(defaultValues?.secure || false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        setHost(defaultValues?.host || "")
        setPort(defaultValues?.port || "")
        setUsername(defaultValues?.username || "")
        setPassword(defaultValues?.password || "")
        setSenderName(defaultValues?.senderName || "")
        setFromEmail(defaultValues?.fromEmail || "")
        setIsSecure(defaultValues?.secure || false)
    }, [providerId, defaultValues])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 400))
            onSave(providerId, { host, port, username, password, senderName, fromEmail, secure: isSecure })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="rounded-none">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">
                    {providerName ? `${providerName} — SMTP Configuration` : "SMTP Configuration"}
                </CardTitle>
                <CardDescription>Configure the SMTP credentials for sending emails through this provider</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`${providerId}-host`}>SMTP Host</Label>
                            <Input id={`${providerId}-host`} placeholder="smtp.example.com" className="rounded-none" value={host} onChange={(e) => setHost(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`${providerId}-port`}>Port</Label>
                            <Input id={`${providerId}-port`} placeholder="587" className="rounded-none" value={port} onChange={(e) => setPort(e.target.value)} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`${providerId}-user`}>Username</Label>
                            <Input id={`${providerId}-user`} placeholder="your-username" className="rounded-none" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`${providerId}-pass`}>Password</Label>
                            <Input id={`${providerId}-pass`} type="password" placeholder="••••••••" className="rounded-none" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`${providerId}-sender`}>Sender Name</Label>
                            <Input id={`${providerId}-sender`} placeholder="Your Company" className="rounded-none" value={senderName} onChange={(e) => setSenderName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`${providerId}-from`}>From Email Address</Label>
                            <Input id={`${providerId}-from`} type="email" placeholder="no-reply@example.com" className="rounded-none" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} required />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Switch checked={isSecure} onCheckedChange={setIsSecure} />
                        <Label>Use Secure Connection (SSL/TLS)</Label>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                    <Button type="submit" size="sm" className="ml-auto rounded-none" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Configuration
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
