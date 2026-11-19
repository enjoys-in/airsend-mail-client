import { createSlotStore } from "@/components/common/slot-store";

// The AirSend sidebar panel Nimbus's sidebar renders into (see src/components/common/slot-store.ts).
// Plain TypeScript, no Nimbus imports, so the host can import it without pulling the Files app in.
const store = createSlotStore();

export const setFilesSidebarSlot = store.setSlot;
export const setFilesSidebarReady = store.setReady;
/** The AirSend sidebar panel Nimbus's sidebar renders into, or null when there isn't one. */
export const useFilesSidebarSlot = store.useSlot;
export const useFilesSidebarReady = store.useReady;
