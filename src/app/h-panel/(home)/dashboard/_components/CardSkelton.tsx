import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StatCardSkeleton() {
    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-4 mb-2">
            {
                Array.from({ length: 12 }).map((_, index) => (<Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        {/* Title placeholder */}
                        <Skeleton className="h-4 w-24" />
                        {/* Icon placeholder */}
                        <Skeleton className="h-6 w-6 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        {/* Value placeholder */}
                        <Skeleton className="h-8 w-16" />
                        {/* Optional subtext */}
                        {/* <Skeleton className="h-3 w-20 mt-2" /> */}
                    </CardContent>
                </Card>))
            }

        </div>
    )
}

export function ChartSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-72 mt-1" />
                </div>
                <div className="flex">
                    <div className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-8 w-12 mt-1" />
                    </div>
                    <div className="flex flex-1 flex-col justify-center gap-1 border-t border-l px-6 py-4 sm:border-t-0 sm:px-8 sm:py-6">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-8 w-12 mt-1" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <div className="h-[300px] w-full flex items-end gap-1 pt-8">
                    {Array.from({ length: 31 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className="flex-1 rounded-t-sm"
                            style={{ height: `${Math.random() * 60 + 10}%` }}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}