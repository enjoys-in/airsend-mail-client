"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { SmtpConfig } from "./email-provider-form"

export interface SmtpConfigFormProps {
  providerId: string
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

export function SmtpConfigForm({ providerId, defaultValues, onSave }: SmtpConfigFormProps) {
  const [host, setHost] = useState(defaultValues?.host || "")
  const [port, setPort] = useState(defaultValues?.port || "")
  const [username, setUsername] = useState(defaultValues?.username || "")
  const [password, setPassword] = useState(defaultValues?.password || "")
  const [senderName, setSenderName] = useState(defaultValues?.senderName || "")
  const [fromEmail, setFromEmail] = useState(defaultValues?.fromEmail || "")
  const [isSecure, setIsSecure] = useState(defaultValues?.secure || false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Create config object
    const config: SmtpConfig = {
      host,
      port,
      username,
      password,
      senderName,
      fromEmail,
      secure: isSecure,
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Save the configuration
    onSave(providerId, config)

    setIsSubmitting(false)
    setSuccess(true)

    // Reset success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMTP Configuration</CardTitle>
        <CardDescription>Configure your SMTP settings for sending emails</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4" >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input
                id="smtp-host"
                placeholder="smtp.example.com"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="rounded-none"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">Port</Label>
              <Input id="smtp-port" placeholder="587" value={port} onChange={(e) => setPort(e.target.value)} required />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="your-username"
                value={username}
                className="rounded-none"

                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                className="rounded-none"

                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sender-name">Sender Name</Label>
              <Input
                id="sender-name"
                placeholder="Your Company"
                value={senderName}
                className="rounded-none"

                onChange={(e) => setSenderName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-email">From Email Address</Label>
              <Input
                id="from-email"
                type="email"
                className="rounded-none"

                placeholder="no-reply@example.com"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="is-secure" checked={isSecure} onCheckedChange={setIsSecure} />
            <Label htmlFor="is-secure">Use Secure Connection (SSL/TLS)</Label>
          </div>

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>SMTP configuration saved successfully!</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="ml-auto">
            {isSubmitting ? "Saving..." : "Save Configuration"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

