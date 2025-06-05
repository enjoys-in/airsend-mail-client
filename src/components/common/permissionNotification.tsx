'use client'
import { API } from '@/lib/api/handler'
import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { requestNotificationPermission } from '@/lib/helper'

import { useAppSelector } from '@/store/hooks'
const publicKey = 'BJw086bmrTdcixl4bO_ep7kPMevfXiot27XyBoccCaeOH_eQZL_X3ml8TvFSKlfgsI6joi43-m3efwL4D8YXX0'
function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}
export default function NotificationRequest() {
    const [isVisible, setIsVisible] = React.useState(false);
    const currAcc = useAppSelector((state) => state.accounts.currAccount)

    useEffect(() => {
        const checkNotificationPreference = () => {
            if ("Notification" in window && Notification.permission !== "granted") {
                currAcc && currAcc.role === "USER" && setIsVisible(true);
            }

            if ("serviceWorker" in navigator) {
                navigator.serviceWorker
                    .register("/service-worker.js")
                    .then(async (registration) => {
                        const subscription = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array(publicKey)
                        })
                        const { data } = await API.subcribeWebPush({
                            method: "POST",
                            body: JSON.stringify(subscription),
                            headers: { "Content-Type": "application/json" }
                        });
                        if (data.success) {

                            console.log("Aisa Kya Dekh rahe PaaiJaan, i'm just a console message baby,")
                        }
                    }
                    )
                    .catch((err) => console.error("Omffo Ji, Aj me sed hu or cry bhi aa rha", err));


            }
            const preference = localStorage.getItem('notificationPreference')
            if (preference === null) {
                setIsVisible(true)
            } else if (preference === 'denied') {
                setIsVisible(true)
            }

        }
        const timer = setTimeout(checkNotificationPreference, 2000)
        return () => clearTimeout(timer)
    }, [])

    const handleAllow = () => {
        localStorage.setItem('notificationPreference', 'allowed')
        setIsVisible(false)
        requestNotificationPermission()
    }

    const handleConfirmDeny = () => {
        localStorage.setItem('notificationPreference', 'denied')
        setIsVisible(false)

    }

    return isVisible ? (
        <AnimatePresence>
            <motion.div
                key={"empty"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black z-40"
            />
            <motion.div
                key={"notification"}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto z-50"
            >
                <Card className="w-full md:w-96 bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold">Enable Notifications 🥹</CardTitle>
                        <Button variant="ghost" size="icon" onClick={handleConfirmDeny}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-300">
                            Allow us to send you push notifications to stay updated.<br />
                            Please Dedo Na Permisssion, Fir Tumhe Kaise Pta Chalega Kisne Tumhe Kab or Kyu Yaad Kia.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={handleConfirmDeny}>
                            Not Now
                        </Button>
                        <Button onClick={handleAllow} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Bell className="mr-2 h-4 w-4" /> Allow Notifications
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </AnimatePresence>
    ) : null
}

