import serverAxios from "@/lib/api/serverAxios"
import { SomethingWentWrong } from "@/components/common/SomethingWentWrong"
import type { ApiResponse } from "@/lib/types"
import type { WorkspaceResponse } from "@/lib/types/workspace.interface"
import { WorkspaceManager } from "./_components/workspace-manager"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function WorkspacePage({ params }: { params: any }) {
    const { domainId } = await params
    try {
        const { data } = await serverAxios.get(`/api/v1/admin/workspace/${domainId}`) as {
            data: ApiResponse<WorkspaceResponse>
        }

        if (!data.success) throw new Error(data.message)

        const { workspace, available_accounts } = data.result

        if (!workspace) {
            return (
                <div className="p-6 space-y-4">
                    <p className="text-muted-foreground">Workspace is not enabled for this domain.</p>
                    <Link href={`/h-panel/domains/${domainId}`}>
                        <Button variant="outline" size="sm" className="rounded-none">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Go to Domain Settings
                        </Button>
                    </Link>
                </div>
            )
        }

        return (
            <div className="p-4 md:p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{workspace.name}</h1>
                        <p className="text-sm text-muted-foreground">Manage members and their access scopes</p>
                    </div>
                    <Link href={`/h-panel/domains/${domainId}`}>
                        <Button variant="outline" size="sm" className="rounded-none">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Domain
                        </Button>
                    </Link>
                </div>

                <WorkspaceManager
                    domainId={domainId}
                    workspaceName={workspace.name}
                    initialMembers={workspace.members}
                    availableAccounts={available_accounts}
                />
            </div>
        )
    } catch (error) {
        return <SomethingWentWrong />
    }
}
