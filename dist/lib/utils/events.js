"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var eventSplitter = /\s+/;
function eventsApi(iteratee, events, name, callback, options) {
    var i = 0, names;
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
        var handlers = events[name] || (events[name] = []);
        var context_1 = options.context, ctx = options.ctx, listening = options.listening, priority = options.priority;
        if (listening) {
            listening.count++;
        }
        handlers.push({
            callback: callback,
            context: context_1,
            ctx: context_1 || ctx,
            listening: listening,
            priority: priority
        });
        handlers.sort(function (a, b) { return b.priority - a.priority; });
    }
    return events;
}
function offApi(events, name, callback, options) {
    if (!events) {
        return;
    }
    var i = 0, listening;
    var context = options.context, listeners = options.listeners;
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
        if (!handlers) {
            break;
        }
        var remaining = [];
        for (var j = 0; j < handlers.length; j++) {
            var handler = handlers[j];
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
        var once_1 = map[name] = _.once(function () {
            offer(name, once_1);
            callback.apply(this, arguments);
        });
        once_1._callback = callback;
    }
    return map;
}
function triggerApi(objEvents, name, callback, args, triggerer) {
    if (triggerer === void 0) { triggerer = triggerEvents; }
    if (objEvents) {
        var events = objEvents[name];
        var allEvents = objEvents['all'];
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
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
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
var Event = (function () {
    function Event(name) {
        this._name = name;
    }
    Event.prototype.stopPropagation = function () {
        this._isPropagationStopped = true;
    };
    Event.prototype.preventDefault = function () {
        this._isDefaultPrevented = true;
    };
    Object.defineProperty(Event.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Event.prototype, "isPropagationStopped", {
        get: function () {
            return this._isPropagationStopped;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Event.prototype, "isDefaultPrevented", {
        get: function () {
            return this._isDefaultPrevented;
        },
        enumerable: true,
        configurable: true
    });
    return Event;
}());
exports.Event = Event;
var EventDispatcher = (function () {
    function EventDispatcher() {
    }
    EventDispatcher.prototype.on = function (nameOrMap, callback, context, priority) {
        this.internalOn(nameOrMap, callback, context, priority);
        return this;
    };
    EventDispatcher.prototype.internalOn = function (name, callback, context, priority, listening) {
        if (priority === void 0) { priority = 0; }
        this._events = eventsApi(onApi, this._events || {}, name, callback, {
            context: context,
            ctx: this,
            listening: listening,
            priority: priority
        });
        if (listening) {
            var listeners = this._listeners || (this._listeners = {});
            listeners[listening.id] = listening;
        }
    };
    EventDispatcher.prototype.once = function (name, callback, context, priority) {
        var events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
        return this.on(events, void 0, context, priority);
    };
    EventDispatcher.prototype.off = function (name, callback, context) {
        if (!this._events) {
            return this;
        }
        this._events = eventsApi(offApi, this._events, name, callback, {
            context: context,
            listeners: this._listeners
        });
        return this;
    };
    EventDispatcher.prototype.listenTo = function (obj, name, callback, priority) {
        if (!obj) {
            return this;
        }
        var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
        var listeningTo = this._listeningTo || (this._listeningTo = {});
        var listening = listeningTo[id];
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
        obj.internalOn(name, callback, this, priority, listening);
        return this;
    };
    EventDispatcher.prototype.listenToOnce = function (obj, name, callback, priority) {
        var events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, obj));
        return this.listenTo(obj, events, void 0, priority);
    };
    EventDispatcher.prototype.stopListening = function (obj, name, callback) {
        var listeningTo = this._listeningTo;
        if (!listeningTo) {
            return this;
        }
        var ids = obj ? [obj._listenId] : _.keys(listeningTo);
        for (var i = 0; i < ids.length; i++) {
            var listening = listeningTo[ids[i]];
            if (!listening) {
                break;
            }
            listening.obj.off(name, callback, this);
        }
        if (_.isEmpty(listeningTo)) {
            this._listeningTo = void 0;
        }
        return this;
    };
    EventDispatcher.prototype.trigger = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this._events) {
            return this;
        }
        if (name instanceof Event) {
            triggerApi(this._events, name.name, void 0, [name], function (events, args) {
                var ev, i = -1, l = events.length;
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
    };
    return EventDispatcher;
}());
exports.EventDispatcher = EventDispatcher;
//# sourceMappingURL=events.js.map