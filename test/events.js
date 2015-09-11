// Backbone.js 1.2.3
// (c) 2010-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Backbone may be freely distributed under the MIT license.
// For all details and documentation:
// http://backbonejs.org
//
// This test case was taken from
// https://github.com/jashkenas/backbone/blob/6b927eb5e7081af16f97d9c15e34b030624a68f9/test/events.js

var Assert   = require("assert");
var _        = require("lodash");
var EventsNS = require("../lib/utils/events");
var Events   = EventsNS.EventDispatcher;
var Event    = EventsNS.Event;


describe("Events", function () {
	it("on and trigger", function () {
		var obj = new Events();
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

	it("binding and triggering multiple events", function () {
		var obj = new Events();
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

	it("binding and triggering with event maps", function () {
        var obj = new Events();
		obj.counter = 0;

		var increment = function () {
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

	it("binding and triggering multiple event names with event maps", function () {
        var obj = new Events();
		obj.counter = 0;

		var increment = function () {
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

	it("binding and trigger with event maps context", function () {
        var obj = new Events();
		obj.counter = 0;
		var context = {};

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

	it("listenTo and stopListening", function () {
		var a = new Events();
		var b = new Events();

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

	it("listenTo and stopListening with event maps", function () {
        var a = new Events();
		var b = new Events();
		var cb = function () {
			Assert(true);
		};

        a.listenTo(b, {event: cb});
		b.trigger('event');

		a.listenTo(b, {event2: cb});
		b.on('event2', cb);
		a.stopListening(b, {event2: cb});
		b.trigger('event event2');

        a.stopListening();
		b.trigger('event event2');
	});

	it("stopListening with omitted args", function () {
        var a = new Events();
		var b = new Events();
		var cb = function () {
			Assert(true);
		};
		a.listenTo(b, 'event', cb);
		b.on('event', cb);
		a.listenTo(b, 'event2', cb);
		a.stopListening(null, {event: cb});
		b.trigger('event event2');
		b.off();
		a.listenTo(b, 'event event2', cb);
		a.stopListening(null, 'event');
		a.stopListening();
		b.trigger('event2');
	});

	it("listenToOnce", function () {
		// Same as the previous test, but we use once rather than having to explicitly unbind
		var obj = new Events();
        obj.counterA = 0;
        obj.counterB = 0;

		var incrA = function () {
			obj.counterA += 1;
			obj.trigger('event');
		};
		var incrB = function () {
			obj.counterB += 1;
		};
		obj.listenToOnce(obj, 'event', incrA);
		obj.listenToOnce(obj, 'event', incrB);
		obj.trigger('event');
		Assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
		Assert.equal(obj.counterB, 1, 'counterB should have only been incremented once.');
	});

	it("listenToOnce and stopListening", function () {
		var a = new Events();
		var b = new Events();
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

	it("listenTo, listenToOnce and stopListening", function () {
        var a = new Events();
		var b = new Events();
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

	it("listenTo and stopListening with event maps", function () {
        var a = new Events();
		var b = new Events();
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

	it("listenTo yourself", function () {
		var e = new Events();
		e.listenTo(e, "foo", function () {
			Assert(true);
		});
		e.trigger("foo");
	});

	it("listenTo yourself cleans yourself up with stopListening", function () {
		var e = new Events();
		e.listenTo(e, "foo", function () {
			Assert(true);
		});
		e.trigger("foo");

        e.listenTo(e, "foo", function () {
			Assert(false);
		});
        e.stopListening();
		e.trigger("foo");
	});

	it("stopListening cleans up references", function () {
        var a = new Events();
		var b = new Events();
		var fn = function () {};
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

	it("stopListening cleans up references from listenToOnce", function () {
        var a = new Events();
		var b = new Events();
		var fn = function () {};
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

	it("listenTo and off cleaning up references", function () {
        var a = new Events();
		var b = new Events();
		var fn = function () { };

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

	it("listenTo and stopListening cleaning up references", function () {
        var a = new Events();
		var b = new Events();

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

	it("listenToOnce without context cleans up references after the event has fired", function () {
        var a = new Events();
		var b = new Events();
		a.listenToOnce(b, 'all', function () {
			Assert(true);
		});
		b.trigger('anything');
		Assert.equal(_.size(a._listeningTo), 0);
	});

	it("listenToOnce with event maps cleans up references", function () {
        var a = new Events();
		var b = new Events();
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

	it("listenToOnce with event maps binds the correct `this`", function () {
        var a = new Events();
		var b = new Events();
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

	it("listenTo with empty callback doesn't throw an error", function () {
		var e = new Events();
		e.listenTo(e, "foo", null);
		e.trigger("foo");
		Assert(true);
	});

	it("trigger all for each event", function () {
		var a, b, obj = new Events();
        obj.counter = 0;
		obj.on('all', function (event) {
			obj.counter++;
			if (event == 'a') a = true;
			if (event == 'b') b = true;
		}).trigger('a b');
		Assert(a);
		Assert(b);
		Assert.equal(obj.counter, 2);
	});

	it("on, then unbind all functions", function () {
		var obj = new Events();
        obj.counter = 0;
		var callback = function () {
			obj.counter += 1;
		};

		obj.on('event', callback);
		obj.trigger('event');
		obj.off('event');
		obj.trigger('event');
		Assert.equal(obj.counter, 1, 'counter should have only been incremented once.');
	});

	it("bind two callbacks, unbind only one", function () {
        var obj = new Events();
        obj.counterA = 0;
        obj.counterB = 0;
		var callback = function () {
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

	it("unbind a callback in the midst of it firing", function () {
        var obj = new Events();
        obj.counter = 0;
		var callback = function () {
			obj.counter += 1;
			obj.off('event', callback);
		};
		obj.on('event', callback);
		obj.trigger('event');
		obj.trigger('event');
		obj.trigger('event');
		Assert.equal(obj.counter, 1, 'the callback should have been unbound.');
	});

	it("two binds that unbind themeselves", function () {
        var obj = new Events();
        obj.counterA = 0;
        obj.counterB = 0;
		var incrA = function () {
			obj.counterA += 1;
			obj.off('event', incrA);
		};
		var incrB = function () {
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

	it("bind a callback with a supplied context", function () {
		var TestClass = function () {
			return this;
		};
		TestClass.prototype.assertTrue = function () {
			Assert(true, '`this` was bound to the callback');
		};

		var obj = new Events();
		obj.on('event', function () {
			this.assertTrue();
		}, (new TestClass));
		obj.trigger('event');
	});

	it("nested trigger with unbind", function () {
        var obj = new Events();
        obj.counter = 0;
		var incr1 = function () {
			obj.counter += 1;
			obj.off('event', incr1);
			obj.trigger('event');
		};
		var incr2 = function () {
			obj.counter += 1;
		};
		obj.on('event', incr1);
		obj.on('event', incr2);
		obj.trigger('event');
		Assert.equal(obj.counter, 3, 'counter should have been incremented three times');
	});

	it("callback list is not altered during trigger", function () {
		var counter = 0, obj = new Events();
		var incr = function () {
			counter++;
		};
		var incrOn = function () {
			obj.on('event all', incr);
		};
		var incrOff = function () {
			obj.off('event all', incr);
		};

		obj.on('event all', incrOn).trigger('event');
		Assert.equal(counter, 0, 'on does not alter callback list');

		obj.off().on('event', incrOff).on('event all', incr).trigger('event');
		Assert.equal(counter, 2, 'off does not alter callback list');
	});

	it("#1282 - 'all' callback list is retrieved after each event.", function () {
		var counter = 0;
		var obj = new Events();
		var incr = function () {
			counter++;
		};

        obj.on('x', function () {
			obj.on('y', incr).on('all', incr);
		}).trigger('x y');

		Assert.strictEqual(counter, 2);
	});

	it("if no callback is provided, `on` is a noop", function () {
		(new Events()).on('test').trigger('test');
	});

	it("if callback is truthy but not a function, `on` should throw an error just like jQuery", function () {
		var view = (new Events()).on('test', 'noop');
		Assert.throws(function () {
			view.trigger('test');
		});
	});

	it("remove all events for a specific context", function () {
		var obj = new Events();
		obj.on('x y all', function () {
			Assert(true);
		});
		obj.on('x y all', function () {
			Assert(false);
		}, obj);
		obj.off(null, null, obj);
		obj.trigger('x y');
	});

	it("remove all events for a specific callback", function () {
		var obj = new Events();
		var success = function () {
			Assert(true);
		};
		var fail = function () {
			Assert(false);
		};
		obj.on('x y all', success);
		obj.on('x y all', fail);
		obj.off(null, fail);
		obj.trigger('x y');
	});

	it("#1310 - off does not skip consecutive events", function () {
		var obj = new Events();
		obj.on('event', function () {
			Assert(false);
		}, obj);
		obj.on('event', function () {
			Assert(false);
		}, obj);
		obj.off(null, null, obj);
		obj.trigger('event');
	});

	it("once", function () {
		// Same as the previous test, but we use once rather than having to explicitly unbind
		var obj = new Events();
        obj.counterA = 0;
        obj.counterB = 0;

		var incrA = function () {
			obj.counterA += 1;
			obj.trigger('event');
		};
		var incrB = function () {
			obj.counterB += 1;
		};
		obj.once('event', incrA);
		obj.once('event', incrB);
		obj.trigger('event');
		Assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
		Assert.equal(obj.counterB, 1, 'counterB should have only been incremented once.');
	});

	it("once variant one", function () {
		var count = 0, f = function () {
			count += 1;
		};

		var a = (new Events()).once('event', f);
		var b = (new Events()).on('event', f);

		a.trigger('event');
		b.trigger('event');
		b.trigger('event');

		Assert.equal(count, 3);
	});

	it("once variant two", function () {
		var obj = new Events(), count = 0;
		var f = function () {
			count += 1;
		};

		obj.once('event', f)
		   .on('event', f)
		   .trigger('event')
		   .trigger('event');

		Assert.equal(count, 3);
	});

	it("once with off", function () {
		var obj = new Events();
		var f = function () {
			Assert(false);
		};

		obj.once('event', f);
		obj.off('event', f);
		obj.trigger('event');
	});

	it("once with event maps", function () {
		var obj = new Events();
        obj.counter = 0;

		var increment = function () {
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

	it("once with off only by context", function () {
		var context = {};
		var obj = new Events();
		obj.once('event', function () {
			Assert(false);
		}, context);
		obj.off(null, null, context);
		obj.trigger('event');
	});

	it("once with asynchronous events", function (done) {
		var func = _.debounce(function () {
			Assert(true);
			done();
		}, 50);

		var obj = (new Events()).once('async', func);
		obj.trigger('async');
		obj.trigger('async');
	});

	it("once with multiple events.", function () {
		var obj = new Events(), count = 0;
		obj.once('x y', function () {
			count += 1;
		});
		obj.trigger('x y');
		Assert.equal(count, 2);
	});

	it("Off during iteration with once.", function () {
		var obj = new Events(), count = 0;
		var f = function () {
			this.off('event', f);
		};
		obj.on('event', f);
		obj.once('event', function () {});
		obj.on('event', function () {
			count += 1;
		});

		obj.trigger('event');
		obj.trigger('event');
		Assert.equal(count, 2);
	});

	it("`once` on `all` should work as expected", function () {
        var obj = new Events(), count = 0;
		obj.once('all', function () {
			count += 1;
			obj.trigger('all');
		});
		obj.trigger('all');

		Assert.equal(count, 1);
	});

	it("once without a callback is a noop", function () {
		(new Events()).once('event').trigger('event');
	});

	it("listenToOnce without a callback is a noop", function () {
		var obj = new Events();
		obj.listenToOnce(obj, 'event').trigger('event');
	});

	it("event functions are chainable", function () {
		var obj = new Events();
		var obj2 = new Events();
		var fn = function () {};

		Assert.equal(obj, obj.trigger('noeventssetyet'));
		Assert.equal(obj, obj.off('noeventssetyet'));
		Assert.equal(obj, obj.stopListening('noeventssetyet'));
		Assert.equal(obj, obj.on('a', fn));
		Assert.equal(obj, obj.once('c', fn));
		Assert.equal(obj, obj.trigger('a'));
		Assert.equal(obj, obj.listenTo(obj2, 'a', fn));
		Assert.equal(obj, obj.listenToOnce(obj2, 'b', fn));
		Assert.equal(obj, obj.off('a c'));
		Assert.equal(obj, obj.stopListening(obj2, 'a'));
		Assert.equal(obj, obj.stopListening());
	});

	it("#3448 - listenToOnce with space-separated events", function () {
		var one = new Events();
		var two = new Events();
		var count = 1;
		one.listenToOnce(two, 'x y', function (n) {
			Assert(n === count++);
		});
		two.trigger('x', 1);
		two.trigger('x', 1);
		two.trigger('y', 2);
		two.trigger('y', 2);
	});
});


describe("Events (customized)", function () {
	it("accepts event objects", function() {
		var count = 0;
		var events = new Events();
		var event = new Event("myEvent");
		events.on("myEvent", function(e) {
			Assert(e instanceof Event);
			count += 1;
		});
		events.trigger(event);
		Assert.equal(count, 1);
	});

	it("stops propagation", function() {
		var count = 0;
		var events = new Events();
		var event = new Event("myEvent");
		events.on("myEvent", function(e) { count++; e.stopPropagation(); });
		events.on("myEvent", function(e) { count++; Assert(false); });
		events.trigger(event);
		Assert.equal(count, 1);
	});

	it("sorts handlers by priority", function() {
		var count = 0;
		var events = new Events();
		events.on("myEvent", function(e) { Assert.equal(count, 1); count++; }, void 0, 0);
		events.on("myEvent", function(e) { Assert.equal(count, 0); count++; }, void 0, 100);
		events.trigger("myEvent");
		Assert.equal(count, 2);
	});
});
