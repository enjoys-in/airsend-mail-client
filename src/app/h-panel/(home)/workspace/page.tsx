import serverAxios from "@/lib/api/serverAxios"
import { SomethingWentWrong } from "@/components/common/SomethingWentWrong"
import type { ApiResponse } from "@/lib/types"
import { PageHeader, PageShell } from "@/components/h-panel/kit"
import { DomainList } from "./_components/domain-list"

interface DomainItem {
    id: string
    domain_name: string
    status: string
}

export default async function WorkspaceListPage() {
    try {
        const { data } = await serverAxios.get("/api/v1/admin/domains") as {
            data: ApiResponse<DomainItem[]>
        }
        if (!data.success) throw new Error(data.message)

        return (
            <PageShell>
                <PageHeader title="Workspace" description="Select a domain to manage its workspace members and what each of them can use." />
                <DomainList domains={data.result} />
            </PageShell>
        )
    } catch (error) {
        return <SomethingWentWrong />
    }
}
