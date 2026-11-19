import { createSlotStore } from "@/components/common/slot-store";

// The AirSend sidebar panel Kaneo's sidebar renders into (see src/components/common/slot-store.ts).
// Plain TypeScript, no Kaneo imports, so the host can import it without pulling the Kaneo app in.
const store = createSlotStore();

export const setTasksSidebarSlot = store.setSlot;
export const setTasksSidebarReady = store.setReady;
/** The AirSend sidebar panel Kaneo's sidebar renders into, or null when there isn't one. */
export const useTasksSidebarSlot = store.useSlot;
export const useTasksSidebarReady = store.useReady;
