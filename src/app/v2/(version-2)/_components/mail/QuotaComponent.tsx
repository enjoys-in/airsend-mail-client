"use client";

import React, { useEffect } from 'react';
import SidebarStroageView from './SidebarStroageView';

import { ApiResponse } from '@/lib/types';
import { StorageUsageSkeleton } from './StorageUsageSkelton';
import { API } from '@/lib/api/handler';
import { AxiosResponse } from 'axios';
import { useMailStore } from '@/store/mails';
import { QuotaResponse } from '@/lib/types/QuotaResponse';
import { airsendDB } from '@/db';
import { useAppSelector } from '@/store/hooks';
import { useSockets } from '@/hooks/useSockets';
import { SocketEventConstants } from '@/lib/sockets/socket-constants';
import { CustomEventKey, useCustomEvent } from '@/hooks/use-custom-event';

const QuotaComponent = () => {
    const quota = useMailStore(state => state.quota);
    const setQuota = useMailStore(state => state.setQuota);
    const { socket } = useSockets()
    const currAccount = useAppSelector(state => state.accounts.currAccount)
    const { listen } = useCustomEvent(CustomEventKey.SyncMail);

    const fetchQuotaFromAPI = React.useCallback(async () => {
        if (!currAccount?.email) return
        try {
            const { data } = await API.getQuota() as AxiosResponse<ApiResponse<QuotaResponse>>;
            if (!data.success) return

            await airsendDB.addNestedItem("settings", currAccount.email, {
                "settings.usage": data.result.usage,
                "settings.mailbox_size": data.result.limit,
                "settings.quota_in_percent": data.result.quota_in_percent
            })
            setQuota(data.result);
        } catch (error) {
            // silently fail — cached data stays
        }
    }, [currAccount?.email, setQuota]);

    // On mount: show cached data from IDB; only call API if IDB has no data
    useEffect(() => {
        if (!currAccount?.email) return

        // Show cached data immediately (if available)
        airsendDB.getMultiNestedItem("settings", currAccount.email, [
            "settings.usage",
            "settings.mailbox_size",
        ]).then((item) => {
            if (item.success && item.value?.settings?.usage != null && item.value?.settings?.mailbox_size) {
                setQuota({
                    usage: Number(item.value.settings.usage),
                    limit: Number(item.value.settings.mailbox_size),
                    quota_in_percent: Number(
                        Number(item.value.settings.usage) / Number(item.value.settings.mailbox_size) * 100
                    ).toFixed(2),
                });
            } else {
                // No cached data in IDB — fetch from API
                fetchQuotaFromAPI();
            }
        }).catch(() => {
            // IDB not configured or errored — fetch from API
            fetchQuotaFromAPI();
        });
    }, [currAccount?.email, fetchQuotaFromAPI]);


    useEffect(() => {
        const updateQuota = async (value: string) => {
            try {
                const delta = Number(JSON.parse(value))
                if (!delta || isNaN(delta)) return

                // Read fresh quota from Zustand (not stale closure)
                const currentQuota = useMailStore.getState().quota
                if (!currentQuota) return

                const totalUsage = Number(currentQuota.usage) + delta
                const limit = Number(currentQuota.limit)
                if (isNaN(totalUsage) || isNaN(limit) || limit === 0) return

                const quota_in_percent = (totalUsage / limit * 100).toFixed(2)

                await airsendDB.updateMultipleNestedItems("settings", currAccount?.email!, {
                    "settings.usage": totalUsage,
                    "settings.quota_in_percent": quota_in_percent,
                });

                setQuota({
                    limit,
                    usage: totalUsage,
                    quota_in_percent,
                });
            } catch (error) {
                // Fallback: just refresh from API
                fetchQuotaFromAPI()
            }
        };

        socket.on(SocketEventConstants.MAIL_USAGED, updateQuota);
        const unsubscribe = listen(() => fetchQuotaFromAPI())
        return () => {
            socket.off(SocketEventConstants.MAIL_USAGED, updateQuota);
            unsubscribe()
        };

    }, [currAccount?.email, fetchQuotaFromAPI]);



    return quota !== null ? (
        <SidebarStroageView total={Number(quota?.limit)} used={Number(quota?.usage)} />
    ) : <StorageUsageSkeleton />;
};

export default QuotaComponent;
