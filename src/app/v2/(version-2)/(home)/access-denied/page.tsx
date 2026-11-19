"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { AccessDenied } from "../../_components/access-denied"
import type { GatedFeature } from "@/lib/feature-gate"

const FEATURES: GatedFeature[] = ["tasks", "files", "workspace"]

function Denied() {
    const requested = useSearchParams().get("feature") as GatedFeature | null
    return <AccessDenied feature={requested && FEATURES.includes(requested) ? requested : "workspace"} />
}

// Target of the middleware rewrite (HTTP 403) when the token carries no scopes at all.
export default function AccessDeniedPage() {
    return (
        <Suspense fallback={null}>
            <Denied />
        </Suspense>
    )
}
