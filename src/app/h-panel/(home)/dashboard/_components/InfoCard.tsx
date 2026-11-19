"use client"

import React from "react"
import { AlertCircle, CheckCircle, Globe, Mail, MailCheck, Users, UserCheck, XCircle, type LucideIcon } from "lucide-react"
import { Stat } from "@/components/h-panel/kit"

/**
 * A dashboard number. The statistics are fetched in server components, which cannot pass a component function to the
 * client kit, so the icon is chosen by key here.
 */
const ICONS = {
    users: Users,
    userCheck: UserCheck,
    domains: CheckCircle,
    globe: Globe,
    mail: Mail,
    mailCheck: MailCheck,
    alert: AlertCircle,
    failed: XCircle,
} satisfies Record<string, LucideIcon>

export type InfoCardIcon = keyof typeof ICONS

const InfoCard = ({ title, icon, value }: { title: string; icon: InfoCardIcon; value: string }) => {
    return <Stat label={title} value={value} icon={ICONS[icon]} />
}

export default InfoCard
