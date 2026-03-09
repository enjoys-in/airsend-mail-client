"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, X, Loader2, Server } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { RelayConfig } from "../page"

interface RelayFormProps {
    editingRelay: RelayConfig | null
    onSave: (relay: RelayConfig) => void
    onCancel: () => void
}

const EMPTY_RELAY: Omit<RelayConfig, "id" | "created_at"> = {
    name: "",
    host: "",
    port: "587",
    username: "",
    password: "",
    secure: false,
    auth_method: "plain",
    allowed_domains: [],
    max_connections: 10,
    rate_limit: 100,
    enabled: true,
}

export function RelayForm({ editingRelay, onSave, onCancel }: RelayFormProps) {
    const { toast } = useToast()
    const [form, setForm] = useState(EMPTY_RELAY)
    const [newDomain, setNewDomain] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (editingRelay) {
            const { id, created_at, ...rest } = editingRelay
            setForm(rest)
        } else {
            setForm(EMPTY_RELAY)
        }
    }, [editingRelay])

    const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const addDomain = () => {
        const trimmed = newDomain.trim().toLowerCase()
        if (!trimmed) return
        if (form.allowed_domains.includes(trimmed)) return
        updateField("allowed_domains", [...form.allowed_domains, trimmed])
        setNewDomain("")
    }

    const removeDomain = (domain: string) => {
        updateField("allowed_domains", form.allowed_domains.filter((d) => d !== domain))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim() || !form.host.trim() || !form.username.trim()) {
            toast({ variant: "destructive", title: "Error", description: "Name, host, and username are required." })
            return
        }
        setSubmitting(true)
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 400))
            const relay: RelayConfig = {
                ...form,
                id: editingRelay?.id || crypto.randomUUID(),
                created_at: editingRelay?.created_at || new Date().toISOString(),
            }
            onSave(relay)
            setForm(EMPTY_RELAY)
            setNewDomain("")
            toast({ title: editingRelay ? "Relay updated" : "Relay created" })
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Failed to save relay configuration." })
        } finally {
            setSubmitting(false)
        }
    }

    const isEditing = !!editingRelay

    return (
        <Card className="rounded-none">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">{isEditing ? "Edit Relay" : "Add New Relay"}</CardTitle>
                </div>
                <CardDescription>
                    {isEditing
                        ? "Update the relay configuration below"
                        : "Configure Airsend as your SMTP relay server for outbound email routing"}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="relay-name">Relay Name</Label>
                        <Input
                            id="relay-name"
                            placeholder="e.g. Primary Relay"
                            className="rounded-none"
                            value={form.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            required
                        />
                    </div>

                    <Separator />

                    {/* Connection */}
                    <div>
                        <p className="text-sm font-medium mb-3">Connection Settings</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="relay-host">SMTP Host</Label>
                                <Input
                                    id="relay-host"
                                    placeholder="relay.airsend.dev"
                                    className="rounded-none"
                                    value={form.host}
                                    onChange={(e) => updateField("host", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="relay-port">Port</Label>
                                <Input
                                    id="relay-port"
                                    placeholder="587"
                                    className="rounded-none"
                                    value={form.port}
                                    onChange={(e) => updateField("port", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="relay-auth">Auth Method</Label>
                                <Select value={form.auth_method} onValueChange={(v) => updateField("auth_method", v as RelayConfig["auth_method"])}>
                                    <SelectTrigger id="relay-auth" className="rounded-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="plain">PLAIN</SelectItem>
                                        <SelectItem value="login">LOGIN</SelectItem>
                                        <SelectItem value="cram-md5">CRAM-MD5</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Credentials */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="relay-user">Username</Label>
                            <Input
                                id="relay-user"
                                placeholder="relay-user"
                                className="rounded-none"
                                value={form.username}
                                onChange={(e) => updateField("username", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="relay-pass">Password</Label>
                            <Input
                                id="relay-pass"
                                type="password"
                                placeholder="••••••••"
                                className="rounded-none"
                                value={form.password}
                                onChange={(e) => updateField("password", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Switch checked={form.secure} onCheckedChange={(v) => updateField("secure", v)} />
                        <Label>Use Secure Connection (SSL/TLS)</Label>
                    </div>

                    <Separator />

                    {/* Limits */}
                    <div>
                        <p className="text-sm font-medium mb-3">Rate Limiting & Connections</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="relay-max-conn">Max Connections</Label>
                                <Input
                                    id="relay-max-conn"
                                    type="number"
                                    className="rounded-none"
                                    value={form.max_connections}
                                    onChange={(e) => updateField("max_connections", parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="relay-rate">Rate Limit (emails/hr)</Label>
                                <Input
                                    id="relay-rate"
                                    type="number"
                                    className="rounded-none"
                                    value={form.rate_limit}
                                    onChange={(e) => updateField("rate_limit", parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Allowed Domains */}
                    <div className="space-y-2">
                        <Label>Allowed Domains</Label>
                        <p className="text-xs text-muted-foreground">Only these domains will be permitted to relay through this server. Leave empty to allow all.</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="example.com"
                                className="rounded-none"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())}
                            />
                            <Button type="button" variant="outline" size="sm" className="rounded-none shrink-0" onClick={addDomain}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {form.allowed_domains.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {form.allowed_domains.map((d) => (
                                    <Badge key={d} variant="secondary" className="gap-1 rounded-none">
                                        {d}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeDomain(d)} />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2 justify-end border-t pt-4">
                    {isEditing && (
                        <Button type="button" variant="outline" size="sm" className="rounded-none" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" size="sm" className="rounded-none" disabled={submitting}>
                        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {isEditing ? "Update Relay" : "Add Relay"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
