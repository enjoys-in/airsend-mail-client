"use client"

import React, { useRef, useEffect } from "react"
import { useSettingsStore } from "@/store/settings"
import { allSettingsItems } from "@/app/v2/(version-2)/_components/mail/settingsMenu"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { accountItems, mailItems } from "@/app/v2/(version-2)/_components/mail/settingsMenu"
import { SlidersHorizontal } from "lucide-react"

export function MobileSettingsNav() {
    const activeItem = useSettingsStore((s) => s.activeItem)
    const setActiveItem = useSettingsStore((s) => s.setActiveItem)
    const pillsRef = useRef<HTMLDivElement>(null)

    // Sync hash
    useEffect(() => {
        const updateTabFromHash = () => {
            const hash = decodeURIComponent(window.location.hash.replace("#", ""))
            if (hash) {
                setActiveItem(hash)
            }
        }
        updateTabFromHash()
        window.addEventListener("hashchange", updateTabFromHash)
        return () => window.removeEventListener("hashchange", updateTabFromHash)
    }, [setActiveItem])

    const handleSelect = (key: string) => {
        if (activeItem !== key) {
            setActiveItem(key)
            window.location.hash = encodeURIComponent(key)
        }
    }

    // Auto-scroll active pill into view
    useEffect(() => {
        if (pillsRef.current) {
            const activeEl = pillsRef.current.querySelector<HTMLElement>("[data-active='true']")
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
            }
        }
    }, [activeItem])

    return (
        <div className="md:hidden w-full mb-6 space-y-3">
            {/* Quick dropdown for fast jumping */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                    <SlidersHorizontal className="size-3.5 text-primary" />
                    <span>Tab:</span>
                </div>
                <Select value={activeItem} onValueChange={handleSelect}>
                    <SelectTrigger className="w-full h-9 text-xs sm:text-sm bg-card/80 border-border/80 rounded-xl shadow-2xs font-medium">
                        <SelectValue placeholder="Select tab" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                        <SelectGroup>
                            <SelectLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
                                Account
                            </SelectLabel>
                            {accountItems.map((item) => (
                                <SelectItem key={item.key} value={item.key} textValue={item.label} className="text-xs sm:text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
                                Airsend Mail
                            </SelectLabel>
                            {mailItems.map((item) => (
                                <SelectItem key={item.key} value={item.key} textValue={item.label} className="text-xs sm:text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {/* Horizontal scrollable pills */}
            <div
                ref={pillsRef}
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 scroll-smooth"
            >
                {allSettingsItems.map((item) => {
                    const isActive = activeItem === item.key
                    return (
                        <button
                            key={item.key}
                            data-active={isActive ? "true" : "false"}
                            onClick={() => handleSelect(item.key)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 shrink-0 border",
                                isActive
                                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                    : "bg-card/70 text-muted-foreground border-border/70 hover:text-foreground hover:bg-muted/60"
                            )}
                        >
                            <span className={cn(isActive ? "text-primary-foreground" : "text-muted-foreground")}>
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
