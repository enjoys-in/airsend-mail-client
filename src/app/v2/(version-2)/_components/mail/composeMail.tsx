import React, { Fragment } from "react";
import { X, Minus, Maximize2, Minimize2, Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMultiTabStore } from "@/store/settings/multiTabSystem";
import { useSettingsStore } from "@/store/settings";

export default function MultiTabSystem() {

    const {     
        setFocusedTab,
        tabs,
        visibleTabs,
        minimizedTabs,
        fullscreenTab,
        createTab,
        closeTab,
        minimizeTab,
        restoreTab,
        toggleFullscreen,
    } = useMultiTabStore();

    const composerLayout = useSettingsStore((s) => s.settings?.personalization?.composer_layout)
        || (typeof window !== "undefined" ? (localStorage.getItem("airsend_composer_layout") as "normal" | "maximized") : null)
        || "normal";
    const isPreferredMaximized = composerLayout === "maximized";

    return (
        <Fragment>
            {/* Compose button */}
            <Button
                onClick={() => createTab()}
                className="flex items-center justify-center gap-2 w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-sm transition-all duration-150"
            >
                <Pen className="h-3.5 w-3.5" />
                <span>Compose</span>
            </Button>

            {/* Backdrop for focused modal mode */}
            {isPreferredMaximized && visibleTabs.length > 0 && !fullscreenTab && (
                <div
                    className="fixed inset-0 bg-background/60 backdrop-blur-xs z-[55] animate-in fade-in duration-200"
                    onClick={() => visibleTabs[0] && minimizeTab(visibleTabs[0].id)}
                />
            )}

            {/* Tabs container */}
            <div className={cn(
                "fixed z-50 flex items-end gap-2",
                isPreferredMaximized && visibleTabs.length > 0 && !fullscreenTab
                    ? "inset-0 pointer-events-none flex items-center justify-center p-4 sm:p-8"
                    : "bottom-0 right-4"
            )}>
                {/* Minimized tabs */}
                {minimizedTabs.map((tabId) => {
                    const tab = tabs.find((t) => t.id === tabId);
                    if (!tab) return null;

                    return (
                        <Button
                            key={`min-${tabId}`}
                            variant="secondary"
                            size="sm"
                            className="pointer-events-auto truncate max-w-[160px] h-9 rounded-t-xl rounded-b-none text-xs font-medium shadow-md border border-b-0 bg-card hover:bg-muted/80 text-foreground flex items-center gap-1.5 px-3"
                            onClick={() => restoreTab(tabId)}
                        >
                            <span className="size-1.5 rounded-full bg-primary/70 shrink-0" />
                            <span className="truncate">{tab.title || "New message"}</span>
                        </Button>
                    );
                })}

                {/* Visible Tabs */}
                {visibleTabs.map((tab) => {
                    const isFullscreen = fullscreenTab?.id === tab.id;
                    const isModalCentered = isPreferredMaximized && !fullscreenTab;
                    return (
                        <Card
                            key={tab.id}
                            className={cn(
                                "flex flex-col shadow-2xl transition-all duration-200 overflow-hidden pointer-events-auto bg-background border border-border/80 ring-1 ring-black/5 dark:ring-white/5",
                                isFullscreen
                                    ? "fixed inset-2 sm:inset-4 z-[60] mt-12 sm:mt-14 rounded-2xl border"
                                    : isModalCentered
                                        ? "w-full max-w-3xl h-[85vh] max-h-[780px] rounded-2xl border shadow-2xl"
                                        : "w-full sm:w-[620px] md:w-[680px] h-[80vh] min-h-[500px] max-h-[760px] rounded-t-2xl rounded-b-none border-b-0"
                            )}
                        >
                            {/* Tab Header */}
                            <div className="bg-card/95 backdrop-blur-md border-b border-border/70 flex justify-between items-center h-10 px-3.5 shrink-0 select-none text-foreground">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="size-2 rounded-full bg-primary/70 shrink-0" />
                                    <span className="text-xs sm:text-sm font-semibold tracking-tight truncate text-foreground">
                                        {tab.title || "New message"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => toggleFullscreen(tab.id)}
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-lg transition-colors"
                                        title={isFullscreen ? "Restore window" : "Maximize"}
                                    >
                                        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => minimizeTab(tab.id)}
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-lg transition-colors"
                                        title="Minimize"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => closeTab(tab.id)}
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                        title="Close"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <CardContent
                                className={cn(
                                    "p-0 flex-1 overflow-auto flex flex-col min-h-0",
                                    isFullscreen ? "h-full" : "h-[calc(100%-40px)]"
                                )}
                                onFocus={() => setFocusedTab(tab.id)}
                            >
                                {tab.content}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </Fragment>
    );
}
