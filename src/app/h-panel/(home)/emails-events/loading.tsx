import React from 'react'
import { PageShell, Panel, RowsSkeleton } from '@/components/h-panel/kit'
import { Skeleton } from '@/components/ui/skeleton'

const loading = () => {
  return (
    <PageShell>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Panel>
        <RowsSkeleton rows={8} />
      </Panel>
    </PageShell>
  )
}

export default loading
