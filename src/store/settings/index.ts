import { AccountSettings } from '@/lib/types/account-settings.interface'
import { create } from 'zustand'

interface SignatureEditorStoreState {
    type: "canvas" | "editor" | "upload"
    setType: (item: SignatureEditorStoreState["type"]) => void


}

interface State {
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
