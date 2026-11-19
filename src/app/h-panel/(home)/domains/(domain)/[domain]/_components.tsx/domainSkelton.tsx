import React from 'react'
import { PageShell, Panel, RowsSkeleton } from '@/components/h-panel/kit'
import { Skeleton } from '@/components/ui/skeleton'

/** Loading state of the per-domain page: header, stat tiles and the DNS records table. */
const DomainSkelton = () => {
  return (
    <PageShell>
      <div className="mb-6 space-y-3">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="mb-6 h-9 w-48" />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Panel key={index} className="space-y-2 px-4 py-3.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </Panel>
        ))}
      </div>
      <Panel>
        <div className="border-b border-border/70 px-5 py-4">
          <Skeleton className="h-4 w-28" />
        </div>
        <RowsSkeleton rows={5} />
      </Panel>
    </PageShell>
  )
}

export default DomainSkelton
