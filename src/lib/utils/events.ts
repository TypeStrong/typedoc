// Backbone.js 1.2.3
// (c) 2010-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Backbone may be freely distributed under the MIT license.
// For all details and documentation:
// https://backbonejs.org
//
// The Events object is a typesafe conversion of Backbones Events object:
// https://github.com/jashkenas/backbone/blob/05fde9e201f7e2137796663081105cd6dad12a98/backbone.js#L119-L374

import * as _ from 'lodash';

export interface EventCallback extends Function {
    _callback?: Function;
}

interface EventListener {
    obj: any;
    objId: number;
    id: number;
    listeningTo: EventListeners;
    count: number;
}

interface EventListeners {
    [id: number]: EventListener;
}

interface EventHandler {
    callback: EventCallback;
    context: any;
    ctx: any;
    listening: EventListener;
    priority: number;
}

interface EventHandlers {
    [name: string]: EventHandler[];
}

export interface EventMap {
    [name: string]: EventCallback;
}

interface EventIteratee<T, U> {
    (events: U, name: string, callback: Function | undefined, options: T): U;
}

interface EventTriggerer {
    (events: EventHandler[], args: any[]): void;
}

interface OnApiOptions {
    context: any;
    ctx: any;
    listening: any;
    priority: number;
}

interface OffApiOptions {
    context: any;
    listeners: any;
}

// Regular expression used to split event strings.
const eventSplitter = /\s+/;

/**
 * Iterates over the standard `event, callback` (as well as the fancy multiple
 * space-separated events `"change blur", callback` and jQuery-style event
 * maps `{event: callback}`).
 */
function eventsApi<T, U>(
    iteratee: EventIteratee<T, U>,
    events: U, name: EventMap | string | undefined,
    callback: EventCallback | undefined,
    options: T): U {
    let i = 0, names: string[];

    if (name && typeof name === 'object') {
        // Handle event maps.
        if (callback !== void 0 && 'context' in options && options['context'] === void 0) {
            options['context'] = callback;
        }

        for (names = _.keys(name); i < names.length ; i++) {
            events = eventsApi(iteratee, events, names[i], name[names[i]], options);
        }
    // tslint:disable-next-line:strict-type-predicates
    } else if (name && typeof name === 'string' && eventSplitter.test(name)) {
        // Handle space separated event names by delegating them individually.
        for (names = name.split(eventSplitter); i < names.length; i++) {
            events = iteratee(events, names[i], callback, options);
        }
    } else {
        // Finally, standard events.
        events = iteratee(events, <any> name, callback, options);
    }

    return events;
}

/**
 * The reducing API that adds a callback to the `events` object.
 */
function onApi(events: EventHandlers, name: string, callback: EventCallback | undefined, options: OnApiOptions): EventHandlers {
    if (callback) {
        const handlers = events[name] || (events[name] = []);
        const context = options.context, ctx = options.ctx, listening = options.listening, priority = options.priority;
        if (listening) {
            listening.count++;
        }

        handlers.push({
            callback:  callback,
            context:   context,
            ctx:       context || ctx,
            listening: listening,
            priority:  priority
        });

        handlers.sort((a, b) => b.priority - a.priority);
    }

    return events;
}

/**
 * The reducing API that removes a callback from the `events` object.
 */
function offApi(events: EventHandlers | undefined, name: string, callback: EventCallback | undefined, options: OffApiOptions): EventHandlers | undefined {
    if (!events) {
        return;
    }

    let i = 0, listening: EventListener;
    const context = options.context, listeners = options.listeners;

    // Delete all events listeners and "drop" events.
    if (!name && !callback && !context) {
        const ids = _.keys(listeners);
        for (; i < ids.length; i++) {
            listening = listeners[ids[i]];
            delete listeners[listening.id];
            delete listening.listeningTo[listening.objId];
        }
        return;
    }

    const names = name ? [name] : _.keys(events);
    for (; i < names.length; i++) {
        name = names[i];
        const handlers = events[name];

        // Bail out if there are no events stored.
        if (!handlers) {
            break;
        }

        // Replace events if there are any remaining.  Otherwise, clean up.
        const remaining: EventHandler[] = [];
        for (let j = 0; j < handlers.length; j++) {
            const handler = handlers[j];
            if (
                callback && callback !== handler.callback &&
                callback !== handler.callback._callback ||
                context && context !== handler.context
            ) {
                remaining.push(handler);
            } else {
                listening = handler.listening;
                if (listening && --listening.count === 0) {
                    delete listeners[listening.id];
                    delete listening.listeningTo[listening.objId];
                }
            }
        }

        // Update tail event if the list has any events.  Otherwise, clean up.
        if (remaining.length) {
            events[name] = remaining;
        } else {
            delete events[name];
        }
    }

    if (_.size(events)) {
        return events;
    }
}

