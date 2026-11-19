import Link from "next/link"
import { Plus } from "lucide-react"
import serverAxios from "@/lib/api/serverAxios"
import { Button } from "@/components/ui/button"
import { OrganizationsTable } from "./_components/organizations-table"
import { OverviewStats } from "./_components/overview-stats"
import { OrgPage, PageHeader } from "./_components/kit"

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

    // Everything below comes from the organizations already fetched (no extra requests).
    const domains = organizations.flatMap((org) => org.domains || [])
    const verified = domains.filter((d: any) => d.dns_verified === true || String(d.status).toLowerCase() === "verified").length
    const counts = domains.map((d: any) => d.accounts_count).filter((n: unknown): n is number => typeof n === "number")
    const mailboxes = counts.length ? counts.reduce((sum: number, n: number) => sum + n, 0) : null

    return (
        <OrgPage>
            <PageHeader
                title="Organizations"
                description="Group your domains and members, and decide who can do what in Files, Tasks and Workspace."
                actions={
                    <Button asChild size="sm">
                        <Link href="/h-panel/org/create">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Create organization
                        </Link>
                    </Button>
                }
            />

            <div className="space-y-6">
                <OverviewStats organizations={organizations.length} domains={domains.length} verified={verified} mailboxes={mailboxes} />
                <OrganizationsTable data={organizations} />
            </div>
        </OrgPage>
    )
}
