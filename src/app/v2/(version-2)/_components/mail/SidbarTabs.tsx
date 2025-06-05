"use client"
import React from 'react'
import { ListFolders } from './ListFolders'
import RootTab from '@/components/RootTab'
import { useAppSelector } from '@/store/hooks'
import { cn } from '@/lib/utils'
import { SettingsMenu } from './settingsMenu'

const SidbarTabs = () => {
    const activeTab = useAppSelector((state) => state.layout.sidebarTab);
    return (
        <div>
            {/* <div className="hidden md:block">
                <RootTab<"Mailbox" | "Settings">
                    leftLabel="Mailbox"
                    rightLabel="Settings"
                />
            </div> */}
            <div className="group flex flex-col gap-1 py-2">
            <ListFolders />
                {/* {
                    activeTab === "Settings" && <div
                        className={cn(
                            "w-full transition-transform duration-500 ease-in-out translate-x-0",

                        )}
                    >
                        <SettingsMenu />
                    </div>
                } */}

            </div>
        </div>
    )
}

export default SidbarTabs