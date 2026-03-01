"use client";
import { socketAddListeners, socketRemoveListeners } from "@/lib/sockets/listeners";
import { appSocket } from "@/lib/sockets/socket";
import { SocketEventConstants } from "@/lib/sockets/socket-constants";
import { useAppSelector } from "@/store/hooks";
import React, { PropsWithChildren, useRef } from "react";
import { Socket } from "socket.io-client";

export const SocketContext = React.createContext<{ socket: Socket; isConnected: boolean }>({
    socket: appSocket,
    isConnected: false,
});

const SocketContextProvider = ({ children }: PropsWithChildren) => {
    const currAcc = useAppSelector((state) => state.accounts.currAccount);
    const [isConnected, setIsConnected] = React.useState(appSocket.connected);
    // Track the email we last connected with to avoid redundant cycles
    const registeredEmailRef = useRef<string | null>(null);
    // Track whether listeners are already attached (survives remounts)
    const listenersAttachedRef = useRef(false);

    React.useEffect(() => {
        if (!currAcc?.email) {
            // Only disconnect if we previously connected
            if (registeredEmailRef.current) {
                appSocket.disconnect();
                registeredEmailRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // If already connected with same email — nothing to do
        if (appSocket.connected && registeredEmailRef.current === currAcc.email) {
            return;
        }

        const handleConnect = () => {
            console.log("✅ Socket connected");
            setIsConnected(true);
            registeredEmailRef.current = currAcc.email;
            appSocket.emit(SocketEventConstants.REGISTER_CLIENT, currAcc.email);
        };

        const handleDisconnect = (reason: string) => {
            console.log("❌ Socket disconnected:", reason);
            setIsConnected(false);
            // Don't clear registeredEmailRef — socket.io will auto-reconnect
            // and we want handleConnect to re-register with the same email
        };

        const handleConnectError = (err: any) => {
            console.error("⚠️ Socket connection error:", err?.message || err);
            setIsConnected(false);
        };

        // Only attach listeners once (they survive template remounts)
        if (!listenersAttachedRef.current) {
            appSocket.on("connect", handleConnect);
            appSocket.on("disconnect", handleDisconnect);
            appSocket.on("connect_error", handleConnectError);
            socketAddListeners(appSocket);
            listenersAttachedRef.current = true;
        }

        // Connect if not already connected
        if (!appSocket.connected) {
            appSocket.connect();
        } else {
            // Already connected (e.g. template remount) — just re-register if email changed
            if (registeredEmailRef.current !== currAcc.email) {
                handleConnect();
            }
        }

        // Cleanup only runs on true unmount (user navigates away from /v2 entirely)
        return () => {
            // Don't disconnect or remove listeners on template remounts.
            // The refs keep track — actual cleanup happens when email becomes null
            // or when the provider truly leaves the tree.
        };
    }, [currAcc?.email]);

    // Disconnect on true unmount (leaving the app)
    React.useEffect(() => {
        return () => {
            if (listenersAttachedRef.current) {
                appSocket.off("connect");
                appSocket.off("disconnect");
                appSocket.off("connect_error");
                socketRemoveListeners(appSocket);
                listenersAttachedRef.current = false;
            }
            if (appSocket.connected) {
                appSocket.disconnect();
            }
            registeredEmailRef.current = null;
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket: appSocket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContextProvider;
