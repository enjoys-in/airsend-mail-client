import serverAxios from "@/lib/api/serverAxios"
import { SomethingWentWrong } from "@/components/common/SomethingWentWrong"
import type { ApiResponse } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Boxes } from "lucide-react"
import Link from "next/link"

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
            <div className="p-4 md:p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Workspace</h1>
                    <p className="text-sm text-muted-foreground">Select a domain to manage its workspace</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {data.result.map((domain) => (
                        <Link key={domain.id} href={`/h-panel/workspace/${domain.id}`}>
                            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <Boxes className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{domain.domain_name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{domain.status}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {data.result.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                        No domains found. Add a domain first.
                    </div>
                )}
            </div>
        )
    } catch (error) {
        return <SomethingWentWrong />
    }
}
