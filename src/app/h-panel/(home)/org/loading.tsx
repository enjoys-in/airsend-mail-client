import { Skeleton } from "@/components/ui/skeleton"
import { OrgPage, Panel } from "./_components/kit"

/** Shown while any org page loads: a header, a row of stats and a few cards. */
const loading = () => {
  return (
    <OrgPage>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Panel key={i} className="space-y-2 px-4 py-3.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-14" />
            </Panel>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Panel key={i} className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
            </Panel>
          ))}
        </div>
      </div>
    </OrgPage>
  )
}

export default loading
