var Event = (function () {
    function Event() {
    }
    Event.prototype.stopPropagation = function () {
        this.isPropagationStopped = true;
    };
    Event.prototype.preventDefault = function () {
        this.isDefaultPrevented = true;
    };
    return Event;
})();
exports.Event = Event;
var EventDispatcher = (function () {
    function EventDispatcher() {
    }
    EventDispatcher.prototype.dispatch = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this.listeners)
            return;
        if (!this.listeners[event])
            return;
        var obj;
        if (args.length > 0 && args[0] instanceof Event) {
            obj = args[0];
            obj.isDefaultPrevented = false;
            obj.isPropagationStopped = false;
        }
        var listeners = this.listeners[event];
        for (var i = 0, c = listeners.length; i < c; i++) {
            var listener = listeners[i];
            listener.handler.apply(listener.scope, args);
            if (obj && obj.isPropagationStopped)
                break;
        }
    };
    EventDispatcher.prototype.on = function (event, handler, scope, priority) {
        if (scope === void 0) { scope = null; }
        if (priority === void 0) { priority = 0; }
        if (!this.listeners)
            this.listeners = {};
        if (!this.listeners[event])
            this.listeners[event] = [];
        var listeners = this.listeners[event];
        listeners.push({
            handler: handler,
            scope: scope,
            priority: priority
        });
        listeners.sort(function (a, b) { return b.priority - a.priority; });
    };
    EventDispatcher.prototype.off = function (event, handler, scope) {
        var _this = this;
        if (event === void 0) { event = null; }
        if (handler === void 0) { handler = null; }
        if (scope === void 0) { scope = null; }
        if (!this.listeners) {
            return;
        }
        if (!event && !handler && !scope) {
            this.listeners = null;
        }
        else {
            var offEvent = function (event) {
                if (!_this.listeners[event])
                    return;
                var listeners = _this.listeners[event];
                var index = 0, count = listeners.length;
                while (index < count) {
                    var listener = listeners[index];
                    if ((handler && listener.handler != handler) || (scope && listener.scope != scope)) {
                        index += 1;
                    }
                    else {
                        listeners.splice(index, 1);
                        count -= 1;
                    }
                }
                if (listeners.length == 0) {
                    delete _this.listeners[event];
                }
            };
            if (!event) {
                for (event in this.listeners) {
                    if (!this.listeners.hasOwnProperty(event))
                        continue;
                    offEvent(event);
                }
            }
            else {
                offEvent(event);
            }
        }
    };
    return EventDispatcher;
})();
exports.EventDispatcher = EventDispatcher;
