import { __config } from "@/constants/config";
import { io } from "socket.io-client";
 
export const appSocket = io(`${__config.APP.BASE_URL!}/mail`, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    transports: ['websocket', 'polling'],
}); // main namespace