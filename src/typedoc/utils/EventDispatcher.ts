module TypeDoc
{
    export interface IListener {
        handler:Function;
        scope:any;
        priority:number;
    }


    export interface IListenerRegistry {
        [event:string]:IListener[];
    }


    export class Event
    {
        public isPropagationStopped:boolean;

        public isDefaultPrevented:boolean;


        stopPropagation() {
            this.isPropagationStopped = true;
        }


        preventDefault() {
            this.isDefaultPrevented = true;
        }
    }


    export class EventDispatcher
    {
        private listeners:IListenerRegistry;


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


        off(event:string = null, handler:Function = null, scope:any = null) {
            if (!this.listeners) return;
            if (!event || !handler || !scope) {
                this.listeners = null;
            } else {
                function offEvent(event:string) {
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
                }

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