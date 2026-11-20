"use client"

import { Globe, Plus, Trash2 } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"
import { EmptyState, PageHeader, PageShell, Pill, Section, Stat, StatGrid } from "@/components/h-panel/kit"

export interface CorsOrigin {
  id: string
  origin: string
  is_active: boolean
  created_at: string
  protected: boolean
}

function errorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message || (error instanceof Error ? error.message : fallback)
}

function kindOf(origin: string): { label: string; tone: "violet" | "blue" | "green" } {
  if (origin.includes("*.")) return { label: "Wildcard", tone: "violet" }
  if (origin.startsWith("http://")) return { label: "Local dev", tone: "blue" }
  return { label: "Exact", tone: "green" }
}

export function CorsOrigins({ initial }: { initial: CorsOrigin[] }) {
  const { toast } = useToast()
  const [items, setItems] = useState(initial)
  const [value, setValue] = useState("")
  const [adding, setAdding] = useState(false)
  const [formError, setFormError] = useState("")

  const activeCount = useMemo(() => items.filter((item) => item.is_active).length, [items])

  const add = useCallback(async () => {
    const origin = value.trim()
    if (!origin) return
    setAdding(true)
    setFormError("")
    try {
      const { data } = await API.addCorsOrigin(origin)
      if (!data.success) throw new Error(data.message)
      const saved = data.result as CorsOrigin
      setItems((prev) => [...prev.filter((item) => item.id !== saved.id), saved])
      setValue("")
      toast({ title: "Origin saved", description: "The workspace server picks it up within a minute." })
    } catch (error) {
      setFormError(errorMessage(error, "Could not save the origin"))
    } finally {
      setAdding(false)
    }
  }, [value, toast])

  const toggle = useCallback(async (item: CorsOrigin, next: boolean) => {
    try {
      const { data } = await API.setCorsOriginActive(item.id, next)
      if (!data.success) throw new Error(data.message)
      setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, is_active: next } : entry)))
    } catch (error) {
      toast({ variant: "destructive", title: errorMessage(error, "Could not update the origin") })
    }
  }, [toast])

  const remove = useCallback(async (item: CorsOrigin) => {
    try {
      const { data } = await API.removeCorsOrigin(item.id)
      if (!data.success) throw new Error(data.message)
      setItems((prev) => prev.filter((entry) => entry.id !== item.id))
      toast({ title: data.message })
    } catch (error) {
      toast({ variant: "destructive", title: errorMessage(error, "Could not remove the origin") })
    }
  }, [toast])

  return (
    <PageShell>
      <PageHeader
        title="Allowed origins"
        description="Websites that may call the workspace server from a browser. Changes apply within a minute, with no restart."
      />

      <StatGrid className="mb-6 lg:grid-cols-3">
        <Stat label="Origins" value={items.length} icon={Globe} />
        <Stat label="Active" value={activeCount} />
        <Stat label="Inactive" value={items.length - activeCount} />
      </StatGrid>

      <Section flush>
        <div className="border-b border-border/70 px-4 py-3">
          <form
            className="flex flex-wrap items-start gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              void add()
            }}
          >
            <div className="min-w-[260px] max-w-md flex-1">
              <Input
                value={value}
                onChange={(event) => {
                  setValue(event.target.value)
                  setFormError("")
                }}
                placeholder="https://app.example.com or http://localhost:9500"
                className="h-9 font-mono text-sm"
                aria-label="Origin"
                aria-invalid={formError !== ""}
                disabled={adding}
              />
              {formError && <p className="mt-1.5 text-xs text-red-600" role="alert">{formError}</p>}
            </div>
            <Button type="submit" size="sm" className="h-9" disabled={adding || value.trim() === ""}>
              <Plus className="mr-1.5 h-4 w-4" /> Add origin
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Use scheme://host[:port] with no path. A wildcard such as https://*.example.com must use https. Plain http is only accepted for localhost and 127.0.0.1.
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState icon={Globe} title="No origins" description="No website is allowed to call the workspace server." />
        ) : (
          <div className="max-h-[calc(100vh-26rem)] min-h-[200px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Origin</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const kind = kindOf(item.origin)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="pl-5 font-mono text-sm">
                        {item.origin}
                        {item.protected && <Pill tone="amber" className="ml-2">Production</Pill>}
                      </TableCell>
                      <TableCell><Pill tone={kind.tone}>{kind.label}</Pill></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Switch
                          checked={item.is_active}
                          disabled={item.protected}
                          onCheckedChange={(next) => void toggle(item, next)}
                          aria-label={`${item.is_active ? "Deactivate" : "Activate"} ${item.origin}`}
                        />
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-600"
                              disabled={item.protected}
                              title={item.protected ? "Production origins cannot be removed" : "Remove"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove this origin?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Pages served from <b className="font-mono">{item.origin}</b> will no longer be able to call the workspace server.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => void remove(item)} className="bg-red-600 text-white hover:bg-red-700">
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>
    </PageShell>
  )
}
