"use client"

import React from 'react'
import { db } from '@/db'
import { useSettingsStore } from '@/store/settings'
import dot from 'dot-object';
import { API } from '@/lib/api/handler';
import { toast } from 'sonner';
import { isSyncingFromBackend } from '@/lib/api/sync-guard';

const IdbSyncHookApi = () => {
    const { setSettings } = useSettingsStore()
    React.useEffect(() => {
        const handler = async (changes: any) => {
            // Skip if we're syncing FROM backend TO IDB (prevents loop)
            if (isSyncingFromBackend()) {
                return;
            }

            for (const e of changes) {
                if (e.table.toLowerCase() === 'settings') {
                    const email = (e as any).key
                    const { updatedAt, ...modifications } = dot.object((e as any).mods) as any;

                    if (Object.keys(modifications).length === 0) {
                        return toast.info("Nothing to Update")
                    }

                    // Extract only the changed settings fields (delta)
                    const delta = modifications.settings ?? modifications
                    const { usage, mailbox_size, quota_in_percent, ...settingsDelta } = delta

                    if (Object.keys(settingsDelta).length === 0) {
                        return
                    }

                    /* Backend-first: push only changed fields to API, rollback on failure */
                    toast.promise(
                        API.handleUpdateMailUserSetting({
                            email,
                            settings: settingsDelta,
                        }).then(({ data }: any) => {
                            if (!data.success) {
                                /* Restore previous settings in Zustand so UI reverts */
                                if (e?.oldObj?.settings) {
                                    setSettings(e.oldObj.settings)
                                }
                                throw new Error(data.message || "Update rejected by server")
                            }
                        }),
                        {
                            loading: "Syncing settings…",
                            success: "Settings saved",
                            error: "Failed to save — reverted",
                        },
                    )
                }
            }
        };

        (db as any).on('changes', handler);

        return () => {
            db.on('changes').unsubscribe(handler);
        };
    }, []);

    return null
}

export default IdbSyncHookApi