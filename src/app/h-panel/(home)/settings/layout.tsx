"use client";
import React, { PropsWithChildren } from 'react'
import { useAppDispatch } from '@/store/hooks';
import { setSidebarTab } from '@/store/slices/layout';

const SettingsLayout = ({ children }: PropsWithChildren) => {
    const dispatch = useAppDispatch();
    React.useEffect(() => {
        dispatch(setSidebarTab("Preferences"))
    },[dispatch])
    return (
        <div className='space-y-6 p-4 md:block'>
            {children}
        </div>
    )
}

export default SettingsLayout