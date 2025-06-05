import React from 'react'
import { useSockets } from "@/hooks/useSockets";
import { SocketEventConstants } from '@/lib/sockets/socket-constants';
import { toast } from 'sonner';
const SentMailToast = () => {
    const { socket } = useSockets()
    React.useEffect(() => {
        return () => {
            const handleToast = (value: string) => {
                const data = JSON.parse(value);
                toast.success(data.message)
            }
            socket.off(SocketEventConstants.MAIL_USAGED, handleToast);
        };
    },[socket])
    return  <div/>
}

export default SentMailToast