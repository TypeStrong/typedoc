"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Assert = require("assert");
const _ = require("lodash");
const events_1 = require("../lib/utils/events");
class Events extends events_1.EventDispatcher {
    constructor() {
        super(...arguments);
        this.counter = 0;
        this.counterA = 0;
        this.counterB = 0;
    }
}
describe('Events', function () {
    it('on and trigger', function () {
        const obj = new Events();
        obj.counter = 0;
        obj.on('event', function () {
            obj.counter += 1;
        });
        obj.trigger('event');
        Assert.equal(obj.counter, 1, 'counter should be incremented.');
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        Assert.equal(obj.counter, 5, 'counter should be incremented five times.');
    });
    it('binding and triggering multiple events', function () {
        const obj = new Events();
        obj.counter = 0;
        obj.on('a b c', function () {
            obj.counter += 1;
        });
        obj.trigger('a');
        Assert.equal(obj.counter, 1);
        obj.trigger('a b');
        Assert.equal(obj.counter, 3);
        obj.trigger('c');
        Assert.equal(obj.counter, 4);
        obj.off('a c');
        obj.trigger('a b c');
        Assert.equal(obj.counter, 5);
    });
    it('binding and triggering with event maps', function () {
        const obj = new Events();
        obj.counter = 0;
        const increment = function () {
            this.counter += 1;
        };
        obj.on({
            a: increment,
            b: increment,
            c: increment
        }, obj);
        obj.trigger('a');
        Assert.equal(obj.counter, 1);
        obj.trigger('a b');
        Assert.equal(obj.counter, 3);
        obj.trigger('c');
        Assert.equal(obj.counter, 4);
        obj.off({
            a: increment,
            c: increment
        }, obj);
        obj.trigger('a b c');
        Assert.equal(obj.counter, 5);
    });
    it('binding and triggering multiple event names with event maps', function () {
        const obj = new Events();
        obj.counter = 0;
        const increment = function () {
            this.counter += 1;
        };
        obj.on({
            'a b c': increment
        });
        obj.trigger('a');
        Assert.equal(obj.counter, 1);
        obj.trigger('a b');
        Assert.equal(obj.counter, 3);
        obj.trigger('c');
        Assert.equal(obj.counter, 4);
        obj.off({
            'a c': increment
        });
        obj.trigger('a b c');
        Assert.equal(obj.counter, 5);
    });
    it('binding and trigger with event maps context', function () {
        const obj = new Events();
        obj.counter = 0;
        const context = {};
        obj.on({
            a: function () {
                Assert.strictEqual(this, context, 'defaults `context` to `callback` param');
            }
        }, context).trigger('a');
        obj.off().on({
            a: function () {
                Assert.strictEqual(this, context, 'will not override explicit `context` param');
            }
        }, this, context).trigger('a');
    });
    it('listenTo and stopListening', function () {
        const a = new Events();
        const b = new Events();
        a.listenTo(b, 'all', function () {
            Assert(true);
        });
        b.trigger('anything');
        a.listenTo(b, 'all', function () {
            Assert(false);
        });
        a.stopListening();
        b.trigger('anything');
    });
    it('listenTo and stopListening with event maps', function () {
        const a = new Events();
        const b = new Events();
        const cb = function () {
            Assert(true);
        };
        a.listenTo(b, { event: cb });
        b.trigger('event');
        a.listenTo(b, { event2: cb });
        b.on('event2', cb);
        a.stopListening(b, { event2: cb });
        b.trigger('event event2');
        a.stopListening();
        b.trigger('event event2');
    });
    it('stopListening with omitted args', function () {
        const a = new Events();
        const b = new Events();
        const cb = function () {
            Assert(true);
        };
        a.listenTo(b, 'event', cb);
        b.on('event', cb);
        a.listenTo(b, 'event2', cb);
        a.stopListening(undefined, { event: cb });
        b.trigger('event event2');
        b.off();
        a.listenTo(b, 'event event2', cb);
        a.stopListening(undefined, 'event');
        a.stopListening();
        b.trigger('event2');
    });
    it('listenToOnce', function () {
        const obj = new Events();
        obj.counterA = 0;
        obj.counterB = 0;
        const incrA = function () {
            obj.counterA += 1;
            obj.trigger('event');
        };
        const incrB = function () {
            obj.counterB += 1;
        };
        obj.listenToOnce(obj, 'event', incrA);
        obj.listenToOnce(obj, 'event', incrB);
        obj.trigger('event');
        Assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
        Assert.equal(obj.counterB, 1, 'counterB should have only been incremented once.');
    });
    it('listenToOnce and stopListening', function () {
        const a = new Events();
        const b = new Events();
        a.listenToOnce(b, 'all', function () {
            Assert(true);
        });
        b.trigger('anything');
        b.trigger('anything');
        a.listenToOnce(b, 'all', function () {
            Assert(false);
        });
        a.stopListening();
        b.trigger('anything');
    });
    it('listenTo, listenToOnce and stopListening', function () {
        const a = new Events();
        const b = new Events();
        a.listenToOnce(b, 'all', function () {
            Assert(true);
        });
        b.trigger('anything');
        b.trigger('anything');
        a.listenTo(b, 'all', function () {
            Assert(false);
        });
        a.stopListening();
        b.trigger('anything');
    });
    it('listenTo and stopListening with event maps', function () {
        const a = new Events();
        const b = new Events();
        a.listenTo(b, {
            change: function () {
                Assert(true);
            }
        });
        b.trigger('change');
        a.listenTo(b, {
            change: function () {
                Assert(false);
            }
        });
        a.stopListening();
        b.trigger('change');
    });
    it('listenTo yourself', function () {
        const e = new Events();
        e.listenTo(e, 'foo', function () {
            Assert(true);
        });
        e.trigger('foo');
    });
    it('listenTo yourself cleans yourself up with stopListening', function () {
        const e = new Events();
        e.listenTo(e, 'foo', function () {
            Assert(true);
        });
        e.trigger('foo');
        e.listenTo(e, 'foo', function () {
            Assert(false);
        });
        e.stopListening();
        e.trigger('foo');
    });
    it('stopListening cleans up references', function () {
        const a = new Events();
        const b = new Events();
        const fn = function () { };
        b.on('event', fn);
        a.listenTo(b, 'event', fn).stopListening();
        Assert.equal(_.size(a._listeningTo), 0);
        Assert.equal(_.size(b._events.event), 1);
        Assert.equal(_.size(b._listeners), 0);
        a.listenTo(b, 'event', fn).stopListening(b);
        Assert.equal(_.size(a._listeningTo), 0);
        Assert.equal(_.size(b._events.event), 1);
        Assert.equal(_.size(b._listeners), 0);
        a.listenTo(b, 'event', fn).stopListening(b, 'event');
        Assert.equal(_.size(a._listeningTo), 0);
        Assert.equal(_.size(b._events.event), 1);
        Assert.equal(_.size(b._listeners), 0);
        a.listenTo(b, 'event', fn).stopListening(b, 'event', fn);
        Assert.equal(_.size(a._listeningTo), 0);
        Assert.equal(_.size(b._events.event), 1);
        Assert.equal(_.size(b._listeners), 0);
    });
    it('stopListening cleans up references from listenToOnce', function () {
        const a = new Events();
        const b = new Events();
        const fn = function () { };
        b.on('event', fn);
        a.listenToOnce(b, 'event', fn).stopListening();
        Assert.equal(_.size(a._listeningTo), 0);
        Assert.equal(_.size(b._events.event), 1);
        Assert.equal(_.size(b._listeners), 0);
        a.listenToOnce(b, 'event', fn).stopListening(b);
        Assert.equal(_.size(a._listeningTo), 0);
        Assert.equal(_.size(b._events.event), 1);
        Assert.equal(_.size(b._listeners), 0);
        a.listenToOnce(b, 'event', fn).stopListening(b, 'event');
        Assert.equal(_.size(a._listeningTo), 0);
        Assert.equal(_.size(b._events.event), 1);
        Assert.equal(_.size(b._listeners), 0);
        a.listenToOnce(b, 'event', fn).stopListening(b, 'event', fn);
        Assert.equal(_.size(a._listeningTo), 0);
        Assert.equal(_.size(b._events.event), 1);
        Assert.equal(_.size(b._listeners), 0);
    });
    it('listenTo and off cleaning up references', function () {
        const a = new Events();
        const b = new Events();
        const fn = function () { };
        a.listenTo(b, 'event', fn);
        b.off();
        Assert.equal(_.size(a._listeningTo), 0);
        Assert.equal(_.size(b._listeners), 0);
        a.listenTo(b, 'event', fn);
        b.off('event');
        Assert.equal(_.size(a._listeningTo), 0);
        Assert.equal(_.size(b._listeners), 0);
        a.listenTo(b, 'event', fn);
        b.off(null, fn);
        Assert.equal(_.size(a._listeningTo), 0);
        Assert.equal(_.size(b._listeners), 0);
        a.listenTo(b, 'event', fn);
        b.off(null, null, a);
        Assert.equal(_.size(a._listeningTo), 0);
        Assert.equal(_.size(b._listeners), 0);
    });
    it('listenTo and stopListening cleaning up references', function () {
        const a = new Events();
        const b = new Events();
        a.listenTo(b, 'all', function () {
            Assert(true);
        });
        b.trigger('anything');
        a.listenTo(b, 'other', function () {
            Assert(false);
        });
        a.stopListening(b, 'other');
        a.stopListening(b, 'all');
        Assert.equal(_.size(a._listeningTo), 0);
    });
    it('listenToOnce without context cleans up references after the event has fired', function () {
        const a = new Events();
        const b = new Events();
        a.listenToOnce(b, 'all', function () {
            Assert(true);
        });
        b.trigger('anything');
        Assert.equal(_.size(a._listeningTo), 0);
    });
    it('listenToOnce with event maps cleans up references', function () {
        const a = new Events();
        const b = new Events();
        a.listenToOnce(b, {
            one: function () {
                Assert(true);
            },
            two: function () {
                Assert(false);
            }
        });
        b.trigger('one');
        Assert.equal(_.size(a._listeningTo), 1);
    });
    it('listenToOnce with event maps binds the correct `this`', function () {
        const a = new Events();
        const b = new Events();
        a.listenToOnce(b, {
            one: function () {
                Assert(this === a);
            },
            two: function () {
                Assert(false);
            }
        });
        b.trigger('one');
    });
    it('listenTo with empty callback does not throw an error', function () {
        const e = new Events();
        e.listenTo(e, 'foo', undefined);
        e.trigger('foo');
        Assert(true);
    });
    it('trigger all for each event', function () {
        let a = false;
        let b = false;
        const obj = new Events();
        obj.counter = 0;
        obj.on('all', function (event) {
            obj.counter++;
            if (event === 'a') {
                a = true;
            }
            if (event === 'b') {
                b = true;
            }
        }).trigger('a b');
        Assert(a);
        Assert(b);
        Assert.equal(obj.counter, 2);
    });
    it('on, then unbind all functions', function () {
        const obj = new Events();
        obj.counter = 0;
        const callback = function () {
            obj.counter += 1;
        };
        obj.on('event', callback);
        obj.trigger('event');
        obj.off('event');
        obj.trigger('event');
        Assert.equal(obj.counter, 1, 'counter should have only been incremented once.');
    });
    it('bind two callbacks, unbind only one', function () {
        const obj = new Events();
        obj.counterA = 0;
        obj.counterB = 0;
        const callback = function () {
            obj.counterA += 1;
        };
        obj.on('event', callback);
        obj.on('event', function () {
            obj.counterB += 1;
        });
        obj.trigger('event');
        obj.off('event', callback);
        obj.trigger('event');
        Assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
        Assert.equal(obj.counterB, 2, 'counterB should have been incremented twice.');
    });
    it('unbind a callback in the midst of it firing', function () {
        const obj = new Events();
        obj.counter = 0;
        const callback = function () {
            obj.counter += 1;
            obj.off('event', callback);
        };
        obj.on('event', callback);
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        Assert.equal(obj.counter, 1, 'the callback should have been unbound.');
    });
    it('two binds that unbind themeselves', function () {
        const obj = new Events();
        obj.counterA = 0;
        obj.counterB = 0;
        const incrA = function () {
            obj.counterA += 1;
            obj.off('event', incrA);
        };
        const incrB = function () {
            obj.counterB += 1;
            obj.off('event', incrB);
        };
        obj.on('event', incrA);
        obj.on('event', incrB);
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        Assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
        Assert.equal(obj.counterB, 1, 'counterB should have only been incremented once.');
    });
    it('bind a callback with a supplied context', function () {
        class TestClass {
            assertTrue() {
                Assert(true, '`this` was bound to the callback');
            }
        }
        const obj = new Events();
        obj.on('event', function () {
            this.assertTrue();
        }, (new TestClass));
        obj.trigger('event');
    });
    it('nested trigger with unbind', function () {
        const obj = new Events();
        obj.counter = 0;
        const incr1 = function () {
            obj.counter += 1;
            obj.off('event', incr1);
            obj.trigger('event');
        };
        const incr2 = function () {
            obj.counter += 1;
        };
        obj.on('event', incr1);
        obj.on('event', incr2);
        obj.trigger('event');
        Assert.equal(obj.counter, 3, 'counter should have been incremented three times');
    });
    it('callback list is not altered during trigger', function () {
        let counter = 0;
        const obj = new Events();
        const incr = function () {
            counter++;
        };
        const incrOn = function () {
            obj.on('event all', incr);
        };
        const incrOff = function () {
            obj.off('event all', incr);
        };
        obj.on('event all', incrOn).trigger('event');
        Assert.equal(counter, 0, 'on does not alter callback list');
        obj.off().on('event', incrOff).on('event all', incr).trigger('event');
        Assert.equal(counter, 2, 'off does not alter callback list');
    });
    it("#1282 - 'all' callback list is retrieved after each event.", function () {
        let counter = 0;
        const obj = new Events();
        const incr = function () {
            counter++;
        };
        obj.on('x', function () {
            obj.on('y', incr).on('all', incr);
        }).trigger('x y');
        Assert.strictEqual(counter, 2);
    });
    it('if no callback is provided, `on` is a noop', function () {
        new Events().on('test').trigger('test');
    });
    it('if callback is truthy but not a function, `on` should throw an error just like jQuery', function () {
        const view = new Events().on('test', 'noop');
        Assert.throws(function () {
            view.trigger('test');
        });
    });
    it('remove all events for a specific context', function () {
        const obj = new Events();
        obj.on('x y all', function () {
            Assert(true);
        });
        obj.on('x y all', function () {
            Assert(false);
        }, obj);
        obj.off(undefined, undefined, obj);
        obj.trigger('x y');
    });
    it('remove all events for a specific callback', function () {
        const obj = new Events();
        const success = function () {
            Assert(true);
        };
        const fail = function () {
            Assert(false);
        };
        obj.on('x y all', success);
        obj.on('x y all', fail);
        obj.off(undefined, fail);
        obj.trigger('x y');
    });
    it('#1310 - off does not skip consecutive events', function () {
        const obj = new Events();
        obj.on('event', function () {
            Assert(false);
        }, obj);
        obj.on('event', function () {
            Assert(false);
        }, obj);
        obj.off(undefined, undefined, obj);
        obj.trigger('event');
    });
    it('once', function () {
        const obj = new Events();
        obj.counterA = 0;
        obj.counterB = 0;
        const incrA = function () {
            obj.counterA += 1;
            obj.trigger('event');
        };
        const incrB = function () {
            obj.counterB += 1;
        };
        obj.once('event', incrA);
        obj.once('event', incrB);
        obj.trigger('event');
        Assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
        Assert.equal(obj.counterB, 1, 'counterB should have only been incremented once.');
    });
    it('once variant one', function () {
        let count = 0;
        const f = function () {
            count += 1;
        };
        const a = (new Events()).once('event', f);
        const b = (new Events()).on('event', f);
        a.trigger('event');
        b.trigger('event');
        b.trigger('event');
        Assert.equal(count, 3);
    });
    it('once variant two', function () {
        let count = 0;
        const obj = new Events();
        const f = function () {
            count += 1;
        };
        obj.once('event', f)
            .on('event', f)
            .trigger('event')
            .trigger('event');
        Assert.equal(count, 3);
    });
    it('once with off', function () {
        const obj = new Events();
        const f = function () {
            Assert(false);
        };
        obj.once('event', f);
        obj.off('event', f);
        obj.trigger('event');
    });
    it('once with event maps', function () {
        const obj = new Events();
        obj.counter = 0;
        const increment = function () {
            this.counter += 1;
        };
        obj.once({
            a: increment,
            b: increment,
            c: increment
        }, obj);
        obj.trigger('a');
        Assert.equal(obj.counter, 1);
        obj.trigger('a b');
        Assert.equal(obj.counter, 2);
        obj.trigger('c');
        Assert.equal(obj.counter, 3);
        obj.trigger('a b c');
        Assert.equal(obj.counter, 3);
    });
    it('once with off only by context', function () {
        const context = {};
        const obj = new Events();
        obj.once('event', function () {
            Assert(false);
        }, context);
        obj.off(undefined, undefined, context);
        obj.trigger('event');
    });
    it('once with asynchronous events', function (done) {
        const func = _.debounce(function () {
            Assert(true);
            done();
        }, 50);
        const obj = (new Events()).once('async', func);
        obj.trigger('async');
        obj.trigger('async');
    });
    it('once with multiple events.', function () {
        let count = 0;
        const obj = new Events();
        obj.once('x y', function () {
            count += 1;
        });
        obj.trigger('x y');
        Assert.equal(count, 2);
    });
    it('Off during iteration with once.', function () {
        let count = 0;
        const obj = new Events();
        const f = function () {
            this.off('event', f);
        };
        obj.on('event', f);
        obj.once('event', function () { });
        obj.on('event', function () {
            count += 1;
        });
        obj.trigger('event');
        obj.trigger('event');
        Assert.equal(count, 2);
    });
    it('`once` on `all` should work as expected', function () {
        let count = 0;
        const obj = new Events();
        obj.once('all', function () {
            count += 1;
            obj.trigger('all');
        });
        obj.trigger('all');
        Assert.equal(count, 1);
    });
    it('once without a callback is a noop', function () {
        new Events().once('event').trigger('event');
    });
    it('listenToOnce without a callback is a noop', function () {
        const obj = new Events();
        obj.listenToOnce(obj, 'event').trigger('event');
    });
    it('event functions are chainable', function () {
        const obj = new Events();
        const obj2 = new Events();
        const fn = function () { };
        Assert.equal(obj, obj.trigger('noeventssetyet'));
        Assert.equal(obj, obj.off('noeventssetyet'));
        Assert.equal(obj, obj.stopListening(undefined, 'noeventssetyet'));
        Assert.equal(obj, obj.on('a', fn));
        Assert.equal(obj, obj.once('c', fn));
        Assert.equal(obj, obj.trigger('a'));
        Assert.equal(obj, obj.listenTo(obj2, 'a', fn));
        Assert.equal(obj, obj.listenToOnce(obj2, 'b', fn));
        Assert.equal(obj, obj.off('a c'));
        Assert.equal(obj, obj.stopListening(obj2, 'a'));
        Assert.equal(obj, obj.stopListening());
    });
    it('#3448 - listenToOnce with space-separated events', function () {
        const one = new Events();
        const two = new Events();
        let count = 1;
        one.listenToOnce(two, 'x y', function (n) {
            Assert(n === count++);
        });
        two.trigger('x', 1);
        two.trigger('x', 1);
        two.trigger('y', 2);
        two.trigger('y', 2);
    });
});
describe('Events (customized)', function () {
    it('accepts event objects', function () {
        let count = 0;
        const events = new Events();
        const event = new events_1.Event('myEvent');
        events.on('myEvent', function (e) {
            Assert(e instanceof events_1.Event);
            count += 1;
        });
        events.trigger(event);
        Assert.equal(count, 1);
    });
    it('stops propagation', function () {
        let count = 0;
        const events = new Events();
        const event = new events_1.Event('myEvent');
        events.on('myEvent', function (e) { count++; e.stopPropagation(); });
        events.on('myEvent', function (e) { count++; Assert(false); });
        events.trigger(event);
        Assert.equal(count, 1);
    });
    it('sorts handlers by priority', function () {
        let count = 0;
        const events = new Events();
        events.on('myEvent', function (e) { Assert.equal(count, 1); count++; }, void 0, 0);
        events.on('myEvent', function (e) { Assert.equal(count, 0); count++; }, void 0, 100);
        events.trigger('myEvent');
        Assert.equal(count, 2);
    });
});
//# sourceMappingURL=events.test.js.map