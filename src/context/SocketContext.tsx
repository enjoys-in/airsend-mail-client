"use client"
import { socketAddListeners, socketRemoveListeners } from "@/lib/sockets/listeners";
import { appSocket } from "@/lib/sockets/socket";
import { SocketEventConstants } from "@/lib/sockets/socket-constants";
import { useAppSelector } from "@/store/hooks";
import React, { PropsWithChildren, use } from "react";
import { Socket } from "socket.io-client";

export const SocketContext = React.createContext<{ socket: Socket,isConnected:boolean }>({ socket: appSocket,isConnected:false });
const SocketContextProvider = ({ children }: PropsWithChildren) => {
    const currAcc = useAppSelector((state) => state.accounts.currAccount);
    const [isConnected, setIsConnected] = React.useState(false);
    React.useEffect(() => {
        appSocket.on("connect", () => setIsConnected(true))
        appSocket.on("disconnect", () => {
            console.log("disconnected")
            setIsConnected(false);
        })
        appSocket.on("connection_error", () => setIsConnected(false));
        if (currAcc?.email) {
            appSocket.emit(SocketEventConstants.REGISTER_CLIENT, currAcc?.email)
        }
        socketAddListeners(appSocket);
        return () => socketRemoveListeners(appSocket)
    }, [])
    return (
        <SocketContext.Provider value={{ socket: appSocket ,isConnected}}>
            {children}
        </SocketContext.Provider>
    )
}
export default SocketContextProvider