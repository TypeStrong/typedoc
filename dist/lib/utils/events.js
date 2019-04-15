"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const eventSplitter = /\s+/;
function eventsApi(iteratee, events, name, callback, options) {
    let i = 0, names;
    if (name && typeof name === 'object') {
        if (callback !== void 0 && 'context' in options && options['context'] === void 0) {
            options['context'] = callback;
        }
        for (names = _.keys(name); i < names.length; i++) {
            events = eventsApi(iteratee, events, names[i], name[names[i]], options);
        }
    }
    else if (name && typeof name === 'string' && eventSplitter.test(name)) {
        for (names = name.split(eventSplitter); i < names.length; i++) {
            events = iteratee(events, names[i], callback, options);
        }
    }
    else {
        events = iteratee(events, name, callback, options);
    }
    return events;
}
function onApi(events, name, callback, options) {
    if (callback) {
        const handlers = events[name] || (events[name] = []);
        const context = options.context, ctx = options.ctx, listening = options.listening, priority = options.priority;
        if (listening) {
            listening.count++;
        }
        handlers.push({
            callback: callback,
            context: context,
            ctx: context || ctx,
            listening: listening,
            priority: priority
        });
        handlers.sort((a, b) => b.priority - a.priority);
    }
    return events;
}
function offApi(events, name, callback, options) {
    if (!events) {
        return;
    }
    let i = 0, listening;
    const context = options.context, listeners = options.listeners;
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
        if (!handlers) {
            break;
        }
        const remaining = [];
        for (let j = 0; j < handlers.length; j++) {
            const handler = handlers[j];
            if (callback && callback !== handler.callback &&
                callback !== handler.callback._callback ||
                context && context !== handler.context) {
                remaining.push(handler);
            }
            else {
                listening = handler.listening;
                if (listening && --listening.count === 0) {
                    delete listeners[listening.id];
                    delete listening.listeningTo[listening.objId];
                }
            }
        }
        if (remaining.length) {
            events[name] = remaining;
        }
        else {
            delete events[name];
        }
    }
    if (_.size(events)) {
        return events;
    }
}
function onceMap(map, name, callback, offer) {
    if (callback) {
        const once = map[name] = _.once(function () {
            offer(name, once);
            callback.apply(this, arguments);
        });
        once._callback = callback;
    }
    return map;
}
function triggerApi(objEvents, name, callback, args, triggerer = triggerEvents) {
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
function triggerEvents(events, args) {
    let ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
        case 0:
            while (++i < l) {
                (ev = events[i]).callback.call(ev.ctx);
            }
            return;
        case 1:
            while (++i < l) {
                (ev = events[i]).callback.call(ev.ctx, a1);
            }
            return;
        case 2:
            while (++i < l) {
                (ev = events[i]).callback.call(ev.ctx, a1, a2);
            }
            return;
        case 3:
            while (++i < l) {
                (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
            }
            return;
        default:
            while (++i < l) {
                (ev = events[i]).callback.apply(ev.ctx, args);
            }
            return;
    }
}
class Event {
    constructor(name) {
        this._isPropagationStopped = false;
        this._isDefaultPrevented = false;
        this._name = name;
    }
    stopPropagation() {
        this._isPropagationStopped = true;
    }
    preventDefault() {
        this._isDefaultPrevented = true;
    }
    get name() {
        return this._name;
    }
    get isPropagationStopped() {
        return this._isPropagationStopped;
    }
    get isDefaultPrevented() {
        return this._isDefaultPrevented;
    }
}
exports.Event = Event;
class EventDispatcher {
    get _listenId() {
        return this._savedListenId || (this._savedListenId = _.uniqueId('l'));
    }
    on(nameOrMap, callback, context, priority) {
        this.internalOn(nameOrMap, callback, context, priority);
        return this;
    }
    internalOn(name, callback, context, priority = 0, listening) {
        this._events = eventsApi(onApi, this._events || {}, name, callback, {
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
    once(name, callback, context, priority) {
        const events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
        return this.on(events, void 0, context, priority);
    }
    off(name, callback, context) {
        if (!this._events) {
            return this;
        }
        this._events = eventsApi(offApi, this._events, name, callback, {
            context: context,
            listeners: this._listeners
        });
        return this;
    }
    listenTo(obj, name, callback, priority) {
        if (!obj) {
            return this;
        }
        const id = obj._listenId;
        const listeningTo = this._listeningTo || (this._listeningTo = {});
        let listening = listeningTo[id];
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
        obj.internalOn(name, callback, this, priority, listening);
        return this;
    }
    listenToOnce(obj, name, callback, priority) {
        const events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, obj));
        return this.listenTo(obj, events, void 0, priority);
    }
    stopListening(obj, name, callback) {
        const listeningTo = this._listeningTo;
        if (!listeningTo) {
            return this;
        }
        const ids = obj ? [obj._listenId] : _.keys(listeningTo);
        for (let i = 0; i < ids.length; i++) {
            const listening = listeningTo[ids[i]];
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
    trigger(name, ...args) {
        if (!this._events) {
            return this;
        }
        if (name instanceof Event) {
            triggerApi(this._events, name.name, void 0, [name], (events, args) => {
                let ev, i = -1, l = events.length;
                while (++i < l) {
                    if (name.isPropagationStopped) {
                        return;
                    }
                    ev = events[i];
                    ev.callback.apply(ev.ctx, args);
                }
            });
        }
        else {
            eventsApi(triggerApi, this._events, name, void 0, args);
        }
        return this;
    }
}
exports.EventDispatcher = EventDispatcher;
//# sourceMappingURL=events.js.map