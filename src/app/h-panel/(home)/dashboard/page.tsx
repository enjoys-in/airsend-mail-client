import React, { Suspense } from 'react'
import AccountStatistics from './_components/AccountStatistics';
import { StatCardSkeleton, ChartSkeleton } from './_components/CardSkelton';
import MailStatistics from './_components/MailStatistics';
import ChartsComponent from './_components/ChartsComponent';

const page = async () => {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-1 space-y-4">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min gap-2 p-2">              
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
        </div>
    )

}

export default page