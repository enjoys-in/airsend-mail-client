"use client"
import React, { createContext } from 'react';
import { db, airsendDB } from '@/db';
import dynamic from "next/dynamic"
import { useAppSelector } from '@/store/hooks';
const IdbSyncHookApi = dynamic(() => import("@/components/common/IdbSyncHookApi"), {
    ssr: false,
})

interface IndexDbContextProps {
    db: typeof db
    airsendDB: typeof airsendDB
}

export const IndexDbContext = createContext<IndexDbContextProps | undefined>(undefined);


export const IndexDbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Mails are stored per mailbox; message_id lookups resolve to the account on screen.
    // Set during render (idempotent) so it is in place before any child effect reads mails.
    const email = useAppSelector((state) => state.accounts.currAccount?.email)
    airsendDB.setMailAccount(email)

    return (
        <IndexDbContext.Provider value={{ db, airsendDB }}>
            <IdbSyncHookApi />
            {children}
        </IndexDbContext.Provider>
    );
};
