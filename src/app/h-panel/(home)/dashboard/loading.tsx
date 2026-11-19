import React from "react"
import { PageHeader, PageShell } from "@/components/h-panel/kit"
import { StatCardSkeleton, ChartSkeleton } from "./_components/CardSkelton"

const loading = () => {
  return (
    <PageShell>
      <PageHeader title="Dashboard" description="Accounts, domains and mail traffic across everything you manage." />
      <div className="space-y-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <ChartSkeleton />
      </div>
    </PageShell>
  )
}

export default loading
