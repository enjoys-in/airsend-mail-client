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