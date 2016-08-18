// Backbone.js 1.2.3
// (c) 2010-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Backbone may be freely distributed under the MIT license.
// For all details and documentation:
// http://backbonejs.org
//
// The Events object is a typesafe conversion of Backbones Events object:
// https://github.com/jashkenas/backbone/blob/05fde9e201f7e2137796663081105cd6dad12a98/backbone.js#L119-L374

import * as _ from "lodash";


export interface IEventCallback extends Function {
    _callback?:Function;
}

interface IEventListener {
    obj:any;
    objId:number;
    id:number;
    listeningTo:IEventListeners;
    count:number;
}

interface IEventListeners {
    [id:number]:IEventListener;
}

interface IEventHandler {
    callback:IEventCallback;
    context:any;
    ctx:any;
    listening:IEventListener;
    priority:number;
}

interface IEventHandlers {
    [name:string]:IEventHandler[];
}

export interface IEventMap {
    [name:string]:IEventCallback;
}

interface IEventIteratee<T, U> {
    (events:U, name:string, callback:Function, options:T):U
}

interface IOnApiOptions {
    context:any;
    ctx:any;
    listening:any;
    priority:number;
}

interface IOffApiOptions {
    context:any;
    listeners:any;
}


// Regular expression used to split event strings.
var eventSplitter = /\s+/;


/**
 * Iterates over the standard `event, callback` (as well as the fancy multiple
 * space-separated events `"change blur", callback` and jQuery-style event
 * maps `{event: callback}`).
 */
function eventsApi<T, U>(iteratee:IEventIteratee<T, U>, events:U, name:IEventMap|string, callback:IEventCallback, options:T):U {
    var i = 0, names:string[];

    if (name && typeof name === 'object') {
        // Handle event maps.
        if (callback !== void 0 && 'context' in options && options['context'] === void 0) {
            options['context'] = callback;
        }

        for (names = _.keys(name); i < names.length ; i++) {
            events = eventsApi(iteratee, events, names[i], name[names[i]], options);
        }
    } else if (name && typeof name === 'string' && eventSplitter.test(name)) {
        // Handle space separated event names by delegating them individually.
        for (names = name.split(eventSplitter); i < names.length; i++) {
            events = iteratee(events, names[i], callback, options);
        }
    } else {
        // Finally, standard events.
        events = iteratee(events, <any>name, callback, options);
    }

    return events;
}


/**
 * The reducing API that adds a callback to the `events` object.
 */
