"use client";
import { socketAddListeners, socketRemoveListeners } from "@/lib/sockets/listeners";
import { appSocket } from "@/lib/sockets/socket";
import { SocketEventConstants } from "@/lib/sockets/socket-constants";
import { useAppSelector } from "@/store/hooks";
import React, { PropsWithChildren } from "react";
import { Socket } from "socket.io-client";

export const SocketContext = React.createContext<{ socket: Socket; isConnected: boolean }>({
    socket: appSocket,
    isConnected: false,
});

const SocketContextProvider = ({ children }: PropsWithChildren) => {
    const currAcc = useAppSelector((state) => state.accounts.currAccount);
    const [isConnected, setIsConnected] = React.useState(false);

    React.useEffect(() => {
        if (!currAcc?.email) {
            console.warn(" No account email found, disconnecting");
            appSocket.disconnect();
            setIsConnected(false);
            return;
        }

        const handleConnect = () => {
            console.log("✅ connected");
            setIsConnected(true);
            appSocket.emit(SocketEventConstants.REGISTER_CLIENT, currAcc.email);
        };

        const handleDisconnect = () => {
            console.log("❌ disconnected");
            setIsConnected(false);
        };

        const handleConnectError = (err: any) => {
            console.error("⚠️ connection error:", err);
            setIsConnected(false);
        };

        // Clean old listeners first
        appSocket.off("connect", handleConnect);
        appSocket.off("disconnect", handleDisconnect);
        appSocket.off("connect_error", handleConnectError);

        // Attach fresh listeners
        appSocket.on("connect", handleConnect);
        appSocket.on("disconnect", handleDisconnect);
        appSocket.on("connect_error", handleConnectError);

        // Attach app-specific listeners
        socketAddListeners(appSocket);

        // Force a fresh connect if not already connected
        if (!appSocket.connected) {
            console.log("🔄 Connecting...");
            appSocket.connect();
        } else {
            // Already connected, just register immediately
            handleConnect();
        }

        return () => {
            console.log("🧹 Cleaning up");
            appSocket.off("connect", handleConnect);
            appSocket.off("disconnect", handleDisconnect);
            appSocket.off("connect_error", handleConnectError);
            socketRemoveListeners(appSocket);
        };
    }, [currAcc?.email]);

    return (
        <SocketContext.Provider value={{ socket: appSocket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContextProvider;
