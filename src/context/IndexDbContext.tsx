"use client"
import React, { createContext } from 'react';
import { db, airsendDB } from '@/db';
import dynamic from "next/dynamic"
const IdbSyncHookApi = dynamic(() => import("@/components/common/IdbSyncHookApi"), {
    ssr: false,
})

interface IndexDbContextProps {
    db: typeof db
    airsendDB: typeof airsendDB
}

export const IndexDbContext = createContext<IndexDbContextProps | undefined>(undefined);


export const IndexDbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    return (
        <IndexDbContext.Provider value={{ db, airsendDB }}>
            <IdbSyncHookApi />
            {children}
        </IndexDbContext.Provider>
    );
};
