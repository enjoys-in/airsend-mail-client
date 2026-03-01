import { OrganizationsTable } from "./_components/organizations-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import serverAxios from "@/lib/api/serverAxios"
import { MOCK_ORGANIZATIONS } from "./_lib/mock-data"

export default async function OrganizationsPage() {
    let organizations: any[] = []
    try {
        const { data } = await serverAxios.get("/api/v1/admin/organizations")
        if (data.success) {
            organizations = data.result || []
        }
    } catch {
        // fallback to mock data during development
        organizations = MOCK_ORGANIZATIONS
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <h1 className="text-lg font-semibold">Organizations</h1>
                <div className="ml-auto">
                    <Button asChild size="sm">
                        <Link href="/h-panel/org/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Organization
                        </Link>
                    </Button>
                </div>
            </header>
            <div className="flex-1 p-4 min-w-0 overflow-auto">
                <OrganizationsTable data={organizations} />
            </div>
        </div>
    )
}