function onApi(events:IEventHandlers, name:string, callback:IEventCallback, options:IOnApiOptions):IEventHandlers {
    if (callback) {
        var handlers = events[name] || (events[name] = []);
        var context = options.context, ctx = options.ctx, listening = options.listening, priority = options.priority;
        if (listening) listening.count++;

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
function offApi(events:IEventHandlers, name:string, callback:IEventCallback, options:IOffApiOptions):IEventHandlers {
    if (!events) return;

    var i = 0, listening:IEventListener;
    var context = options.context, listeners = options.listeners;

    // Delete all events listeners and "drop" events.
    if (!name && !callback && !context) {
        var ids = _.keys(listeners);
        for (; i < ids.length; i++) {
            listening = listeners[ids[i]];
            delete listeners[listening.id];
            delete listening.listeningTo[listening.objId];
        }
        return;
    }

    var names = name ? [name] : _.keys(events);
    for (; i < names.length; i++) {
        name = names[i];
        var handlers = events[name];

        // Bail out if there are no events stored.
        if (!handlers) break;

        // Replace events if there are any remaining.  Otherwise, clean up.
        var remaining:IEventHandler[] = [];
        for (var j = 0; j < handlers.length; j++) {
            var handler = handlers[j];
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
function onceMap(map:IEventMap, name:string, callback:IEventCallback, offer:Function):IEventMap {
    if (callback) {
        var once = map[name] = <IEventCallback>_.once(function() {
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
function triggerApi(objEvents:IEventHandlers, name:string, callback:Function, args:any[], triggerer:{(events:IEventHandler[], args:any[]):void} = triggerEvents):IEventHandlers {
    if (objEvents) {
        var events = objEvents[name];
        var allEvents = objEvents['all'];
        if (events && allEvents) allEvents = allEvents.slice();
        if (events) triggerer(events, args);
        if (allEvents) triggerer(allEvents, [name].concat(args));
    }

    return objEvents;
}


/**
 * A difficult-to-believe, but optimized internal dispatch function for
 * triggering events. Tries to keep the usual cases speedy (most internal
 * Backbone events have 3 arguments).
 */
function triggerEvents(events:IEventHandler[], args:any[]) {
    var ev:IEventHandler, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
        case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
        case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
        case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
        case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
        default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
}



/**
 * An event object that can be processed with [[Events]].
 */
export class Event
{
    /**
     * The name of the event.
     */
    private _name:string;

    /**
     * Has [[Event.stopPropagation]] been called?
     */
    private _isPropagationStopped:boolean;

    /**
     * Has [[Event.preventDefault]] been called?
     */
    private _isDefaultPrevented:boolean;



    /**
     * Create a new Event instance.
     */
    constructor(name:string) {
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
    get name():string {
        return this._name;
    }


    /**
     * Has [[Event.stopPropagation]] been called?
     */
    get isPropagationStopped():boolean {
        return this._isPropagationStopped;
    }


    /**
     * Has [[Event.preventDefault]] been called?
     */
    get isDefaultPrevented():boolean {
        return this._isDefaultPrevented;
    }
}



/**
 * A class that provides a custom event channel.
 *
 * You may bind a callback to an event with `on` or remove with `off`;
 * `trigger`-ing an event fires all callbacks in succession.
 */
export class EventDispatcher
{
    /**
     * Map of all handlers registered with the "on" function.
     */
    private _events:IEventHandlers;

    /**
     * Map of all objects this instance is listening to.
     */
    private _listeningTo:IEventListeners;

    /**
     * Map of all objects that are listening to this instance.
     */
    private _listeners:IEventListeners;

    /**
     * A unique id that identifies this instance.
     */
    private _listenId:string;



    /**
     * Bind an event to a `callback` function. Passing `"all"` will bind
     * the callback to all events fired.
     */
    on(name:IEventMap|string, callback:IEventCallback, context?:any, priority?:number) {
        this.internalOn(name, callback, context, priority);
        return this;
    }


    /**
     * Guard the `listening` argument from the public API.
     */
    private internalOn(name:IEventMap|string, callback:IEventCallback, context?:any, priority:number = 0, listening?:IEventListener) {
        this._events = eventsApi(onApi, this._events || <IEventHandlers>{}, name, callback, {
            context: context,
            ctx: this,
            listening: listening,
            priority: priority
        });

        if (listening) {
            var listeners = this._listeners || (this._listeners = {});
            listeners[listening.id] = listening;
        }
    }


    /**
     * Bind an event to only be triggered a single time. After the first time
     * the callback is invoked, its listener will be removed. If multiple events
     * are passed in using the space-separated syntax, the handler will fire
     * once for each event, not once for a combination of all events.
     */
    once(name:IEventMap|string, callback:IEventCallback, context?:any, priority?:number) {
        // Map the event into a `{event: once}` object.
        var events = eventsApi(onceMap, <IEventMap>{}, name, callback, _.bind(this.off, this));
        return this.on(events, void 0, context, priority);
    }


    /**
     * Remove one or many callbacks. If `context` is null, removes all
     * callbacks with that function. If `callback` is null, removes all
     * callbacks for the event. If `name` is null, removes all bound
     * callbacks for all events.
     */
    off(name:IEventMap|string, callback:IEventCallback, context?:any) {
        if (!this._events) return this;

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
    listenTo(obj:EventDispatcher, name:IEventMap|string, callback?:IEventCallback, priority?:number) {
        if (!obj) return this;
        var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
        var listeningTo = this._listeningTo || (this._listeningTo = {});
        var listening = listeningTo[id];

        // This object is not listening to any other events on `obj` yet.
        // Setup the necessary references to track the listening callbacks.
        if (!listening) {
            var thisId = this._listenId || (this._listenId = _.uniqueId('l'));
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
    listenToOnce(obj:EventDispatcher, name:IEventMap|string, callback:IEventCallback, priority?:number) {
        // Map the event into a `{event: once}` object.
        var events = eventsApi(onceMap, <IEventMap>{}, name, callback, _.bind(this.stopListening, this, obj));
        return this.listenTo(obj, events, void 0, priority);
    }


    /**
     * Tell this object to stop listening to either specific events ... or
     * to every object it's currently listening to.
     */
    stopListening(obj?:EventDispatcher, name?:IEventMap|string, callback?:IEventCallback) {
        var listeningTo = this._listeningTo;
        if (!listeningTo) return this;

        var ids = obj ? [obj._listenId] : _.keys(listeningTo);
        for (var i = 0; i < ids.length; i++) {
            var listening = listeningTo[ids[i]];

            // If listening doesn't exist, this object is not currently
            // listening to obj. Break out early.
            if (!listening) break;

            listening.obj.off(name, callback, this);
        }

        if (_.isEmpty(listeningTo)) this._listeningTo = void 0;

        return this;
    }


    /**
     * Trigger one or many events, firing all bound callbacks. Callbacks are
     * passed the same arguments as `trigger` is, apart from the event name
     * (unless you're listening on `"all"`, which will cause your callback to
     * receive the true name of the event as the first argument).
     */
    trigger(name:Event|IEventMap|string, ...args:any[]) {
        if (!this._events) return this;

        if (name instanceof Event) {
            triggerApi(this._events, name.name, void 0, [name], (events:IEventHandler[], args:any[]) => {
                var ev:IEventHandler, i = -1, l = events.length;
                while (++i < l) {
                    if (name.isPropagationStopped) return;
                    ev = events[i];
                    ev.callback.apply(ev.ctx, args);
                }
            });
        } else {
            eventsApi(triggerApi, this._events, <IEventMap|string>name, void 0, args);
        }

        return this;
    }
}
