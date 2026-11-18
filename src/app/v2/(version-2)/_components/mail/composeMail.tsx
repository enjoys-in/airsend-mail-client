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
                            className="pointer-events-auto truncate max-w-[140px] h-8 rounded-t-lg rounded-b-none text-xs shadow-md border border-b-0"
                            onClick={() => restoreTab(tabId)}
                        >
                            {tab.title}
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
                                "flex flex-col shadow-2xl transition-all duration-200 overflow-hidden pointer-events-auto",
                                isFullscreen
                                    ? "fixed inset-4 z-[60] mt-14 rounded-xl border"
                                    : isModalCentered
                                        ? "w-full max-w-3xl h-[80vh] max-h-[720px] rounded-2xl border shadow-2xl bg-card"
                                        : "w-[620px] h-[75vh] min-h-[480px] rounded-t-xl rounded-b-none border-b-0"
                            )}
                        >
                            {/* Tab Header */}
                            <div className="bg-foreground text-background flex justify-between items-center rounded-t-xl h-9 px-3 shrink-0">
                                <span className="text-sm font-medium truncate flex-1">{tab.title}</span>
                                <div className="flex items-center gap-0.5 ml-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => toggleFullscreen(tab.id)}
                                        className="h-6 w-6 text-background/60 hover:text-background hover:bg-white/10 rounded-md transition-colors duration-150"
                                    >
                                        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => minimizeTab(tab.id)}
                                        className="h-6 w-6 text-background/60 hover:text-background hover:bg-white/10 rounded-md transition-colors duration-150"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => closeTab(tab.id)}
                                        className="h-6 w-6 text-background/60 hover:text-background hover:bg-white/10 rounded-md transition-colors duration-150"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <CardContent
                                className={cn(
                                    "p-0 flex-1 overflow-auto",
                                    isFullscreen ? "h-full" : "h-[calc(100%-36px)]"
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
