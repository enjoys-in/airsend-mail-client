import { __config } from "@/constants/config";
import { io } from "socket.io-client";
 
export const appSocket = io(`${__config.APP.BASE_URL!}/mail`, {
    reconnection: true,
    transports: ['polling'],
}); // main namespace