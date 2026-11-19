import serverAxios from "@/lib/api/serverAxios"
import { SomethingWentWrong } from "@/components/common/SomethingWentWrong"
import type { ApiResponse } from "@/lib/types"
import type { WorkspaceResponse } from "@/lib/types/workspace.interface"
import { WorkspaceManager } from "./_components/workspace-manager"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EmptyState, PageHeader, PageShell, Panel } from "@/components/h-panel/kit"

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
                <PageShell>
                    <PageHeader back={{ href: "/h-panel/workspace", label: "Workspace" }} title="Workspace" />
                    <Panel>
                        <EmptyState
                            title="Workspace is not enabled for this domain"
                            description="Turn it on in the domain settings, then come back to add members."
                            action={
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/h-panel/domains/${domainId}`}>Go to domain settings</Link>
                                </Button>
                            }
                        />
                    </Panel>
                </PageShell>
            )
        }

        return (
            <PageShell>
                <PageHeader
                    back={{ href: `/h-panel/domains/${domainId}`, label: "Domain" }}
                    title={workspace.name}
                    description="Manage members and their access scopes."
                />

                <WorkspaceManager
                    domainId={domainId}
                    workspaceName={workspace.name}
                    initialMembers={workspace.members}
                    availableAccounts={available_accounts}
                />
            </PageShell>
        )
    } catch (error) {
        return <SomethingWentWrong />
    }
}
