import { CustomEventKey } from "@/hooks/use-custom-event";


type Callback<T = any> = (payload: T) => void;

const listeners = new Map<CustomEventKey, Set<Callback>>();

export const eventBus = {
    emit<T>(key: CustomEventKey, payload?: T) {
        window.dispatchEvent(new CustomEvent<T>(key, { detail: payload }));
        listeners.get(key)?.forEach(fn => fn(payload));
    },

    emitOnce<T>(key: CustomEventKey, payload?: T) {
        if (!listeners.has(key)) {
            this.emit(key, payload);
            listeners.set(key, new Set()); // prevents re-emitting
        }
    },

    on<T>(key: CustomEventKey, fn: Callback<T>) {
        if (!listeners.has(key)) listeners.set(key, new Set());
        listeners.get(key)!.add(fn);
        return () => listeners.get(key)!.delete(fn); // unsubscribe
    },

    once<T>(key: CustomEventKey, fn: Callback<T>) {
        const wrapper = (data: T) => {
            fn(data);
            this.off(key, wrapper);
        };
        this.on(key, wrapper);
    },

    off<T>(key: CustomEventKey, fn: Callback<T>) {
        listeners.get(key)?.delete(fn);
    },

    clear(key: CustomEventKey) {
        listeners.delete(key);
    },
};