/**
 * Reduces the event callbacks into a map of `{event: onceWrapper`.}
 * `offer` unbinds the `onceWrapper` after it has been called.
 */
function onceMap(map: EventMap, name: string, callback: EventCallback | undefined, offer: Function): EventMap {
    if (callback) {
        const once = map[name] = <EventCallback> _.once(function() {
            offer(name, once);
            callback.apply(this, arguments);
        });

        once._callback = callback;
    }

    return map;
}

/**
 * Handles triggering the appropriate event callbacks.
 */
function triggerApi(objEvents: EventHandlers, name: string, callback: Function | undefined, args: any[], triggerer: EventTriggerer = triggerEvents): EventHandlers {
    if (objEvents) {
        const events = objEvents[name];
        let allEvents = objEvents['all'];
        if (events && allEvents) {
            allEvents = allEvents.slice();
        }
        if (events) {
            triggerer(events, args);
        }
        if (allEvents) {
            triggerer(allEvents, [name].concat(args));
        }
    }

    return objEvents;
}

/**
 * A difficult-to-believe, but optimized internal dispatch function for
 * triggering events. Tries to keep the usual cases speedy (most internal
 * Backbone events have 3 arguments).
 */
function triggerEvents(events: EventHandler[], args: any[]) {
    let ev: EventHandler, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
        case 0: while (++i < l) { (ev = events[i]).callback.call(ev.ctx); } return;
        case 1: while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1); } return;
        case 2: while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1, a2); } return;
        case 3: while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); } return;
        default: while (++i < l) { (ev = events[i]).callback.apply(ev.ctx, args); } return;
    }
}

/**
 * An event object that can be processed with [[Events]].
 */
export class Event {
    /**
     * The name of the event.
     */
    private _name: string;

    /**
     * Has [[Event.stopPropagation]] been called?
     */
    private _isPropagationStopped = false;

    /**
     * Has [[Event.preventDefault]] been called?
     */
    private _isDefaultPrevented = false;

    /**
     * Create a new Event instance.
     */
    constructor(name: string) {
        this._name = name;
    }

    /**
     * Stop the propagation of this event. Remaining event handlers will not be executed.
     */
    stopPropagation() {
        this._isPropagationStopped = true;
    }

    /**
     * Prevent the default action associated with this event from being executed.
     */
    preventDefault() {
        this._isDefaultPrevented = true;
    }

    /**
     * Return the event name.
     */
    get name(): string {
        return this._name;
    }

    /**
     * Has [[Event.stopPropagation]] been called?
     */
    get isPropagationStopped(): boolean {
        return this._isPropagationStopped;
    }

    /**
     * Has [[Event.preventDefault]] been called?
     */
    get isDefaultPrevented(): boolean {
        return this._isDefaultPrevented;
    }
}

/**
 * A class that provides a custom event channel.
 *
 * You may bind a callback to an event with `on` or remove with `off`;
 * `trigger`-ing an event fires all callbacks in succession.
 */
export class EventDispatcher {
    /**
     * Map of all handlers registered with the "on" function.
     */
    private _events?: EventHandlers;

    /**
     * Map of all objects this instance is listening to.
     */
    private _listeningTo?: EventListeners;

    /**
     * Map of all objects that are listening to this instance.
     */
    private _listeners?: EventListeners;

    /**
     * A unique id that identifies this instance.
     */
    private get _listenId(): string {
        return this._savedListenId || (this._savedListenId = _.uniqueId('l'));
    }
    private _savedListenId?: string;

    /**
     * Bind an event to a `callback` function. Passing `"all"` will bind
     * the callback to all events fired.
     */
    on(eventMap: EventMap, context?: any);
    on(eventMap: EventMap, callback?: EventCallback, context?: any, priority?: number);
    on(name: string, callback: EventCallback, context?: any, priority?: number);
    on(nameOrMap: EventMap|string, callback: EventCallback, context?: any, priority?: number) {
        this.internalOn(nameOrMap, callback, context, priority);
        return this;
    }

    /**
     * Guard the `listening` argument from the public API.
     */
    private internalOn(name: EventMap | string, callback: EventCallback | undefined, context?: any, priority: number = 0, listening?: EventListener) {
        this._events = eventsApi(onApi, this._events || <EventHandlers> {}, name, callback, {
            context: context,
            ctx: this,
            listening: listening,
            priority: priority
        });

        if (listening) {
            const listeners = this._listeners || (this._listeners = {});
            listeners[listening.id] = listening;
        }
    }

