"use client";
import { useDispatch } from 'react-redux';
import React, { PropsWithChildren } from 'react'
import { setSidebarTab } from '@/store/slices/layout';

// The settings shell (sub-nav + gutter) comes from settings/layout.tsx; this only keeps the sidebar tab in step.
const SettingsLayout = ({ children }: PropsWithChildren) => {
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(setSidebarTab("Preferences"))
    },[dispatch])
    return <>{children}</>
}

export default SettingsLayout
