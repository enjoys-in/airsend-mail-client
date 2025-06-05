import { create } from 'zustand'


interface State {
    loading: boolean
    setLoading: (loading: boolean) => void

    content:string
    setContent: (content: string) => void

}

export const useEditorStore = create<State>()((set) => ({
    loading: false,
    setLoading: (loading) => set({ loading }),
    content: "",
    setContent: (content) => set({ content }),
    
}))