"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SmtpConfigForm } from "./smtp-config-form"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { SavedProviders } from "./saved-providers"

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
    {
        id: "gmail",
        name: "Gmail",
        defaultConfig: {
            host: "smtp.gmail.com",
            port: "587",
            secure: false,
        },
    },
    {
        id: "outlook",
        name: "Outlook",
        defaultConfig: {
            host: "smtp.office365.com",
            port: "587",
            secure: false,
        },
    },
    {
        id: "sendgrid",
        name: "SendGrid",
        defaultConfig: {
            host: "smtp.sendgrid.net",
            port: "587",
            secure: false,
        },
    },
    {
        id: "mailchimp",
        name: "Mailchimp",
        defaultConfig: {
            host: "smtp.mandrillapp.com",
            port: "587",
            secure: false,
        },
    },
    {
        id: "sendinblue",
        name: "Sendinblue",
        defaultConfig: {
            host: "smtp-relay.sendinblue.com",
            port: "587",
            secure: false,
        },
    },
    {
        id: "twilio",
        name: "Twilio",
        defaultConfig: {
            host: "email-smtp.us-east-1.amazonaws.com",
            port: "587",
            secure: false,
        },
    },
    {
        id: "mailgun",
        name: "Mailgun",
        defaultConfig: {
            host: "smtp.mailgun.org",
            port: "587",
            secure: false,
        },
    },
    {
        id: "brevo",
        name: "Brevo",
        defaultConfig: {
            host: "smtp-relay.brevo.com",
            port: "587",
            secure: false,
        },
    },
    {
        id: "resend",
        name: "Resend",
        defaultConfig: {
            host: "smtp.resend.com",
            port: "465",
            secure: true,
        },
    },
]

function SortableProvider({
    provider,
    isActive,
    onToggle,
}: {
    provider: EmailProvider
    isActive: boolean
    onToggle: () => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: provider.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div ref={setNodeRef} style={style} className="flex items-center justify-between py-2 group">
            <div className="flex items-center gap-2">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <Label htmlFor={`provider-${provider.id}`} className="cursor-pointer">
                    {provider.name}
                </Label>
            </div>
            <Switch id={`provider-${provider.id}`} checked={isActive} onCheckedChange={onToggle} />
        </div>
    )
}

export function EmailProviderForm() {
    const [activeProviders, setActiveProviders] = useState<string[]>([])
    const [currentEditingProvider, setCurrentEditingProvider] = useState<string | null>(null)
    const [providerOrder, setProviderOrder] = useState<string[]>(EMAIL_PROVIDERS.map((p) => p.id))
    const [savedProviders, setSavedProviders] = useState<SavedProvidersType>({})

    // Initialize from localStorage if available
    useEffect(() => {
        const savedData = localStorage.getItem("emailProviderPreferences")
        if (savedData) {
            try {
                const data = JSON.parse(savedData)
                setSavedProviders(data)
                setActiveProviders(Object.keys(data))
            } catch (e) {
                console.error("Failed to parse saved preferences", e)
            }
        }
    }, [])

    // Save to localStorage when preferences change
    useEffect(() => {
        if (Object.keys(savedProviders).length > 0) {
            localStorage.setItem("emailProviderPreferences", JSON.stringify(savedProviders))
        }
    }, [savedProviders])

    const handleToggle = (providerId: string) => {
        if (activeProviders.includes(providerId)) {
            setActiveProviders(activeProviders.filter((id) => id !== providerId))
            if (currentEditingProvider === providerId) {
                setCurrentEditingProvider(null)
            }
        } else {
            setActiveProviders([...activeProviders, providerId])
            setCurrentEditingProvider(providerId)
        }
    }

    const handleSaveConfig = (providerId: string, config: SmtpConfig) => {
        setSavedProviders({
            ...savedProviders,
            [providerId]: config,
        })
    }

    const handleDeleteConfig = (providerId: string) => {
        const newSavedProviders = { ...savedProviders }
        delete newSavedProviders[providerId]
        setSavedProviders(newSavedProviders)
        setActiveProviders(activeProviders.filter((id) => id !== providerId))
        if (currentEditingProvider === providerId) {
            setCurrentEditingProvider(null)
        }
    }

    const handleEditProvider = (providerId: string) => {
        setCurrentEditingProvider(providerId)
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    const handleDragEnd = (event: any) => {
        const { active, over } = event

        if (active.id !== over.id) {
            const oldIndex = providerOrder.indexOf(active.id)
            const newIndex = providerOrder.indexOf(over.id)

            const newOrder = [...providerOrder]
            newOrder.splice(oldIndex, 1)
            newOrder.splice(newIndex, 0, active.id)

            setProviderOrder(newOrder)
        }
    }

    const orderedProviders = [...EMAIL_PROVIDERS].sort((a, b) => {
        return providerOrder.indexOf(a.id) - providerOrder.indexOf(b.id)
    })

    const selectedProviderConfig = EMAIL_PROVIDERS.find((p) => p.id === currentEditingProvider)?.defaultConfig
    const savedConfig = currentEditingProvider ? savedProviders[currentEditingProvider] : undefined

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-[300px_1fr] gap-6">
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Providers</CardTitle>
                            <CardDescription>Select and reorder your email service providers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={providerOrder} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-1">
                                        {orderedProviders.map((provider) => (
                                            <SortableProvider
                                                key={provider.id}
                                                provider={provider}
                                                isActive={activeProviders.includes(provider.id)}
                                                onToggle={() => handleToggle(provider.id)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </CardContent>
                    </Card>
                </div>

                {currentEditingProvider && (
                    <SmtpConfigForm
                        providerId={currentEditingProvider}
                        defaultValues={{
                            ...selectedProviderConfig,
                            ...savedConfig,
                        }}
                        onSave={handleSaveConfig}
                    />
                )}
            </div>

            {Object.keys(savedProviders).length > 0 && (
                <SavedProviders
                    providers={savedProviders}
                    providerInfo={EMAIL_PROVIDERS}
                    onEdit={handleEditProvider}
                    onDelete={handleDeleteConfig}
                />
            )}
        </div>
    )
}

