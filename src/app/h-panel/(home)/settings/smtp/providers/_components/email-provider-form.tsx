"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SmtpConfigForm } from "./smtp-config-form"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, CheckCircle2 } from "lucide-react"
import { SavedProviders } from "./saved-providers"
import { useToast } from "@/components/ui/use-toast"

export type SmtpConfig = {
    host: string
    port: string
    username: string
    password: string
    senderName: string
    fromEmail: string
    secure: boolean
}

export type EmailProvider = {
    id: string
    name: string
    defaultConfig?: {
        host?: string
        port?: string
        secure?: boolean
    }
}

export type SavedProvidersType = {
    [key: string]: SmtpConfig
}

const EMAIL_PROVIDERS: EmailProvider[] = [
    { id: "gmail", name: "Gmail", defaultConfig: { host: "smtp.gmail.com", port: "587", secure: false } },
    { id: "outlook", name: "Outlook", defaultConfig: { host: "smtp.office365.com", port: "587", secure: false } },
    { id: "sendgrid", name: "SendGrid", defaultConfig: { host: "smtp.sendgrid.net", port: "587", secure: false } },
    { id: "mailchimp", name: "Mailchimp", defaultConfig: { host: "smtp.mandrillapp.com", port: "587", secure: false } },
    { id: "sendinblue", name: "Sendinblue", defaultConfig: { host: "smtp-relay.sendinblue.com", port: "587", secure: false } },
    { id: "twilio", name: "Twilio (SES)", defaultConfig: { host: "email-smtp.us-east-1.amazonaws.com", port: "587", secure: false } },
    { id: "mailgun", name: "Mailgun", defaultConfig: { host: "smtp.mailgun.org", port: "587", secure: false } },
    { id: "brevo", name: "Brevo", defaultConfig: { host: "smtp-relay.brevo.com", port: "587", secure: false } },
    { id: "resend", name: "Resend", defaultConfig: { host: "smtp.resend.com", port: "465", secure: true } },
]

