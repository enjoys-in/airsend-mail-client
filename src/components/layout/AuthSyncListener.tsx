"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setLogout as setUserLogout } from "@/store/slices/account";
import { setLogout as setAdminLogout } from "@/store/slices/account/admin";
import { onRemoteLogout } from "@/lib/auth-sync";

const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

const AuthSyncListener = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        return onRemoteLogout((scope) => {
            const path = normalize(window.location.pathname);

            if (scope === "admin") {
                dispatch(setAdminLogout());
                if (path.startsWith("/h-panel") && path !== "/h-panel") {
                    window.location.replace("/h-panel");
                }
                return;
            }

            try {
                window.localStorage.removeItem("access_token");
            } catch {
                void 0;
            }
            dispatch(setUserLogout());
            if (path.startsWith("/v2") && path !== "/v2") {
                window.location.replace("/v2");
            }
        });
    }, [dispatch]);

    return null;
};

export default AuthSyncListener;
