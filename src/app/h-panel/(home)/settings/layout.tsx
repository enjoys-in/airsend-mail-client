"use client";
import React, { PropsWithChildren } from 'react'
import { useAppDispatch } from '@/store/hooks';
import { setSidebarTab } from '@/store/slices/layout';
import { SettingsShell } from './_components/settings-shell';

const SettingsLayout = ({ children }: PropsWithChildren) => {
    const dispatch = useAppDispatch();
    React.useEffect(() => {
        dispatch(setSidebarTab("Preferences"))
    },[dispatch])
    return <SettingsShell>{children}</SettingsShell>
}

export default SettingsLayout
