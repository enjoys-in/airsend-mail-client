"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FEATURE_LABEL, type GatedFeature } from "@/lib/feature-gate"

/** Shown instead of a gated page when the profile (`/me`) has no scope for the feature. */
export function AccessDenied({ feature }: { feature: GatedFeature }) {
    const label = FEATURE_LABEL[feature]
    return (
        <div
            role="alert"
            className="flex h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)] w-full flex-col items-center justify-center gap-4 p-8"
        >
            <ShieldAlert className="h-14 w-14 text-muted-foreground/50" />
            <div className="space-y-2 text-center">
                <h3 className="text-lg font-semibold text-foreground">Access denied</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                    Your account does not have access to {label}. Ask an organization admin to grant you the{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">{feature}</code> scope.
                </p>
            </div>
            <Button asChild variant="outline">
                <Link href="/v2/u/mail">Back to mail</Link>
            </Button>
        </div>
    )
}
