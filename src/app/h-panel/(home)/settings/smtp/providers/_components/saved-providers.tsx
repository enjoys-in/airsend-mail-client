"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import type { EmailProvider, SavedProvidersType } from "./email-provider-form"

interface SavedProvidersProps {
  providers: SavedProvidersType
  providerInfo: EmailProvider[]
  onEdit: (providerId: string) => void
  onDelete: (providerId: string) => void
}

export function SavedProviders({ providers, providerInfo, onEdit, onDelete }: SavedProvidersProps) {
  const getProviderName = (id: string) => {
    return providerInfo.find((p) => p.id === id)?.name || id
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Email Providers</CardTitle>
        <CardDescription>Your configured email providers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(providers).map(([id, config]) => (
            <div key={id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{getProviderName(id)}</h3>
                  <Badge variant="outline">{id}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {config.fromEmail} • {config.host}:{config.port}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(id)}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

