import React, { Suspense } from "react"
import AccountStatistics from "./_components/AccountStatistics"
import { StatCardSkeleton, ChartSkeleton } from "./_components/CardSkelton"
import MailStatistics from "./_components/MailStatistics"
import ChartsComponent from "./_components/ChartsComponent"
import { PageHeader, PageShell } from "@/components/h-panel/kit"

const page = async () => {
    return (
        <PageShell>
            <PageHeader title="Dashboard" description="Accounts, domains and mail traffic across everything you manage." />
            <div className="space-y-4">
                <Suspense fallback={<StatCardSkeleton />}>
                    <AccountStatistics />
                </Suspense>
                <Suspense fallback={<StatCardSkeleton />}>
                    <MailStatistics />
                </Suspense>
                <Suspense fallback={<ChartSkeleton />}>
                    <ChartsComponent />
                </Suspense>
            </div>
        </PageShell>
    )

}

export default page
