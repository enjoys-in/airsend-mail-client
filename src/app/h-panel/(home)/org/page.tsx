import { OrganizationsTable } from "./_components/organizations-table"
import { Button } from "@/components/ui/button"
import { Plus, Building2 } from "lucide-react"
import Link from "next/link"
import serverAxios from "@/lib/api/serverAxios"

export default async function OrganizationsPage() {
    let organizations: any[] = []
    try {
        const { data } = await serverAxios.get("/api/v1/admin/organizations")
        if (data.success) {
            organizations = data.result || []
        }
    } catch {
        organizations = []
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="flex h-14 shrink-0 items-center justify-between border-b px-6 bg-card">
                <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h1 className="text-base font-semibold">Organizations Overview</h1>
                </div>
                <div>
                    <Button asChild size="sm" className="gap-1.5 shadow-sm">
                        <Link href="/h-panel/org/create">
                            <Plus className="h-4 w-4" />
                            Create Organization
                        </Link>
                    </Button>
                </div>
            </header>
            <div className="flex-1 p-6 min-w-0 overflow-auto">
                <div className="container max-w-6xl mx-auto space-y-6">
                    <OrganizationsTable data={organizations} />
                </div>
            </div>
        </div>
    )
}
