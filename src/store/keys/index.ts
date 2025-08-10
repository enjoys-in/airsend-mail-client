
import { EncodedMessageResponse } from '@/lib/types/mail.interface'
import { create } from 'zustand'



interface State {
    encrypted: null | EncodedMessageResponse
    setEncryptedData: (item: EncodedMessageResponse) => void
}


export const useKeyStore = create<State>()((set) => ({
    encrypted: null,
    setEncryptedData: (item) => set({ encrypted: item }),
}))

