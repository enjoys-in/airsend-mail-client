import { Pill, type Tone } from "@/components/h-panel/kit"
import { DOMAIN_STATUS } from "@/lib/types/mail.interface"

/** Colour for a domain status: verified = green, pending = amber, rejected = red, not started = neutral. */
export const domainStatusTone = (status: string): Tone => {
    switch (status) {
        case DOMAIN_STATUS.VERIFIED:
            return "green"
        case DOMAIN_STATUS.PENDING:
            return "amber"
        case DOMAIN_STATUS.REJECTED:
            return "red"
        default:
            return "neutral"
    }
}

const label = (status: string) => {
    const lower = String(status ?? "").toLowerCase()
    return lower.charAt(0).toUpperCase() + lower.slice(1)
}

export function DomainStatusPill({ status }: { status: string }) {
    return <Pill tone={domainStatusTone(status)}>{label(status)}</Pill>
}
