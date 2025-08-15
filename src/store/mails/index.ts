import { SingleEmailResponse } from '@/lib/types/EmailResponse'
import { GetAllMailsPayload, MailData } from '@/lib/types/mail.interface'
import { MailBoxListAPIResponse, MailLablesType } from '@/lib/types/MailBoxListResponse.interface'
import { QuotaResponse } from '@/lib/types/QuotaResponse'
import { create } from 'zustand'



const ALLOWED_SPECIAL_USE = [
    { name: "All Mail", path: "INBOX", special_use: "\\All", unseen_count: 0, total_count: 0 },
    { name: "Inbox", path: "inbox", special_use: "\\Inbox", unseen_count: 0, total_count: 0 },
    { name: "Sent", path: "sent", special_use: "\\Sent", unseen_count: 0, total_count: 0 },
    { name: "Drafts", path: "drafts", special_use: "\\Drafts", unseen_count: 0, total_count: 0 },
    { name: "Deleted", path: "deleted", special_use: "\\Trash", unseen_count: 0, total_count: 0 },
    { name: "Spam", path: "spam", special_use: "\\Junk", unseen_count: 0, total_count: 0 },
    { name: "Archive", path: "archive", special_use: "\\Archive", unseen_count: 0, total_count: 0 },
]
type Labels =( Omit<MailBoxListAPIResponse, "type"> & { type: MailLablesType.LABEL })[]
type Folders =( Omit<MailBoxListAPIResponse, "type"> & { type: MailLablesType.FOLDER })[]
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

    all_folders: Folders | null
    setAllFolders: (list: Folders | null) => void

    all_labels: Labels | null
    setAllLabels: (list: Labels | null) => void

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

    selectedMail: GetAllMailsPayload & Record<string, any> | null
    setSelectedMail: (id: Record<string, any> & GetAllMailsPayload) => void

    checkedItems: string[]
    setCheckedItems: (items: string[]) => void

    lables: { name: string; color: string, isActive: boolean, id: string }[]
    setLables: (items: { name: string; color: string, isActive: boolean, id: string }) => void

    all_emails: GetAllMailsPayload[] | null
    setAllEmails: (list: GetAllMailsPayload[]) => void
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

    all_folders: null,
    setAllFolders: (list) => set({ all_folders: list }),

    all_labels: null,
    setAllLabels: (list) => set({ all_labels: list }),
})
)