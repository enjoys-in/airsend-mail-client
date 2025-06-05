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

const QuotaComponent = () => {
    const quota = useMailStore(state => state.quota);
    const setQuota = useMailStore(state => state.setQuota);
    const { socket } = useSockets()
    const currAccount = useAppSelector(state => state.accounts.currAccount)


    const fetchQuota = async () => {
        try {
            const item = await airsendDB.getMultiNestedItem("settings", currAccount?.email as string, [
                "settings.usage",
                "settings.mailbox_size",
            ])

            if (item.success && item.value && item.value.settings.usage) {
                setQuota({
                    usage: item.value.settings.usage,
                    limit: item.value.settings.mailbox_size,
                    quota_in_percent: Number(item.value.settings.usage / item.value.settings.mailbox_size * 100).toFixed(2),
                });
                return;
            }
            const { data } = await API.getQuota() as AxiosResponse<ApiResponse<QuotaResponse>>;
            if (!data.success) {
                return
            }
            await airsendDB.addNestedItem("settings", currAccount?.email as string, {
                "settings.usage": data.result.usage,
                "settings.mailbox_size": data.result.limit,
                "settings.quota_in_percent": data.result.quota_in_percent
            })
            setQuota(data.result);
        } catch (error) {

        }
    };

    useEffect(() => {
        if (!quota && currAccount?.email) {
            fetchQuota();
        }
    }, [quota, currAccount?.email]);


    useEffect(() => {
        const updateQuota = async (value: string) => {
            const data = JSON.parse(value) as { message: string };
            const item = await airsendDB.getMultiNestedItem("settings", currAccount?.email as string, [
                "settings.usage",
                "settings.mailbox_size",
            ])
            if (item.success && item.value) {
                const totalUsage = (item?.value.settings.usage || 0) + Number(data.message);
                const { success, updates } = await airsendDB.updateMultipleNestedItems("settings", currAccount?.email!, {
                    "settings.usage": totalUsage,
                    "settings.quota_in_percent": Number(totalUsage / item.value.settings.mailbox_size * 100).toFixed(2),
                });
                if (success) {
                    setQuota({
                        ...quota,
                        usage: updates.settings.usage,
                        quota_in_percent: updates.settings.quota_in_percent,
                    } as any);
                }
            }
        };

        socket.on(SocketEventConstants.MAIL_USAGED, updateQuota);
        return () => {
            socket.off(SocketEventConstants.MAIL_USAGED, updateQuota);
        };
    }, [currAccount?.email]);



    return quota !== null ? (
        <SidebarStroageView total={Number(quota?.limit)} used={Number(quota?.usage)} />
    ) : <StorageUsageSkeleton />;
};

export default QuotaComponent;
