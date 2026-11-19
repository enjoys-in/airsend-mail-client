"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Pill, Section } from "@/components/h-panel/kit"
import { FormFooter } from "../../../_components/settings-shell"
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
        <form onSubmit={handleSubmit} className="space-y-5">
            <Section
                title={isEditing ? "Edit relay" : "Add a relay"}
                description={isEditing ? "Update the relay configuration below." : "Configure Airsend as your SMTP relay server for outbound email routing."}
            >
                <div className="max-w-md space-y-1.5">
                    <Label htmlFor="relay-name">Relay name</Label>
                    <Input
                        id="relay-name"
                        placeholder="e.g. Primary Relay"
                        className="h-9"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        required
                    />
                </div>
            </Section>

            <Section title="Connection" description="Where the relay lives and how to sign in.">
                <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="relay-host">SMTP host</Label>
                            <Input
                                id="relay-host"
                                placeholder="relay.airsend.dev"
                                className="h-9"
                                value={form.host}
                                onChange={(e) => updateField("host", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="relay-port">Port</Label>
                            <Input
                                id="relay-port"
                                placeholder="587"
                                className="h-9"
                                value={form.port}
                                onChange={(e) => updateField("port", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="relay-auth">Auth method</Label>
                            <Select value={form.auth_method} onValueChange={(v) => updateField("auth_method", v as RelayConfig["auth_method"])}>
                                <SelectTrigger id="relay-auth" className="h-9">
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="relay-user">Username</Label>
                            <Input
                                id="relay-user"
                                placeholder="relay-user"
                                className="h-9"
                                value={form.username}
                                onChange={(e) => updateField("username", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="relay-pass">Password</Label>
                            <Input
                                id="relay-pass"
                                type="password"
                                placeholder="••••••••"
                                className="h-9"
                                value={form.password}
                                onChange={(e) => updateField("password", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 px-4 py-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="relay-secure">Secure connection</Label>
                            <p className="text-xs text-muted-foreground">Use SSL/TLS from the first byte (usually port 465).</p>
                        </div>
                        <Switch id="relay-secure" checked={form.secure} onCheckedChange={(v) => updateField("secure", v)} />
                    </div>
                </div>
            </Section>

            <Section title="Limits" description="Rate limiting and connection pool.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="relay-max-conn">Max connections</Label>
                        <Input
                            id="relay-max-conn"
                            type="number"
                            className="h-9"
                            value={form.max_connections}
                            onChange={(e) => updateField("max_connections", parseInt(e.target.value) || 0)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="relay-rate">Rate limit (emails per hour)</Label>
                        <Input
                            id="relay-rate"
                            type="number"
                            className="h-9"
                            value={form.rate_limit}
                            onChange={(e) => updateField("rate_limit", parseInt(e.target.value) || 0)}
                        />
                    </div>
                </div>
            </Section>

            <Section title="Allowed domains" description="Only these domains may relay through this server. Leave empty to allow all.">
                <div className="space-y-3">
                    <div className="flex max-w-md gap-2">
                        <Input
                            placeholder="example.com"
                            className="h-9"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())}
                        />
                        <Button type="button" variant="outline" size="sm" className="h-9 shrink-0" onClick={addDomain} aria-label="Add domain">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {form.allowed_domains.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {form.allowed_domains.map((d) => (
                                <Pill key={d} className="gap-1.5 py-1 pl-2.5 pr-1.5">
                                    {d}
                                    <button type="button" onClick={() => removeDomain(d)} aria-label={`Remove ${d}`} className="rounded-full p-0.5 hover:bg-foreground/10">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Pill>
                            ))}
                        </div>
                    )}
                </div>
            </Section>

            <FormFooter>
                {isEditing && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? "Update relay" : "Add relay"}
                </Button>
            </FormFooter>
        </form>
    )
}
