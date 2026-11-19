"use client"

import { StatGrid, Stat, Panel } from "@/components/h-panel/kit"
import { Skeleton } from "@/components/ui/skeleton"

/** Four placeholder numbers while a statistics row loads. */
export function StatCardSkeleton() {
    return (
        <StatGrid>
            {Array.from({ length: 4 }).map((_, index) => (
                <Stat key={index} label="Loading" value="" loading />
            ))}
        </StatGrid>
    )
}

export function ChartSkeleton() {
    return (
        <Panel>
            <div className="flex flex-col gap-3 border-b border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                </div>
                <div className="flex gap-6">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>
            <div className="p-5">
                <div className="flex h-[280px] w-full items-end gap-1 pt-8">
                    {Array.from({ length: 31 }).map((_, i) => (
                        <Skeleton key={i} className="flex-1 rounded-t-sm" style={{ height: `${20 + ((i * 37) % 60)}%` }} />
                    ))}
                </div>
            </div>
        </Panel>
    )
}
