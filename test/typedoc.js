var TypeDoc = require("../bin/typedoc.js");
var Path    = require("path");
var Assert  = require("assert");

describe('TypeDoc', function() {
    var settings;
    var application;

    describe('Settings', function() {
        var inputFiles = Path.join(__dirname, 'converter', 'basic');

        it('constructs', function() {
            settings = new TypeDoc.Settings();
        });
        it('expands input files', function() {
            settings.inputFiles = [inputFiles];
            settings.expandInputFiles();

            Assert.notEqual(settings.inputFiles.indexOf(Path.join(inputFiles, 'classes.ts')), -1);
            Assert.equal(settings.inputFiles.indexOf(inputFiles), -1);
        });
    });

    describe('EventDispatcher', function() {
        var dispatcher;
        var called = false;
        var listener = function() { called = true; };

        beforeEach(function() {
            called = false;
        });

        it('constructs', function() {
            dispatcher = new TypeDoc.EventDispatcher();
        });
        it('adds listeners', function() {
            dispatcher.on('test', listener);
            dispatcher.dispatch('test');
            Assert.equal(called, true);
        });
        it('removes listeners', function() {
            dispatcher.on('test', listener);
            dispatcher.off('test', listener);
            dispatcher.dispatch('test');
            Assert.equal(called, false);
        });
        it('removes listeners by event', function() {
            dispatcher.on('test', listener);
            dispatcher.off('test');
            dispatcher.dispatch('test');
            Assert.equal(called, false);
        });
        it('removes listeners by reference', function() {
            dispatcher.on('test', listener);
            dispatcher.off(null, listener);
            dispatcher.dispatch('test');
            Assert.equal(called, false);
        });
        it('removes listeners by scope', function() {
            dispatcher.on('test', listener, this);
            dispatcher.off(null, null, this);
            dispatcher.dispatch('test');
            Assert.equal(called, false);
        });
        it('sorts listeners by priority', function() {
            var result = 10;
            dispatcher.on('test', function() { result /= 10; }, null, 10);
            dispatcher.on('test', function() { result *= 2; },  null, -5);
            dispatcher.on('test', function() { result += 5; },  null,  5);
            dispatcher.dispatch('test');
            Assert.equal(result, 12);
        });
    });

    describe('Event', function() {
        it('constructs', function() {
            new TypeDoc.Event();
        });
        it('stops propagation', function() {
            var event = new TypeDoc.Event();
            var dispatcher = new TypeDoc.EventDispatcher();
            dispatcher.on('test', function(e) { e.stopPropagation(); });
            dispatcher.on('test', function(e) { throw new Error('Propagation not stopped!'); });
            dispatcher.dispatch('test', event);

            Assert.equal(event.isPropagationStopped, true);
        });
        it('prevents default', function() {
            var event = new TypeDoc.Event();
            var dispatcher = new TypeDoc.EventDispatcher();
            dispatcher.on('test', function(e) { e.preventDefault(); });
            dispatcher.dispatch('test', event);

            Assert.equal(event.isDefaultPrevented, true);
        });
    });

    describe('Application', function() {
        it('constructs', function() {
            application = new TypeDoc.Application(settings);
        });
    });
});