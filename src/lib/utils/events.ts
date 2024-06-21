import { insertPrioritySorted } from "./array";

/**
 * Intentionally very simple event emitter.
 *
 * @privateRemarks
 * This is essentially a stripped down copy of EventHooks in hooks.ts.
 */
export class EventDispatcher<T extends Record<keyof T, unknown[]>> {
    // Function is *usually* not a good type to use, but here it lets us specify stricter
    // contracts in the methods while not casting everywhere this is used.
    private _listeners = new Map<
        keyof T,
        {
            listener: Function;
            priority: number;
        }[]
    >();

    /**
     * Starts listening to an event.
     * @param event the event to listen to.
     * @param listener function to be called when an this event is emitted.
     * @param priority optional priority to insert this hook with.
     */
    on<K extends keyof T>(
        event: K,
        listener: (this: undefined, ...args: T[K]) => void,
        priority = 0,
    ): void {
        const list = (this._listeners.get(event) || []).slice();
        insertPrioritySorted(list, { listener, priority });
        this._listeners.set(event, list);
    }

    /**
     * Stops listening to an event.
     * @param event the event to stop listening to.
     * @param listener the function to remove from the listener array.
     */
    off<K extends keyof T>(
        event: K,
        listener: (this: undefined, ...args: T[K]) => void,
    ): void {
        const listeners = this._listeners.get(event);
        if (listeners) {
            const index = listeners.findIndex((lo) => lo.listener === listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emits an event to all currently subscribed listeners.
     * @param event the event to emit.
     * @param args any arguments required for the event.
     */
    trigger<K extends keyof T>(event: K, ...args: T[K]): void {
        const listeners = this._listeners.get(event)?.slice() || [];
        for (const { listener } of listeners) {
            listener(...args);
        }
    }
}