function SortableProvider({
    provider,
    index,
    isActive,
    isConfigured,
    isEditing,
    onToggle,
    onClick,
}: {
    provider: EmailProvider
    index: number
    isActive: boolean
    isConfigured: boolean
    isEditing: boolean
    onToggle: () => void
    onClick: () => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: provider.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between py-2.5 px-2 group border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${isEditing ? "bg-muted/50" : ""}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-2 min-w-0">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground w-4 shrink-0">#{index + 1}</span>
                <Label className="cursor-pointer text-sm truncate">{provider.name}</Label>
                {isConfigured && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                {isActive && !isConfigured && (
                    <Badge variant="outline" className="text-xs rounded-none">Pending</Badge>
                )}
                <Switch checked={isActive} onCheckedChange={onToggle} />
            </div>
        </div>
    )
}

export function EmailProviderForm() {
    const { toast } = useToast()
    const [activeProviders, setActiveProviders] = useState<string[]>([])
    const [currentEditingProvider, setCurrentEditingProvider] = useState<string | null>(null)
    const [providerOrder, setProviderOrder] = useState<string[]>(EMAIL_PROVIDERS.map((p) => p.id))
    const [savedProviders, setSavedProviders] = useState<SavedProvidersType>({})

    useEffect(() => {
        const savedData = localStorage.getItem("emailProviderPreferences")
        const savedOrder = localStorage.getItem("emailProviderOrder")
        if (savedData) {
            try {
                const data = JSON.parse(savedData)
                setSavedProviders(data)
                setActiveProviders(Object.keys(data))
            } catch { /* ignore */ }
        }
        if (savedOrder) {
            try {
                const order = JSON.parse(savedOrder)
                if (Array.isArray(order)) setProviderOrder(order)
            } catch { /* ignore */ }
        }
    }, [])

    const persist = useCallback((providers: SavedProvidersType, order: string[]) => {
        localStorage.setItem("emailProviderPreferences", JSON.stringify(providers))
        localStorage.setItem("emailProviderOrder", JSON.stringify(order))
    }, [])

    const handleToggle = (providerId: string) => {
        if (activeProviders.includes(providerId)) {
            setActiveProviders((prev) => prev.filter((id) => id !== providerId))
            if (currentEditingProvider === providerId) setCurrentEditingProvider(null)
        } else {
            setActiveProviders((prev) => [...prev, providerId])
            setCurrentEditingProvider(providerId)
        }
    }

    const handleSaveConfig = (providerId: string, config: SmtpConfig) => {
        const updated = { ...savedProviders, [providerId]: config }
        setSavedProviders(updated)
        persist(updated, providerOrder)
        toast({ title: "Provider saved", description: `${EMAIL_PROVIDERS.find((p) => p.id === providerId)?.name} configuration saved.` })
    }

    const handleDeleteConfig = (providerId: string) => {
        const updated = { ...savedProviders }
        delete updated[providerId]
        setSavedProviders(updated)
        setActiveProviders((prev) => prev.filter((id) => id !== providerId))
        if (currentEditingProvider === providerId) setCurrentEditingProvider(null)
        persist(updated, providerOrder)
    }

    const handleEditProvider = (providerId: string) => {
        setCurrentEditingProvider(providerId)
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = providerOrder.indexOf(active.id as string)
        const newIndex = providerOrder.indexOf(over.id as string)
        const newOrder = arrayMove(providerOrder, oldIndex, newIndex)
        setProviderOrder(newOrder)
        persist(savedProviders, newOrder)
    }

    const orderedProviders = [...EMAIL_PROVIDERS].sort(
        (a, b) => providerOrder.indexOf(a.id) - providerOrder.indexOf(b.id),
    )

    const selectedProviderConfig = EMAIL_PROVIDERS.find((p) => p.id === currentEditingProvider)?.defaultConfig
    const savedConfig = currentEditingProvider ? savedProviders[currentEditingProvider] : undefined

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
                {/* Provider list with drag & drop */}
                <div className="space-y-4">
                    <Card className="rounded-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Email Providers</CardTitle>
                            <CardDescription className="text-xs">
                                Toggle providers on/off and drag to set priority order. The top provider (#1) is used first.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={providerOrder} strategy={verticalListSortingStrategy}>
                                    <div>
                                        {orderedProviders.map((provider, index) => (
                                            <SortableProvider
                                                key={provider.id}
                                                provider={provider}
                                                index={index}
                                                isActive={activeProviders.includes(provider.id)}
                                                isConfigured={!!savedProviders[provider.id]}
                                                isEditing={currentEditingProvider === provider.id}
                                                onToggle={() => handleToggle(provider.id)}
                                                onClick={() => {
                                                    if (activeProviders.includes(provider.id)) {
                                                        setCurrentEditingProvider(provider.id)
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </CardContent>
                    </Card>

                    {/* Priority summary */}
                    {activeProviders.length > 0 && (
                        <Card className="rounded-none">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Send Priority</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1.5">
                                    {orderedProviders
                                        .filter((p) => activeProviders.includes(p.id))
                                        .map((p, i) => (
                                            <Badge key={p.id} variant={savedProviders[p.id] ? "default" : "outline"} className="text-xs rounded-none">
                                                {i + 1}. {p.name}
                                            </Badge>
                                        ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Emails are sent using the highest-priority provider. If it fails, the next provider is tried.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* SMTP Config form */}
                <div>
                    {currentEditingProvider ? (
                        <SmtpConfigForm
                            key={currentEditingProvider}
                            providerId={currentEditingProvider}
                            providerName={EMAIL_PROVIDERS.find((p) => p.id === currentEditingProvider)?.name || currentEditingProvider}
                            defaultValues={{ ...selectedProviderConfig, ...savedConfig }}
                            onSave={handleSaveConfig}
                        />
                    ) : (
                        <Card className="rounded-none">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <p className="text-sm text-muted-foreground">Toggle a provider on and click it to configure SMTP settings.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Saved providers overview */}
            {Object.keys(savedProviders).length > 0 && (
                <SavedProviders
                    providers={savedProviders}
                    providerOrder={providerOrder}
                    providerInfo={EMAIL_PROVIDERS}
                    onEdit={handleEditProvider}
                    onDelete={handleDeleteConfig}
                />
            )}
        </div>
    )
}
