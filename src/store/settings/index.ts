import { AccountSettings } from '@/lib/types/account-settings.interface'
import { create } from 'zustand'

interface SignatureEditorStoreState {
    type: "canvas" | "editor" | "upload"
    setType: (item: SignatureEditorStoreState["type"]) => void


}

interface State {
    keys: Record<string, string>
    activeItem: string
    setActiveItem: (item: string) => void
    settings: Partial<AccountSettings> | null
    setSettings: (item: Partial<AccountSettings>) => void
}


export const useSignatureEditorStore = create<SignatureEditorStoreState>()((set) => ({
    type: "editor",
    setType: (item) => set({ type: item }),
}))

export const useSettingsStore = create<State>()((set) => ({
    keys: {
        "account-and-password": "Account and password",
        "appearance": "Appearance",
        "signatures": "Signatures",
        "notifications": "Notifications",
        "import-via-easy-switch": "Import via Easy Switch",
        "filters": "Filters",
        "email-config": "Email Config",
        "email-privacy": "Email privacy",
        "encryption-and-keys": "Encryption and keys",
        "folders-and-labels": "Folders and labels",
        "email-forwarding": "Email Forwarding",
        "identity-and-addresses": "Identity and addresses",
        "messages-and-composing": "Messages and composing"
    },
    activeItem: "Account and password",
    setActiveItem: (item) => set({ activeItem: item }),
    settings: null,
    setSettings: (item) => set((state) => ({
        settings: {
            ...state.settings,
            ...item,
        },
    })),

})
)
