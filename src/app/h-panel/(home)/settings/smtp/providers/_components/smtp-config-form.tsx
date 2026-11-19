"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { Section } from "@/components/h-panel/kit"
import { FormFooter } from "../../../_components/settings-shell"
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
        <Section
            title={providerName ? `${providerName} SMTP configuration` : "SMTP configuration"}
            description="Credentials used to send email through this provider."
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
                    <div className="space-y-1.5">
                        <Label htmlFor={`${providerId}-host`}>SMTP host</Label>
                        <Input id={`${providerId}-host`} placeholder="smtp.example.com" className="h-9" value={host} onChange={(e) => setHost(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor={`${providerId}-port`}>Port</Label>
                        <Input id={`${providerId}-port`} placeholder="587" className="h-9" value={port} onChange={(e) => setPort(e.target.value)} required />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor={`${providerId}-user`}>Username</Label>
                        <Input id={`${providerId}-user`} placeholder="your-username" className="h-9" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor={`${providerId}-pass`}>Password</Label>
                        <Input id={`${providerId}-pass`} type="password" placeholder="••••••••" className="h-9" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor={`${providerId}-sender`}>Sender name</Label>
                        <Input id={`${providerId}-sender`} placeholder="Your Company" className="h-9" value={senderName} onChange={(e) => setSenderName(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor={`${providerId}-from`}>From email address</Label>
                        <Input id={`${providerId}-from`} type="email" placeholder="no-reply@example.com" className="h-9" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} required />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 px-4 py-3">
                    <div className="space-y-0.5">
                        <Label htmlFor={`${providerId}-secure`}>Secure connection</Label>
                        <p className="text-xs text-muted-foreground">Use SSL/TLS from the first byte (usually port 465).</p>
                    </div>
                    <Switch id={`${providerId}-secure`} checked={isSecure} onCheckedChange={setIsSecure} />
                </div>

                <FormFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save configuration
                    </Button>
                </FormFooter>
            </form>
        </Section>
    )
}
