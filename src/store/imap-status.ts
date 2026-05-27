import { create } from 'zustand'

export interface ImapStatus {
  imapConnected: boolean
  since: string | null
}

interface ImapStatusStore extends ImapStatus {
  setConnected: (timestamp: string) => void
  setDisconnected: (timestamp: string) => void
  setInitialStatus: (status: { imapConnected: boolean; imapConnectedAt?: string; imapDisconnectedAt?: string }) => void
}

export const useImapStatusStore = create<ImapStatusStore>((set) => ({
  imapConnected: false,
  since: null,

  setConnected: (timestamp) =>
    set({ imapConnected: true, since: timestamp }),

  setDisconnected: (timestamp) =>
    set({ imapConnected: false, since: timestamp }),

  setInitialStatus: (status) =>
    set({
      imapConnected: status.imapConnected,
      since: status.imapConnectedAt || status.imapDisconnectedAt || null,
    }),
}))
