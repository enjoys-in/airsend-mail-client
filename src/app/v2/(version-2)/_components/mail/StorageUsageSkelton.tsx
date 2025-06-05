export function StorageUsageSkeleton() {
    return (
        <div className="w-full max-w-md  p-2 rounded">
            {/* Text content skeleton */}
            <div className="flex justify-between items-center mb-1">
                <div className="h-4 w-32 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-10 bg-gray-700 rounded animate-pulse" />
            </div>

            {/* Progress bar skeleton */}
            <div className="w-full h-1.5 bg-gray-800 rounded overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse rounded" />
            </div>
        </div>
    )
}