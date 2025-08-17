import React, { Fragment } from "react";
import { X, Minus, Maximize2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useMultiTabStore } from "@/store/settings/multiTabSystem";



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

    return (
        <Fragment>
            {/* New Mail button with top margin */}
            <Button
                onClick={() => createTab()}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 cursor-pointer transition"
            >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">New Mail</span>
            </Button>

            {/* Tabs container */}
            <div className="fixed bottom-0 right-0 flex space-x-2 items-end">
                {/* Minimized tabs */}
                {minimizedTabs.map((tabId) => {
                    const tab = tabs.find((t) => t.id === tabId);
                    if (!tab) return null;

                    return (
                        <Button
                            key={`min-${tabId}`}
                            variant="secondary"
                            size="sm"
                            className="truncate max-w-[120px]"
                            onClick={() => restoreTab(tabId)}
                        >
                            {tab.title}
                        </Button>
                    );
                })}

                {/* Visible Tabs */}
                {visibleTabs.map((tab) => {
                    const isFullscreen = fullscreenTab?.id === tab.id;
                    return (
                        <Card
                            key={tab.id}
                            className={`flex flex-col shadow-lg transition-all duration-300 ${isFullscreen
                                ? "fixed inset-4 z-50 mt-16"
                                : "max-w-[750px] w-[750px]"
                                }`}
                        >
                            {/* Tab Header */}
                            <div className="bg-blue-600 text-white flex justify-between items-center rounded-t-lg ">
                                <span className="font-medium truncate flex-1  px-2">{tab.title}</span>
                                <div className="flex items-center space-x-1 ml-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => toggleFullscreen(tab.id)}
                                        className="text-gray-200 hover:text-white hover:bg-blue-700 transition-colors"
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => minimizeTab(tab.id)}
                                        className="text-gray-200 hover:text-white hover:bg-blue-700 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => closeTab(tab.id)}
                                        className="text-gray-200 hover:text-white hover:bg-blue-700 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <CardContent className="p-0 flex-1 overflow-auto  h-[600px]" onFocus={() => setFocusedTab(tab.id)}>
                                {tab.content}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </Fragment>

    );
}
