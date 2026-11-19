import { Skeleton } from "@/components/ui/skeleton"
import { PageShell, Panel, RowsSkeleton } from "@/components/h-panel/kit"

/** Shown while the user list loads. */
const loading = () => {
    return (
        <PageShell>
            <div className="mb-6 flex items-start justify-between gap-3">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-4 w-80 max-w-full" />
                </div>
                <Skeleton className="h-9 w-28" />
            </div>
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Panel key={i} className="space-y-2 px-4 py-3.5">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-7 w-14" />
                        </Panel>
                    ))}
                </div>
                <Panel>
                    <RowsSkeleton rows={6} />
                </Panel>
            </div>
        </PageShell>
    )
}

export default loading
