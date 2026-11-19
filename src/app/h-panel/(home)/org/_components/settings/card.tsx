"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Drop-in replacements for the shadcn `Card*` parts, styled like the rest of the org section (hairline border, soft radius,
 * no shadow, a divided header, calm type). The settings sections import these instead of "@/components/ui/card".
 */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("rounded-xl border border-border/70 bg-card text-card-foreground", className)} {...props} />
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("space-y-0.5 border-b border-border/70 px-5 py-4", className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("flex items-center gap-2 text-sm font-medium", className)} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn("text-xs text-muted-foreground", className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-5", className)} {...props} />
}