    /**
     * Bind an event to only be triggered a single time. After the first time
     * the callback is invoked, its listener will be removed. If multiple events
     * are passed in using the space-separated syntax, the handler will fire
     * once for each event, not once for a combination of all events.
     */
    once(eventMap: EventMap, context?: any);
    once(name: string, callback: EventCallback, context?: any, priority?: any);
    once(name: EventMap|string, callback?: EventCallback, context?: any, priority?: number) {
        // Map the event into a `{event: once}` object.
        const events = eventsApi(onceMap, <EventMap> {}, name, callback, _.bind(this.off, this));
        return this.on(events, void 0, context, priority);
    }

    /**
     * Remove one or many callbacks. If `context` is null, removes all
     * callbacks with that function. If `callback` is null, removes all
     * callbacks for the event. If `name` is null, removes all bound
     * callbacks for all events.
     */
    off();
    off(eventMap: EventMap | undefined, context?: any);
    off(name: string | undefined, callback?: EventCallback, context?: any);
    off(name?: EventMap|string, callback?: EventCallback, context?: any) {
        if (!this._events) {
            return this;
        }

        this._events = eventsApi(offApi, this._events, name, callback, {
            context: context,
            listeners: this._listeners
        });

        return this;
    }

    /**
     * Inversion-of-control versions of `on`. Tell *this* object to listen to
     * an event in another object... keeping track of what it's listening to
     * for easier unbinding later.
     */
    listenTo(obj: EventDispatcher, name: EventMap|string, callback?: EventCallback, priority?: number) {
        if (!obj) {
            return this;
        }
        const id = obj._listenId;
        const listeningTo = this._listeningTo || (this._listeningTo = {});
        let listening = listeningTo[id];

        // This object is not listening to any other events on `obj` yet.
        // Setup the necessary references to track the listening callbacks.
        if (!listening) {
            const thisId = this._listenId;
            listening = listeningTo[id] = {
                obj: obj,
                objId: id,
                id: thisId,
                listeningTo: listeningTo,
                count: 0
            };
        }

        // Bind callbacks on obj, and keep track of them on listening.
        obj.internalOn(name, callback, this, priority, listening);
        return this;
    }

    /**
     * Inversion-of-control versions of `once`.
     */
    listenToOnce(obj: EventDispatcher, eventMap: EventMap);
    listenToOnce(obj: EventDispatcher, name: string, callback: EventCallback, priority?: number);
    listenToOnce(obj: EventDispatcher, name: EventMap|string, callback?: EventCallback, priority?: number) {
        // Map the event into a `{event: once}` object.
        const events = eventsApi(onceMap, <EventMap> {}, name, callback, _.bind(this.stopListening, this, obj));
        return this.listenTo(obj, events, void 0, priority);
    }

    /**
     * Tell this object to stop listening to either specific events ... or
     * to every object it's currently listening to.
     */
    stopListening(obj?: EventDispatcher, name?: EventMap|string, callback?: EventCallback) {
        const listeningTo = this._listeningTo;
        if (!listeningTo) {
            return this;
        }

        const ids = obj ? [obj._listenId] : _.keys(listeningTo);
        for (let i = 0; i < ids.length; i++) {
            const listening = listeningTo[ids[i]];

            // If listening doesn't exist, this object is not currently
            // listening to obj. Break out early.
            if (!listening) {
                break;
            }

            listening.obj.off(name, callback, this);
        }

        if (_.isEmpty(listeningTo)) {
            this._listeningTo = void 0;
        }

        return this;
    }

    /**
     * Trigger one or many events, firing all bound callbacks. Callbacks are
     * passed the same arguments as `trigger` is, apart from the event name
     * (unless you're listening on `"all"`, which will cause your callback to
     * receive the true name of the event as the first argument).
     */
    trigger(name: Event|EventMap|string, ...args: any[]) {
        if (!this._events) {
            return this;
        }

        if (name instanceof Event) {
            triggerApi(this._events, name.name, void 0, [name], (events: EventHandler[], args: any[]) => {
                let ev: EventHandler, i = -1, l = events.length;
                while (++i < l) {
                    if (name.isPropagationStopped) {
                        return;
                    }
                    ev = events[i];
                    ev.callback.apply(ev.ctx, args);
                }
            });
        } else {
            eventsApi(triggerApi, this._events, name, void 0, args);
        }

        return this;
    }
}
