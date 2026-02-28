"use client"

import { useState, useEffect } from "react"
import {
    RotateCcw,
    User,
    Globe,
    Paintbrush,
    Shield,
    Import,
    MessageSquare,
    Lock,
    UserCircle,
    Folder,
    Filter,
    Forward,
    Globe2,
    Key,
    Server,
    Bell,
    Pen,
    CalendarDays,
} from "lucide-react"
import { useSettingsStore } from "@/store/settings"
import { EnvelopeOpenIcon } from "@radix-ui/react-icons"

const accountItems = [
    { icon: <User size={18} />, label: "Account and password", key: "account-and-password" },
    { icon: <Pen size={18} />, label: "Signatures", key: "signatures" },

    // { icon: <Globe size={18} />, label: "Language and time" },
    { icon: <Paintbrush size={18} />, label: "Appearance", key: "appearance" },
    { icon: <Bell size={18} />, label: "Notifications", key: "notifications" },

    // { icon: <Shield size={18} />, label: "Security and privacy" },
    { icon: <Import size={18} />, label: "Import via Easy Switch", key: "import-via-easy-switch" },
    // { icon: <RotateCcw size={18} />, label: "Recovery", notification: true },
]

const mailItems = [
    { icon: <Filter size={18} />, label: "Filters", key: "filters" },
    { icon: <Server size={18} />, label: "IMAP/SMTP", key: "imap-smtp" },
    { icon: <EnvelopeOpenIcon height={18} width={18} />, label: "Email Config", key: "email-config" },
    { icon: <Lock size={18} />, label: "Email privacy", key: "email-privacy" },
    { icon: <Key size={18} />, label: "Encryption and keys", key: "encryption-and-keys" },
    { icon: <Folder size={18} />, label: "Folders and labels", key: "folders-and-labels" },
    { icon: <Forward size={18} />, label: "Email Forwarding", key: "email-forwarding" },
    { icon: <UserCircle size={18} />, label: "Identity and addresses", key: "identity-and-addresses" },
    { icon: <MessageSquare size={18} />, label: "Messages and composing", key: "messages-and-composing" },
    { icon: <CalendarDays size={18} />, label: "Calendar", key: "calendar" },
]

export const SettingsMenu = () => {
    const activeItem = useSettingsStore((s) => s.activeItem)
    const setActiveItem = useSettingsStore((s) => s.setActiveItem)

    useEffect(() => {
        const updateTabFromHash = () => {
            const hash = decodeURIComponent(window.location.hash.replace("#", ""))
            if (hash) {
                setActiveItem(hash)
            }
        }

        updateTabFromHash()
        window.addEventListener("hashchange", updateTabFromHash)
        return () => window.removeEventListener("hashchange", updateTabFromHash)
    }, [])
    useEffect(() => {

        if (activeItem) {
            window.location.hash = encodeURIComponent(activeItem)
        }
    }, [activeItem])
    return (
        <div className="text-white flex flex-col">
            <div className="p-4">
                <h2 className="text-sm font-medium text-gray-400 mb-2">Account</h2>
                <nav className="space-y-1">
                    {accountItems.map((item) => (
                        <button
                            key={item.label}
                            className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${activeItem === item.key ? "bg-gray-800" : "hover:bg-gray-900"
                                }`}
                            onClick={activeItem === item.key ? undefined : () => setActiveItem(item.key)}
                        >
                            <span className="mr-3 text-gray-400">{item.icon}</span>
                            <span>{item.label}</span>
                            {/* {item.notification && (
                                <span className="ml-auto">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                </span>
                            )} */}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="p-4 pt-2">
                <h2 className="text-sm font-medium text-gray-400 mb-2">Airsend Mail</h2>
                <nav className="space-y-1">
                    {mailItems.map((item) => (
                        <button
                            key={item.label}
                            className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${activeItem === item.key ? "bg-gray-800" : "hover:bg-gray-900"
                                }`}
                            onClick={activeItem === item.key ? undefined : () => setActiveItem(item.key)}

                        >
                            <span className="mr-3 text-gray-400">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    )
}

