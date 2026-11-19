import { PageShell, Panel, RowsSkeleton } from "@/components/h-panel/kit"
import { Skeleton } from "@/components/ui/skeleton"

export default function LogViewerSkeleton() {
  return (
    <PageShell>
      <div className="mb-6 space-y-3">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="mb-6 h-9 w-48" />
      <Panel>
        <div className="border-b border-border/70 px-4 py-3">
          <Skeleton className="h-9 w-64" />
        </div>
        <RowsSkeleton rows={8} />
      </Panel>
    </PageShell>
  )
}
