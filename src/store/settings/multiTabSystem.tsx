import { create } from "zustand";
import EmailComposer from '../../app/v2/(version-2)/u/compose/_components/emailComposer';

interface Tab {
    id: number;
    title: string;
    content?: React.ReactNode;
}

// Zustand store
interface TabStore {
    tabs: Tab[];
    visibleTabs: Tab[];
    queuedTabs: Tab[];
    minimizedTabs: number[];
    fullscreenTab: Tab | null;
    nextTabId: number;
    MAX_VISIBLE_TABS: number;
    focusedTab: number;

    createTab: () => void;
    closeTab: (tabId: number) => void;
    minimizeTab: (tabId: number) => void;
    restoreTab: (tabId: number) => void;
    toggleFullscreen: (tabId: number) => void;
    setFocusedTab: (tabId: number) => void;
}

export const useMultiTabStore = create<TabStore>((set, get) => ({
    tabs: [],
    visibleTabs: [],
    queuedTabs: [],
    minimizedTabs: [],
    fullscreenTab: null,
    nextTabId: 1,
    MAX_VISIBLE_TABS: 2,

    createTab: () => {
        const id = get().nextTabId;
        const newTab: Tab = {
            id,
            title: "New message",
            content: <EmailComposer showHeader={false} tabId={id} />,
        };

        const visible = [...get().visibleTabs];
        const queued = [...get().queuedTabs];

        if (visible.length < get().MAX_VISIBLE_TABS) {
            visible.push(newTab);
        } else {
            queued.push(visible[0]);
            visible.splice(0, 1, newTab);
        }

        set({
            tabs: [...get().tabs, newTab],
            visibleTabs: visible,
            queuedTabs: queued,
            nextTabId: id + 1,
        });
    },

    closeTab: (tabId) => {
        const visible = get().visibleTabs.filter((t) => t.id !== tabId);
        const queued = get().queuedTabs.filter((t) => t.id !== tabId);

        if (visible.length < get().MAX_VISIBLE_TABS && queued.length > 0) {
            visible.push(queued[0]);
            queued.splice(0, 1);
        }

        set({
            tabs: get().tabs.filter((t) => t.id !== tabId),
            visibleTabs: visible,
            queuedTabs: queued,
            minimizedTabs: get().minimizedTabs.filter((id) => id !== tabId),
            fullscreenTab: get().fullscreenTab?.id === tabId ? null : get().fullscreenTab,
        });
    },

    minimizeTab: (tabId) => {
        const visible = get().visibleTabs.filter((t) => t.id !== tabId);
        const queued = [...get().queuedTabs];

        if (visible.length < get().MAX_VISIBLE_TABS && queued.length > 0) {
            visible.push(queued[0]);
            queued.splice(0, 1);
        }

        set({
            visibleTabs: visible,
            queuedTabs: queued,
            minimizedTabs: [...get().minimizedTabs, tabId],
        });
    },

    restoreTab: (tabId) => {
        const tab = get().tabs.find((t) => t.id === tabId);
        if (!tab) return;

        const visible = [...get().visibleTabs];
        const queued = [...get().queuedTabs];

        if (visible.length < get().MAX_VISIBLE_TABS) {
            visible.push(tab);
        } else {
            queued.push(visible[0]);
            visible.splice(0, 1, tab);
        }

        set({
            visibleTabs: visible,
            queuedTabs: queued,
            minimizedTabs: get().minimizedTabs.filter((id) => id !== tabId),
        });
    },

    toggleFullscreen: (tabId) => {
        const tab = get().tabs.find((t) => t.id === tabId);
        if (!tab) return;

        set({
            fullscreenTab: get().fullscreenTab?.id === tabId ? null : tab,
        });
    },
    focusedTab: 0,
    setFocusedTab: (tabId) => {
        set({
            focusedTab: tabId,
        });
    },
}));