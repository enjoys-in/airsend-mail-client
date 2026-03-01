"use client"

import React from 'react'
import { db } from '@/db'
import { useSettingsStore } from '@/store/settings'
import dot from 'dot-object';
import { API } from '@/lib/api/handler';
import { toast } from 'sonner';

const IdbSyncHookApi = () => {
    const { setSettings } = useSettingsStore()
    React.useEffect(() => {
        const handler = async (changes: any) => {
            for (const e of changes) {
                if (e.table.toLowerCase() === 'settings') {
                    const email = (e as any).key
                    const { updatedAt, ...modifications } = dot.object((e as any).mods) as any;
                    const { usage, mailbox_size, quota_in_percent, ...payload } = e.obj.settings

                    if (Object.keys(modifications).length === 0) {
                        return toast.info("Nothing to Update")
                    }
                    if ("usage" in modifications || "mailbox_size" in modifications || "quota_in_percent" in modifications) {
                        return
                    }

                    /* Backend-first: push to API, rollback IDB on failure */
                    toast.promise(
                        API.handleUpdateMailUserSetting({
                            email,
                            settings: payload,
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