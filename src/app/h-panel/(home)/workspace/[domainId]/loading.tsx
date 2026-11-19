import { PageShell, Panel, RowsSkeleton } from "@/components/h-panel/kit"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <PageShell>
            <div className="mb-6 space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>
            <Panel>
                <RowsSkeleton rows={5} />
            </Panel>
        </PageShell>
    )
}
