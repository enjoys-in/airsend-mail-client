import { Socket } from "socket.io-client";
import { SocketEventConstants } from "./socket-constants";

class SocketListeners {
    static onServerClosed() {
        console.log("server closed")
    }

    static onWarning(data: string) {
        console.log("warning")
    }
}
export const socketAddListeners = (appSocket: Socket) => {
   
  

    appSocket.on(SocketEventConstants.WARNING, SocketListeners.onWarning)
}
export const socketRemoveListeners = (appSocket: Socket) => {   
    appSocket.off(SocketEventConstants.WARNING)

}