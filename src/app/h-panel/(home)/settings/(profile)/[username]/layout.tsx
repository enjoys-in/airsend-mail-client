"use client";
import { useDispatch } from 'react-redux';
import React, { PropsWithChildren } from 'react'
import { setSidebarTab } from '@/store/slices/layout';

const SettingsLayout = ({ children }: PropsWithChildren) => {
    const dispatch = useDispatch();
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