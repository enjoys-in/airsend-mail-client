"use client";

import { memo, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VisualLayoutCardProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    selected: boolean;
    onSelect: () => void;
    preview: ReactNode;
    className?: string;
}

function VisualLayoutCard({
    title,
    description,
    icon,
    selected,
    onSelect,
    preview,
    className,
}: VisualLayoutCardProps) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={onSelect}
            className={cn(
                "group relative flex flex-col text-left p-3 rounded-2xl border transition-all duration-150 focus:outline-hidden",
                selected
                    ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                    : "border-border/70 bg-card/60 hover:border-border hover:bg-muted/40",
                className
            )}
        >
            <div className="mb-2.5 overflow-hidden rounded-lg">
                {preview}
            </div>
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 min-w-0">
                    {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
                    <span className="text-xs sm:text-sm font-semibold truncate text-foreground">
                        {title}
                    </span>
                </div>
                <div
                    className={cn(
                        "size-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                        selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/80 bg-background"
                    )}
                >
                    {selected && <Check className="size-2.5 stroke-[3]" />}
                </div>
            </div>
            {description && (
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                    {description}
                </p>
            )}
        </button>
    );
}

export default memo(VisualLayoutCard);
