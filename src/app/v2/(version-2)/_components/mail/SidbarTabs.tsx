"use client"
import React from 'react'
import { ListFolders } from './ListFolders'

const SidbarTabs = () => {
    return (
        <div>

            <div className="group flex flex-col gap-1 py-2">
                <ListFolders />
            </div>
        </div>
    )
}

export default SidbarTabs