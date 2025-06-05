import { __config } from "@/constants/config";
import { io } from "socket.io-client";
import { Helpers } from "../helper";
const user = Helpers.getUserFromCookies();

export const appSocket = io(__config.APP.BASE_URL!, {
    auth: {
        mid: user?.mid
    },
    
}); // main namespace