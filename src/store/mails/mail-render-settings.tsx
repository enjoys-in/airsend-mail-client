import { create } from "zustand";


interface MailRenderSettingsState {
    renderStyle: 'light' | 'dark';
    setRenderStyle: (style: 'light' | 'dark') => void;
    renderMode: 'iframe' | 'dynamicIframe';
    setRenderMode: (mode: 'iframe' | 'dynamicIframe') => void;
    cspViolation: boolean;
    setCspViolation: (violation: boolean) => void;
    imagesEnabled: boolean;
    setImagesEnabled: (enabled: boolean) => void;
    // reply

}

export const useMailRenderSettings = create<MailRenderSettingsState>()((set) => ({
    renderStyle: 'dark',
    setRenderStyle: (style) => set({ renderStyle: style }),
    renderMode: 'iframe',
    setRenderMode: (mode) => set({ renderMode: mode }),
    cspViolation: false,
    setCspViolation: (violation) => set({ cspViolation: violation }),
    imagesEnabled: false,
    setImagesEnabled: (enabled) => set({ imagesEnabled: enabled }),


}))