import { OrganizationForm } from "../../_components/organization-form"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import serverAxios from "@/lib/api/serverAxios"

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    let org = null
    try {
        const { data } = await serverAxios.get(`/api/v1/admin/organization/${id}`)
        if (data.success) {
            org = data.result
        }
    } catch {
        org = null
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b px-6 bg-card">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/h-panel/org">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Organizations
                        </Link>
                    </Button>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Link href="/h-panel/org" className="hover:text-foreground">
                            Organizations
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-foreground font-medium">{org?.name || `Organization ${id}`}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-foreground font-medium">Edit</span>
                    </div>
                </div>
            </header>

            {/* Scrollable Content Body */}
            <div className="flex-1 p-6 overflow-auto">
                <div className="container max-w-6xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit {org?.name || "Organization"}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Update brand identity, adjust associated domains, and manage reporting contacts.
                        </p>
                    </div>

                    <OrganizationForm mode="edit" initialData={org} />
                </div>
            </div>
        </div>
    )
}
