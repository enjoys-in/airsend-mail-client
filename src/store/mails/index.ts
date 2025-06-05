import { SingleEmailResponse } from '@/lib/types/EmailResponse'
import { MailData } from '@/lib/types/mail.interface'
import { QuotaResponse } from '@/lib/types/QuotaResponse'
import { create } from 'zustand'



const ALLOWED_SPECIAL_USE = [
    { name: "All Mail", path: "INBOX", special_use: "\\All", unseen_count: 0, total_count: 0 },
    { name: "Inbox", path: "INBOX", special_use: "\\Inbox", unseen_count: 0, total_count: 0 },
    { name: "Sent", path: "Sent", special_use: "\\Sent", unseen_count: 0, total_count: 0 },
    { name: "Drafts", path: "Drafts", special_use: "\\Drafts", unseen_count: 0, total_count: 0 },
    { name: "Trash", path: "Trash", special_use: "\\Trash", unseen_count: 0, total_count: 0 },
    { name: "Spam", path: "Spam", special_use: "\\Junk", unseen_count: 0, total_count: 0 },
    { name: "Archive", path: "Archive", special_use: "\\Archive", unseen_count: 0, total_count: 0 },

]

interface State {
    loading: boolean
    setLoading: (loading: boolean) => void

    quota: QuotaResponse | null
    setQuota: (storage: QuotaResponse | null) => void

    error: string | null
    setError: (error: string | null) => void

    selected_mailbox: string | null
    setSelectedMailbox: (name: string | null) => void

    all_mailbox: typeof ALLOWED_SPECIAL_USE
    setAllMailbox: (list: typeof ALLOWED_SPECIAL_USE) => void

    config: Record<string, any>
    setConfig: (config: Record<string, any>) => void

    openConfigDialog: boolean
    setOpenConfigDialog: (input: boolean) => void

    active_profile: { id: string, name: string, quota: number, usage: number, }
    setActiveProfile: (profile: { id: string, name: string, quota: number, usage: number, }) => void

    today_meetings: { title: string, start_time: string, end_time: string }[]
    setTodayMeetings: (meetings: { title: string, start_time: string, end_time: string }) => void

    mailboxes: { name: string }[]
    setMailboxes: (mailboxes: { name: string }) => void

    selectedMail: MailData & Record<string, any> | null
    setSelectedMail: (id: Record<string, any> & MailData) => void

    checkedItems: string[]
    setCheckedItems: (items: string[]) => void

    lables: { name: string; color: string, isActive: boolean, id: string }[]
    setLables: (items: { name: string; color: string, isActive: boolean, id: string }) => void

    all_emails: MailData[] | null
    setAllEmails: (list: MailData[]) => void
}
// devtools((set) => ({
//     selectedMail: null,
//     setSelectedMail: (id) => set({ selectedMail: id }),
//     selectedMailIndex: 0,
//     setSelectedMailIndex: (index) => set({ selectedMailIndex: index }),
// }))
export const useMailStore = create<State>()((set) => ({
    loading: false,
    setLoading: (loading) => set({ loading }),

    selectedMail: null,
    setSelectedMail: (id) => set({ selectedMail: id }),

    checkedItems: [],
    setCheckedItems: (items) => set({ checkedItems: items }),

    lables: [],
    setLables: (items) => set(state => ({ lables: [...state.lables, items] })),

    mailboxes: [],
    setMailboxes: (mailboxe) => set(state => ({ mailboxes: [...state.mailboxes, mailboxe] })),

    active_profile: { id: "", name: "", quota: 0, usage: 0 },
    setActiveProfile: (profile) => set({ active_profile: profile }),

    today_meetings: [],
    setTodayMeetings: (meetings) => set(state => ({ today_meetings: [...state.today_meetings, meetings] })),

    openConfigDialog: false,
    setOpenConfigDialog: (input) => set({ openConfigDialog: input }),

    config: {},
    setConfig: (config) => set({ config }),

    error: null,
    setError: (error) => set({ error }),

    selected_mailbox: null,
    setSelectedMailbox: (name) => set({ selected_mailbox: name }),

    all_mailbox: ALLOWED_SPECIAL_USE.slice(1, ALLOWED_SPECIAL_USE.length),
    setAllMailbox: (list) => set({ all_mailbox: list }),

    all_emails: null,
    setAllEmails: (list) => set({ all_emails: list }),

    quota: null,
    setQuota: (quota) => set({ quota }),
})
)