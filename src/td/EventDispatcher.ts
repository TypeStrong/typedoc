module td
{
    export interface IListener {
        handler:Function;
        scope:any;
        priority:number;
    }


    /**
     * Base class of all events.
     *
     * Events are emitted by [[EventDispatcher]] and are passed to all
     * handlers registered for the associated event name.
     */
    export class Event
    {
        /**
         * Has [[Event.stopPropagation]] been called?
         */
        public isPropagationStopped:boolean;

        /**
         * Has [[Event.preventDefault]] been called?
         */
        public isDefaultPrevented:boolean;


        /**
         * Stop the propagation of this event. Remaining event handlers will not be executed.
         */
        stopPropagation() {
            this.isPropagationStopped = true;
        }


        /**
         * Prevent the default action associated with this event from being executed.
         */
        preventDefault() {
            this.isDefaultPrevented = true;
        }
    }


    /**
     * Base class of all objects dispatching events.
     *
     * Events are dispatched by calling [[EventDispatcher.dispatch]]. Events must have a name and
     * they can carry additional arguments that are passed to all handlers. The first argument can
     * be an instance of [[Event]] providing additional functionality.
     */
    export class EventDispatcher
    {
        /**
         * List of all registered handlers grouped by event name.
         */
        private listeners:{[event:string]:IListener[]};


        /**
         * Dispatch an event with the given event name.
         *
         * @param event  The name of the event to dispatch.
         * @param args   Additional arguments to pass to the handlers.
         */
        dispatch(event:string, ...args:any[]) {
            if (!this.listeners) return;
            if (!this.listeners[event]) return;

            var obj:Event;
            if (args.length > 0 && args[0] instanceof Event) {
                obj = args[0];
                obj.isDefaultPrevented = false;
                obj.isPropagationStopped = false;
            }

            var listeners = this.listeners[event];
            for (var i = 0, c = listeners.length; i < c; i++) {
                var listener = listeners[i];
                listener.handler.apply(listener.scope, args);

                if (obj && obj.isPropagationStopped) break;
            }
        }


        /**
         * Register an event handler for the given event name.
         *
         * @param event     The name of the event the handler should be registered to.
         * @param handler   The callback that should be invoked.
         * @param scope     The scope the callback should be executed in.
         * @param priority  A numeric value describing the priority of the handler. Handlers
         *                  with higher priority will be executed earlier.
         */
        on(event:string, handler:Function, scope:any = null, priority:number = 0) {
            if (!this.listeners) this.listeners = {};
            if (!this.listeners[event]) this.listeners[event] = [];

            var listeners = this.listeners[event];
            listeners.push({
                handler:  handler,
                scope:    scope,
                priority: priority
            });

            listeners.sort((a, b) => b.priority - a.priority);
        }


        /**
         * Remove an event handler.
         *
         * @param event    The name of the event whose handlers should be removed.
         * @param handler  The callback that should be removed.
         * @param scope    The scope of the callback that should be removed.
         */
        off(event:string = null, handler:Function = null, scope:any = null) {
            if (!this.listeners) {
                return;
            }

            if (!event && !handler && !scope) {
                this.listeners = null;
            } else {
                var offEvent = (event:string) => {
                    if (!this.listeners[event]) return;
                    var listeners = this.listeners[event];
                    var index = 0, count = listeners.length;
                    while (index < count) {
                        var listener = listeners[index];
                        if ((handler && listener.handler != handler) || (scope && listener.scope != scope)) {
                            index += 1;
                        } else {
                            listeners.splice(index, 1);
                            count -= 1;
                        }
                    }

                    if (listeners.length == 0) {
                        delete this.listeners[event];
                    }
                };

                if (!event) {
                    for (event in this.listeners) {
                        if (!this.listeners.hasOwnProperty(event)) continue;
                        offEvent(event);
                    }
                } else {
                    offEvent(event);
                }
            }
        }
    }
}