/// <reference path="lib/tsd.d.ts" />
var td;
(function (td) {
    /*
     * Node modules
     */
    td.Util = require('util');
    td.VM = require('vm');
    td.Path = require('path');
    /*
     * External modules
     */
    td.Handlebars = require('handlebars');
    td.Marked = require('marked');
    td.HighlightJS = require('highlight.js');
    td.Minimatch = require('minimatch');
    td.FS = require('fs-extra');
    td.ShellJS = require('shelljs');
    td.ProgressBar = require('progress');
    /*
     * Locate TypeScript
     */
    td.tsPath = (function () {
        var path = td.Path.dirname(require.resolve('typescript'));
        if (!td.FS.existsSync(td.Path.resolve(path, 'tsc.js'))) {
            process.stderr.write('Could not find ´tsc.js´. Please install typescript, e.g. \'npm install typescript\'.\n');
            process.exit();
        }
        else {
            return path;
        }
    })();
})(td || (td = {}));
/*
 * Load TypeScript
 */
eval((function () {
    var fileName = td.Path.resolve(td.tsPath, 'tsc.js');
    var contents = td.FS.readFileSync(fileName, 'utf-8');
    return contents.replace('ts.executeCommandLine(ts.sys.args);', '');
})());
var td;
(function (td) {
    /**
     * Base class of all events.
     *
     * Events are emitted by [[EventDispatcher]] and are passed to all
     * handlers registered for the associated event name.
     */
    var Event = (function () {
        function Event() {
        }
        /**
         * Stop the propagation of this event. Remaining event handlers will not be executed.
         */
        Event.prototype.stopPropagation = function () {
            this.isPropagationStopped = true;
        };
        /**
         * Prevent the default action associated with this event from being executed.
         */
        Event.prototype.preventDefault = function () {
            this.isDefaultPrevented = true;
        };
        return Event;
    })();
    td.Event = Event;
    /**
     * Base class of all objects dispatching events.
     *
     * Events are dispatched by calling [[EventDispatcher.dispatch]]. Events must have a name and
     * they can carry additional arguments that are passed to all handlers. The first argument can
     * be an instance of [[Event]] providing additional functionality.
     */
    var EventDispatcher = (function () {
        function EventDispatcher() {
        }
        /**
         * Dispatch an event with the given event name.
         *
         * @param event  The name of the event to dispatch.
         * @param args   Additional arguments to pass to the handlers.
         */
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
        /**
         * Register an event handler for the given event name.
         *
         * @param event     The name of the event the handler should be registered to.
         * @param handler   The callback that should be invoked.
         * @param scope     The scope the callback should be executed in.
         * @param priority  A numeric value describing the priority of the handler. Handlers
         *                  with higher priority will be executed earlier.
         */
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
        /**
         * Remove an event handler.
         *
         * @param event    The name of the event whose handlers should be removed.
         * @param handler  The callback that should be removed.
         * @param scope    The scope of the callback that should be removed.
         */
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
    td.EventDispatcher = EventDispatcher;
})(td || (td = {}));
/// <reference path="EventDispatcher.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
 * The TypeDoc main module and namespace.
 *
 * The [[Application]] class holds the core logic of the cli application. All code related
 * to resolving reflections is stored in [[TypeDoc.Factories]], the actual data models can be found
 * in [[TypeDoc.Models]] and the final rendering is defined in [[TypeDoc.Output]].
 */
var td;
(function (td) {
    /**
     * The default TypeDoc main application class.
     *
     * This class holds the two main components of TypeDoc, the [[Dispatcher]] and
     * the [[Renderer]]. When running TypeDoc, first the [[Dispatcher]] is invoked which
     * generates a [[ProjectReflection]] from the passed in source files. The
     * [[ProjectReflection]] is a hierarchical model representation of the TypeScript
     * project. Afterwards the model is passed to the [[Renderer]] which uses an instance
     * of [[BaseTheme]] to generate the final documentation.
     *
     * Both the [[Dispatcher]] and the [[Renderer]] are subclasses of the [[EventDispatcher]]
     * and emit a series of events while processing the project. Subscribe to these Events
     * to control the application flow or alter the output.
     */
    var Application = (function (_super) {
        __extends(Application, _super);
        /**
         * Create a new TypeDoc application instance.
         */
        function Application(arg) {
            _super.call(this);
            this.converter = new td.converter.Converter(this);
            this.renderer = new td.output.Renderer(this);
            this.logger = new td.ConsoleLogger();
            this.options = td.OptionsParser.createOptions();
            this.compilerOptions = td.OptionsParser.createCompilerOptions();
            if (arg == undefined || typeof arg == 'object') {
                this.bootstrapWithOptions(arg);
            }
            else if (arg === true) {
                this.bootstrapFromCommandline();
            }
        }
        /**
         * Generic initialization logic.
         */
        Application.prototype.bootstrap = function () {
            if (typeof this.options.logger == 'function') {
                this.logger = new td.CallbackLogger(this.options.logger);
            }
            else if (this.options.logger == td.LoggerType.None) {
                this.logger = new td.Logger();
            }
            return this.loadNpmPlugins(this.options.plugins);
        };
        /**
         * Run TypeDoc from the command line.
         */
        Application.prototype.bootstrapFromCommandline = function () {
            var parser = new td.OptionsParser(this);
            parser.addCommandLineParameters();
            parser.loadOptionFileFromArguments(null, true);
            parser.parseArguments(null, true);
            this.bootstrap();
            this.collectParameters(parser);
            if (!parser.loadOptionFileFromArguments() || !parser.parseArguments()) {
                process.exit(1);
                return;
            }
            if (this.options.version) {
                ts.sys.write(this.toString());
            }
            else if (this.options.help) {
                ts.sys.write(parser.toString());
            }
            else if (parser.inputFiles.length === 0) {
                ts.sys.write(parser.toString());
                process.exit(1);
            }
            else if (!this.options.out && !this.options.json) {
                this.logger.error("You must either specify the 'out' or 'json' option.");
                process.exit(1);
            }
            else {
                var src = this.expandInputFiles(parser.inputFiles);
                var project = this.convert(src);
                if (project) {
                    if (this.options.out)
                        this.generateDocs(project, this.options.out);
                    if (this.options.json)
                        this.generateJson(project, this.options.json);
                    if (this.logger.hasErrors()) {
                        process.exit(3);
                    }
                }
                else {
                    process.exit(2);
                }
            }
        };
        /**
         * Initialize TypeDoc with the given options object.
         *
         * @param options  The desired options to set.
         */
        Application.prototype.bootstrapWithOptions = function (options) {
            var parser = new td.OptionsParser(this);
            parser.loadOptionFileFromObject(options, true);
            parser.parseObject(options, true);
            this.bootstrap();
            this.collectParameters(parser);
            parser.loadOptionFileFromObject(options);
            parser.parseObject(options);
        };
        /**
         * Load the given list of npm plugins.
         *
         * @param plugins  A list of npm modules that should be loaded as plugins. When not specified
         *   this function will invoke [[discoverNpmPlugins]] to find a list of all installed plugins.
         * @returns TRUE on success, otherwise FALSE.
         */
        Application.prototype.loadNpmPlugins = function (plugins) {
            plugins = plugins || this.discoverNpmPlugins();
            var i, c = plugins.length;
            for (i = 0; i < c; i++) {
                var plugin = plugins[i];
                if (typeof plugin != 'string') {
                    this.logger.error('Unknown plugin %s', plugin);
                    return false;
                }
                else if (plugin.toLowerCase() == 'none') {
                    return true;
                }
            }
            for (i = 0; i < c; i++) {
                var plugin = plugins[i];
                try {
                    var instance = require(plugin);
                    if (typeof instance == 'function') {
                        instance(this, td);
                        this.logger.write('Loaded plugin %s', plugin);
                    }
                    else {
                        this.logger.error('The plugin %s did not return a function.', plugin);
                    }
                }
                catch (error) {
                    this.logger.error('The plugin %s could not be loaded.', plugin);
                    this.logger.writeln(error.stack);
                }
            }
        };
        /**
         * Discover all installed TypeDoc plugins.
         *
         * @returns A list of all npm module names that are qualified TypeDoc plugins.
         */
        Application.prototype.discoverNpmPlugins = function () {
            var result = [];
            var logger = this.logger;
            discover();
            return result;
            /**
             * Find all parent folders containing a `node_modules` subdirectory.
             */
            function discover() {
                var path = process.cwd(), previous;
                do {
                    var modules = td.Path.join(path, 'node_modules');
                    if (td.FS.existsSync(modules) && td.FS.lstatSync(modules).isDirectory()) {
                        discoverModules(modules);
                    }
                    previous = path;
                    path = td.Path.resolve(td.Path.join(previous, '..'));
                } while (previous != path);
            }
            /**
             * Scan the given `node_modules` directory for TypeDoc plugins.
             */
            function discoverModules(basePath) {
                td.FS.readdirSync(basePath).forEach(function (name) {
                    var dir = td.Path.join(basePath, name);
                    var infoFile = td.Path.join(dir, 'package.json');
                    if (!td.FS.existsSync(infoFile)) {
                        return;
                    }
                    var info = loadPackageInfo(infoFile);
                    if (isPlugin(info)) {
                        result.push(name);
                    }
                });
            }
            /**
             * Load and parse the given `package.json`.
             */
            function loadPackageInfo(fileName) {
                try {
                    return JSON.parse(td.FS.readFileSync(fileName, { encoding: 'utf-8' }));
                }
                catch (error) {
                    logger.error('Could not parse %s', fileName);
                    return {};
                }
            }
            /**
             * Test whether the given package info describes a TypeDoc plugin.
             */
            function isPlugin(info) {
                var keywords = info.keywords;
                if (!keywords || !td.Util.isArray(keywords)) {
                    return false;
                }
                for (var i = 0, c = keywords.length; i < c; i++) {
                    var keyword = keywords[i];
                    if (typeof keyword == 'string' && keyword.toLowerCase() == 'typedocplugin') {
                        return true;
                    }
                }
                return false;
            }
        };
        /**
         * Allow [[Converter]] and [[Renderer]] to add parameters to the given [[OptionsParser]].
         *
         * @param parser  The parser instance the found parameters should be added to.
         */
        Application.prototype.collectParameters = function (parser) {
            parser.addParameter(this.converter.getParameters());
            parser.addParameter(this.renderer.getParameters());
            this.dispatch(Application.EVENT_COLLECT_PARAMETERS, parser);
        };
        /**
         * Run the converter for the given set of files and return the generated reflections.
         *
         * @param src  A list of source that should be compiled and converted.
         * @returns An instance of ProjectReflection on success, NULL otherwise.
         */
        Application.prototype.convert = function (src) {
            this.logger.writeln('Using TypeScript %s from %s', this.getTypeScriptVersion(), td.tsPath);
            var result = this.converter.convert(src);
            if (result.errors && result.errors.length) {
                this.logger.diagnostics(result.errors);
                if (this.options.ignoreCompilerErrors) {
                    this.logger.resetErrors();
                    return result.project;
                }
                else {
                    return null;
                }
            }
            else {
                return result.project;
            }
        };
        /**
         * Run the documentation generator for the given set of files.
         *
         * @param out  The path the documentation should be written to.
         * @returns TRUE if the documentation could be generated successfully, otherwise FALSE.
         */
        Application.prototype.generateDocs = function (input, out) {
            var project = input instanceof td.models.ProjectReflection ? input : this.convert(input);
            if (!project)
                return false;
            out = td.Path.resolve(out);
            this.renderer.render(project, out);
            if (this.logger.hasErrors()) {
                this.logger.error('Documentation could not be generated due to the errors above.');
            }
            else {
                this.logger.success('Documentation generated at %s', out);
            }
            return true;
        };
        /**
         * Run the converter for the given set of files and write the reflections to a json file.
         *
         * @param out  The path and file name of the target file.
         * @returns TRUE if the json file could be written successfully, otherwise FALSE.
         */
        Application.prototype.generateJson = function (input, out) {
            var project = input instanceof td.models.ProjectReflection ? input : this.convert(input);
            if (!project)
                return false;
            out = td.Path.resolve(out);
            td.writeFile(out, JSON.stringify(project.toObject(), null, '\t'), false);
            this.logger.success('JSON written to %s', out);
            return true;
        };
        /**
         * Expand a list of input files.
         *
         * Searches for directories in the input files list and replaces them with a
         * listing of all TypeScript files within them. One may use the ```--exclude``` option
         * to filter out files with a pattern.
         *
         * @param inputFiles  The list of files that should be expanded.
         * @returns  The list of input files with expanded directories.
         */
        Application.prototype.expandInputFiles = function (inputFiles) {
            var exclude, files = [];
            if (this.options.exclude) {
                exclude = new td.Minimatch.Minimatch(this.options.exclude);
            }
            function add(dirname) {
                td.FS.readdirSync(dirname).forEach(function (file) {
                    var realpath = td.Path.join(dirname, file);
                    if (td.FS.statSync(realpath).isDirectory()) {
                        add(realpath);
                    }
                    else if (/\.ts$/.test(realpath)) {
                        if (exclude && exclude.match(realpath.replace(/\\/g, '/'))) {
                            return;
                        }
                        files.push(realpath);
                    }
                });
            }
            inputFiles.forEach(function (file) {
                file = td.Path.resolve(file);
                if (td.FS.statSync(file).isDirectory()) {
                    add(file);
                }
                else {
                    files.push(file);
                }
            });
            return files;
        };
        /**
         * Return the version number of the loaded TypeScript compiler.
         *
         * @returns The version number of the loaded TypeScript package.
         */
        Application.prototype.getTypeScriptVersion = function () {
            if (!this.typeScriptVersion) {
                var json = JSON.parse(td.FS.readFileSync(td.Path.join(td.tsPath, '..', 'package.json'), 'utf8'));
                this.typeScriptVersion = json.version;
            }
            return this.typeScriptVersion;
        };
        /**
         * Print the version number.
         */
        Application.prototype.toString = function () {
            return [
                '',
                'TypeDoc ' + Application.VERSION,
                'Using TypeScript ' + this.getTypeScriptVersion() + ' from ' + td.tsPath,
                ''
            ].join(ts.sys.newLine);
        };
        /**
         *
         * @event
         */
        Application.EVENT_COLLECT_PARAMETERS = 'collectParameters';
        /**
         * The version number of TypeDoc.
         */
        Application.VERSION = '0.3.8';
        return Application;
    })(td.EventDispatcher);
    td.Application = Application;
})(td || (td = {}));
var td;
(function (td) {
    /**
     * List of known log levels. Used to specify the urgency of a log message.
     */
    (function (LogLevel) {
        LogLevel[LogLevel["Verbose"] = 0] = "Verbose";
        LogLevel[LogLevel["Info"] = 1] = "Info";
        LogLevel[LogLevel["Warn"] = 2] = "Warn";
        LogLevel[LogLevel["Error"] = 3] = "Error";
        LogLevel[LogLevel["Success"] = 4] = "Success";
    })(td.LogLevel || (td.LogLevel = {}));
    var LogLevel = td.LogLevel;
    (function (LoggerType) {
        LoggerType[LoggerType["None"] = 0] = "None";
        LoggerType[LoggerType["Console"] = 1] = "Console";
    })(td.LoggerType || (td.LoggerType = {}));
    var LoggerType = td.LoggerType;
    /**
     * A logger that will not produce any output.
     *
     * This logger also serves as the ase calls of other loggers as it implements
     * all the required utility functions.
     */
    var Logger = (function () {
        function Logger() {
            /**
             * How many error messages have been logged?
             */
            this.errorCount = 0;
        }
        /**
         * Has an error been raised through the log method?
         */
        Logger.prototype.hasErrors = function () {
            return this.errorCount > 0;
        };
        /**
         * Reset the error counter.
         */
        Logger.prototype.resetErrors = function () {
            this.errorCount = 0;
        };
        /**
         * Log the given message.
         *
         * @param text  The message that should be logged.
         * @param args  The arguments that should be printed into the given message.
         */
        Logger.prototype.write = function (text) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.log(td.Util.format.apply(this, arguments), LogLevel.Info);
        };
        /**
         * Log the given message with a trailing whitespace.
         *
         * @param text  The message that should be logged.
         * @param args  The arguments that should be printed into the given message.
         */
        Logger.prototype.writeln = function (text) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.log(td.Util.format.apply(this, arguments), LogLevel.Info, true);
        };
        /**
         * Log the given success message.
         *
         * @param text  The message that should be logged.
         * @param args  The arguments that should be printed into the given message.
         */
        Logger.prototype.success = function (text) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.log(td.Util.format.apply(this, arguments), LogLevel.Success);
        };
        /**
         * Log the given verbose message.
         *
         * @param text  The message that should be logged.
         * @param args  The arguments that should be printed into the given message.
         */
        Logger.prototype.verbose = function (text) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.log(td.Util.format.apply(this, arguments), LogLevel.Verbose);
        };
        /**
         * Log the given warning.
         *
         * @param text  The warning that should be logged.
         * @param args  The arguments that should be printed into the given warning.
         */
        Logger.prototype.warn = function (text) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.log(td.Util.format.apply(this, arguments), LogLevel.Warn);
        };
        /**
         * Log the given error.
         *
         * @param text  The error that should be logged.
         * @param args  The arguments that should be printed into the given error.
         */
        Logger.prototype.error = function (text) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.log(td.Util.format.apply(this, arguments), LogLevel.Error);
        };
        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level  The urgency of the log message.
         * @param newLine  Should the logger print a trailing whitespace?
         */
        Logger.prototype.log = function (message, level, newLine) {
            if (level === void 0) { level = LogLevel.Info; }
            if (level == LogLevel.Error) {
                this.errorCount += 1;
            }
        };
        /**
         * Print the given TypeScript log messages.
         *
         * @param diagnostics  The TypeScript messages that should be logged.
         */
        Logger.prototype.diagnostics = function (diagnostics) {
            var _this = this;
            diagnostics.forEach(function (diagnostic) {
                _this.diagnostic(diagnostic);
            });
        };
        /**
         * Print the given TypeScript log message.
         *
         * @param diagnostic  The TypeScript message that should be logged.
         */
        Logger.prototype.diagnostic = function (diagnostic) {
            var output;
            if (diagnostic.file) {
                output = diagnostic.file.fileName;
                output += '(' + ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start).line + ')';
                output += ts.sys.newLine + ' ' + diagnostic.messageText;
            }
            else {
                output = diagnostic.messageText;
            }
            switch (diagnostic.category) {
                case ts.DiagnosticCategory.Error:
                    this.log(output, LogLevel.Error);
                    break;
                case ts.DiagnosticCategory.Warning:
                    this.log(output, LogLevel.Warn);
                    break;
                case ts.DiagnosticCategory.Message:
                    this.log(output, LogLevel.Info);
            }
        };
        return Logger;
    })();
    td.Logger = Logger;
    /**
     * A logger that outputs all messages to the console.
     */
    var ConsoleLogger = (function (_super) {
        __extends(ConsoleLogger, _super);
        function ConsoleLogger() {
            _super.apply(this, arguments);
        }
        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level  The urgency of the log message.
         * @param newLine  Should the logger print a trailing whitespace?
         */
        ConsoleLogger.prototype.log = function (message, level, newLine) {
            if (level === void 0) { level = LogLevel.Info; }
            if (level == LogLevel.Error) {
                this.errorCount += 1;
            }
            var output = '';
            if (level == LogLevel.Error)
                output += 'Error: ';
            if (level == LogLevel.Warn)
                output += 'Warning: ';
            output += message;
            if (newLine || level == LogLevel.Success)
                ts.sys.write(ts.sys.newLine);
            ts.sys.write(output + ts.sys.newLine);
            if (level == LogLevel.Success)
                ts.sys.write(ts.sys.newLine);
        };
        return ConsoleLogger;
    })(Logger);
    td.ConsoleLogger = ConsoleLogger;
    /**
     * A logger that calls a callback function.
     */
    var CallbackLogger = (function (_super) {
        __extends(CallbackLogger, _super);
        /**
         * Create a new CallbackLogger instance.
         *
         * @param callback  The callback that should be used to log messages.
         */
        function CallbackLogger(callback) {
            _super.call(this);
            this.callback = callback;
        }
        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level  The urgency of the log message.
         * @param newLine  Should the logger print a trailing whitespace?
         */
        CallbackLogger.prototype.log = function (message, level, newLine) {
            if (level === void 0) { level = LogLevel.Info; }
            if (level == LogLevel.Error) {
                this.errorCount += 1;
            }
            this.callback(message, level, newLine);
        };
        return CallbackLogger;
    })(Logger);
    td.CallbackLogger = CallbackLogger;
})(td || (td = {}));
var td;
(function (td) {
    (function (ModuleKind) {
        ModuleKind[ModuleKind["None"] = 0] = "None";
        ModuleKind[ModuleKind["CommonJS"] = 1] = "CommonJS";
        ModuleKind[ModuleKind["AMD"] = 2] = "AMD";
    })(td.ModuleKind || (td.ModuleKind = {}));
    var ModuleKind = td.ModuleKind;
    (function (ScriptTarget) {
        ScriptTarget[ScriptTarget["ES3"] = 0] = "ES3";
        ScriptTarget[ScriptTarget["ES5"] = 1] = "ES5";
        ScriptTarget[ScriptTarget["ES6"] = 2] = "ES6";
        ScriptTarget[ScriptTarget["Latest"] = 2] = "Latest";
    })(td.ScriptTarget || (td.ScriptTarget = {}));
    var ScriptTarget = td.ScriptTarget;
    (function (SourceFileMode) {
        SourceFileMode[SourceFileMode["File"] = 0] = "File";
        SourceFileMode[SourceFileMode["Modules"] = 1] = "Modules";
    })(td.SourceFileMode || (td.SourceFileMode = {}));
    var SourceFileMode = td.SourceFileMode;
    (function (ParameterHint) {
        ParameterHint[ParameterHint["File"] = 0] = "File";
        ParameterHint[ParameterHint["Directory"] = 1] = "Directory";
    })(td.ParameterHint || (td.ParameterHint = {}));
    var ParameterHint = td.ParameterHint;
    (function (ParameterType) {
        ParameterType[ParameterType["String"] = 0] = "String";
        ParameterType[ParameterType["Number"] = 1] = "Number";
        ParameterType[ParameterType["Boolean"] = 2] = "Boolean";
        ParameterType[ParameterType["Map"] = 3] = "Map";
    })(td.ParameterType || (td.ParameterType = {}));
    var ParameterType = td.ParameterType;
    (function (ParameterScope) {
        ParameterScope[ParameterScope["TypeDoc"] = 0] = "TypeDoc";
        ParameterScope[ParameterScope["TypeScript"] = 1] = "TypeScript";
    })(td.ParameterScope || (td.ParameterScope = {}));
    var ParameterScope = td.ParameterScope;
    /**
     * A parser that can read command line arguments, option files and javascript objects.
     */
    var OptionsParser = (function () {
        /**
         * Create a new OptionsParser instance.
         *
         * @param application  The application that stores the parsed settings
         */
        function OptionsParser(application) {
            /**
             * The list of discovered input files.
             */
            this.inputFiles = [];
            /**
             * Map of parameter names and their definitions.
             */
            this.arguments = {};
            /**
             * Map of parameter short names and their full equivalent.
             */
            this.shortNames = {};
            this.application = application;
            this.addDefaultParameters();
            this.addCompilerParameters();
        }
        /**
         * Register one or multiple parameter definitions.
         */
        OptionsParser.prototype.addParameter = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            args.forEach(function (param) {
                if (td.Util.isArray(param)) {
                    _this.addParameter.apply(_this, param);
                    return;
                }
                param.type = param.type || ParameterType.String;
                param.scope = param.scope || ParameterScope.TypeDoc;
                _this.arguments[param.name.toLowerCase()] = param;
                if (param.short) {
                    _this.shortNames[param.short.toLowerCase()] = param.name;
                }
                if (param.defaultValue && !param.isArray) {
                    var name = param.name;
                    var target = (param.scope == ParameterScope.TypeDoc) ? _this.application.options : _this.application.compilerOptions;
                    if (!target[name]) {
                        target[name] = param.defaultValue;
                    }
                }
            });
        };
        /**
         * Register the command line parameters.
         */
        OptionsParser.prototype.addCommandLineParameters = function () {
            this.addParameter({
                name: 'out',
                help: 'Specifies the location the documentation should be written to.',
                hint: ParameterHint.Directory
            }, {
                name: 'json',
                help: 'Specifies the location and file name a json file describing the project is written to.',
                hint: ParameterHint.File
            }, {
                name: 'version',
                short: 'v',
                help: 'Print the TypeDoc\'s version.',
                type: ParameterType.Boolean
            }, {
                name: 'help',
                short: 'h',
                help: 'Print this message.',
                type: ParameterType.Boolean
            });
        };
        /**
         * Register the default parameters.
         */
        OptionsParser.prototype.addDefaultParameters = function () {
            this.addParameter({
                name: 'theme',
                help: 'Specify the path to the theme that should be used or \'default\' or \'minimal\' to use built-in themes.',
                type: ParameterType.String
            }, {
                name: OptionsParser.OPTIONS_KEY,
                help: 'Specify a js option file that should be loaded. If not specified TypeDoc will look for \'typedoc.js\' in the current directory.',
                type: ParameterType.String,
                hint: ParameterHint.File
            }, {
                name: 'exclude',
                help: 'Define a pattern for excluded files when specifying paths.',
                type: ParameterType.String
            }, {
                name: 'ignoreCompilerErrors',
                help: 'Should TypeDoc generate documentation pages even after the compiler has returned errors?',
                type: ParameterType.Boolean
            }, {
                name: 'plugin',
                help: 'Specify the npm plugins that should be loaded. Omit to load all installed plugins, set to \'none\' to load no plugins.',
                type: ParameterType.String,
                isArray: true
            }, {
                name: 'verbose',
                help: 'Should TypeDoc print additional debug information?',
                type: ParameterType.Boolean
            }, {
                name: 'logger',
                help: 'Specify the logger that should be used, \'none\' or \'console\'',
                defaultValue: td.LoggerType.Console,
                type: ParameterType.Map,
                map: {
                    'none': td.LoggerType.None,
                    'console': td.LoggerType.Console
                },
                convert: function (param, value) {
                    if (typeof value == 'function') {
                        return value;
                    }
                    else {
                        return OptionsParser.convert(param, value);
                    }
                }
            });
        };
        /**
         * Register all TypeScript related properties.
         */
        OptionsParser.prototype.addCompilerParameters = function () {
            var _this = this;
            var ignored = OptionsParser.IGNORED_TS_PARAMS;
            ts.optionDeclarations.forEach(function (option) {
                if (ignored.indexOf(option.name) != -1)
                    return;
                var param = {
                    name: option.name,
                    short: option.shortName,
                    help: option.description ? option.description.key : null,
                    scope: ParameterScope.TypeScript
                };
                switch (option.type) {
                    case "number":
                        param.type = ParameterType.Number;
                        break;
                    case "boolean":
                        param.type = ParameterType.Boolean;
                        break;
                    case "string":
                        param.type = ParameterType.String;
                        break;
                    default:
                        param.type = ParameterType.Map;
                        param.map = option.type;
                        if (option.error) {
                            var error = ts.createCompilerDiagnostic(option.error);
                            param.mapError = ts.flattenDiagnosticMessageText(error.messageText, ', ');
                        }
                }
                switch (option.paramType) {
                    case ts.Diagnostics.FILE:
                        param.hint = ParameterHint.File;
                        break;
                    case ts.Diagnostics.DIRECTORY:
                        param.hint = ParameterHint.Directory;
                        break;
                }
                _this.addParameter(param);
            });
        };
        /**
         * Add an input/source file.
         *
         * The input files will be used as source files for the compiler. All command line
         * arguments without parameter will be interpreted as being input files.
         *
         * @param fileName The path and filename of the input file.
         */
        OptionsParser.prototype.addInputFile = function (fileName) {
            this.inputFiles.push(fileName);
        };
        /**
         * Retrieve a parameter by its name.
         *
         * @param name  The name of the parameter to look for.
         * @returns The parameter definition or NULL when not found.
         */
        OptionsParser.prototype.getParameter = function (name) {
            name = name.toLowerCase();
            if (ts.hasProperty(this.shortNames, name)) {
                name = this.shortNames[name];
            }
            if (ts.hasProperty(this.arguments, name)) {
                return this.arguments[name];
            }
            else {
                return null;
            }
        };
        /**
         * Return all parameters within the given scope.
         *
         * @param scope  The scope the parameter list should be filtered for.
         * @returns All parameters within the given scope
         */
        OptionsParser.prototype.getParametersByScope = function (scope) {
            var parameters = [];
            for (var key in this.arguments) {
                if (!this.arguments.hasOwnProperty(key))
                    continue;
                var argument = this.arguments[key];
                if (argument.scope === scope) {
                    parameters.push(argument);
                }
            }
            return parameters;
        };
        /**
         * Set the option described by the given parameter description to the given value.
         *
         * @param param  The parameter description of the option to set.
         * @param value  The target value of the option.
         * @returns TRUE on success, otherwise FALSE.
         */
        OptionsParser.prototype.setOption = function (param, value) {
            var _this = this;
            if (param.isArray && td.Util.isArray(value)) {
                var result = true;
                value.forEach(function (value) { return result = _this.setOption(param, value) && result; });
                return result;
            }
            try {
                if (param.convert) {
                    value = param.convert(param, value);
                }
                else {
                    value = OptionsParser.convert(param, value);
                }
            }
            catch (error) {
                this.application.logger.error(error.message);
                return false;
            }
            var name = param.name;
            var target = (param.scope == ParameterScope.TypeDoc) ? this.application.options : this.application.compilerOptions;
            if (param.isArray) {
                (target[name] = target[name] || []).push(value);
            }
            else {
                target[name] = value;
            }
            return true;
        };
        /**
         * Try to find and load an option file from command line arguments.
         *
         * An option file can either be specified using the command line argument ``--option`` or must
         * be a file named ``typedoc.js`` within the current directory.
         *
         * @param args  The list of arguments that should be parsed. When omitted the
         *   current command line arguments will be used.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
         *   will simply skip all unknown arguments.
         * @returns TRUE on success, otherwise FALSE.
         */
        OptionsParser.prototype.loadOptionFileFromArguments = function (args, ignoreUnknownArgs) {
            args = args || process.argv.slice(2);
            var index = 0;
            var optionFile;
            while (index < args.length) {
                var arg = args[index++];
                if (arg.charCodeAt(0) !== 45 /* minus */) {
                    continue;
                }
                arg = arg.slice(arg.charCodeAt(1) === 45 /* minus */ ? 2 : 1).toLowerCase();
                if (arg == OptionsParser.OPTIONS_KEY && args[index]) {
                    optionFile = td.Path.resolve(args[index]);
                    break;
                }
            }
            if (!optionFile) {
                optionFile = td.Path.resolve('typedoc.js');
                if (!td.FS.existsSync(optionFile)) {
                    return true;
                }
            }
            return this.loadOptionFile(optionFile, ignoreUnknownArgs);
        };
        /**
         * Try to load an option file from a settings object.
         *
         * @param obj  The object whose properties should be applied.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
         *   will simply skip all unknown arguments.
         * @returns TRUE on success, otherwise FALSE.
         */
        OptionsParser.prototype.loadOptionFileFromObject = function (obj, ignoreUnknownArgs) {
            if (typeof obj != 'object')
                return true;
            if (!obj[OptionsParser.OPTIONS_KEY]) {
                return true;
            }
            return this.loadOptionFile(obj[OptionsParser.OPTIONS_KEY], ignoreUnknownArgs);
        };
        /**
         * Load the specified option file.
         *
         * @param optionFile  The absolute path and file name of the option file.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
         *   will simply skip all unknown arguments.
         * @returns TRUE on success, otherwise FALSE.
         */
        OptionsParser.prototype.loadOptionFile = function (optionFile, ignoreUnknownArgs) {
            if (!td.FS.existsSync(optionFile)) {
                this.application.logger.error('The specified option file %s does not exist.', optionFile);
                return false;
            }
            var data = require(optionFile);
            if (typeof data == 'function') {
                data = data(this.application, td);
            }
            if (!(typeof data == 'object')) {
                this.application.logger.error('The option file %s could not be read, it must either export a function or an object.', optionFile);
                return false;
            }
            else {
                if (data.src) {
                    if (typeof data.src == 'string') {
                        this.inputFiles = [data.src];
                    }
                    else if (td.Util.isArray(data.src)) {
                        this.inputFiles = data.src;
                    }
                    else {
                        this.application.logger.error('The property \'src\' of the option file %s must be a string or an array.', optionFile);
                    }
                    delete data.src;
                }
                return this.parseObject(data, ignoreUnknownArgs);
            }
        };
        /**
         * Apply the values of the given options object.
         *
         * @param obj  The object whose properties should be applied.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
         *   will simply skip all unknown arguments.
         * @returns TRUE on success, otherwise FALSE.
         */
        OptionsParser.prototype.parseObject = function (obj, ignoreUnknownArgs) {
            if (typeof obj != 'object')
                return true;
            var logger = this.application.logger;
            var result = true;
            for (var key in obj) {
                if (!obj.hasOwnProperty(key))
                    continue;
                var parameter = this.getParameter(key);
                if (!parameter) {
                    if (!ignoreUnknownArgs) {
                        logger.error('Unknown option: %s', key);
                        result = false;
                    }
                }
                else {
                    result = this.setOption(parameter, obj[key]) && result;
                }
            }
            return result;
        };
        /**
         * Read and store the given list of arguments.
         *
         * @param args  The list of arguments that should be parsed. When omitted the
         *   current command line arguments will be used.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored? If so the parser
         *   will simply skip all unknown arguments.
         * @returns TRUE on success, otherwise FALSE.
         */
        OptionsParser.prototype.parseArguments = function (args, ignoreUnknownArgs) {
            var index = 0;
            var result = true;
            var logger = this.application.logger;
            args = args || process.argv.slice(2);
            while (index < args.length) {
                var arg = args[index++];
                if (arg.charCodeAt(0) === 64 /* at */) {
                    result = this.parseResponseFile(arg.slice(1), ignoreUnknownArgs) && result;
                }
                else if (arg.charCodeAt(0) === 45 /* minus */) {
                    arg = arg.slice(arg.charCodeAt(1) === 45 /* minus */ ? 2 : 1).toLowerCase();
                    var parameter = this.getParameter(arg);
                    if (!parameter) {
                        if (ignoreUnknownArgs)
                            continue;
                        logger.error('Unknown option: %s', arg);
                        return false;
                    }
                    else if (parameter.type !== ParameterType.Boolean) {
                        if (!args[index]) {
                            if (ignoreUnknownArgs)
                                continue;
                            logger.error('Option "%s" expects an argument', parameter.name);
                            return false;
                        }
                        else {
                            result = this.setOption(parameter, args[index++]) && result;
                        }
                    }
                    else {
                        result = this.setOption(parameter, true) && result;
                    }
                }
                else if (!ignoreUnknownArgs) {
                    this.addInputFile(arg);
                }
            }
            return result;
        };
        /**
         * Read the arguments stored in the given file.
         *
         * @param filename  The path and filename that should be parsed.
         * @param ignoreUnknownArgs  Should unknown arguments be ignored?
         * @returns TRUE on success, otherwise FALSE.
         */
        OptionsParser.prototype.parseResponseFile = function (filename, ignoreUnknownArgs) {
            var text = ts.sys.readFile(filename);
            var logger = this.application.logger;
            if (!text) {
                logger.error('File not found: "%s"', filename);
                return false;
            }
            var args = [];
            var pos = 0;
            while (true) {
                while (pos < text.length && text.charCodeAt(pos) <= 32 /* space */)
                    pos++;
                if (pos >= text.length)
                    break;
                var start = pos;
                if (text.charCodeAt(start) === 34 /* doubleQuote */) {
                    pos++;
                    while (pos < text.length && text.charCodeAt(pos) !== 34 /* doubleQuote */)
                        pos++;
                    if (pos < text.length) {
                        args.push(text.substring(start + 1, pos));
                        pos++;
                    }
                    else {
                        logger.error('Unterminated quoted string in response file "%s"', filename);
                        return false;
                    }
                }
                else {
                    while (text.charCodeAt(pos) > 32 /* space */)
                        pos++;
                    args.push(text.substring(start, pos));
                }
            }
            return this.parseArguments(args, ignoreUnknownArgs);
        };
        /**
         * Prepare parameter information for the [[toString]] method.
         *
         * @param scope  The scope of the parameters whose help should be returned.
         * @returns The columns and lines for the help of the requested parameters.
         */
        OptionsParser.prototype.getParameterHelp = function (scope) {
            var parameters = this.getParametersByScope(scope);
            parameters.sort(function (a, b) {
                return ts.compareValues(a.name.toLowerCase(), b.name.toLowerCase());
            });
            var names = [];
            var helps = [];
            var margin = 0;
            for (var i = 0; i < parameters.length; i++) {
                var parameter = parameters[i];
                if (!parameter.help)
                    continue;
                var name = " ";
                if (parameter.short) {
                    name += "-" + parameter.short;
                    if (typeof parameter.hint != 'undefined') {
                        name += ' ' + ParameterHint[parameter.hint].toUpperCase();
                    }
                    name += ", ";
                }
                name += "--" + parameter.name;
                if (parameter.hint)
                    name += ' ' + ParameterHint[parameter.hint].toUpperCase();
                names.push(name);
                helps.push(parameter.help);
                margin = Math.max(name.length, margin);
            }
            return { names: names, helps: helps, margin: margin };
        };
        /**
         * Print some usage information.
         *
         * Taken from TypeScript (src/compiler/tsc.ts)
         */
        OptionsParser.prototype.toString = function () {
            var typeDoc = this.getParameterHelp(ParameterScope.TypeDoc);
            var typeScript = this.getParameterHelp(ParameterScope.TypeScript);
            var margin = Math.max(typeDoc.margin, typeScript.margin);
            var output = [];
            output.push('Usage:');
            output.push(' typedoc --mode modules --out path/to/documentation path/to/sourcefiles');
            output.push('', 'TypeDoc options:');
            pushHelp(typeDoc);
            output.push('', 'TypeScript options:');
            pushHelp(typeScript);
            output.push('');
            return output.join(ts.sys.newLine);
            function pushHelp(columns) {
                for (var i = 0; i < columns.names.length; i++) {
                    var usage = columns.names[i];
                    var description = columns.helps[i];
                    output.push(usage + padding(margin - usage.length + 2) + description);
                }
            }
            function padding(length) {
                return Array(length + 1).join(" ");
            }
        };
        /**
         * Convert the given value according to the type setting of the given parameter.
         *
         * @param param  The parameter definition.
         * @param value  The value that should be converted.
         * @returns The converted value.
         */
        OptionsParser.convert = function (param, value) {
            switch (param.type) {
                case ParameterType.Number:
                    value = parseInt(value);
                    break;
                case ParameterType.Boolean:
                    value = (typeof value == 'undefined' ? true : !!value);
                    break;
                case ParameterType.String:
                    value = value || "";
                    break;
                case ParameterType.Map:
                    var map = param.map;
                    var key = value ? (value + "").toLowerCase() : '';
                    if (ts.hasProperty(map, key)) {
                        value = map[key];
                    }
                    else if (param.mapError) {
                        throw new Error(param.mapError);
                    }
                    else {
                        throw new Error(td.Util.format('Invalid option given for option "%s".', param.name));
                    }
                    break;
            }
            return value;
        };
        /**
         * Create an options object populated with the default values.
         *
         * @returns An options object populated with default values.
         */
        OptionsParser.createOptions = function () {
            return {
                theme: 'default'
            };
        };
        /**
         * Create the compiler options populated with the default values.
         *
         * @returns A compiler options object populated with default values.
         */
        OptionsParser.createCompilerOptions = function () {
            return {
                target: 0 /* ES3 */,
                module: 0 /* None */
            };
        };
        /**
         * A list of all TypeScript parameters that should be ignored.
         */
        OptionsParser.IGNORED_TS_PARAMS = [
            'out', 'outDir', 'version', 'help',
            'watch', 'declaration', 'mapRoot',
            'sourceMap', 'removeComments'
        ];
        /**
         * The name of the parameter that specifies the options file.
         */
        OptionsParser.OPTIONS_KEY = 'options';
        return OptionsParser;
    })();
    td.OptionsParser = OptionsParser;
})(td || (td = {}));
var td;
(function (td) {
    var PluginHost = (function (_super) {
        __extends(PluginHost, _super);
        function PluginHost() {
            _super.apply(this, arguments);
        }
        PluginHost.prototype.getParameters = function () {
            var result = [];
            for (var key in this.plugins) {
                if (!this.plugins.hasOwnProperty(key))
                    continue;
                var plugin = this.plugins[key];
                if (plugin.getParameters) {
                    result.push.call(result, plugin.getParameters());
                }
            }
            return result;
        };
        /**
         * Retrieve a plugin instance.
         *
         * @returns  The instance of the plugin or NULL if no plugin with the given class is attached.
         */
        PluginHost.prototype.getPlugin = function (name) {
            if (this.plugins[name]) {
                return this.plugins[name];
            }
            else {
                return null;
            }
        };
        PluginHost.prototype.addPlugin = function (name, pluginClass) {
            if (!this.plugins)
                this.plugins = {};
            if (this.plugins[name]) {
                return null;
            }
            else {
                return this.plugins[name] = new pluginClass(this);
            }
        };
        PluginHost.prototype.removePlugin = function (name) {
            if (this.plugins[name]) {
                this.plugins[name].remove();
                delete this.plugins[name];
                return true;
            }
            else {
                return false;
            }
        };
        PluginHost.prototype.removeAllPlugins = function () {
            for (var name in this.plugins) {
                if (!this.plugins.hasOwnProperty(name))
                    continue;
                this.plugins[name].remove();
            }
            this.plugins = {};
        };
        PluginHost.registerPlugin = function (name, pluginClass) {
            if (!this.PLUGINS)
                this.PLUGINS = {};
            this.PLUGINS[name] = pluginClass;
        };
        PluginHost.loadPlugins = function (instance) {
            for (var name in this.PLUGINS) {
                if (!this.PLUGINS.hasOwnProperty(name))
                    continue;
                instance.addPlugin(name, this.PLUGINS[name]);
            }
        };
        return PluginHost;
    })(td.EventDispatcher);
    td.PluginHost = PluginHost;
})(td || (td = {}));
var td;
(function (td) {
    /**
     * List of known existent directories. Used to speed up [[directoryExists]].
     */
    var existingDirectories = {};
    /**
     * Normalize the given path.
     *
     * @param path  The path that should be normalized.
     * @returns The normalized path.
     */
    function normalizePath(path) {
        return ts.normalizePath(path);
    }
    td.normalizePath = normalizePath;
    /**
     * Test whether the given directory exists.
     *
     * @param directoryPath  The directory that should be tested.
     * @returns TRUE if the given directory exists, FALSE otherwise.
     */
    function directoryExists(directoryPath) {
        if (ts.hasProperty(existingDirectories, directoryPath)) {
            return true;
        }
        if (ts.sys.directoryExists(directoryPath)) {
            existingDirectories[directoryPath] = true;
            return true;
        }
        return false;
    }
    td.directoryExists = directoryExists;
    /**
     * Make sure that the given directory exists.
     *
     * @param directoryPath  The directory that should be validated.
     */
    function ensureDirectoriesExist(directoryPath) {
        if (directoryPath.length > ts.getRootLength(directoryPath) && !directoryExists(directoryPath)) {
            var parentDirectory = ts.getDirectoryPath(directoryPath);
            ensureDirectoriesExist(parentDirectory);
            ts.sys.createDirectory(directoryPath);
        }
    }
    td.ensureDirectoriesExist = ensureDirectoriesExist;
    /**
     * Write a file to disc.
     *
     * If the containing directory does not exist it will be created.
     *
     * @param fileName  The name of the file that should be written.
     * @param data  The contents of the file.
     * @param writeByteOrderMark  Whether the UTF-8 BOM should be written or not.
     * @param onError  A callback that will be invoked if an error occurs.
     */
    function writeFile(fileName, data, writeByteOrderMark, onError) {
        try {
            ensureDirectoriesExist(ts.getDirectoryPath(ts.normalizePath(fileName)));
            ts.sys.writeFile(fileName, data, writeByteOrderMark);
        }
        catch (e) {
            if (onError)
                onError(e.message);
        }
    }
    td.writeFile = writeFile;
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter) {
        /**
         * Helper class that determines the common base path of a set of files.
         *
         * In the first step all files must be passed to [[add]]. Afterwards [[trim]]
         * can be used to retrieve the shortest path relative to the determined base path.
         */
        var BasePath = (function () {
            function BasePath() {
                /**
                 * List of known base paths.
                 */
                this.basePaths = [];
            }
            /**
             * Add the given file path to this set of base paths.
             *
             * @param fileName  The absolute filename that should be added to the base path.
             */
            BasePath.prototype.add = function (fileName) {
                var fileDir = td.Path.dirname(BasePath.normalize(fileName));
                var filePath = fileDir.split('/');
                basePaths: for (var n = 0, c = this.basePaths.length; n < c; n++) {
                    var basePath = this.basePaths[n].split('/');
                    var mMax = Math.min(basePath.length, filePath.length);
                    for (var m = 0; m < mMax; m++) {
                        if (basePath[m] == filePath[m]) {
                            continue;
                        }
                        if (m < 1) {
                            // No match at all, try next known base path
                            continue basePaths;
                        }
                        else {
                            // Partial match, trim the known base path
                            if (m < basePath.length) {
                                this.basePaths[n] = basePath.slice(0, m).join('/');
                            }
                            return;
                        }
                    }
                    // Complete match, exit
                    this.basePaths[n] = basePath.splice(0, mMax).join('/');
                    return;
                }
                // Unknown base path, add it
                this.basePaths.push(fileDir);
            };
            /**
             * Trim the given filename by the determined base paths.
             *
             * @param fileName  The absolute filename that should be trimmed.
             * @returns The trimmed version of the filename.
             */
            BasePath.prototype.trim = function (fileName) {
                fileName = BasePath.normalize(fileName);
                for (var n = 0, c = this.basePaths.length; n < c; n++) {
                    var basePath = this.basePaths[n];
                    if (fileName.substr(0, basePath.length) == basePath) {
                        return fileName.substr(basePath.length + 1);
                    }
                }
                return fileName;
            };
            /**
             * Reset this instance, ignore all paths already passed to [[add]].
             */
            BasePath.prototype.reset = function () {
                this.basePaths = [];
            };
            /**
             * Normalize the given path.
             *
             * @param path  The path that should be normalized.
             * @returns Normalized version of the given path.
             */
            BasePath.normalize = function (path) {
                // Ensure forward slashes
                path = path.replace(/\\/g, '/');
                // Remove all surrounding quotes
                path = path.replace(/^["']+|["']+$/g, '');
                // Make Windows drive letters lower case
                return path.replace(/^([^\:]+)\:\//, function (m, m1) { return m1.toUpperCase() + ':/'; });
            };
            return BasePath;
        })();
        converter.BasePath = BasePath;
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter_1) {
        /**
         * The context describes the current state the converter is in.
         */
        var Context = (function () {
            /**
             * Create a new Context instance.
             *
             * @param converter  The converter instance that has created the context.
             * @param fileNames  A list of all files that have been passed to the TypeScript compiler.
             * @param checker  The TypeChecker instance returned by the TypeScript compiler.
             */
            function Context(converter, fileNames, checker, program) {
                /**
                 * Next free symbol id used by [[getSymbolID]].
                 */
                this.symbolID = -1024;
                this.converter = converter;
                this.fileNames = fileNames;
                this.checker = checker;
                this.program = program;
                this.visitStack = [];
                var project = new td.models.ProjectReflection(this.getOptions().name);
                this.project = project;
                this.scope = project;
                var options = converter.application.options;
                if (options.externalPattern) {
                    this.externalPattern = new td.Minimatch.Minimatch(options.externalPattern);
                }
            }
            /**
             * Return the current TypeDoc options object.
             */
            Context.prototype.getOptions = function () {
                return this.converter.application.options;
            };
            /**
             * Return the compiler options.
             */
            Context.prototype.getCompilerOptions = function () {
                return this.converter.application.compilerOptions;
            };
            /**
             * Return the type declaration of the given node.
             *
             * @param node  The TypeScript node whose type should be resolved.
             * @returns The type declaration of the given node.
             */
            Context.prototype.getTypeAtLocation = function (node) {
                try {
                    return this.checker.getTypeAtLocation(node);
                }
                catch (error) {
                    try {
                        if (node.symbol) {
                            return this.checker.getDeclaredTypeOfSymbol(node.symbol);
                        }
                    }
                    catch (error) { }
                }
                return null;
            };
            /**
             * Return the current logger instance.
             *
             * @returns The current logger instance.
             */
            Context.prototype.getLogger = function () {
                return this.converter.application.logger;
            };
            /**
             * Return the symbol id of the given symbol.
             *
             * The compiler sometimes does not assign an id to symbols, this method makes sure that we have one.
             * It will assign negative ids if they are not set.
             *
             * @param symbol  The symbol whose id should be returned.
             * @returns The id of the given symbol.
             */
            Context.prototype.getSymbolID = function (symbol) {
                if (!symbol)
                    return null;
                if (!symbol.id)
                    symbol.id = this.symbolID--;
                return symbol.id;
            };
            /**
             * Register a newly generated reflection.
             *
             * Ensures that the reflection is both listed in [[Project.reflections]] and
             * [[Project.symbolMapping]] if applicable.
             *
             * @param reflection  The reflection that should be registered.
             * @param node  The node the given reflection was resolved from.
             * @param symbol  The symbol the given reflection was resolved from.
             */
            Context.prototype.registerReflection = function (reflection, node, symbol) {
                this.project.reflections[reflection.id] = reflection;
                var id = this.getSymbolID(symbol ? symbol : (node ? node.symbol : null));
                if (!this.isInherit && id && !this.project.symbolMapping[id]) {
                    this.project.symbolMapping[id] = reflection.id;
                }
            };
            /**
             * Trigger a node reflection event.
             *
             * All events are dispatched on the current converter instance.
             *
             * @param name  The name of the event that should be triggered.
             * @param reflection  The triggering reflection.
             * @param node  The triggering TypeScript node if available.
             */
            Context.prototype.trigger = function (name, reflection, node) {
                this.converter.dispatch(name, this, reflection, node);
            };
            /**
             * Run the given callback with the context configured for the given source file.
             *
             * @param node  The TypeScript node containing the source file declaration.
             * @param callback  The callback that should be executed.
             */
            Context.prototype.withSourceFile = function (node, callback) {
                var options = this.converter.application.options;
                var externalPattern = this.externalPattern;
                var isExternal = this.fileNames.indexOf(node.fileName) == -1;
                if (externalPattern) {
                    isExternal = isExternal || externalPattern.match(node.fileName);
                }
                if (isExternal && options.excludeExternals) {
                    return;
                }
                var isDeclaration = ts.isDeclarationFile(node);
                if (isDeclaration) {
                    var lib = this.converter.getDefaultLib();
                    var isLib = node.fileName.substr(-lib.length) == lib;
                    if (!options.includeDeclarations || isLib) {
                        return;
                    }
                }
                this.isExternal = isExternal;
                this.isDeclaration = isDeclaration;
                this.trigger(converter_1.Converter.EVENT_FILE_BEGIN, this.project, node);
                callback();
                this.isExternal = false;
                this.isDeclaration = false;
            };
            /**
             * Run the given callback with the scope of the context set to the given reflection.
             *
             * @param scope  The reflection that should be set as the scope of the context while the callback is invoked.
             */
            Context.prototype.withScope = function (scope) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                if (!scope || !args.length)
                    return;
                var callback = args.pop();
                var parameters = args.shift();
                var oldScope = this.scope;
                var oldTypeArguments = this.typeArguments;
                var oldTypeParameters = this.typeParameters;
                this.scope = scope;
                this.typeParameters = parameters ? this.extractTypeParameters(parameters, args.length > 0) : this.typeParameters;
                this.typeArguments = null;
                callback();
                this.scope = oldScope;
                this.typeParameters = oldTypeParameters;
                this.typeArguments = oldTypeArguments;
            };
            /**
             * Inherit the children of the given TypeScript node to the current scope.
             *
             * @param baseNode  The node whose children should be inherited.
             * @param typeArguments  The type arguments that apply while inheriting the given node.
             * @return The resulting reflection / the current scope.
             */
            Context.prototype.inherit = function (baseNode, typeArguments) {
                var _this = this;
                var wasInherit = this.isInherit;
                var oldInherited = this.inherited;
                var oldInheritParent = this.inheritParent;
                var oldTypeArguments = this.typeArguments;
                this.isInherit = true;
                this.inheritParent = baseNode;
                this.inherited = [];
                var target = this.scope;
                if (!(target instanceof td.models.ContainerReflection)) {
                    throw new Error('Expected container reflection');
                }
                if (baseNode.symbol) {
                    var id = this.getSymbolID(baseNode.symbol);
                    if (this.inheritedChildren && this.inheritedChildren.indexOf(id) != -1) {
                        return target;
                    }
                    else {
                        this.inheritedChildren = this.inheritedChildren || [];
                        this.inheritedChildren.push(id);
                    }
                }
                if (target.children) {
                    this.inherited = target.children.map(function (c) { return c.name; });
                }
                else {
                    this.inherited = [];
                }
                if (typeArguments) {
                    this.typeArguments = typeArguments.map(function (t) { return converter_1.convertType(_this, t); });
                }
                else {
                    this.typeArguments = null;
                }
                converter_1.visit(this, baseNode);
                this.isInherit = wasInherit;
                this.inherited = oldInherited;
                this.inheritParent = oldInheritParent;
                this.typeArguments = oldTypeArguments;
                if (!this.isInherit) {
                    delete this.inheritedChildren;
                }
                return target;
            };
            /**
             * Convert the given list of type parameter declarations into a type mapping.
             *
             * @param parameters  The list of type parameter declarations that should be converted.
             * @param preserve  Should the currently set type parameters of the context be preserved?
             * @returns The resulting type mapping.
             */
            Context.prototype.extractTypeParameters = function (parameters, preserve) {
                var _this = this;
                var typeParameters = {};
                if (preserve) {
                    for (var key in this.typeParameters) {
                        if (!this.typeParameters.hasOwnProperty(key))
                            continue;
                        typeParameters[key] = this.typeParameters[key];
                    }
                }
                parameters.forEach(function (declaration, index) {
                    var name = declaration.symbol.name;
                    if (_this.typeArguments && _this.typeArguments[index]) {
                        typeParameters[name] = _this.typeArguments[index];
                    }
                    else {
                        typeParameters[name] = converter_1.createTypeParameter(_this, declaration);
                    }
                });
                return typeParameters;
            };
            return Context;
        })();
        converter_1.Context = Context;
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
/// <reference path="../PluginHost.ts" />
var td;
(function (td) {
    var converter;
    (function (converter) {
        /**
         * Compiles source files using TypeScript and converts compiler symbols to reflections.
         */
        var Converter = (function (_super) {
            __extends(Converter, _super);
            /**
             * Create a new Converter instance.
             *
             * @param application  The application instance this converter relies on. The application
             *   must expose the settings that should be used and serves as a global logging endpoint.
             */
            function Converter(application) {
                _super.call(this);
                this.application = application;
                Converter.loadPlugins(this);
            }
            /**
             * Return a list of parameters introduced by this component.
             *
             * @returns A list of parameter definitions introduced by this component.
             */
            Converter.prototype.getParameters = function () {
                return _super.prototype.getParameters.call(this).concat([{
                        name: "name",
                        help: 'Set the name of the project that will be used in the header of the template.'
                    }, {
                        name: "mode",
                        help: "Specifies the output mode the project is used to be compiled with: 'file' or 'modules'",
                        type: td.ParameterType.Map,
                        map: {
                            'file': td.SourceFileMode.File,
                            'modules': td.SourceFileMode.Modules
                        },
                        defaultValue: td.SourceFileMode.Modules
                    }, {
                        name: "externalPattern",
                        key: 'Define a pattern for files that should be considered being external.'
                    }, {
                        name: "includeDeclarations",
                        help: 'Turn on parsing of .d.ts declaration files.',
                        type: td.ParameterType.Boolean
                    }, {
                        name: "excludeExternals",
                        help: 'Prevent externally resolved TypeScript files from being documented.',
                        type: td.ParameterType.Boolean
                    }, {
                        name: "excludeNotExported",
                        help: 'Prevent symbols that are not exported from being documented.',
                        type: td.ParameterType.Boolean
                    }]);
            };
            /**
             * Compile the given source files and create a project reflection for them.
             *
             * @param fileNames  Array of the file names that should be compiled.
             */
            Converter.prototype.convert = function (fileNames) {
                if (this.application.options.verbose) {
                    this.application.logger.verbose('\n\x1b[32mStarting conversion\x1b[0m\n\nInput files:');
                    for (var i = 0, c = fileNames.length; i < c; i++) {
                        this.application.logger.verbose(' - ' + fileNames[i]);
                    }
                    this.application.logger.verbose('\n');
                }
                for (var i = 0, c = fileNames.length; i < c; i++) {
                    fileNames[i] = ts.normalizePath(ts.normalizeSlashes(fileNames[i]));
                }
                var program = ts.createProgram(fileNames, this.application.compilerOptions, this);
                var checker = program.getTypeChecker();
                var context = new converter.Context(this, fileNames, checker, program);
                this.dispatch(Converter.EVENT_BEGIN, context);
                var errors = this.compile(context);
                var project = this.resolve(context);
                this.dispatch(Converter.EVENT_END, context);
                if (this.application.options.verbose) {
                    this.application.logger.verbose('\n\x1b[32mFinished conversion\x1b[0m\n');
                }
                return {
                    errors: errors,
                    project: project
                };
            };
            /**
             * Compile the files within the given context and convert the compiler symbols to reflections.
             *
             * @param context  The context object describing the current state the converter is in.
             * @returns An array containing all errors generated by the TypeScript compiler.
             */
            Converter.prototype.compile = function (context) {
                var program = context.program;
                program.getSourceFiles().forEach(function (sourceFile) {
                    converter.visit(context, sourceFile);
                });
                // First get any syntactic errors.
                var diagnostics = program.getSyntacticDiagnostics();
                if (diagnostics.length === 0) {
                    diagnostics = program.getGlobalDiagnostics();
                    if (diagnostics.length === 0) {
                        return program.getSemanticDiagnostics();
                    }
                    else {
                        return diagnostics;
                    }
                }
                else {
                    return diagnostics;
                }
            };
            /**
             * Resolve the project within the given context.
             *
             * @param context  The context object describing the current state the converter is in.
             * @returns The final project reflection.
             */
            Converter.prototype.resolve = function (context) {
                this.dispatch(Converter.EVENT_RESOLVE_BEGIN, context);
                var project = context.project;
                for (var id in project.reflections) {
                    if (!project.reflections.hasOwnProperty(id))
                        continue;
                    if (this.application.options.verbose) {
                        this.application.logger.verbose('Resolving %s', project.reflections[id].getFullName());
                    }
                    this.dispatch(Converter.EVENT_RESOLVE, context, project.reflections[id]);
                }
                this.dispatch(Converter.EVENT_RESOLVE_END, context);
                return project;
            };
            /**
             * Return the basename of the default library that should be used.
             *
             * @returns The basename of the default library.
             */
            Converter.prototype.getDefaultLib = function () {
                var target = this.application.compilerOptions.target;
                return target == 2 /* ES6 */ ? 'lib.es6.d.ts' : 'lib.d.ts';
            };
            /**
             * CompilerHost implementation
             */
            /**
             * Return an instance of ts.SourceFile representing the given file.
             *
             * Implementation of ts.CompilerHost.getSourceFile()
             *
             * @param filename  The path and name of the file that should be loaded.
             * @param languageVersion  The script target the file should be interpreted with.
             * @param onError  A callback that will be invoked if an error occurs.
             * @returns An instance of ts.SourceFile representing the given file.
             */
            Converter.prototype.getSourceFile = function (filename, languageVersion, onError) {
                try {
                    var text = ts.sys.readFile(filename, this.application.compilerOptions.charset);
                }
                catch (e) {
                    if (onError) {
                        onError(e.number === Converter.ERROR_UNSUPPORTED_FILE_ENCODING ? 'Unsupported file encoding' : e.message);
                    }
                    text = "";
                }
                return text !== undefined ? ts.createSourceFile(filename, text, languageVersion) : undefined;
            };
            /**
             * Return the full path of the default library that should be used.
             *
             * Implementation of ts.CompilerHost.getDefaultLibFilename()
             *
             * @returns The full path of the default library.
             */
            Converter.prototype.getDefaultLibFileName = function (options) {
                var lib = this.getDefaultLib();
                var path = ts.getDirectoryPath(ts.normalizePath(td.tsPath));
                return td.Path.join(path, 'bin', lib);
            };
            /**
             * Return the full path of the current directory.
             *
             * Implementation of ts.CompilerHost.getCurrentDirectory()
             *
             * @returns The full path of the current directory.
             */
            Converter.prototype.getCurrentDirectory = function () {
                return this.currentDirectory || (this.currentDirectory = ts.sys.getCurrentDirectory());
            };
            /**
             * Return whether file names are case sensitive on the current platform or not.
             *
             * Implementation of ts.CompilerHost.useCaseSensitiveFileNames()
             *
             * @returns TRUE if file names are case sensitive on the current platform, FALSE otherwise.
             */
            Converter.prototype.useCaseSensitiveFileNames = function () {
                return ts.sys.useCaseSensitiveFileNames;
            };
            /**
             * Return the canonical file name of the given file.
             *
             * Implementation of ts.CompilerHost.getCanonicalFileName()
             *
             * @param fileName  The file name whose canonical variant should be resolved.
             * @returns The canonical file name of the given file.
             */
            Converter.prototype.getCanonicalFileName = function (fileName) {
                return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
            };
            /**
             * Return the new line char sequence of the current platform.
             *
             * Implementation of ts.CompilerHost.getNewLine()
             *
             * @returns The new line char sequence of the current platform.
             */
            Converter.prototype.getNewLine = function () {
                return ts.sys.newLine;
            };
            /**
             * Write a compiled javascript file to disc.
             *
             * As TypeDoc will not emit compiled javascript files this is a null operation.
             *
             * Implementation of ts.CompilerHost.writeFile()
             *
             * @param fileName  The name of the file that should be written.
             * @param data  The contents of the file.
             * @param writeByteOrderMark  Whether the UTF-8 BOM should be written or not.
             * @param onError  A callback that will be invoked if an error occurs.
             */
            Converter.prototype.writeFile = function (fileName, data, writeByteOrderMark, onError) { };
            /**
             * Return code of ts.sys.readFile when the file encoding is unsupported.
             */
            Converter.ERROR_UNSUPPORTED_FILE_ENCODING = -2147024809;
            /**
             * General events
             */
            /**
             * Triggered when the converter begins converting a project.
             * The listener should implement [[IConverterCallback]].
             * @event
             */
            Converter.EVENT_BEGIN = 'begin';
            /**
             * Triggered when the converter has finished converting a project.
             * The listener should implement [[IConverterCallback]].
             * @event
             */
            Converter.EVENT_END = 'end';
            /**
             * Factory events
             */
            /**
             * Triggered when the converter begins converting a source file.
             * The listener should implement [[IConverterNodeCallback]].
             * @event
             */
            Converter.EVENT_FILE_BEGIN = 'fileBegin';
            /**
             * Triggered when the converter has created a declaration reflection.
             * The listener should implement [[IConverterNodeCallback]].
             * @event
             */
            Converter.EVENT_CREATE_DECLARATION = 'createDeclaration';
            /**
             * Triggered when the converter has created a signature reflection.
             * The listener should implement [[IConverterNodeCallback]].
             * @event
             */
            Converter.EVENT_CREATE_SIGNATURE = 'createSignature';
            /**
             * Triggered when the converter has created a parameter reflection.
             * The listener should implement [[IConverterNodeCallback]].
             * @event
             */
            Converter.EVENT_CREATE_PARAMETER = 'createParameter';
            /**
             * Triggered when the converter has created a type parameter reflection.
             * The listener should implement [[IConverterNodeCallback]].
             * @event
             */
            Converter.EVENT_CREATE_TYPE_PARAMETER = 'createTypeParameter';
            /**
             * Triggered when the converter has found a function implementation.
             * The listener should implement [[IConverterNodeCallback]].
             * @event
             */
            Converter.EVENT_FUNCTION_IMPLEMENTATION = 'functionImplementation';
            /**
             * Resolve events
             */
            /**
             * Triggered when the converter begins resolving a project.
             * The listener should implement [[IConverterCallback]].
             * @event
             */
            Converter.EVENT_RESOLVE_BEGIN = 'resolveBegin';
            /**
             * Triggered when the converter resolves a reflection.
             * The listener should implement [[IConverterResolveCallback]].
             * @event
             */
            Converter.EVENT_RESOLVE = 'resolveReflection';
            /**
             * Triggered when the converter has finished resolving a project.
             * The listener should implement [[IConverterCallback]].
             * @event
             */
            Converter.EVENT_RESOLVE_END = 'resolveEnd';
            return Converter;
        })(td.PluginHost);
        converter.Converter = Converter;
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter_2) {
        var ConverterPlugin = (function () {
            /**
             * Create a new CommentPlugin instance.
             *
             * @param converter  The converter this plugin should be attached to.
             */
            function ConverterPlugin(converter) {
                this.converter = converter;
            }
            /**
             * Removes this plugin.
             */
            ConverterPlugin.prototype.remove = function () {
                this.converter.off(null, null, this);
                this.converter = null;
            };
            return ConverterPlugin;
        })();
        converter_2.ConverterPlugin = ConverterPlugin;
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter) {
        /**
         * Return the default value of the given node.
         *
         * @param node  The TypeScript node whose default value should be extracted.
         * @returns The default value as a string.
         */
        function getDefaultValue(node) {
            if (!node.initializer)
                return;
            switch (node.initializer.kind) {
                case 8 /* StringLiteral */:
                    return '"' + node.initializer.text + '"';
                    break;
                case 7 /* NumericLiteral */:
                    return node.initializer.text;
                    break;
                case 95 /* TrueKeyword */:
                    return 'true';
                    break;
                case 80 /* FalseKeyword */:
                    return 'false';
                    break;
                default:
                    var source = ts.getSourceFileOfNode(node);
                    return source.text.substring(node.initializer.pos, node.initializer.end);
                    break;
            }
        }
        converter.getDefaultValue = getDefaultValue;
        /**
         * Analyze the given node and create a suitable reflection.
         *
         * This function checks the kind of the node and delegates to the matching function implementation.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The compiler node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visit(context, node) {
            if (context.visitStack.indexOf(node) != -1) {
                return null;
            }
            var oldVisitStack = context.visitStack;
            context.visitStack = oldVisitStack.slice();
            context.visitStack.push(node);
            if (context.getOptions().verbose) {
                var file = ts.getSourceFileOfNode(node);
                var pos = ts.getLineAndCharacterOfPosition(file, node.pos);
                if (node.symbol) {
                    context.getLogger().verbose('Visiting \x1b[34m%s\x1b[0m\n    in %s (%s:%s)', context.checker.getFullyQualifiedName(node.symbol), file.fileName, pos.line.toString(), pos.character.toString());
                }
                else {
                    context.getLogger().verbose('Visiting node of kind %s in %s (%s:%s)', node.kind.toString(), file.fileName, pos.line.toString(), pos.character.toString());
                }
            }
            var result;
            switch (node.kind) {
                case 228 /* SourceFile */:
                    result = visitSourceFile(context, node);
                    break;
                case 175 /* ClassExpression */:
                case 202 /* ClassDeclaration */:
                    result = visitClassDeclaration(context, node);
                    break;
                case 203 /* InterfaceDeclaration */:
                    result = visitInterfaceDeclaration(context, node);
                    break;
                case 206 /* ModuleDeclaration */:
                    result = visitModuleDeclaration(context, node);
                    break;
                case 181 /* VariableStatement */:
                    result = visitVariableStatement(context, node);
                    break;
                case 132 /* PropertySignature */:
                case 133 /* PropertyDeclaration */:
                case 225 /* PropertyAssignment */:
                case 226 /* ShorthandPropertyAssignment */:
                case 199 /* VariableDeclaration */:
                case 153 /* BindingElement */:
                    result = visitVariableDeclaration(context, node);
                    break;
                case 205 /* EnumDeclaration */:
                    result = visitEnumDeclaration(context, node);
                    break;
                case 227 /* EnumMember */:
                    result = visitEnumMember(context, node);
                    break;
                case 136 /* Constructor */:
                case 140 /* ConstructSignature */:
                    result = visitConstructor(context, node);
                    break;
                case 134 /* MethodSignature */:
                case 135 /* MethodDeclaration */:
                case 201 /* FunctionDeclaration */:
                    result = visitFunctionDeclaration(context, node);
                    break;
                case 137 /* GetAccessor */:
                    result = visitGetAccessorDeclaration(context, node);
                    break;
                case 138 /* SetAccessor */:
                    result = visitSetAccessorDeclaration(context, node);
                    break;
                case 139 /* CallSignature */:
                case 143 /* FunctionType */:
                    result = visitCallSignatureDeclaration(context, node);
                    break;
                case 141 /* IndexSignature */:
                    result = visitIndexSignatureDeclaration(context, node);
                    break;
                case 180 /* Block */:
                case 207 /* ModuleBlock */:
                    result = visitBlock(context, node);
                    break;
                case 155 /* ObjectLiteralExpression */:
                    result = visitObjectLiteral(context, node);
                    break;
                case 146 /* TypeLiteral */:
                    result = visitTypeLiteral(context, node);
                    break;
                case 215 /* ExportAssignment */:
                    result = visitExportAssignment(context, node);
                    break;
                case 204 /* TypeAliasDeclaration */:
                    result = visitTypeAliasDeclaration(context, node);
                    break;
            }
            context.visitStack = oldVisitStack;
            return result;
        }
        converter.visit = visit;
        function visitBlock(context, node) {
            if (node.statements) {
                var prefered = [202 /* ClassDeclaration */, 203 /* InterfaceDeclaration */, 205 /* EnumDeclaration */];
                var statements = [];
                node.statements.forEach(function (statement) {
                    if (prefered.indexOf(statement.kind) != -1) {
                        visit(context, statement);
                    }
                    else {
                        statements.push(statement);
                    }
                });
                statements.forEach(function (statement) {
                    visit(context, statement);
                });
            }
            return context.scope;
        }
        /**
         * Analyze the given source file node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The source file node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitSourceFile(context, node) {
            var result = context.scope;
            var options = context.getOptions();
            context.withSourceFile(node, function () {
                if (options.mode == td.SourceFileMode.Modules) {
                    result = converter.createDeclaration(context, node, td.models.ReflectionKind.ExternalModule, node.fileName);
                    context.withScope(result, function () {
                        visitBlock(context, node);
                        result.setFlag(td.models.ReflectionFlag.Exported);
                    });
                }
                else {
                    visitBlock(context, node);
                }
            });
            return result;
        }
        /**
         * Analyze the given module node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The module node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitModuleDeclaration(context, node) {
            var parent = context.scope;
            var reflection = converter.createDeclaration(context, node, td.models.ReflectionKind.Module);
            context.withScope(reflection, function () {
                var opt = context.getCompilerOptions();
                if (parent instanceof td.models.ProjectReflection && !context.isDeclaration &&
                    (!opt.module || opt.module == 0 /* None */)) {
                    reflection.setFlag(td.models.ReflectionFlag.Exported);
                }
                if (node.body) {
                    visit(context, node.body);
                }
            });
            return reflection;
        }
        /**
         * Analyze the given class declaration node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The class declaration node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitClassDeclaration(context, node) {
            var reflection;
            if (context.isInherit && context.inheritParent == node) {
                reflection = context.scope;
            }
            else {
                reflection = converter.createDeclaration(context, node, td.models.ReflectionKind.Class);
            }
            context.withScope(reflection, node.typeParameters, function () {
                if (node.members) {
                    node.members.forEach(function (member) {
                        visit(context, member);
                    });
                }
                var baseType = ts.getClassExtendsHeritageClauseElement(node);
                if (baseType) {
                    var type = context.getTypeAtLocation(baseType);
                    if (!context.isInherit) {
                        if (!reflection.extendedTypes)
                            reflection.extendedTypes = [];
                        reflection.extendedTypes.push(converter.convertType(context, baseType, type));
                    }
                    if (type && type.symbol) {
                        type.symbol.declarations.forEach(function (declaration) {
                            context.inherit(declaration, baseType.typeArguments);
                        });
                    }
                }
                var implementedTypes = ts.getClassImplementsHeritageClauseElements(node);
                if (implementedTypes) {
                    implementedTypes.forEach(function (implementedType) {
                        if (!reflection.implementedTypes) {
                            reflection.implementedTypes = [];
                        }
                        reflection.implementedTypes.push(converter.convertType(context, implementedType));
                    });
                }
            });
            return reflection;
        }
        /**
         * Analyze the given interface declaration node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The interface declaration node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitInterfaceDeclaration(context, node) {
            var reflection;
            if (context.isInherit && context.inheritParent == node) {
                reflection = context.scope;
            }
            else {
                reflection = converter.createDeclaration(context, node, td.models.ReflectionKind.Interface);
            }
            context.withScope(reflection, node.typeParameters, function () {
                if (node.members) {
                    node.members.forEach(function (member, isInherit) {
                        visit(context, member);
                    });
                }
                var baseTypes = ts.getInterfaceBaseTypeNodes(node);
                if (baseTypes) {
                    baseTypes.forEach(function (baseType) {
                        var type = context.getTypeAtLocation(baseType);
                        if (!context.isInherit) {
                            if (!reflection.extendedTypes)
                                reflection.extendedTypes = [];
                            reflection.extendedTypes.push(converter.convertType(context, baseType, type));
                        }
                        if (type && type.symbol) {
                            type.symbol.declarations.forEach(function (declaration) {
                                context.inherit(declaration, baseType.typeArguments);
                            });
                        }
                    });
                }
            });
            return reflection;
        }
        /**
         * Analyze the given variable statement node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The variable statement node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitVariableStatement(context, node) {
            if (node.declarationList && node.declarationList.declarations) {
                node.declarationList.declarations.forEach(function (variableDeclaration) {
                    if (ts.isBindingPattern(variableDeclaration.name)) {
                        visitBindingPattern(context, variableDeclaration.name);
                    }
                    else {
                        visitVariableDeclaration(context, variableDeclaration);
                    }
                });
            }
            return context.scope;
        }
        function isSimpleObjectLiteral(objectLiteral) {
            if (!objectLiteral.properties)
                return true;
            return objectLiteral.properties.length == 0;
        }
        /**
         * Analyze the given variable declaration node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The variable declaration node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitVariableDeclaration(context, node) {
            var comment = converter.CommentPlugin.getComment(node);
            if (comment && /\@resolve/.test(comment)) {
                var resolveType = context.getTypeAtLocation(node);
                if (resolveType && resolveType.symbol) {
                    var resolved = visit(context, resolveType.symbol.declarations[0]);
                    if (resolved) {
                        resolved.name = node.symbol.name;
                    }
                    return resolved;
                }
            }
            var name, isBindingPattern;
            if (ts.isBindingPattern(node.name)) {
                if (node['propertyName']) {
                    name = ts.declarationNameToString(node['propertyName']);
                    isBindingPattern = true;
                }
                else {
                    return null;
                }
            }
            var scope = context.scope;
            var kind = scope.kind & td.models.ReflectionKind.ClassOrInterface ? td.models.ReflectionKind.Property : td.models.ReflectionKind.Variable;
            var variable = converter.createDeclaration(context, node, kind, name);
            context.withScope(variable, function () {
                if (node.initializer) {
                    switch (node.initializer.kind) {
                        case 164 /* ArrowFunction */:
                        case 163 /* FunctionExpression */:
                            variable.kind = scope.kind & td.models.ReflectionKind.ClassOrInterface ? td.models.ReflectionKind.Method : td.models.ReflectionKind.Function;
                            visitCallSignatureDeclaration(context, node.initializer);
                            break;
                        case 155 /* ObjectLiteralExpression */:
                            if (!isSimpleObjectLiteral(node.initializer)) {
                                variable.kind = td.models.ReflectionKind.ObjectLiteral;
                                variable.type = new td.models.IntrinsicType('object');
                                visitObjectLiteral(context, node.initializer);
                            }
                            break;
                        default:
                            variable.defaultValue = getDefaultValue(node);
                    }
                }
                if (variable.kind == kind || variable.kind == td.models.ReflectionKind.Event) {
                    if (isBindingPattern) {
                        variable.type = converter.convertDestructuringType(context, node.name);
                    }
                    else {
                        variable.type = converter.convertType(context, node.type, context.getTypeAtLocation(node));
                    }
                }
            });
            return variable;
        }
        /**
         * Traverse the elements of the given binding pattern and create the corresponding variable reflections.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The binding pattern node that should be analyzed.
         */
        function visitBindingPattern(context, node) {
            node.elements.forEach(function (element) {
                visitVariableDeclaration(context, element);
                if (ts.isBindingPattern(element.name)) {
                    visitBindingPattern(context, element.name);
                }
            });
        }
        /**
         * Analyze the given enumeration declaration node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The enumeration declaration node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitEnumDeclaration(context, node) {
            var enumeration = converter.createDeclaration(context, node, td.models.ReflectionKind.Enum);
            context.withScope(enumeration, function () {
                if (node.members) {
                    node.members.forEach(function (node) {
                        visitEnumMember(context, node);
                    });
                }
            });
            return enumeration;
        }
        /**
         * Analyze the given enumeration member node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The enumeration member node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitEnumMember(context, node) {
            var member = converter.createDeclaration(context, node, td.models.ReflectionKind.EnumMember);
            if (member) {
                member.defaultValue = getDefaultValue(node);
            }
            return member;
        }
        /**
         * Analyze parameters in given constructor declaration node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The constructor declaration node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitConstructorModifiers(context, node) {
            node.parameters.forEach(function (param) {
                var visibility = param.flags & (16 /* Public */ | 64 /* Protected */ | 32 /* Private */);
                if (!visibility)
                    return;
                var property = converter.createDeclaration(context, param, td.models.ReflectionKind.Property);
                if (!property)
                    return;
                property.setFlag(td.models.ReflectionFlag.Static, false);
                property.type = converter.convertType(context, param.type, context.getTypeAtLocation(param));
                var sourceComment = converter.CommentPlugin.getComment(node);
                if (sourceComment) {
                    var constructorComment = converter.CommentPlugin.parseComment(sourceComment);
                    if (constructorComment) {
                        var tag = constructorComment.getTag('param', property.name);
                        if (tag && tag.text) {
                            property.comment = converter.CommentPlugin.parseComment(tag.text);
                        }
                    }
                }
            });
        }
        /**
         * Analyze the given constructor declaration node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The constructor declaration node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitConstructor(context, node) {
            var parent = context.scope;
            var hasBody = !!node.body;
            var method = converter.createDeclaration(context, node, td.models.ReflectionKind.Constructor, 'constructor');
            visitConstructorModifiers(context, node);
            context.withScope(method, function () {
                if (!hasBody || !method.signatures) {
                    var name = 'new ' + parent.name;
                    var signature = converter.createSignature(context, node, name, td.models.ReflectionKind.ConstructorSignature);
                    signature.type = new td.models.ReferenceType(parent.name, td.models.ReferenceType.SYMBOL_ID_RESOLVED, parent);
                    method.signatures = method.signatures || [];
                    method.signatures.push(signature);
                }
                else {
                    context.trigger(converter.Converter.EVENT_FUNCTION_IMPLEMENTATION, method, node);
                }
            });
            return method;
        }
        function visitFunctionDeclaration(context, node) {
            var scope = context.scope;
            var kind = scope.kind & td.models.ReflectionKind.ClassOrInterface ? td.models.ReflectionKind.Method : td.models.ReflectionKind.Function;
            var hasBody = !!node.body;
            var method = converter.createDeclaration(context, node, kind);
            context.withScope(method, function () {
                if (!hasBody || !method.signatures) {
                    var signature = converter.createSignature(context, node, method.name, td.models.ReflectionKind.CallSignature);
                    if (!method.signatures)
                        method.signatures = [];
                    method.signatures.push(signature);
                }
                else {
                    context.trigger(converter.Converter.EVENT_FUNCTION_IMPLEMENTATION, method, node);
                }
            });
            return method;
        }
        function visitCallSignatureDeclaration(context, node) {
            var scope = context.scope;
            if (scope instanceof td.models.DeclarationReflection) {
                var name = scope.kindOf(td.models.ReflectionKind.FunctionOrMethod) ? scope.name : '__call';
                var signature = converter.createSignature(context, node, name, td.models.ReflectionKind.CallSignature);
                if (!scope.signatures)
                    scope.signatures = [];
                scope.signatures.push(signature);
            }
            return scope;
        }
        /**
         * Analyze the given index signature declaration node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The signature declaration node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitIndexSignatureDeclaration(context, node) {
            var scope = context.scope;
            if (scope instanceof td.models.DeclarationReflection) {
                scope.indexSignature = converter.createSignature(context, node, '__index', td.models.ReflectionKind.IndexSignature);
            }
            return scope;
        }
        /**
         * Analyze the given getter declaration node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The signature declaration node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitGetAccessorDeclaration(context, node) {
            var accessor = converter.createDeclaration(context, node, td.models.ReflectionKind.Accessor);
            context.withScope(accessor, function () {
                accessor.getSignature = converter.createSignature(context, node, '__get', td.models.ReflectionKind.GetSignature);
            });
            return accessor;
        }
        /**
         * Analyze the given setter declaration node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The signature declaration node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitSetAccessorDeclaration(context, node) {
            var accessor = converter.createDeclaration(context, node, td.models.ReflectionKind.Accessor);
            context.withScope(accessor, function () {
                accessor.setSignature = converter.createSignature(context, node, '__set', td.models.ReflectionKind.SetSignature);
            });
            return accessor;
        }
        /**
         * Analyze the given object literal node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The object literal node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitObjectLiteral(context, node) {
            if (node.properties) {
                node.properties.forEach(function (node) {
                    visit(context, node);
                });
            }
            return context.scope;
        }
        /**
         * Analyze the given type literal node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The type literal node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitTypeLiteral(context, node) {
            if (node.members) {
                node.members.forEach(function (node) {
                    visit(context, node);
                });
            }
            return context.scope;
        }
        /**
         * Analyze the given type alias declaration node and create a suitable reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node     The type alias declaration node that should be analyzed.
         * @return The resulting reflection or NULL.
         */
        function visitTypeAliasDeclaration(context, node) {
            var alias = converter.createDeclaration(context, node, td.models.ReflectionKind.TypeAlias);
            context.withScope(alias, function () {
                alias.type = converter.convertType(context, node.type, context.getTypeAtLocation(node.type));
            });
            return alias;
        }
        function visitExportAssignment(context, node) {
            if (!node.isExportEquals) {
                return context.scope;
            }
            var type = context.getTypeAtLocation(node.expression);
            if (type && type.symbol) {
                var project = context.project;
                type.symbol.declarations.forEach(function (declaration) {
                    if (!declaration.symbol)
                        return;
                    var id = project.symbolMapping[context.getSymbolID(declaration.symbol)];
                    if (!id)
                        return;
                    var reflection = project.reflections[id];
                    if (reflection instanceof td.models.DeclarationReflection) {
                        reflection.setFlag(td.models.ReflectionFlag.ExportAssignment, true);
                    }
                    markAsExported(reflection);
                });
            }
            function markAsExported(reflection) {
                if (reflection instanceof td.models.DeclarationReflection) {
                    reflection.setFlag(td.models.ReflectionFlag.Exported, true);
                }
                reflection.traverse(markAsExported);
            }
            return context.scope;
        }
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter) {
        /**
         * Convert the given TypeScript type into its TypeDoc type reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node  The node whose type should be reflected.
         * @param type  The type of the node if already known.
         * @returns The TypeDoc type reflection representing the given node and type.
         */
        function convertType(context, node, type) {
            if (node) {
                type = type || context.getTypeAtLocation(node);
                // Test for type aliases as early as possible
                if (isTypeAlias(context, node, type)) {
                    return convertTypeAliasNode(node);
                }
                // Node based type conversions by node kind
                switch (node.kind) {
                    case 8 /* StringLiteral */:
                        return convertStringLiteralExpression(node);
                    case 147 /* ArrayType */:
                        return convertArrayTypeNode(context, node);
                    case 148 /* TupleType */:
                        return convertTupleTypeNode(context, node);
                    case 149 /* UnionType */:
                        return convertUnionTypeNode(context, node);
                }
                // Node based type conversions by type flags
                if (type) {
                    if (type.flags & 512 /* TypeParameter */) {
                        return convertTypeParameterNode(context, node);
                    }
                    else if (type.flags & 48128 /* ObjectType */) {
                        return convertTypeReferenceNode(context, node, type);
                    }
                }
            }
            // Type conversions by type flags
            if (type) {
                if (type.flags & 1048703 /* Intrinsic */) {
                    return convertIntrinsicType(type);
                }
                else if (type.flags & 256 /* StringLiteral */) {
                    return convertStringLiteralType(type);
                }
                else if (type.flags & 128 /* Enum */) {
                    return convertEnumType(context, type);
                }
                else if (type.flags & 8192 /* Tuple */) {
                    return convertTupleType(context, type);
                }
                else if (type.flags & 16384 /* Union */) {
                    return convertUnionType(context, type);
                }
                else if (type.flags & 48128 /* ObjectType */) {
                    return convertTypeReferenceType(context, type);
                }
                else {
                    return convertUnknownType(context, type);
                }
            }
        }
        converter.convertType = convertType;
        /**
         * Test whether the given node and type definitions represent a type alias.
         *
         * The compiler resolves type aliases pretty early and there is no field telling us
         * whether the given node was a type alias or not. So we have to compare the type name of the
         * node with the type name of the type symbol.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node  The node that should be tested.
         * @param type  The type of the node that should be tested.
         * @returns TRUE when the given node and type look like a type alias, otherwise FALSE.
         */
        function isTypeAlias(context, node, type) {
            if (!type || !node || !node.typeName)
                return false;
            if (!type.symbol)
                return true;
            var checker = context.checker;
            var symbolName = checker.getFullyQualifiedName(type.symbol).split('.');
            if (!symbolName.length)
                return false;
            if (symbolName[0].substr(0, 1) == '"')
                symbolName.shift();
            var nodeName = ts.getTextOfNode(node.typeName).split('.');
            if (!nodeName.length)
                return false;
            var common = Math.min(symbolName.length, nodeName.length);
            symbolName = symbolName.slice(-common);
            nodeName = nodeName.slice(-common);
            return nodeName.join('.') != symbolName.join('.');
        }
        /**
         * Create a type literal reflection.
         *
         * This is a utility function used by [[convertTypeReferenceNode]] and
         * [[convertTypeReferenceType]] when encountering an object or type literal.
         *
         * A type literal is explicitly set:
         * ```
         * var someValue:{a:string; b:number;};
         * ```
         *
         * An object literal types are usually reflected by the TypeScript compiler:
         * ```
         * function someFunction() { return {a:'Test', b:1024}; }
         * ```
         *
         * @param context  The context object describing the current state the converter is in.
         * @param symbol  The symbol describing the type literal.
         * @param node  If known the node which produced the type literal. Type literals that are
         *   implicitly generated by TypeScript won't have a corresponding node.
         * @returns A type reflection representing the given type literal.
         */
        function convertTypeLiteral(context, symbol, node) {
            var declaration = new td.models.DeclarationReflection();
            declaration.kind = td.models.ReflectionKind.TypeLiteral;
            declaration.name = '__type';
            declaration.parent = context.scope;
            context.registerReflection(declaration, null, symbol);
            context.trigger(converter.Converter.EVENT_CREATE_DECLARATION, declaration, node);
            context.withScope(declaration, function () {
                symbol.declarations.forEach(function (node) {
                    converter.visit(context, node);
                });
            });
            return new td.models.ReflectionType(declaration);
        }
        /**
         * Node based type conversions
         */
        /**
         * Create a reflection for the given type alias node.
         *
         * This is a node based converter with no type equivalent.
         *
         * Use [[isTypeAlias]] beforehand to test whether a given type/node combination is
         * pointing to a type alias.
         *
         * ```
         * type MyNumber = number;
         * var someValue:MyNumber;
         * ```
         *
         * @param node  The node whose type should be reflected.
         * @returns  A type reference pointing to the type alias definition.
         */
        function convertTypeAliasNode(node) {
            var name = ts.getTextOfNode(node.typeName);
            return new td.models.ReferenceType(name, td.models.ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME);
        }
        /**
         * Convert the given string literal expression node to its type reflection.
         *
         * This is a node based converter, see [[convertStringLiteralType]] for the type equivalent.
         *
         * ```
         * createElement(tagName:"a"):HTMLAnchorElement;
         * ```
         *
         * @param node  The string literal node that should be converted.
         * @returns The type reflection representing the given string literal node.
         */
        function convertStringLiteralExpression(node) {
            return new td.models.StringLiteralType(node.text);
        }
        /**
         * Convert the given array type node to its type reflection.
         *
         * This is a node based converter with no type equivalent.
         *
         * ```
         * var someValue:number[];
         * ```
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node  The array type node that should be converted.
         * @returns The type reflection representing the given array type node.
         */
        function convertArrayTypeNode(context, node) {
            var result = convertType(context, node.elementType);
            if (result) {
                result.isArray = true;
            }
            else {
                result = new td.models.IntrinsicType('Array');
            }
            return result;
        }
        /**
         * Convert the given tuple type node to its type reflection.
         *
         * This is a node based converter, see [[convertTupleType]] for the type equivalent.
         *
         * ```
         * var someValue:[string,number];
         * ```
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node  The tuple type node that should be converted.
         * @returns The type reflection representing the given tuple type node.
         */
        function convertTupleTypeNode(context, node) {
            var elements;
            if (node.elementTypes) {
                elements = node.elementTypes.map(function (n) { return convertType(context, n); });
            }
            else {
                elements = [];
            }
            return new td.models.TupleType(elements);
        }
        /**
         * Convert the given union type node to its type reflection.
         *
         * This is a node based converter, see [[convertUnionType]] for the type equivalent.
         *
         * ```
         * var someValue:string|number;
         * ```
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node  The union type node that should be converted.
         * @returns The type reflection representing the given union type node.
         */
        function convertUnionTypeNode(context, node) {
            var types = [];
            if (node.types) {
                types = node.types.map(function (n) { return convertType(context, n); });
            }
            else {
                types = [];
            }
            return new td.models.UnionType(types);
        }
        /**
         * Interpret the given type reference node as a type parameter and convert it to its type reflection.
         *
         * This is a node based converter with no type equivalent.
         *
         * ```
         * class SomeClass<T> {
         *   public someValue:T;
         * }
         * ```
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node  The type reference node representing a type parameter.
         * @returns The type reflection representing the given type parameter.
         */
        function convertTypeParameterNode(context, node) {
            if (node.typeName) {
                var result, name = ts.getTextOfNode(node.typeName);
                if (context.typeParameters && context.typeParameters[name]) {
                    result = context.typeParameters[name].clone();
                }
                else {
                    result = new td.models.TypeParameterType();
                    result.name = name;
                }
                return result;
            }
        }
        /**
         * Convert the type reference node to its type reflection.
         *
         * This is a node based converter, see [[convertTypeReferenceType]] for the type equivalent.
         *
         * ```
         * class SomeClass { }
         * var someValue:SomeClass;
         * ```
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node  The type reference node that should be converted.
         * @param type  The type of the type reference node.
         * @returns The type reflection representing the given reference node.
         */
        function convertTypeReferenceNode(context, node, type) {
            if (!type.symbol) {
                return new td.models.IntrinsicType('Object');
            }
            else if (type.symbol.flags & 2048 /* TypeLiteral */ || type.symbol.flags & 4096 /* ObjectLiteral */) {
                return convertTypeLiteral(context, type.symbol, node);
            }
            var result = converter.createReferenceType(context, type.symbol);
            if (node.typeArguments) {
                result.typeArguments = node.typeArguments.map(function (n) { return convertType(context, n); });
            }
            return result;
        }
        /**
         * Type based type conversions
         */
        /**
         * Convert the given intrinsic type to its type reflection.
         *
         * This is a type based converter with no node based equivalent.
         *
         * ```
         * var someValue:string;
         * ```
         *
         * @param type  The intrinsic type that should be converted.
         * @returns The type reflection representing the given intrinsic type.
         */
        function convertIntrinsicType(type) {
            return new td.models.IntrinsicType(type.intrinsicName);
        }
        /**
         * Convert the given string literal type to its type reflection.
         *
         * This is a type based converter, see [[convertStringLiteralExpression]] for the node equivalent.
         *
         * ```
         * createElement(tagName:"a"):HTMLAnchorElement;
         * ```
         *
         * @param type  The intrinsic type that should be converted.
         * @returns The type reflection representing the given string literal type.
         */
        function convertStringLiteralType(type) {
            return new td.models.StringLiteralType(type.text);
        }
        /**
         * Convert the given type to its type reflection.
         *
         * This is a type based converter with no node based equivalent.
         *
         * If no other converter is able to reflect a type, this converter will produce a
         * reflection by utilising ts.typeToString() to generate a string representation of the
         * given type.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param type  The type that should be converted.
         * @returns The type reflection representing the given type.
         */
        function convertUnknownType(context, type) {
            var name = context.checker.typeToString(type);
            return new td.models.UnknownType(name);
        }
        /**
         * Convert the given enumeration type to its type reflection.
         *
         * This is a type based converter with no node based equivalent.
         *
         * ```
         * enum MyEnum { One, Two, Three }
         * var someValue:MyEnum;
         * ```
         *
         * @param context  The context object describing the current state the converter is in.
         * @param type  The enumeration type that should be converted.
         * @returns The type reflection representing the given enumeration type.
         */
        function convertEnumType(context, type) {
            return converter.createReferenceType(context, type.symbol);
        }
        /**
         * Convert the given tuple type to its type reflection.
         *
         * This is a type based converter, see [[convertTupleTypeNode]] for the node equivalent.
         *
         * ```
         * var someValue:[string,number];
         * ```
         *
         * @param context  The context object describing the current state the converter is in.
         * @param type  The tuple type that should be converted.
         * @returns The type reflection representing the given tuple type.
         */
        function convertTupleType(context, type) {
            var elements;
            if (type.elementTypes) {
                elements = type.elementTypes.map(function (t) { return convertType(context, null, t); });
            }
            else {
                elements = [];
            }
            return new td.models.TupleType(elements);
        }
        /**
         * Convert the given union type to its type reflection.
         *
         * This is a type based converter, see [[convertUnionTypeNode]] for the node equivalent.
         *
         * ```
         * var someValue:string|number;
         * ```
         *
         * @param context  The context object describing the current state the converter is in.
         * @param type  The union type that should be converted.
         * @returns The type reflection representing the given union type.
         */
        function convertUnionType(context, type) {
            var types;
            if (type && type.types) {
                types = type.types.map(function (t) { return convertType(context, null, t); });
            }
            else {
                types = [];
            }
            return new td.models.UnionType(types);
        }
        /**
         * Convert the given type reference to its type reflection.
         *
         * This is a type based converter, see [[convertTypeReference]] for the node equivalent.
         *
         * ```
         * class SomeClass { }
         * var someValue:SomeClass;
         * ```
         *
         * @param context  The context object describing the current state the converter is in.
         * @param type  The type reference that should be converted.
         * @returns The type reflection representing the given type reference.
         */
        function convertTypeReferenceType(context, type) {
            if (!type.symbol) {
                return new td.models.IntrinsicType('Object');
            }
            else if (type.symbol.flags & 2048 /* TypeLiteral */ || type.symbol.flags & 4096 /* ObjectLiteral */) {
                return convertTypeLiteral(context, type.symbol);
            }
            var result = converter.createReferenceType(context, type.symbol);
            if (type.typeArguments) {
                result.typeArguments = type.typeArguments.map(function (t) { return convertType(context, null, t); });
            }
            return result;
        }
        /**
         * Convert the given binding pattern to its type reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node  The binding pattern that should be converted.
         * @returns The type reflection representing the given binding pattern.
         */
        function convertDestructuringType(context, node) {
            if (node.kind == 152 /* ArrayBindingPattern */) {
                var types = [];
                node.elements.forEach(function (element) {
                    types.push(convertType(context, element));
                });
                return new td.models.TupleType(types);
            }
            else {
                var declaration = new td.models.DeclarationReflection();
                declaration.kind = td.models.ReflectionKind.TypeLiteral;
                declaration.name = '__type';
                declaration.parent = context.scope;
                context.registerReflection(declaration, null);
                context.trigger(converter.Converter.EVENT_CREATE_DECLARATION, declaration, node);
                context.withScope(declaration, function () {
                    node.elements.forEach(function (element) {
                        converter.visit(context, element);
                    });
                });
                return new td.models.ReflectionType(declaration);
            }
        }
        converter.convertDestructuringType = convertDestructuringType;
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
/**
 * Holds all data models used by TypeDoc.
 *
 * The [[BaseReflection]] is base class of all reflection models. The subclass [[ProjectReflection]]
 * serves as the root container for the current project while [[DeclarationReflection]] instances
 * form the structure of the project. Most of the other classes in this namespace are referenced by this
 * two base classes.
 *
 * The models [[NavigationItem]] and [[UrlMapping]] are special as they are only used by the [[Renderer]]
 * while creating the final output.
 */
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * Current reflection id.
         */
        var REFLECTION_ID = 0;
        /**
         * Reset the reflection id.
         *
         * Used by the test cases to ensure the reflection ids won't change between runs.
         */
        function resetReflectionID() {
            REFLECTION_ID = 0;
        }
        models.resetReflectionID = resetReflectionID;
        /**
         * Defines the available reflection kinds.
         */
        (function (ReflectionKind) {
            ReflectionKind[ReflectionKind["Global"] = 0] = "Global";
            ReflectionKind[ReflectionKind["ExternalModule"] = 1] = "ExternalModule";
            ReflectionKind[ReflectionKind["Module"] = 2] = "Module";
            ReflectionKind[ReflectionKind["Enum"] = 4] = "Enum";
            ReflectionKind[ReflectionKind["EnumMember"] = 16] = "EnumMember";
            ReflectionKind[ReflectionKind["Variable"] = 32] = "Variable";
            ReflectionKind[ReflectionKind["Function"] = 64] = "Function";
            ReflectionKind[ReflectionKind["Class"] = 128] = "Class";
            ReflectionKind[ReflectionKind["Interface"] = 256] = "Interface";
            ReflectionKind[ReflectionKind["Constructor"] = 512] = "Constructor";
            ReflectionKind[ReflectionKind["Property"] = 1024] = "Property";
            ReflectionKind[ReflectionKind["Method"] = 2048] = "Method";
            ReflectionKind[ReflectionKind["CallSignature"] = 4096] = "CallSignature";
            ReflectionKind[ReflectionKind["IndexSignature"] = 8192] = "IndexSignature";
            ReflectionKind[ReflectionKind["ConstructorSignature"] = 16384] = "ConstructorSignature";
            ReflectionKind[ReflectionKind["Parameter"] = 32768] = "Parameter";
            ReflectionKind[ReflectionKind["TypeLiteral"] = 65536] = "TypeLiteral";
            ReflectionKind[ReflectionKind["TypeParameter"] = 131072] = "TypeParameter";
            ReflectionKind[ReflectionKind["Accessor"] = 262144] = "Accessor";
            ReflectionKind[ReflectionKind["GetSignature"] = 524288] = "GetSignature";
            ReflectionKind[ReflectionKind["SetSignature"] = 1048576] = "SetSignature";
            ReflectionKind[ReflectionKind["ObjectLiteral"] = 2097152] = "ObjectLiteral";
            ReflectionKind[ReflectionKind["TypeAlias"] = 4194304] = "TypeAlias";
            ReflectionKind[ReflectionKind["Event"] = 8388608] = "Event";
            ReflectionKind[ReflectionKind["ClassOrInterface"] = 384] = "ClassOrInterface";
            ReflectionKind[ReflectionKind["VariableOrProperty"] = 1056] = "VariableOrProperty";
            ReflectionKind[ReflectionKind["FunctionOrMethod"] = 2112] = "FunctionOrMethod";
            ReflectionKind[ReflectionKind["SomeSignature"] = 1601536] = "SomeSignature";
            ReflectionKind[ReflectionKind["SomeModule"] = 3] = "SomeModule";
        })(models.ReflectionKind || (models.ReflectionKind = {}));
        var ReflectionKind = models.ReflectionKind;
        (function (ReflectionFlag) {
            ReflectionFlag[ReflectionFlag["Private"] = 1] = "Private";
            ReflectionFlag[ReflectionFlag["Protected"] = 2] = "Protected";
            ReflectionFlag[ReflectionFlag["Public"] = 4] = "Public";
            ReflectionFlag[ReflectionFlag["Static"] = 8] = "Static";
            ReflectionFlag[ReflectionFlag["Exported"] = 16] = "Exported";
            ReflectionFlag[ReflectionFlag["ExportAssignment"] = 32] = "ExportAssignment";
            ReflectionFlag[ReflectionFlag["External"] = 64] = "External";
            ReflectionFlag[ReflectionFlag["Optional"] = 128] = "Optional";
            ReflectionFlag[ReflectionFlag["DefaultValue"] = 256] = "DefaultValue";
            ReflectionFlag[ReflectionFlag["Rest"] = 512] = "Rest";
            ReflectionFlag[ReflectionFlag["ConstructorProperty"] = 1024] = "ConstructorProperty";
        })(models.ReflectionFlag || (models.ReflectionFlag = {}));
        var ReflectionFlag = models.ReflectionFlag;
        var relevantFlags = [
            ReflectionFlag.Private,
            ReflectionFlag.Protected,
            ReflectionFlag.Static,
            ReflectionFlag.ExportAssignment,
            ReflectionFlag.Optional,
            ReflectionFlag.DefaultValue,
            ReflectionFlag.Rest
        ];
        (function (TraverseProperty) {
            TraverseProperty[TraverseProperty["Children"] = 0] = "Children";
            TraverseProperty[TraverseProperty["Parameters"] = 1] = "Parameters";
            TraverseProperty[TraverseProperty["TypeLiteral"] = 2] = "TypeLiteral";
            TraverseProperty[TraverseProperty["TypeParameter"] = 3] = "TypeParameter";
            TraverseProperty[TraverseProperty["Signatures"] = 4] = "Signatures";
            TraverseProperty[TraverseProperty["IndexSignature"] = 5] = "IndexSignature";
            TraverseProperty[TraverseProperty["GetSignature"] = 6] = "GetSignature";
            TraverseProperty[TraverseProperty["SetSignature"] = 7] = "SetSignature";
        })(models.TraverseProperty || (models.TraverseProperty = {}));
        var TraverseProperty = models.TraverseProperty;
        /**
         * Base class for all reflection classes.
         *
         * While generating a documentation, TypeDoc generates an instance of [[ProjectReflection]]
         * as the root for all reflections within the project. All other reflections are represented
         * by the [[DeclarationReflection]] class.
         *
         * This base class exposes the basic properties one may use to traverse the reflection tree.
         * You can use the [[children]] and [[parent]] properties to walk the tree. The [[groups]] property
         * contains a list of all children grouped and sorted for being rendered.
         */
        var Reflection = (function () {
            /**
             * Create a new BaseReflection instance.
             */
            function Reflection(parent, name, kind) {
                /**
                 * The symbol name of this reflection.
                 */
                this.name = '';
                this.flags = [];
                this.id = REFLECTION_ID++;
                this.parent = parent;
                this.name = name;
                this.originalName = name;
                this.kind = kind;
            }
            /**
             * Test whether this reflection is of the given kind.
             */
            Reflection.prototype.kindOf = function (kind) {
                if (Array.isArray(kind)) {
                    for (var i = 0, c = kind.length; i < c; i++) {
                        if ((this.kind & kind[i]) !== 0) {
                            return true;
                        }
                    }
                    return false;
                }
                else {
                    return (this.kind & kind) !== 0;
                }
            };
            /**
             * Return the full name of this reflection.
             *
             * The full name contains the name of this reflection and the names of all parent reflections.
             *
             * @param separator  Separator used to join the names of the reflections.
             * @returns The full name of this reflection.
             */
            Reflection.prototype.getFullName = function (separator) {
                if (separator === void 0) { separator = '.'; }
                if (this.parent && !(this.parent instanceof models.ProjectReflection)) {
                    return this.parent.getFullName(separator) + separator + this.name;
                }
                else {
                    return this.name;
                }
            };
            /**
             * Set a flag on this reflection.
             */
            Reflection.prototype.setFlag = function (flag, value) {
                if (value === void 0) { value = true; }
                var name, index;
                if (relevantFlags.indexOf(flag) != -1) {
                    name = ReflectionFlag[flag];
                    name = name.replace(/(.)([A-Z])/g, function (m, a, b) { return a + ' ' + b.toLowerCase(); });
                    index = this.flags.indexOf(name);
                }
                if (value) {
                    this.flags.flags |= flag;
                    if (name && index == -1) {
                        this.flags.push(name);
                    }
                }
                else {
                    this.flags.flags &= ~flag;
                    if (name && index != -1) {
                        this.flags.splice(index, 1);
                    }
                }
                switch (flag) {
                    case ReflectionFlag.Private:
                        this.flags.isPrivate = value;
                        if (value) {
                            this.setFlag(ReflectionFlag.Protected, false);
                            this.setFlag(ReflectionFlag.Public, false);
                        }
                        break;
                    case ReflectionFlag.Protected:
                        this.flags.isProtected = value;
                        if (value) {
                            this.setFlag(ReflectionFlag.Private, false);
                            this.setFlag(ReflectionFlag.Public, false);
                        }
                        break;
                    case ReflectionFlag.Public:
                        this.flags.isPublic = value;
                        if (value) {
                            this.setFlag(ReflectionFlag.Private, false);
                            this.setFlag(ReflectionFlag.Protected, false);
                        }
                        break;
                    case ReflectionFlag.Static:
                        this.flags.isStatic = value;
                        break;
                    case ReflectionFlag.Exported:
                        this.flags.isExported = value;
                        break;
                    case ReflectionFlag.External:
                        this.flags.isExternal = value;
                        break;
                    case ReflectionFlag.Optional:
                        this.flags.isOptional = value;
                        break;
                    case ReflectionFlag.Rest:
                        this.flags.isRest = value;
                        break;
                    case ReflectionFlag.ExportAssignment:
                        this.flags.hasExportAssignment = value;
                        break;
                    case ReflectionFlag.ConstructorProperty:
                        this.flags.isConstructorProperty = value;
                        break;
                }
            };
            /**
             * Return an url safe alias for this reflection.
             */
            Reflection.prototype.getAlias = function () {
                if (!this._alias) {
                    var alias = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    if (alias == '') {
                        alias = 'reflection-' + this.id;
                    }
                    var target = this;
                    while (target.parent && !(target.parent instanceof models.ProjectReflection) && !target.hasOwnDocument) {
                        target = target.parent;
                    }
                    if (!target._aliases)
                        target._aliases = [];
                    var suffix = '', index = 0;
                    while (target._aliases.indexOf(alias + suffix) != -1) {
                        suffix = '-' + (++index).toString();
                    }
                    alias += suffix;
                    target._aliases.push(alias);
                    this._alias = alias;
                }
                return this._alias;
            };
            /**
             * Has this reflection a visible comment?
             *
             * @returns TRUE when this reflection has a visible comment.
             */
            Reflection.prototype.hasComment = function () {
                return (this.comment && this.comment.hasVisibleComponent());
            };
            Reflection.prototype.hasGetterOrSetter = function () {
                return false;
            };
            /**
             * Return a child by its name.
             *
             * @returns The found child or NULL.
             */
            Reflection.prototype.getChildByName = function (arg) {
                var names = Array.isArray(arg) ? arg : arg.split('.');
                var name = names[0];
                var result = null;
                this.traverse(function (child) {
                    if (child.name == name) {
                        if (names.length <= 1) {
                            result = child;
                        }
                        else if (child) {
                            result = child.getChildByName(names.slice(1));
                        }
                    }
                });
                return result;
            };
            /**
             * Try to find a reflection by its name.
             *
             * @return The found reflection or null.
             */
            Reflection.prototype.findReflectionByName = function (arg) {
                var names = Array.isArray(arg) ? arg : arg.split('.');
                var reflection = this.getChildByName(names);
                if (reflection) {
                    return reflection;
                }
                else {
                    return this.parent.findReflectionByName(names);
                }
            };
            /**
             * Traverse all potential child reflections of this reflection.
             *
             * The given callback will be invoked for all children, signatures and type parameters
             * attached to this reflection.
             *
             * @param callback  The callback function that should be applied for each child reflection.
             */
            Reflection.prototype.traverse = function (callback) { };
            /**
             * Return a raw object representation of this reflection.
             */
            Reflection.prototype.toObject = function () {
                var result = {
                    id: this.id,
                    name: this.name,
                    kind: this.kind,
                    kindString: this.kindString,
                    flags: {}
                };
                if (this.originalName != this.name) {
                    result.originalName = this.originalName;
                }
                if (this.comment) {
                    result.comment = this.comment.toObject();
                }
                for (var key in this.flags) {
                    if (parseInt(key) == key || key == 'flags')
                        continue;
                    if (this.flags[key])
                        result.flags[key] = true;
                }
                if (this.decorates) {
                    result.decorates = this.decorates.map(function (type) { return type.toObject(); });
                }
                if (this.decorators) {
                    result.decorators = this.decorators.map(function (decorator) {
                        var result = { name: decorator.name };
                        if (decorator.type)
                            result.type = decorator.type.toObject();
                        if (decorator.arguments)
                            result.arguments = decorator.arguments;
                        return result;
                    });
                }
                this.traverse(function (child, property) {
                    if (property == TraverseProperty.TypeLiteral)
                        return;
                    var name = TraverseProperty[property];
                    name = name.substr(0, 1).toLowerCase() + name.substr(1);
                    if (!result[name])
                        result[name] = [];
                    result[name].push(child.toObject());
                });
                return result;
            };
            /**
             * Return a string representation of this reflection.
             */
            Reflection.prototype.toString = function () {
                return ReflectionKind[this.kind] + ' ' + this.name;
            };
            /**
             * Return a string representation of this reflection and all of its children.
             *
             * @param indent  Used internally to indent child reflections.
             */
            Reflection.prototype.toStringHierarchy = function (indent) {
                if (indent === void 0) { indent = ''; }
                var lines = [indent + this.toString()];
                indent += '  ';
                this.traverse(function (child, property) {
                    lines.push(child.toStringHierarchy(indent));
                });
                return lines.join('\n');
            };
            return Reflection;
        })();
        models.Reflection = Reflection;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
/// <reference path="../../models/Reflection.ts" />
var td;
(function (td) {
    var converter;
    (function (converter) {
        /**
         * List of reflection kinds that never should be static.
         */
        var nonStaticKinds = [
            td.models.ReflectionKind.Class,
            td.models.ReflectionKind.Interface,
            td.models.ReflectionKind.Module
        ];
        /**
         * Create a declaration reflection from the given TypeScript node.
         *
         * @param context  The context object describing the current state the converter is in. The
         *   scope of the context will be the parent of the generated reflection.
         * @param node  The TypeScript node that should be converted to a reflection.
         * @param kind  The desired kind of the reflection.
         * @param name  The desired name of the reflection.
         * @returns The resulting reflection.
         */
        function createDeclaration(context, node, kind, name) {
            var container = context.scope;
            if (!(container instanceof td.models.ContainerReflection)) {
                throw new Error('Expected container reflection.');
            }
            // Ensure we have a name for the reflection
            if (!name) {
                if (!node.symbol)
                    return null;
                name = node.symbol.name;
            }
            // Test whether the node is exported
            var isExported = container.kindOf(td.models.ReflectionKind.Module) ? false : container.flags.isExported;
            if (node.parent && node.parent.kind == 200 /* VariableDeclarationList */) {
                isExported = isExported || !!(node.parent.parent.flags & 1 /* Export */);
            }
            else {
                isExported = isExported || !!(node.flags & 1 /* Export */);
            }
            if (!isExported && context.getOptions().excludeNotExported) {
                return null;
            }
            // Test whether the node is private, when inheriting ignore private members
            var isPrivate = !!(node.flags & 32 /* Private */);
            if (context.isInherit && isPrivate) {
                return null;
            }
            // Test whether the node is static, when merging a module to a class make the node static
            var isConstructorProperty = false;
            var isStatic = false;
            if (nonStaticKinds.indexOf(kind) == -1) {
                isStatic = !!(node.flags & 128 /* Static */);
                if (container.kind == td.models.ReflectionKind.Class) {
                    if (node.parent && node.parent.kind == 136 /* Constructor */) {
                        isConstructorProperty = true;
                    }
                    else if (!node.parent || node.parent.kind != 202 /* ClassDeclaration */) {
                        isStatic = true;
                    }
                }
            }
            // Check if we already have a child with the same name and static flag
            var child;
            var children = container.children = container.children || [];
            children.forEach(function (n) {
                if (n.name == name && n.flags.isStatic == isStatic)
                    child = n;
            });
            if (!child) {
                // Child does not exist, create a new reflection
                child = new td.models.DeclarationReflection(container, name, kind);
                child.setFlag(td.models.ReflectionFlag.Static, isStatic);
                child.setFlag(td.models.ReflectionFlag.Private, isPrivate);
                child.setFlag(td.models.ReflectionFlag.ConstructorProperty, isConstructorProperty);
                child.setFlag(td.models.ReflectionFlag.Exported, isExported);
                child = setupDeclaration(context, child, node);
                if (child) {
                    children.push(child);
                    context.registerReflection(child, node);
                }
            }
            else {
                // Merge the existent reflection with the given node
                child = mergeDeclarations(context, child, node, kind);
            }
            // If we have a reflection, trigger the corresponding event
            if (child) {
                context.trigger(converter.Converter.EVENT_CREATE_DECLARATION, child, node);
            }
            return child;
        }
        converter.createDeclaration = createDeclaration;
        /**
         * Setup a newly created declaration reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The newly created blank reflection.
         * @param node  The TypeScript node whose properties should be applies to the given reflection.
         * @returns The reflection populated with the values of the given node.
         */
        function setupDeclaration(context, reflection, node) {
            reflection.setFlag(td.models.ReflectionFlag.External, context.isExternal);
            reflection.setFlag(td.models.ReflectionFlag.Protected, !!(node.flags & 64 /* Protected */));
            reflection.setFlag(td.models.ReflectionFlag.Public, !!(node.flags & 16 /* Public */));
            reflection.setFlag(td.models.ReflectionFlag.Optional, !!(node['questionToken']));
            if (context.isInherit &&
                (node.parent == context.inheritParent || reflection.flags.isConstructorProperty)) {
                if (!reflection.inheritedFrom) {
                    reflection.inheritedFrom = createReferenceType(context, node.symbol, true);
                    reflection.getAllSignatures().forEach(function (signature) {
                        signature.inheritedFrom = createReferenceType(context, node.symbol, true);
                    });
                }
            }
            return reflection;
        }
        /**
         * Merge the properties of the given TypeScript node with the pre existent reflection.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param reflection  The pre existent reflection.
         * @param node  The TypeScript node whose properties should be merged with the given reflection.
         * @param kind  The desired kind of the reflection.
         * @returns The reflection merged with the values of the given node or NULL if the merge is invalid.
         */
        function mergeDeclarations(context, reflection, node, kind) {
            if (reflection.kind != kind) {
                var weights = [td.models.ReflectionKind.Module, td.models.ReflectionKind.Enum, td.models.ReflectionKind.Class];
                var kindWeight = weights.indexOf(kind);
                var childKindWeight = weights.indexOf(reflection.kind);
                if (kindWeight > childKindWeight) {
                    reflection.kind = kind;
                }
            }
            if (context.isInherit &&
                context.inherited.indexOf(reflection.name) != -1 &&
                (node.parent == context.inheritParent || reflection.flags.isConstructorProperty)) {
                if (!reflection.overwrites) {
                    reflection.overwrites = createReferenceType(context, node.symbol, true);
                    reflection.getAllSignatures().forEach(function (signature) {
                        signature.overwrites = createReferenceType(context, node.symbol, true);
                    });
                }
                return null;
            }
            return reflection;
        }
        /**
         * Create a new reference type pointing to the given symbol.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param symbol  The symbol the reference type should point to.
         * @param includeParent  Should the name of the parent be provided within the fallback name?
         * @returns A new reference type instance pointing to the given symbol.
         */
        function createReferenceType(context, symbol, includeParent) {
            var checker = context.checker;
            var id = context.getSymbolID(symbol);
            var name = checker.symbolToString(symbol);
            if (includeParent && symbol.parent) {
                name = checker.symbolToString(symbol.parent) + '.' + name;
            }
            return new td.models.ReferenceType(name, id);
        }
        converter.createReferenceType = createReferenceType;
        /**
         * Create a new signature reflection from the given node.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node  The TypeScript node containing the signature declaration that should be reflected.
         * @param name  The name of the function or method this signature belongs to.
         * @param kind  The desired kind of the reflection.
         * @returns The newly created signature reflection describing the given node.
         */
        function createSignature(context, node, name, kind) {
            var container = context.scope;
            if (!(container instanceof td.models.ContainerReflection)) {
                throw new Error('Expected container reflection.');
            }
            var signature = new td.models.SignatureReflection(container, name, kind);
            context.registerReflection(signature, node);
            context.withScope(signature, node.typeParameters, true, function () {
                node.parameters.forEach(function (parameter) {
                    createParameter(context, parameter);
                });
                signature.type = extractSignatureType(context, node);
                if (container.inheritedFrom) {
                    signature.inheritedFrom = createReferenceType(context, node.symbol, true);
                }
            });
            context.trigger(converter.Converter.EVENT_CREATE_SIGNATURE, signature, node);
            return signature;
        }
        converter.createSignature = createSignature;
        /**
         * Extract the return type of the given signature declaration.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node  The signature declaration whose return type should be determined.
         * @returns The return type reflection of the given signature.
         */
        function extractSignatureType(context, node) {
            var checker = context.checker;
            if (node.kind & 139 /* CallSignature */ || node.kind & 158 /* CallExpression */) {
                try {
                    var signature = checker.getSignatureFromDeclaration(node);
                    return converter.convertType(context, node.type, checker.getReturnTypeOfSignature(signature));
                }
                catch (error) { }
            }
            if (node.type) {
                return converter.convertType(context, node.type);
            }
            else {
                return converter.convertType(context, node);
            }
        }
        /**
         * Create a parameter reflection for the given node.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node  The parameter node that should be reflected.
         * @returns The newly created parameter reflection.
         */
        function createParameter(context, node) {
            var signature = context.scope;
            if (!(signature instanceof td.models.SignatureReflection)) {
                throw new Error('Expected signature reflection.');
            }
            var parameter = new td.models.ParameterReflection(signature, node.symbol.name, td.models.ReflectionKind.Parameter);
            context.registerReflection(parameter, node);
            context.withScope(parameter, function () {
                if (ts.isBindingPattern(node.name)) {
                    parameter.type = converter.convertDestructuringType(context, node.name);
                    parameter.name = '__namedParameters';
                }
                else {
                    parameter.type = converter.convertType(context, node.type, context.getTypeAtLocation(node));
                }
                parameter.defaultValue = converter.getDefaultValue(node);
                parameter.setFlag(td.models.ReflectionFlag.Optional, !!node.questionToken);
                parameter.setFlag(td.models.ReflectionFlag.Rest, !!node.dotDotDotToken);
                parameter.setFlag(td.models.ReflectionFlag.DefaultValue, !!parameter.defaultValue);
                if (!signature.parameters)
                    signature.parameters = [];
                signature.parameters.push(parameter);
            });
            context.trigger(converter.Converter.EVENT_CREATE_PARAMETER, parameter, node);
            return parameter;
        }
        /**
         * Create a type parameter reflection for the given node.
         *
         * @param context  The context object describing the current state the converter is in.
         * @param node  The type parameter node that should be reflected.
         * @returns The newly created type parameter reflection.
         */
        function createTypeParameter(context, node) {
            var typeParameter = new td.models.TypeParameterType();
            typeParameter.name = node.symbol.name;
            if (node.constraint) {
                typeParameter.constraint = converter.convertType(context, node.constraint);
            }
            var reflection = context.scope;
            var typeParameterReflection = new td.models.TypeParameterReflection(reflection, typeParameter);
            if (!reflection.typeParameters)
                reflection.typeParameters = [];
            reflection.typeParameters.push(typeParameterReflection);
            context.registerReflection(typeParameterReflection, node);
            context.trigger(converter.Converter.EVENT_CREATE_TYPE_PARAMETER, typeParameterReflection, node);
            return typeParameter;
        }
        converter.createTypeParameter = createTypeParameter;
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter_3) {
        /**
         * A handler that parses javadoc comments and attaches [[Models.Comment]] instances to
         * the generated reflections.
         */
        var CommentPlugin = (function (_super) {
            __extends(CommentPlugin, _super);
            /**
             * Create a new CommentPlugin instance.
             *
             * @param converter  The converter this plugin should be attached to.
             */
            function CommentPlugin(converter) {
                _super.call(this, converter);
                converter.on(converter_3.Converter.EVENT_BEGIN, this.onBegin, this);
                converter.on(converter_3.Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this);
                converter.on(converter_3.Converter.EVENT_CREATE_SIGNATURE, this.onDeclaration, this);
                converter.on(converter_3.Converter.EVENT_CREATE_TYPE_PARAMETER, this.onCreateTypeParameter, this);
                converter.on(converter_3.Converter.EVENT_FUNCTION_IMPLEMENTATION, this.onFunctionImplementation, this);
                converter.on(converter_3.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this);
                converter.on(converter_3.Converter.EVENT_RESOLVE, this.onResolve, this);
            }
            CommentPlugin.prototype.storeModuleComment = function (comment, reflection) {
                var isPreferred = (comment.toLowerCase().indexOf('@preferred') != -1);
                if (this.comments[reflection.id]) {
                    var info = this.comments[reflection.id];
                    if (!isPreferred && (info.isPreferred || info.fullText.length > comment.length)) {
                        return;
                    }
                    info.fullText = comment;
                    info.isPreferred = isPreferred;
                }
                else {
                    this.comments[reflection.id] = {
                        reflection: reflection,
                        fullText: comment,
                        isPreferred: isPreferred
                    };
                }
            };
            /**
             * Apply all comment tag modifiers to the given reflection.
             *
             * @param reflection  The reflection the modifiers should be applied to.
             * @param comment  The comment that should be searched for modifiers.
             */
            CommentPlugin.prototype.applyModifiers = function (reflection, comment) {
                if (comment.hasTag('private')) {
                    reflection.setFlag(td.models.ReflectionFlag.Private);
                    CommentPlugin.removeTags(comment, 'private');
                }
                if (comment.hasTag('protected')) {
                    reflection.setFlag(td.models.ReflectionFlag.Protected);
                    CommentPlugin.removeTags(comment, 'protected');
                }
                if (comment.hasTag('public')) {
                    reflection.setFlag(td.models.ReflectionFlag.Public);
                    CommentPlugin.removeTags(comment, 'public');
                }
                if (comment.hasTag('event')) {
                    reflection.kind = td.models.ReflectionKind.Event;
                    // reflection.setFlag(ReflectionFlag.Event);
                    CommentPlugin.removeTags(comment, 'event');
                }
                if (comment.hasTag('hidden')) {
                    if (!this.hidden)
                        this.hidden = [];
                    this.hidden.push(reflection);
                }
            };
            /**
             * Triggered when the converter begins converting a project.
             *
             * @param context  The context object describing the current state the converter is in.
             */
            CommentPlugin.prototype.onBegin = function (context) {
                this.comments = {};
            };
            /**
             * Triggered when the converter has created a type parameter reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently processed.
             * @param node  The node that is currently processed if available.
             */
            CommentPlugin.prototype.onCreateTypeParameter = function (context, reflection, node) {
                var comment = reflection.parent.comment;
                if (comment) {
                    var tag = comment.getTag('typeparam', reflection.name);
                    if (!tag)
                        tag = comment.getTag('param', '<' + reflection.name + '>');
                    if (!tag)
                        tag = comment.getTag('param', reflection.name);
                    if (tag) {
                        reflection.comment = new td.models.Comment(tag.text);
                        comment.tags.splice(comment.tags.indexOf(tag), 1);
                    }
                }
            };
            /**
             * Triggered when the converter has created a declaration or signature reflection.
             *
             * Invokes the comment parser.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently processed.
             * @param node  The node that is currently processed if available.
             */
            CommentPlugin.prototype.onDeclaration = function (context, reflection, node) {
                if (!node)
                    return;
                var rawComment = CommentPlugin.getComment(node);
                if (!rawComment)
                    return;
                if (reflection.kindOf(td.models.ReflectionKind.FunctionOrMethod)) {
                    var comment = CommentPlugin.parseComment(rawComment, reflection.comment);
                    this.applyModifiers(reflection, comment);
                }
                else if (reflection.kindOf(td.models.ReflectionKind.Module)) {
                    this.storeModuleComment(rawComment, reflection);
                }
                else {
                    var comment = CommentPlugin.parseComment(rawComment, reflection.comment);
                    this.applyModifiers(reflection, comment);
                    reflection.comment = comment;
                }
            };
            /**
             * Triggered when the converter has found a function implementation.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently processed.
             * @param node  The node that is currently processed if available.
             */
            CommentPlugin.prototype.onFunctionImplementation = function (context, reflection, node) {
                if (!node)
                    return;
                var comment = CommentPlugin.getComment(node);
                if (comment) {
                    reflection.comment = CommentPlugin.parseComment(comment, reflection.comment);
                }
            };
            /**
             * Triggered when the converter begins resolving a project.
             *
             * @param context  The context object describing the current state the converter is in.
             */
            CommentPlugin.prototype.onBeginResolve = function (context) {
                for (var id in this.comments) {
                    if (!this.comments.hasOwnProperty(id))
                        continue;
                    var info = this.comments[id];
                    var comment = CommentPlugin.parseComment(info.fullText);
                    CommentPlugin.removeTags(comment, 'preferred');
                    this.applyModifiers(info.reflection, comment);
                    info.reflection.comment = comment;
                }
                if (this.hidden) {
                    var project = context.project;
                    this.hidden.forEach(function (reflection) {
                        CommentPlugin.removeReflection(project, reflection);
                    });
                }
            };
            /**
             * Triggered when the converter resolves a reflection.
             *
             * Cleans up comment tags related to signatures like @param or @return
             * and moves their data to the corresponding parameter reflections.
             *
             * This hook also copies over the comment of function implementations to their
             * signatures.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently resolved.
             */
            CommentPlugin.prototype.onResolve = function (context, reflection) {
                if (!(reflection instanceof td.models.DeclarationReflection))
                    return;
                var signatures = reflection.getAllSignatures();
                if (signatures.length) {
                    var comment = reflection.comment;
                    if (comment && comment.hasTag('returns')) {
                        comment.returns = comment.getTag('returns').text;
                        CommentPlugin.removeTags(comment, 'returns');
                    }
                    signatures.forEach(function (signature) {
                        var childComment = signature.comment;
                        if (childComment && childComment.hasTag('returns')) {
                            childComment.returns = childComment.getTag('returns').text;
                            CommentPlugin.removeTags(childComment, 'returns');
                        }
                        if (comment) {
                            if (!childComment) {
                                childComment = signature.comment = new td.models.Comment();
                            }
                            childComment.shortText = childComment.shortText || comment.shortText;
                            childComment.text = childComment.text || comment.text;
                            childComment.returns = childComment.returns || comment.returns;
                        }
                        if (signature.parameters) {
                            signature.parameters.forEach(function (parameter) {
                                var tag;
                                if (childComment)
                                    tag = childComment.getTag('param', parameter.name);
                                if (comment && !tag)
                                    tag = comment.getTag('param', parameter.name);
                                if (tag) {
                                    parameter.comment = new td.models.Comment(tag.text);
                                }
                            });
                        }
                        CommentPlugin.removeTags(childComment, 'param');
                    });
                    CommentPlugin.removeTags(comment, 'param');
                }
            };
            /**
             * Return the raw comment string for the given node.
             *
             * @param node  The node whose comment should be resolved.
             * @returns     The raw comment string or NULL if no comment could be found.
             */
            CommentPlugin.getComment = function (node) {
                var sourceFile = ts.getSourceFileOfNode(node);
                var target = node;
                if (node.kind == 206 /* ModuleDeclaration */) {
                    var a, b;
                    // Ignore comments for cascaded modules, e.g. module A.B { }
                    if (node.nextContainer && node.nextContainer.kind == 206 /* ModuleDeclaration */) {
                        a = node;
                        b = node.nextContainer;
                        if (a.name.end + 1 == b.name.pos) {
                            return null;
                        }
                    }
                    // Pull back comments of cascaded modules
                    while (target.parent && target.parent.kind == 206 /* ModuleDeclaration */) {
                        a = target;
                        b = target.parent;
                        if (a.name.pos == b.name.end + 1) {
                            target = target.parent;
                        }
                        else {
                            break;
                        }
                    }
                }
                if (node.parent && node.parent.kind == 200 /* VariableDeclarationList */) {
                    target = node.parent.parent;
                }
                var comments = ts.getJsDocComments(target, sourceFile);
                if (comments && comments.length) {
                    var comment;
                    if (node.kind == 228 /* 'SourceFile' */) {
                        if (comments.length == 1)
                            return null;
                        comment = comments[0];
                    }
                    else {
                        comment = comments[comments.length - 1];
                    }
                    return sourceFile.text.substring(comment.pos, comment.end);
                }
                else {
                    return null;
                }
            };
            /**
             * Remove all tags with the given name from the given comment instance.
             *
             * @param comment  The comment that should be modified.
             * @param tagName  The name of the that that should be removed.
             */
            CommentPlugin.removeTags = function (comment, tagName) {
                if (!comment || !comment.tags)
                    return;
                var i = 0, c = comment.tags.length;
                while (i < c) {
                    if (comment.tags[i].tagName == tagName) {
                        comment.tags.splice(i, 1);
                        c--;
                    }
                    else {
                        i++;
                    }
                }
            };
            /**
             * Remove the given reflection from the project.
             */
            CommentPlugin.removeReflection = function (project, reflection) {
                reflection.traverse(function (child) { return CommentPlugin.removeReflection(project, child); });
                var parent = reflection.parent;
                parent.traverse(function (child, property) {
                    if (child == reflection) {
                        switch (property) {
                            case td.models.TraverseProperty.Children:
                                if (parent.children) {
                                    var index = parent.children.indexOf(reflection);
                                    if (index != -1)
                                        parent.children.splice(index, 1);
                                }
                                break;
                            case td.models.TraverseProperty.GetSignature:
                                delete parent.getSignature;
                                break;
                            case td.models.TraverseProperty.IndexSignature:
                                delete parent.indexSignature;
                                break;
                            case td.models.TraverseProperty.Parameters:
                                if (reflection.parent.parameters) {
                                    var index = reflection.parent.parameters.indexOf(reflection);
                                    if (index != -1)
                                        reflection.parent.parameters.splice(index, 1);
                                }
                                break;
                            case td.models.TraverseProperty.SetSignature:
                                delete parent.setSignature;
                                break;
                            case td.models.TraverseProperty.Signatures:
                                if (parent.signatures) {
                                    var index = parent.signatures.indexOf(reflection);
                                    if (index != -1)
                                        parent.signatures.splice(index, 1);
                                }
                                break;
                            case td.models.TraverseProperty.TypeLiteral:
                                parent.type = new td.models.IntrinsicType('Object');
                                break;
                            case td.models.TraverseProperty.TypeParameter:
                                if (parent.typeParameters) {
                                    var index = parent.typeParameters.indexOf(reflection);
                                    if (index != -1)
                                        parent.typeParameters.splice(index, 1);
                                }
                                break;
                        }
                    }
                });
                var id = reflection.id;
                delete project.reflections[id];
                for (var key in project.symbolMapping) {
                    if (project.symbolMapping.hasOwnProperty(key) && project.symbolMapping[key] == id) {
                        delete project.symbolMapping[key];
                    }
                }
            };
            /**
             * Parse the given doc comment string.
             *
             * @param text     The doc comment string that should be parsed.
             * @param comment  The [[Models.Comment]] instance the parsed results should be stored into.
             * @returns        A populated [[Models.Comment]] instance.
             */
            CommentPlugin.parseComment = function (text, comment) {
                if (comment === void 0) { comment = new td.models.Comment(); }
                function consumeTypeData(line) {
                    line = line.replace(/^\{[^\}]*\}+/, '');
                    line = line.replace(/^\[[^\[][^\]]*\]+/, '');
                    return line.trim();
                }
                text = text.replace(/^\s*\/\*+/, '');
                text = text.replace(/\*+\/\s*$/, '');
                var currentTag;
                var shortText = 0;
                var lines = text.split(/\r\n?|\n/);
                lines.forEach(function (line) {
                    line = line.replace(/^\s*\*? ?/, '');
                    line = line.replace(/\s*$/, '');
                    var tag = /^@(\w+)/.exec(line);
                    if (tag) {
                        var tagName = tag[1].toLowerCase();
                        line = line.substr(tagName.length + 1).trim();
                        if (tagName == 'return')
                            tagName = 'returns';
                        if (tagName == 'param' || tagName == 'typeparam') {
                            line = consumeTypeData(line);
                            var param = /[^\s]+/.exec(line);
                            if (param) {
                                var paramName = param[0];
                                line = line.substr(paramName.length + 1).trim();
                            }
                            line = consumeTypeData(line);
                            line = line.replace(/^\-\s+/, '');
                        }
                        else if (tagName == 'returns') {
                            line = consumeTypeData(line);
                        }
                        currentTag = new td.models.CommentTag(tagName, paramName, line);
                        if (!comment.tags)
                            comment.tags = [];
                        comment.tags.push(currentTag);
                    }
                    else {
                        if (currentTag) {
                            currentTag.text += '\n' + line;
                        }
                        else if (line == '' && shortText == 0) {
                        }
                        else if (line == '' && shortText == 1) {
                            shortText = 2;
                        }
                        else {
                            if (shortText == 2) {
                                comment.text += (comment.text == '' ? '' : '\n') + line;
                            }
                            else {
                                comment.shortText += (comment.shortText == '' ? '' : '\n') + line;
                                shortText = 1;
                            }
                        }
                    }
                });
                return comment;
            };
            return CommentPlugin;
        })(converter_3.ConverterPlugin);
        converter_3.CommentPlugin = CommentPlugin;
        /**
         * Register this handler.
         */
        converter_3.Converter.registerPlugin('comment', CommentPlugin);
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter_4) {
        /**
         * A plugin that detects decorators.
         */
        var DecoratorPlugin = (function (_super) {
            __extends(DecoratorPlugin, _super);
            /**
             * Create a new ImplementsPlugin instance.
             *
             * @param converter  The converter this plugin should be attached to.
             */
            function DecoratorPlugin(converter) {
                _super.call(this, converter);
                converter.on(converter_4.Converter.EVENT_BEGIN, this.onBegin, this);
                converter.on(converter_4.Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this);
                converter.on(converter_4.Converter.EVENT_RESOLVE, this.onBeginResolve, this);
            }
            /**
             * Create an object describing the arguments a decorator is set with.
             *
             * @param args  The arguments resolved from the decorator's call expression.
             * @param signature  The signature definition of the decorator being used.
             * @returns An object describing the decorator parameters,
             */
            DecoratorPlugin.prototype.extractArguments = function (args, signature) {
                var result = {};
                args.forEach(function (arg, index) {
                    if (index < signature.parameters.length) {
                        var parameter = signature.parameters[index];
                        result[parameter.name] = ts.getTextOfNode(arg);
                    }
                    else {
                        if (!result['...'])
                            result['...'] = [];
                        result['...'].push(ts.getTextOfNode(arg));
                    }
                });
                return result;
            };
            /**
             * Triggered when the converter begins converting a project.
             *
             * @param context  The context object describing the current state the converter is in.
             */
            DecoratorPlugin.prototype.onBegin = function (context) {
                this.usages = {};
            };
            /**
             * Triggered when the converter has created a declaration or signature reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently processed.
             * @param node  The node that is currently processed if available.
             */
            DecoratorPlugin.prototype.onDeclaration = function (context, reflection, node) {
                var _this = this;
                if (!node || !node.decorators)
                    return;
                node.decorators.forEach(function (decorator) {
                    var callExpression;
                    var identifier;
                    switch (decorator.expression.kind) {
                        case 65 /* Identifier */:
                            identifier = decorator.expression;
                            break;
                        case 158 /* CallExpression */:
                            callExpression = decorator.expression;
                            identifier = callExpression.expression;
                            break;
                        default:
                            return;
                    }
                    var info = {
                        name: ts.getTextOfNode(identifier)
                    };
                    var type = context.checker.getTypeAtLocation(identifier);
                    if (type && type.symbol) {
                        var symbolID = context.getSymbolID(type.symbol);
                        info.type = new td.models.ReferenceType(info.name, symbolID);
                        if (callExpression && callExpression.arguments) {
                            var signature = context.checker.getResolvedSignature(callExpression);
                            if (signature) {
                                info.arguments = _this.extractArguments(callExpression.arguments, signature);
                            }
                        }
                        if (!_this.usages[symbolID])
                            _this.usages[symbolID] = [];
                        _this.usages[symbolID].push(new td.models.ReferenceType(reflection.name, td.models.ReferenceType.SYMBOL_ID_RESOLVED, reflection));
                    }
                    if (!reflection.decorators)
                        reflection.decorators = [];
                    reflection.decorators.push(info);
                });
            };
            /**
             * Triggered when the converter resolves a reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently resolved.
             */
            DecoratorPlugin.prototype.onBeginResolve = function (context) {
                for (var symbolID in this.usages) {
                    if (!this.usages.hasOwnProperty(symbolID))
                        continue;
                    var id = context.project.symbolMapping[symbolID];
                    if (!id)
                        continue;
                    var reflection = context.project.reflections[id];
                    if (reflection) {
                        reflection.decorates = this.usages[symbolID];
                    }
                }
            };
            return DecoratorPlugin;
        })(converter_4.ConverterPlugin);
        converter_4.DecoratorPlugin = DecoratorPlugin;
        /**
         * Register this handler.
         */
        converter_4.Converter.registerPlugin('decorator', DecoratorPlugin);
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter_5) {
        /**
         * A handler that moves comments with dot syntax to their target.
         */
        var DeepCommentPlugin = (function (_super) {
            __extends(DeepCommentPlugin, _super);
            /**
             * Create a new CommentHandler instance.
             *
             * @param converter  The converter this plugin should be attached to.
             */
            function DeepCommentPlugin(converter) {
                _super.call(this, converter);
                converter.on(converter_5.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this, 512);
            }
            /**
             * Triggered when the converter begins resolving a project.
             *
             * @param context  The context object describing the current state the converter is in.
             */
            DeepCommentPlugin.prototype.onBeginResolve = function (context) {
                var project = context.project;
                var name;
                for (var key in project.reflections) {
                    var reflection = project.reflections[key];
                    if (!reflection.comment) {
                        findDeepComment(reflection);
                    }
                }
                function push(parent) {
                    var part = parent.originalName;
                    if (!part || part.substr(0, 2) == '__' || parent instanceof td.models.SignatureReflection) {
                        part = '';
                    }
                    if (part && part != '') {
                        name = (name == '' ? part : part + '.' + name);
                    }
                }
                function findDeepComment(reflection) {
                    name = '';
                    push(reflection);
                    var target = reflection.parent;
                    while (target && !(target instanceof td.models.ProjectReflection)) {
                        push(target);
                        if (target.comment) {
                            var tag;
                            if (reflection instanceof td.models.TypeParameterReflection) {
                                tag = target.comment.getTag('typeparam', reflection.name);
                                if (!tag)
                                    tag = target.comment.getTag('param', '<' + reflection.name + '>');
                            }
                            if (!tag)
                                tag = target.comment.getTag('param', name);
                            if (tag) {
                                target.comment.tags.splice(target.comment.tags.indexOf(tag), 1);
                                reflection.comment = new td.models.Comment('', tag.text);
                                break;
                            }
                        }
                        target = target.parent;
                    }
                }
            };
            return DeepCommentPlugin;
        })(converter_5.ConverterPlugin);
        converter_5.DeepCommentPlugin = DeepCommentPlugin;
        /**
         * Register this handler.
         */
        converter_5.Converter.registerPlugin('deepComment', DeepCommentPlugin);
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter_6) {
        /**
         * A handler that truncates the names of dynamic modules to not include the
         * project's base path.
         */
        var DynamicModulePlugin = (function (_super) {
            __extends(DynamicModulePlugin, _super);
            /**
             * Create a new DynamicModuleHandler instance.
             *
             * @param converter  The converter this plugin should be attached to.
             */
            function DynamicModulePlugin(converter) {
                _super.call(this, converter);
                /**
                 * Helper class for determining the base path.
                 */
                this.basePath = new converter_6.BasePath();
                converter.on(converter_6.Converter.EVENT_BEGIN, this.onBegin, this);
                converter.on(converter_6.Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this);
                converter.on(converter_6.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this);
            }
            /**
             * Triggered when the converter begins converting a project.
             *
             * @param context  The context object describing the current state the converter is in.
             */
            DynamicModulePlugin.prototype.onBegin = function (context) {
                this.basePath.reset();
                this.reflections = [];
            };
            /**
             * Triggered when the converter has created a declaration reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently processed.
             * @param node  The node that is currently processed if available.
             */
            DynamicModulePlugin.prototype.onDeclaration = function (context, reflection, node) {
                if (reflection.kindOf(td.models.ReflectionKind.ExternalModule)) {
                    var name = reflection.name;
                    if (name.indexOf('/') == -1) {
                        return;
                    }
                    name = name.replace(/"/g, '');
                    this.reflections.push(reflection);
                    this.basePath.add(name);
                }
            };
            /**
             * Triggered when the converter begins resolving a project.
             *
             * @param context  The context object describing the current state the converter is in.
             */
            DynamicModulePlugin.prototype.onBeginResolve = function (context) {
                var _this = this;
                this.reflections.forEach(function (reflection) {
                    var name = reflection.name.replace(/"/g, '');
                    name = name.substr(0, name.length - td.Path.extname(name).length);
                    reflection.name = '"' + _this.basePath.trim(name) + '"';
                });
            };
            return DynamicModulePlugin;
        })(converter_6.ConverterPlugin);
        converter_6.DynamicModulePlugin = DynamicModulePlugin;
        /**
         * Register this handler.
         */
        converter_6.Converter.registerPlugin('dynamicModule', DynamicModulePlugin);
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter_7) {
        /**
         * Stores data of a repository.
         */
        var Repository = (function () {
            /**
             * Create a new Repository instance.
             *
             * @param path  The root path of the repository.
             */
            function Repository(path) {
                var _this = this;
                /**
                 * The name of the branch this repository is on right now.
                 */
                this.branch = 'master';
                /**
                 * A list of all files tracked by the repository.
                 */
                this.files = [];
                this.path = path;
                td.ShellJS.pushd(path);
                var out = td.ShellJS.exec('git ls-remote --get-url', { silent: true });
                if (out.code == 0) {
                    var url, remotes = out.output.split('\n');
                    for (var i = 0, c = remotes.length; i < c; i++) {
                        url = /github\.com[:\/]([^\/]+)\/(.*)/.exec(remotes[i]);
                        if (url) {
                            this.gitHubUser = url[1];
                            this.gitHubProject = url[2];
                            if (this.gitHubProject.substr(-4) == '.git') {
                                this.gitHubProject = this.gitHubProject.substr(0, this.gitHubProject.length - 4);
                            }
                            break;
                        }
                    }
                }
                out = td.ShellJS.exec('git ls-files', { silent: true });
                if (out.code == 0) {
                    out.output.split('\n').forEach(function (file) {
                        if (file != '') {
                            _this.files.push(converter_7.BasePath.normalize(path + '/' + file));
                        }
                    });
                }
                out = td.ShellJS.exec('git rev-parse --abbrev-ref HEAD', { silent: true });
                if (out.code == 0) {
                    this.branch = out.output.replace('\n', '');
                }
                td.ShellJS.popd();
            }
            /**
             * Check whether the given file is tracked by this repository.
             *
             * @param fileName  The name of the file to test for.
             * @returns TRUE when the file is part of the repository, otherwise FALSE.
             */
            Repository.prototype.contains = function (fileName) {
                return this.files.indexOf(fileName) != -1;
            };
            /**
             * Get the URL of the given file on GitHub.
             *
             * @param fileName  The file whose GitHub URL should be determined.
             * @returns An url pointing to the web preview of the given file or NULL.
             */
            Repository.prototype.getGitHubURL = function (fileName) {
                if (!this.gitHubUser || !this.gitHubProject || !this.contains(fileName)) {
                    return null;
                }
                return [
                    'https://github.com',
                    this.gitHubUser,
                    this.gitHubProject,
                    'blob',
                    this.branch,
                    fileName.substr(this.path.length + 1)
                ].join('/');
            };
            /**
             * Try to create a new repository instance.
             *
             * Checks whether the given path is the root of a valid repository and if so
             * creates a new instance of [[Repository]].
             *
             * @param path  The potential repository root.
             * @returns A new instance of [[Repository]] or NULL.
             */
            Repository.tryCreateRepository = function (path) {
                var out, repository = null;
                td.ShellJS.pushd(path);
                out = td.ShellJS.exec('git rev-parse --show-toplevel', { silent: true });
                td.ShellJS.popd();
                if (out.code != 0)
                    return null;
                return new Repository(converter_7.BasePath.normalize(out.output.replace("\n", '')));
            };
            return Repository;
        })();
        /**
         * A handler that watches for repositories with GitHub origin and links
         * their source files to the related GitHub pages.
         */
        var GitHubPlugin = (function (_super) {
            __extends(GitHubPlugin, _super);
            /**
             * Create a new GitHubHandler instance.
             *
             * @param converter  The converter this plugin should be attached to.
             */
            function GitHubPlugin(converter) {
                _super.call(this, converter);
                /**
                 * List of known repositories.
                 */
                this.repositories = {};
                /**
                 * List of paths known to be not under git control.
                 */
                this.ignoredPaths = [];
                td.ShellJS.config.silent = true;
                if (td.ShellJS.which('git')) {
                    converter.on(converter_7.Converter.EVENT_RESOLVE_END, this.onEndResolve, this);
                }
            }
            /**
             * Check whether the given file is placed inside a repository.
             *
             * @param fileName  The name of the file a repository should be looked for.
             * @returns The found repository info or NULL.
             */
            GitHubPlugin.prototype.getRepository = function (fileName) {
                // Check for known non-repositories
                var dirName = td.Path.dirname(fileName);
                for (var i = 0, c = this.ignoredPaths.length; i < c; i++) {
                    if (this.ignoredPaths[i] == dirName) {
                        return null;
                    }
                }
                // Check for known repositories
                for (var path in this.repositories) {
                    if (!this.repositories.hasOwnProperty(path))
                        continue;
                    if (fileName.substr(0, path.length) == path) {
                        return this.repositories[path];
                    }
                }
                // Try to create a new repository
                var repository = Repository.tryCreateRepository(dirName);
                if (repository) {
                    this.repositories[repository.path] = repository;
                    return repository;
                }
                // No repository found, add path to ignored paths
                var segments = dirName.split('/');
                for (var i = segments.length; i > 0; i--) {
                    this.ignoredPaths.push(segments.slice(0, i).join('/'));
                }
                return null;
            };
            /**
             * Triggered when the converter has finished resolving a project.
             *
             * @param context  The context object describing the current state the converter is in.
             */
            GitHubPlugin.prototype.onEndResolve = function (context) {
                var _this = this;
                var project = context.project;
                project.files.forEach(function (sourceFile) {
                    var repository = _this.getRepository(sourceFile.fullFileName);
                    if (repository) {
                        sourceFile.url = repository.getGitHubURL(sourceFile.fullFileName);
                    }
                });
                for (var key in project.reflections) {
                    var reflection = project.reflections[key];
                    if (reflection.sources)
                        reflection.sources.forEach(function (source) {
                            if (source.file && source.file.url) {
                                source.url = source.file.url + '#L' + source.line;
                            }
                        });
                }
            };
            return GitHubPlugin;
        })(converter_7.ConverterPlugin);
        converter_7.GitHubPlugin = GitHubPlugin;
        /**
         * Register this handler.
         */
        converter_7.Converter.registerPlugin('gitHub', GitHubPlugin);
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter_8) {
        /**
         * A handler that sorts and groups the found reflections in the resolving phase.
         *
         * The handler sets the ´groups´ property of all reflections.
         */
        var GroupPlugin = (function (_super) {
            __extends(GroupPlugin, _super);
            /**
             * Create a new GroupPlugin instance.
             *
             * @param converter  The converter this plugin should be attached to.
             */
            function GroupPlugin(converter) {
                _super.call(this, converter);
                converter.on(converter_8.Converter.EVENT_RESOLVE, this.onResolve, this);
                converter.on(converter_8.Converter.EVENT_RESOLVE_END, this.onEndResolve, this);
            }
            /**
             * Triggered when the converter resolves a reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently resolved.
             */
            GroupPlugin.prototype.onResolve = function (context, reflection) {
                var reflection = reflection;
                reflection.kindString = GroupPlugin.getKindSingular(reflection.kind);
                if (reflection instanceof td.models.ContainerReflection) {
                    var container = reflection;
                    if (container.children && container.children.length > 0) {
                        container.children.sort(GroupPlugin.sortCallback);
                        container.groups = GroupPlugin.getReflectionGroups(container.children);
                    }
                }
            };
            /**
             * Triggered when the converter has finished resolving a project.
             *
             * @param context  The context object describing the current state the converter is in.
             */
            GroupPlugin.prototype.onEndResolve = function (context) {
                function walkDirectory(directory) {
                    directory.groups = GroupPlugin.getReflectionGroups(directory.getAllReflections());
                    for (var key in directory.directories) {
                        if (!directory.directories.hasOwnProperty(key))
                            continue;
                        walkDirectory(directory.directories[key]);
                    }
                }
                var project = context.project;
                if (project.children && project.children.length > 0) {
                    project.children.sort(GroupPlugin.sortCallback);
                    project.groups = GroupPlugin.getReflectionGroups(project.children);
                }
                walkDirectory(project.directory);
                project.files.forEach(function (file) {
                    file.groups = GroupPlugin.getReflectionGroups(file.reflections);
                });
            };
            /**
             * Create a grouped representation of the given list of reflections.
             *
             * Reflections are grouped by kind and sorted by weight and name.
             *
             * @param reflections  The reflections that should be grouped.
             * @returns An array containing all children of the given reflection grouped by their kind.
             */
            GroupPlugin.getReflectionGroups = function (reflections) {
                var groups = [];
                reflections.forEach(function (child) {
                    for (var i = 0; i < groups.length; i++) {
                        var group = groups[i];
                        if (group.kind != child.kind) {
                            continue;
                        }
                        group.children.push(child);
                        return;
                    }
                    var group = new td.models.ReflectionGroup(GroupPlugin.getKindPlural(child.kind), child.kind);
                    group.children.push(child);
                    groups.push(group);
                });
                groups.forEach(function (group) {
                    var someExported = false, allInherited = true, allPrivate = true, allProtected = true, allExternal = true;
                    group.children.forEach(function (child) {
                        someExported = child.flags.isExported || someExported;
                        allPrivate = child.flags.isPrivate && allPrivate;
                        allProtected = (child.flags.isPrivate || child.flags.isProtected) && allProtected;
                        allExternal = child.flags.isExternal && allExternal;
                        allInherited = child.inheritedFrom && allInherited;
                    });
                    group.someChildrenAreExported = someExported;
                    group.allChildrenAreInherited = allInherited;
                    group.allChildrenArePrivate = allPrivate;
                    group.allChildrenAreProtectedOrPrivate = allProtected;
                    group.allChildrenAreExternal = allExternal;
                });
                return groups;
            };
            /**
             * Transform the internal typescript kind identifier into a human readable version.
             *
             * @param kind  The original typescript kind identifier.
             * @returns A human readable version of the given typescript kind identifier.
             */
            GroupPlugin.getKindString = function (kind) {
                var str = td.models.ReflectionKind[kind];
                str = str.replace(/(.)([A-Z])/g, function (m, a, b) { return a + ' ' + b.toLowerCase(); });
                return str;
            };
            /**
             * Return the singular name of a internal typescript kind identifier.
             *
             * @param kind The original internal typescript kind identifier.
             * @returns The singular name of the given internal typescript kind identifier
             */
            GroupPlugin.getKindSingular = function (kind) {
                if (GroupPlugin.SINGULARS[kind]) {
                    return GroupPlugin.SINGULARS[kind];
                }
                else {
                    return GroupPlugin.getKindString(kind);
                }
            };
            /**
             * Return the plural name of a internal typescript kind identifier.
             *
             * @param kind The original internal typescript kind identifier.
             * @returns The plural name of the given internal typescript kind identifier
             */
            GroupPlugin.getKindPlural = function (kind) {
                if (GroupPlugin.PLURALS[kind]) {
                    return GroupPlugin.PLURALS[kind];
                }
                else {
                    return this.getKindString(kind) + 's';
                }
            };
            /**
             * Callback used to sort reflections by weight defined by ´GroupPlugin.WEIGHTS´ and name.
             *
             * @param a The left reflection to sort.
             * @param b The right reflection to sort.
             * @returns The sorting weight.
             */
            GroupPlugin.sortCallback = function (a, b) {
                var aWeight = GroupPlugin.WEIGHTS.indexOf(a.kind);
                var bWeight = GroupPlugin.WEIGHTS.indexOf(b.kind);
                if (aWeight == bWeight) {
                    if (a.flags.isStatic && !b.flags.isStatic)
                        return 1;
                    if (!a.flags.isStatic && b.flags.isStatic)
                        return -1;
                    if (a.name == b.name)
                        return 0;
                    return a.name > b.name ? 1 : -1;
                }
                else
                    return aWeight - bWeight;
            };
            /**
             * Define the sort order of reflections.
             */
            GroupPlugin.WEIGHTS = [
                td.models.ReflectionKind.Global,
                td.models.ReflectionKind.ExternalModule,
                td.models.ReflectionKind.Module,
                td.models.ReflectionKind.Enum,
                td.models.ReflectionKind.EnumMember,
                td.models.ReflectionKind.Class,
                td.models.ReflectionKind.Interface,
                td.models.ReflectionKind.TypeAlias,
                td.models.ReflectionKind.Constructor,
                td.models.ReflectionKind.Event,
                td.models.ReflectionKind.Property,
                td.models.ReflectionKind.Variable,
                td.models.ReflectionKind.Function,
                td.models.ReflectionKind.Accessor,
                td.models.ReflectionKind.Method,
                td.models.ReflectionKind.ObjectLiteral,
                td.models.ReflectionKind.Parameter,
                td.models.ReflectionKind.TypeParameter,
                td.models.ReflectionKind.TypeLiteral,
                td.models.ReflectionKind.CallSignature,
                td.models.ReflectionKind.ConstructorSignature,
                td.models.ReflectionKind.IndexSignature,
                td.models.ReflectionKind.GetSignature,
                td.models.ReflectionKind.SetSignature,
            ];
            /**
             * Define the singular name of individual reflection kinds.
             */
            GroupPlugin.SINGULARS = (function () {
                var singulars = {};
                singulars[td.models.ReflectionKind.Enum] = 'Enumeration';
                singulars[td.models.ReflectionKind.EnumMember] = 'Enumeration member';
                return singulars;
            })();
            /**
             * Define the plural name of individual reflection kinds.
             */
            GroupPlugin.PLURALS = (function () {
                var plurals = {};
                plurals[td.models.ReflectionKind.Class] = 'Classes';
                plurals[td.models.ReflectionKind.Property] = 'Properties';
                plurals[td.models.ReflectionKind.Enum] = 'Enumerations';
                plurals[td.models.ReflectionKind.EnumMember] = 'Enumeration members';
                plurals[td.models.ReflectionKind.TypeAlias] = 'Type aliases';
                return plurals;
            })();
            return GroupPlugin;
        })(converter_8.ConverterPlugin);
        converter_8.GroupPlugin = GroupPlugin;
        /**
         * Register this handler.
         */
        converter_8.Converter.registerPlugin('group', GroupPlugin);
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter_9) {
        /**
         * A plugin that detects interface implementations of functions and
         * properties on classes and links them.
         */
        var ImplementsPlugin = (function (_super) {
            __extends(ImplementsPlugin, _super);
            /**
             * Create a new ImplementsPlugin instance.
             *
             * @param converter  The converter this plugin should be attached to.
             */
            function ImplementsPlugin(converter) {
                _super.call(this, converter);
                converter.on(converter_9.Converter.EVENT_RESOLVE, this.onResolve, this, -10);
            }
            /**
             * Mark all members of the given class to be the implementation of the matching interface member.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param classReflection  The reflection of the classReflection class.
             * @param interfaceReflection  The reflection of the interfaceReflection interface.
             */
            ImplementsPlugin.prototype.analyzeClass = function (context, classReflection, interfaceReflection) {
                var _this = this;
                interfaceReflection.children.forEach(function (interfaceMember) {
                    if (!(interfaceMember instanceof td.models.DeclarationReflection)) {
                        return;
                    }
                    var classMember;
                    for (var index = 0, count = classReflection.children.length; index < count; index++) {
                        var child = classReflection.children[index];
                        if (child.name != interfaceMember.name)
                            continue;
                        if (child.flags.isStatic != interfaceMember.flags.isStatic)
                            continue;
                        classMember = child;
                        break;
                    }
                    if (!classMember) {
                        return;
                    }
                    var interfaceMemberName = interfaceReflection.name + '.' + interfaceMember.name;
                    classMember.implementationOf = new td.models.ReferenceType(interfaceMemberName, td.models.ReferenceType.SYMBOL_ID_RESOLVED, interfaceMember);
                    _this.copyComment(classMember, interfaceMember);
                    if (interfaceMember.kindOf(td.models.ReflectionKind.FunctionOrMethod) && interfaceMember.signatures && classMember.signatures) {
                        interfaceMember.signatures.forEach(function (interfaceSignature) {
                            var interfaceParameters = interfaceSignature.getParameterTypes();
                            classMember.signatures.forEach(function (classSignature) {
                                if (td.models.Type.isTypeListEqual(interfaceParameters, classSignature.getParameterTypes())) {
                                    classSignature.implementationOf = new td.models.ReferenceType(interfaceMemberName, td.models.ReferenceType.SYMBOL_ID_RESOLVED, interfaceSignature);
                                    _this.copyComment(classSignature, interfaceSignature);
                                }
                            });
                        });
                    }
                });
            };
            /**
             * Copy the comment of the source reflection to the target reflection.
             *
             * @param target
             * @param source
             */
            ImplementsPlugin.prototype.copyComment = function (target, source) {
                if (target.comment && source.comment && target.comment.hasTag('inheritdoc')) {
                    target.comment.copyFrom(source.comment);
                    if (target instanceof td.models.SignatureReflection && target.parameters &&
                        source instanceof td.models.SignatureReflection && source.parameters) {
                        for (var index = 0, count = target.parameters.length; index < count; index++) {
                            target.parameters[index].comment.copyFrom(source.parameters[index].comment);
                        }
                    }
                }
            };
            /**
             * Triggered when the converter resolves a reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently resolved.
             */
            ImplementsPlugin.prototype.onResolve = function (context, reflection) {
                var _this = this;
                if (reflection.kindOf(td.models.ReflectionKind.Class) && reflection.implementedTypes) {
                    reflection.implementedTypes.forEach(function (type) {
                        if (!(type instanceof td.models.ReferenceType)) {
                            return;
                        }
                        var source = type.reflection;
                        if (source && source.kindOf(td.models.ReflectionKind.Interface)) {
                            _this.analyzeClass(context, reflection, source);
                        }
                    });
                }
            };
            return ImplementsPlugin;
        })(converter_9.ConverterPlugin);
        converter_9.ImplementsPlugin = ImplementsPlugin;
        /**
         * Register this handler.
         */
        converter_9.Converter.registerPlugin('implements', ImplementsPlugin);
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter_10) {
        /**
         * A handler that tries to find the package.json and readme.md files of the
         * current project.
         *
         * The handler traverses the file tree upwards for each file processed by the processor
         * and records the nearest package info files it can find. Within the resolve files, the
         * contents of the found files will be read and appended to the ProjectReflection.
         */
        var PackagePlugin = (function (_super) {
            __extends(PackagePlugin, _super);
            /**
             * Create a new PackageHandler instance.
             *
             * @param converter  The converter this plugin should be attached to.
             */
            function PackagePlugin(converter) {
                _super.call(this, converter);
                converter.on(converter_10.Converter.EVENT_BEGIN, this.onBegin, this);
                converter.on(converter_10.Converter.EVENT_FILE_BEGIN, this.onBeginDocument, this);
                converter.on(converter_10.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this);
            }
            PackagePlugin.prototype.getParameters = function () {
                return [{
                        name: 'readme',
                        help: 'Path to the readme file that should be displayed on the index page. Pass `none` to disable the index page and start the documentation on the globals page.'
                    }];
            };
            /**
             * Triggered when the converter begins converting a project.
             *
             * @param context  The context object describing the current state the converter is in.
             */
            PackagePlugin.prototype.onBegin = function (context) {
                this.readmeFile = null;
                this.packageFile = null;
                this.visited = [];
                var readme = context.getOptions().readme;
                this.noReadmeFile = (readme == 'none');
                if (!this.noReadmeFile && readme) {
                    readme = td.Path.resolve(readme);
                    if (td.FS.existsSync(readme)) {
                        this.readmeFile = readme;
                    }
                }
            };
            /**
             * Triggered when the converter begins converting a source file.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently processed.
             * @param node  The node that is currently processed if available.
             */
            PackagePlugin.prototype.onBeginDocument = function (context, reflection, node) {
                var _this = this;
                if (!node)
                    return;
                if (this.readmeFile && this.packageFile) {
                    return;
                }
                var fileName = node.fileName;
                var dirName, parentDir = td.Path.resolve(td.Path.dirname(fileName));
                do {
                    dirName = parentDir;
                    if (this.visited.indexOf(dirName) != -1) {
                        break;
                    }
                    td.FS.readdirSync(dirName).forEach(function (file) {
                        var lfile = file.toLowerCase();
                        if (!_this.noReadmeFile && !_this.readmeFile && lfile == 'readme.md') {
                            _this.readmeFile = td.Path.join(dirName, file);
                        }
                        if (!_this.packageFile && lfile == 'package.json') {
                            _this.packageFile = td.Path.join(dirName, file);
                        }
                    });
                    this.visited.push(dirName);
                    parentDir = td.Path.resolve(td.Path.join(dirName, '..'));
                } while (dirName != parentDir);
            };
            /**
             * Triggered when the converter begins resolving a project.
             *
             * @param context  The context object describing the current state the converter is in.
             */
            PackagePlugin.prototype.onBeginResolve = function (context) {
                var project = context.project;
                if (this.readmeFile) {
                    project.readme = td.FS.readFileSync(this.readmeFile, 'utf-8');
                }
                if (this.packageFile) {
                    project.packageInfo = JSON.parse(td.FS.readFileSync(this.packageFile, 'utf-8'));
                    if (!project.name) {
                        project.name = project.packageInfo.name;
                    }
                }
            };
            return PackagePlugin;
        })(converter_10.ConverterPlugin);
        converter_10.PackagePlugin = PackagePlugin;
        /**
         * Register this handler.
         */
        converter_10.Converter.registerPlugin('package', PackagePlugin);
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter_11) {
        /**
         * A handler that attaches source file information to reflections.
         */
        var SourcePlugin = (function (_super) {
            __extends(SourcePlugin, _super);
            /**
             * Create a new SourceHandler instance.
             *
             * @param converter  The converter this plugin should be attached to.
             */
            function SourcePlugin(converter) {
                _super.call(this, converter);
                /**
                 * Helper for resolving the base path of all source files.
                 */
                this.basePath = new converter_11.BasePath();
                /**
                 * A map of all generated [[SourceFile]] instances.
                 */
                this.fileMappings = {};
                converter.on(converter_11.Converter.EVENT_BEGIN, this.onBegin, this);
                converter.on(converter_11.Converter.EVENT_FILE_BEGIN, this.onBeginDocument, this);
                converter.on(converter_11.Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this);
                converter.on(converter_11.Converter.EVENT_CREATE_SIGNATURE, this.onDeclaration, this);
                converter.on(converter_11.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this);
                converter.on(converter_11.Converter.EVENT_RESOLVE, this.onResolve, this);
                converter.on(converter_11.Converter.EVENT_RESOLVE_END, this.onEndResolve, this);
            }
            SourcePlugin.prototype.getSourceFile = function (fileName, project) {
                if (!this.fileMappings[fileName]) {
                    var file = new td.models.SourceFile(fileName);
                    this.fileMappings[fileName] = file;
                    project.files.push(file);
                }
                return this.fileMappings[fileName];
            };
            /**
             * Triggered once per project before the dispatcher invokes the compiler.
             *
             * @param event  An event object containing the related project and compiler instance.
             */
            SourcePlugin.prototype.onBegin = function () {
                this.basePath.reset();
                this.fileMappings = {};
            };
            /**
             * Triggered when the converter begins converting a source file.
             *
             * Create a new [[SourceFile]] instance for all TypeScript files.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently processed.
             * @param node  The node that is currently processed if available.
             */
            SourcePlugin.prototype.onBeginDocument = function (context, reflection, node) {
                if (!node)
                    return;
                var fileName = node.fileName;
                this.basePath.add(fileName);
                this.getSourceFile(fileName, context.project);
            };
            /**
             * Triggered when the converter has created a declaration reflection.
             *
             * Attach the current source file to the [[DeclarationReflection.sources]] array.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently processed.
             * @param node  The node that is currently processed if available.
             */
            SourcePlugin.prototype.onDeclaration = function (context, reflection, node) {
                if (!node)
                    return;
                var sourceFile = ts.getSourceFileOfNode(node);
                var fileName = sourceFile.fileName;
                var file = this.getSourceFile(fileName, context.project);
                var position;
                if (node['name'] && node['name'].end) {
                    position = ts.getLineAndCharacterOfPosition(sourceFile, node['name'].end);
                }
                else {
                    position = ts.getLineAndCharacterOfPosition(sourceFile, node.pos);
                }
                if (!reflection.sources)
                    reflection.sources = [];
                if (reflection instanceof td.models.DeclarationReflection) {
                    file.reflections.push(reflection);
                }
                reflection.sources.push({
                    file: file,
                    fileName: fileName,
                    line: position.line + 1,
                    character: position.character
                });
            };
            /**
             * Triggered when the converter begins resolving a project.
             *
             * @param context  The context object describing the current state the converter is in.
             */
            SourcePlugin.prototype.onBeginResolve = function (context) {
                var _this = this;
                context.project.files.forEach(function (file) {
                    var fileName = file.fileName = _this.basePath.trim(file.fileName);
                    _this.fileMappings[fileName] = file;
                });
            };
            /**
             * Triggered when the converter resolves a reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently resolved.
             */
            SourcePlugin.prototype.onResolve = function (context, reflection) {
                var _this = this;
                if (!reflection.sources)
                    return;
                reflection.sources.forEach(function (source) {
                    source.fileName = _this.basePath.trim(source.fileName);
                });
            };
            /**
             * Triggered when the converter has finished resolving a project.
             *
             * @param context  The context object describing the current state the converter is in.
             */
            SourcePlugin.prototype.onEndResolve = function (context) {
                var project = context.project;
                var home = project.directory;
                project.files.forEach(function (file) {
                    var reflections = [];
                    file.reflections.forEach(function (reflection) {
                        reflections.push(reflection);
                    });
                    var directory = home;
                    var path = td.Path.dirname(file.fileName);
                    if (path != '.') {
                        path.split('/').forEach(function (path) {
                            if (!directory.directories[path]) {
                                directory.directories[path] = new td.models.SourceDirectory(path, directory);
                            }
                            directory = directory.directories[path];
                        });
                    }
                    directory.files.push(file);
                    // reflections.sort(GroupHandler.sortCallback);
                    file.parent = directory;
                    file.reflections = reflections;
                });
            };
            return SourcePlugin;
        })(converter_11.ConverterPlugin);
        converter_11.SourcePlugin = SourcePlugin;
        /**
         * Register this handler.
         */
        converter_11.Converter.registerPlugin('source', SourcePlugin);
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var converter;
    (function (converter_12) {
        /**
         * A handler that converts all instances of [[LateResolvingType]] to their renderable equivalents.
         */
        var TypePlugin = (function (_super) {
            __extends(TypePlugin, _super);
            /**
             * Create a new TypeHandler instance.
             *
             * @param converter  The converter this plugin should be attached to.
             */
            function TypePlugin(converter) {
                _super.call(this, converter);
                this.reflections = [];
                converter.on(converter_12.Converter.EVENT_RESOLVE, this.onResolve, this);
                converter.on(converter_12.Converter.EVENT_RESOLVE_END, this.onResolveEnd, this);
            }
            /**
             * Triggered when the converter resolves a reflection.
             *
             * @param context  The context object describing the current state the converter is in.
             * @param reflection  The reflection that is currently resolved.
             */
            TypePlugin.prototype.onResolve = function (context, reflection) {
                var _this = this;
                var project = context.project;
                resolveType(reflection, reflection.type);
                resolveType(reflection, reflection.inheritedFrom);
                resolveType(reflection, reflection.overwrites);
                resolveTypes(reflection, reflection.extendedTypes);
                resolveTypes(reflection, reflection.extendedBy);
                resolveTypes(reflection, reflection.implementedTypes);
                if (reflection.decorators)
                    reflection.decorators.forEach(function (decorator) {
                        if (decorator.type) {
                            resolveType(reflection, decorator.type);
                        }
                    });
                if (reflection.kindOf(td.models.ReflectionKind.ClassOrInterface)) {
                    this.postpone(reflection);
                    walk(reflection.implementedTypes, function (target) {
                        _this.postpone(target);
                        if (!target.implementedBy)
                            target.implementedBy = [];
                        target.implementedBy.push(new td.models.ReferenceType(reflection.name, td.models.ReferenceType.SYMBOL_ID_RESOLVED, reflection));
                    });
                    walk(reflection.extendedTypes, function (target) {
                        _this.postpone(target);
                        if (!target.extendedBy)
                            target.extendedBy = [];
                        target.extendedBy.push(new td.models.ReferenceType(reflection.name, td.models.ReferenceType.SYMBOL_ID_RESOLVED, reflection));
                    });
                }
                function walk(types, callback) {
                    if (!types)
                        return;
                    types.forEach(function (type) {
                        if (!(type instanceof td.models.ReferenceType))
                            return;
                        if (!type.reflection || !(type.reflection instanceof td.models.DeclarationReflection))
                            return;
                        callback(type.reflection);
                    });
                }
                function resolveTypes(reflection, types) {
                    if (!types)
                        return;
                    for (var i = 0, c = types.length; i < c; i++) {
                        resolveType(reflection, types[i]);
                    }
                }
                function resolveType(reflection, type) {
                    if (type instanceof td.models.ReferenceType) {
                        var referenceType = type;
                        if (referenceType.symbolID == td.models.ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME) {
                            referenceType.reflection = reflection.findReflectionByName(referenceType.name);
                        }
                        else if (!referenceType.reflection && referenceType.symbolID != td.models.ReferenceType.SYMBOL_ID_RESOLVED) {
                            referenceType.reflection = project.reflections[project.symbolMapping[referenceType.symbolID]];
                        }
                        if (referenceType.typeArguments) {
                            referenceType.typeArguments.forEach(function (typeArgument) {
                                resolveType(reflection, typeArgument);
                            });
                        }
                    }
                    else if (type instanceof td.models.TupleType) {
                        var tupleType = type;
                        for (var index = 0, count = tupleType.elements.length; index < count; index++) {
                            resolveType(reflection, tupleType.elements[index]);
                        }
                    }
                    else if (type instanceof td.models.UnionType) {
                        var unionType = type;
                        for (var index = 0, count = unionType.types.length; index < count; index++) {
                            resolveType(reflection, unionType.types[index]);
                        }
                    }
                }
            };
            TypePlugin.prototype.postpone = function (reflection) {
                if (this.reflections.indexOf(reflection) == -1) {
                    this.reflections.push(reflection);
                }
            };
            /**
             * Triggered when the converter has finished resolving a project.
             *
             * @param context  The context object describing the current state the converter is in.
             */
            TypePlugin.prototype.onResolveEnd = function (context) {
                this.reflections.forEach(function (reflection) {
                    if (reflection.implementedBy) {
                        reflection.implementedBy.sort(function (a, b) {
                            if (a['name'] == b['name'])
                                return 0;
                            return a['name'] > b['name'] ? 1 : -1;
                        });
                    }
                    var root;
                    var hierarchy;
                    function push(types) {
                        var level = { types: types };
                        if (hierarchy) {
                            hierarchy.next = level;
                            hierarchy = level;
                        }
                        else {
                            root = hierarchy = level;
                        }
                    }
                    if (reflection.extendedTypes) {
                        push(reflection.extendedTypes);
                    }
                    push([new td.models.ReferenceType(reflection.name, td.models.ReferenceType.SYMBOL_ID_RESOLVED, reflection)]);
                    hierarchy.isTarget = true;
                    if (reflection.extendedBy) {
                        push(reflection.extendedBy);
                    }
                    reflection.typeHierarchy = root;
                });
            };
            return TypePlugin;
        })(converter_12.ConverterPlugin);
        converter_12.TypePlugin = TypePlugin;
        /**
         * Register this handler.
         */
        converter_12.Converter.registerPlugin('type', TypePlugin);
    })(converter = td.converter || (td.converter = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * A model that represents a javadoc comment.
         *
         * Instances of this model are created by the [[CommentHandler]]. You can retrieve comments
         * through the [[BaseReflection.comment]] property.
         */
        var Comment = (function () {
            /**
             * Creates a new Comment instance.
             */
            function Comment(shortText, text) {
                this.shortText = shortText || '';
                this.text = text || '';
            }
            /**
             * Has this comment a visible component?
             *
             * @returns TRUE when this comment has a visible component.
             */
            Comment.prototype.hasVisibleComponent = function () {
                return (!!this.shortText || !!this.text || !!this.tags);
            };
            /**
             * Test whether this comment contains a tag with the given name.
             *
             * @param tagName  The name of the tag to look for.
             * @returns TRUE when this comment contains a tag with the given name, otherwise FALSE.
             */
            Comment.prototype.hasTag = function (tagName) {
                if (!this.tags)
                    return false;
                for (var i = 0, c = this.tags.length; i < c; i++) {
                    if (this.tags[i].tagName == tagName) {
                        return true;
                    }
                }
                return false;
            };
            /**
             * Return the first tag with the given name.
             *
             * You can optionally pass a parameter name that should be searched to.
             *
             * @param tagName  The name of the tag to look for.
             * @param paramName  An optional parameter name to look for.
             * @returns The found tag or NULL.
             */
            Comment.prototype.getTag = function (tagName, paramName) {
                if (!this.tags)
                    return null;
                for (var i = 0, c = this.tags.length; i < c; i++) {
                    var tag = this.tags[i];
                    if (tag.tagName == tagName && (!paramName || tag.paramName == paramName)) {
                        return this.tags[i];
                    }
                }
                return null;
            };
            /**
             * Copy the data of the given comment into this comment.
             *
             * @param comment
             */
            Comment.prototype.copyFrom = function (comment) {
                this.shortText = comment.shortText;
                this.text = comment.text;
                this.returns = comment.returns;
                this.tags = comment.tags ? comment.tags.map(function (tag) { return new models.CommentTag(tag.tagName, tag.paramName, tag.text); }) : null;
            };
            /**
             * Return a raw object representation of this comment.
             */
            Comment.prototype.toObject = function () {
                var result = {};
                if (this.shortText)
                    result.shortText = this.shortText;
                if (this.text)
                    result.text = this.text;
                if (this.returns)
                    result.returns = this.returns;
                if (this.tags && this.tags.length) {
                    result.tags = [];
                    this.tags.forEach(function (tag) { return result.tags.push(tag.toObject()); });
                }
                return result;
            };
            return Comment;
        })();
        models.Comment = Comment;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * A model that represents a single javadoc comment tag.
         *
         * Tags are stored in the [[Comment.tags]] property.
         */
        var CommentTag = (function () {
            /**
             * Create a new CommentTag instance.
             */
            function CommentTag(tagName, paramName, text) {
                this.tagName = tagName;
                this.paramName = paramName || '';
                this.text = text || '';
            }
            /**
             * Return a raw object representation of this tag.
             */
            CommentTag.prototype.toObject = function () {
                var result = {
                    tag: this.tagName,
                    text: this.text
                };
                if (this.paramName) {
                    result.param = this.paramName;
                }
                return result;
            };
            return CommentTag;
        })();
        models.CommentTag = CommentTag;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * A group of reflections. All reflections in a group are of the same kind.
         *
         * Reflection groups are created by the ´GroupHandler´ in the resolving phase
         * of the dispatcher. The main purpose of groups is to be able to more easily
         * render human readable children lists in templates.
         */
        var ReflectionGroup = (function () {
            /**
             * Create a new ReflectionGroup instance.
             *
             * @param title The title of this group.
             * @param kind  The original typescript kind of the children of this group.
             */
            function ReflectionGroup(title, kind) {
                var _this = this;
                /**
                 * All reflections of this group.
                 */
                this.children = [];
                this.title = title;
                this.kind = kind;
                this.allChildrenHaveOwnDocument = (function () { return _this.getAllChildrenHaveOwnDocument(); });
            }
            /**
             * Do all children of this group have a separate document?
             */
            ReflectionGroup.prototype.getAllChildrenHaveOwnDocument = function () {
                var onlyOwnDocuments = true;
                this.children.forEach(function (child) {
                    onlyOwnDocuments = onlyOwnDocuments && child.hasOwnDocument;
                });
                return onlyOwnDocuments;
            };
            /**
             * Return a raw object representation of this reflection group.
             */
            ReflectionGroup.prototype.toObject = function () {
                var result = {
                    title: this.title,
                    kind: this.kind
                };
                if (this.children) {
                    var children = [];
                    this.children.forEach(function (child) {
                        children.push(child.id);
                    });
                    result['children'] = children;
                }
                return result;
            };
            return ReflectionGroup;
        })();
        models.ReflectionGroup = ReflectionGroup;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * Exposes information about a directory containing source files.
         *
         * One my access the root directory of a project through the [[ProjectReflection.directory]]
         * property. Traverse through directories by utilizing the [[SourceDirectory.parent]] or
         * [[SourceDirectory.directories]] properties.
         */
        var SourceDirectory = (function () {
            /**
             * Create a new SourceDirectory instance.
             *
             * @param name  The new of directory.
             * @param parent  The parent directory instance.
             */
            function SourceDirectory(name, parent) {
                /**
                 * The parent directory or NULL if this is a root directory.
                 */
                this.parent = null;
                /**
                 * A list of all subdirectories.
                 */
                this.directories = {};
                /**
                 * A list of all files in this directory.
                 */
                this.files = [];
                /**
                 * The name of this directory.
                 */
                this.name = null;
                /**
                 * The relative path from the root directory to this directory.
                 */
                this.dirName = null;
                if (name && parent) {
                    this.name = name;
                    this.dirName = (parent.dirName ? parent.dirName + '/' : '') + name;
                    this.parent = parent;
                }
            }
            /**
             * Return a string describing this directory and its contents.
             *
             * @param indent  Used internally for indention.
             * @returns A string representing this directory and all of its children.
             */
            SourceDirectory.prototype.toString = function (indent) {
                if (indent === void 0) { indent = ''; }
                var res = indent + this.name;
                for (var key in this.directories) {
                    if (!this.directories.hasOwnProperty(key))
                        continue;
                    res += '\n' + this.directories[key].toString(indent + '  ');
                }
                this.files.forEach(function (file) {
                    res += '\n' + indent + '  ' + file.fileName;
                });
                return res;
            };
            /**
             * Return a list of all reflections exposed by the files within this directory.
             *
             * @returns An aggregated list of all [[DeclarationReflection]] defined in the
             * files of this directory.
             */
            SourceDirectory.prototype.getAllReflections = function () {
                var reflections = [];
                this.files.forEach(function (file) {
                    reflections.push.apply(reflections, file.reflections);
                });
                // reflections.sort(Factories.GroupHandler.sortCallback);
                return reflections;
            };
            return SourceDirectory;
        })();
        models.SourceDirectory = SourceDirectory;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * Exposes information about a source file.
         *
         * One my access a list of all source files through the [[ProjectReflection.files]] property or as
         * a tree structure through the [[ProjectReflection.directory]] property.
         *
         * Furthermore each reflection carries references to the related SourceFile with their
         * [[DeclarationReflection.sources]] property. It is an array of of [[IDeclarationSource]] instances
         * containing the reference in their [[IDeclarationSource.file]] field.
         */
        var SourceFile = (function () {
            /**
             * Create a new SourceFile instance.
             *
             * @param fullFileName  The full file name.
             */
            function SourceFile(fullFileName) {
                /**
                 * A list of all reflections that are declared in this file.
                 */
                this.reflections = [];
                this.fileName = fullFileName;
                this.fullFileName = fullFileName;
                this.name = td.Path.basename(fullFileName);
            }
            return SourceFile;
        })();
        models.SourceFile = SourceFile;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * Base class of all type definitions.
         *
         * Instances of this class are also used to represent the type `void`.
         */
        var Type = (function () {
            function Type() {
                /**
                 * Is this an array type?
                 */
                this.isArray = false;
            }
            /**
             * Clone this type.
             *
             * @return A clone of this type.
             */
            Type.prototype.clone = function () {
                var clone = new Type();
                clone.isArray = this.isArray;
                return clone;
            };
            /**
             * Test whether this type equals the given type.
             *
             * @param type  The type that should be checked for equality.
             * @returns TRUE if the given type equals this type, FALSE otherwise.
             */
            Type.prototype.equals = function (type) {
                return false;
            };
            /**
             * Return a raw object representation of this type.
             */
            Type.prototype.toObject = function () {
                var result = {};
                result.type = 'void';
                if (this.isArray) {
                    result.isArray = this.isArray;
                }
                return result;
            };
            /**
             * Return a string representation of this type.
             */
            Type.prototype.toString = function () {
                return 'void';
            };
            /**
             * Test whether the two given list of types contain equal types.
             *
             * @param a
             * @param b
             */
            Type.isTypeListSimiliar = function (a, b) {
                if (a.length != b.length)
                    return false;
                outerLoop: for (var an = 0, count = a.length; an < count; an++) {
                    var at = a[an];
                    for (var bn = 0; bn < count; bn++) {
                        if (b[bn].equals(at))
                            continue outerLoop;
                    }
                    return false;
                }
                return true;
            };
            /**
             * Test whether the two given list of types are equal.
             *
             * @param a
             * @param b
             */
            Type.isTypeListEqual = function (a, b) {
                if (a.length != b.length)
                    return false;
                for (var index = 0, count = a.length; index < count; index++) {
                    if (!a[index].equals(b[index])) {
                        return false;
                    }
                }
                return true;
            };
            return Type;
        })();
        models.Type = Type;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        var ContainerReflection = (function (_super) {
            __extends(ContainerReflection, _super);
            function ContainerReflection() {
                _super.apply(this, arguments);
            }
            /**
             * Return a list of all children of a certain kind.
             *
             * @param kind  The desired kind of children.
             * @returns     An array containing all children with the desired kind.
             */
            ContainerReflection.prototype.getChildrenByKind = function (kind) {
                var values = [];
                for (var key in this.children) {
                    var child = this.children[key];
                    if (child.kindOf(kind)) {
                        values.push(child);
                    }
                }
                return values;
            };
            /**
             * Traverse all potential child reflections of this reflection.
             *
             * The given callback will be invoked for all children, signatures and type parameters
             * attached to this reflection.
             *
             * @param callback  The callback function that should be applied for each child reflection.
             */
            ContainerReflection.prototype.traverse = function (callback) {
                if (this.children) {
                    this.children.forEach(function (child) { return callback(child, models.TraverseProperty.Children); });
                }
            };
            /**
             * Return a raw object representation of this reflection.
             */
            ContainerReflection.prototype.toObject = function () {
                var result = _super.prototype.toObject.call(this);
                if (this.groups) {
                    var groups = [];
                    this.groups.forEach(function (group) {
                        groups.push(group.toObject());
                    });
                    result['groups'] = groups;
                }
                return result;
            };
            return ContainerReflection;
        })(models.Reflection);
        models.ContainerReflection = ContainerReflection;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * A reflection that represents a single declaration emitted by the TypeScript compiler.
         *
         * All parts of a project are represented by DeclarationReflection instances. The actual
         * kind of a reflection is stored in its ´kind´ member.
         */
        var DeclarationReflection = (function (_super) {
            __extends(DeclarationReflection, _super);
            function DeclarationReflection() {
                _super.apply(this, arguments);
            }
            DeclarationReflection.prototype.hasGetterOrSetter = function () {
                return !!this.getSignature || !!this.setSignature;
            };
            DeclarationReflection.prototype.getAllSignatures = function () {
                var result = [];
                if (this.signatures)
                    result = result.concat(this.signatures);
                if (this.indexSignature)
                    result.push(this.indexSignature);
                if (this.getSignature)
                    result.push(this.getSignature);
                if (this.setSignature)
                    result.push(this.setSignature);
                return result;
            };
            /**
             * Traverse all potential child reflections of this reflection.
             *
             * The given callback will be invoked for all children, signatures and type parameters
             * attached to this reflection.
             *
             * @param callback  The callback function that should be applied for each child reflection.
             */
            DeclarationReflection.prototype.traverse = function (callback) {
                if (this.typeParameters) {
                    this.typeParameters.forEach(function (parameter) { return callback(parameter, models.TraverseProperty.TypeParameter); });
                }
                if (this.type instanceof models.ReflectionType) {
                    callback(this.type.declaration, models.TraverseProperty.TypeLiteral);
                }
                if (this.signatures) {
                    this.signatures.forEach(function (signature) { return callback(signature, models.TraverseProperty.Signatures); });
                }
                if (this.indexSignature) {
                    callback(this.indexSignature, models.TraverseProperty.IndexSignature);
                }
                if (this.getSignature) {
                    callback(this.getSignature, models.TraverseProperty.GetSignature);
                }
                if (this.setSignature) {
                    callback(this.setSignature, models.TraverseProperty.SetSignature);
                }
                _super.prototype.traverse.call(this, callback);
            };
            /**
             * Return a raw object representation of this reflection.
             */
            DeclarationReflection.prototype.toObject = function () {
                var result = _super.prototype.toObject.call(this);
                if (this.type) {
                    result.type = this.type.toObject();
                }
                if (this.defaultValue) {
                    result.defaultValue = this.defaultValue;
                }
                if (this.overwrites) {
                    result.overwrites = this.overwrites.toObject();
                }
                if (this.inheritedFrom) {
                    result.inheritedFrom = this.inheritedFrom.toObject();
                }
                if (this.extendedTypes) {
                    result.extendedTypes = this.extendedTypes.map(function (t) { return t.toObject(); });
                }
                if (this.extendedBy) {
                    result.extendedBy = this.extendedBy.map(function (t) { return t.toObject(); });
                }
                if (this.implementedTypes) {
                    result.implementedTypes = this.implementedTypes.map(function (t) { return t.toObject(); });
                }
                if (this.implementedBy) {
                    result.implementedBy = this.implementedBy.map(function (t) { return t.toObject(); });
                }
                if (this.implementationOf) {
                    result.implementationOf = this.implementationOf.toObject();
                }
                return result;
            };
            /**
             * Return a string representation of this reflection.
             */
            DeclarationReflection.prototype.toString = function () {
                var result = _super.prototype.toString.call(this);
                if (this.typeParameters) {
                    var parameters = [];
                    this.typeParameters.forEach(function (parameter) {
                        parameters.push(parameter.name);
                    });
                    result += '<' + parameters.join(', ') + '>';
                }
                if (this.type) {
                    result += ':' + this.type.toString();
                }
                return result;
            };
            return DeclarationReflection;
        })(models.ContainerReflection);
        models.DeclarationReflection = DeclarationReflection;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        var ParameterReflection = (function (_super) {
            __extends(ParameterReflection, _super);
            function ParameterReflection() {
                _super.apply(this, arguments);
            }
            /**
             * Traverse all potential child reflections of this reflection.
             *
             * The given callback will be invoked for all children, signatures and type parameters
             * attached to this reflection.
             *
             * @param callback  The callback function that should be applied for each child reflection.
             */
            ParameterReflection.prototype.traverse = function (callback) {
                if (this.type instanceof models.ReflectionType) {
                    callback(this.type.declaration, models.TraverseProperty.TypeLiteral);
                }
                _super.prototype.traverse.call(this, callback);
            };
            /**
             * Return a raw object representation of this reflection.
             */
            ParameterReflection.prototype.toObject = function () {
                var result = _super.prototype.toObject.call(this);
                if (this.type) {
                    result.type = this.type.toObject();
                }
                if (this.defaultValue) {
                    result.defaultValue = this.defaultValue;
                }
                return result;
            };
            /**
             * Return a string representation of this reflection.
             */
            ParameterReflection.prototype.toString = function () {
                return _super.prototype.toString.call(this) + (this.type ? ':' + this.type.toString() : '');
            };
            return ParameterReflection;
        })(models.Reflection);
        models.ParameterReflection = ParameterReflection;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * A reflection that represents the root of the project.
         *
         * The project reflection acts as a global index, one may receive all reflections
         * and source files of the processed project through this reflection.
         */
        var ProjectReflection = (function (_super) {
            __extends(ProjectReflection, _super);
            /**
             * Create a new ProjectReflection instance.
             *
             * @param name  The name of the project.
             */
            function ProjectReflection(name) {
                _super.call(this, null, name, models.ReflectionKind.Global);
                /**
                 * A list of all reflections within the project.
                 */
                this.reflections = {};
                this.symbolMapping = {};
                /**
                 * The root directory of the project.
                 */
                this.directory = new models.SourceDirectory();
                /**
                 * A list of all source files within the project.
                 */
                this.files = [];
            }
            /**
             * Return a list of all reflections in this project of a certain kind.
             *
             * @param kind  The desired kind of reflection.
             * @returns     An array containing all reflections with the desired kind.
             */
            ProjectReflection.prototype.getReflectionsByKind = function (kind) {
                var values = [];
                for (var id in this.reflections) {
                    var reflection = this.reflections[id];
                    if (reflection.kindOf(kind)) {
                        values.push(reflection);
                    }
                }
                return values;
            };
            /**
             * Try to find a reflection by its name.
             *
             * @return The found reflection or null.
             */
            ProjectReflection.prototype.findReflectionByName = function (arg) {
                var names = Array.isArray(arg) ? arg : arg.split('.');
                var name = names.pop();
                search: for (var key in this.reflections) {
                    var reflection = this.reflections[key];
                    if (reflection.name != name)
                        continue;
                    var depth = names.length - 1;
                    var target = reflection;
                    while (target && depth >= 0) {
                        target = target.parent;
                        if (target.name != names[depth])
                            continue search;
                        depth -= 1;
                    }
                    return reflection;
                }
                return null;
            };
            return ProjectReflection;
        })(models.ContainerReflection);
        models.ProjectReflection = ProjectReflection;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        var SignatureReflection = (function (_super) {
            __extends(SignatureReflection, _super);
            function SignatureReflection() {
                _super.apply(this, arguments);
            }
            /**
             * Return an array of the parameter types.
             */
            SignatureReflection.prototype.getParameterTypes = function () {
                if (!this.parameters)
                    return [];
                return this.parameters.map(function (parameter) { return parameter.type; });
            };
            /**
             * Traverse all potential child reflections of this reflection.
             *
             * The given callback will be invoked for all children, signatures and type parameters
             * attached to this reflection.
             *
             * @param callback  The callback function that should be applied for each child reflection.
             */
            SignatureReflection.prototype.traverse = function (callback) {
                if (this.type instanceof models.ReflectionType) {
                    callback(this.type.declaration, models.TraverseProperty.TypeLiteral);
                }
                if (this.typeParameters) {
                    this.typeParameters.forEach(function (parameter) { return callback(parameter, models.TraverseProperty.TypeParameter); });
                }
                if (this.parameters) {
                    this.parameters.forEach(function (parameter) { return callback(parameter, models.TraverseProperty.Parameters); });
                }
                _super.prototype.traverse.call(this, callback);
            };
            /**
             * Return a raw object representation of this reflection.
             */
            SignatureReflection.prototype.toObject = function () {
                var result = _super.prototype.toObject.call(this);
                if (this.type) {
                    result.type = this.type.toObject();
                }
                if (this.overwrites) {
                    result.overwrites = this.overwrites.toObject();
                }
                if (this.inheritedFrom) {
                    result.inheritedFrom = this.inheritedFrom.toObject();
                }
                if (this.implementationOf) {
                    result.implementationOf = this.implementationOf.toObject();
                }
                return result;
            };
            /**
             * Return a string representation of this reflection.
             */
            SignatureReflection.prototype.toString = function () {
                var result = _super.prototype.toString.call(this);
                if (this.typeParameters) {
                    var parameters = [];
                    this.typeParameters.forEach(function (parameter) { return parameters.push(parameter.name); });
                    result += '<' + parameters.join(', ') + '>';
                }
                if (this.type) {
                    result += ':' + this.type.toString();
                }
                return result;
            };
            return SignatureReflection;
        })(models.Reflection);
        models.SignatureReflection = SignatureReflection;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        var TypeParameterReflection = (function (_super) {
            __extends(TypeParameterReflection, _super);
            /**
             * Create a new TypeParameterReflection instance.
             */
            function TypeParameterReflection(parent, type) {
                _super.call(this, parent, type.name, models.ReflectionKind.TypeParameter);
                this.type = type.constraint;
            }
            /**
             * Return a raw object representation of this reflection.
             */
            TypeParameterReflection.prototype.toObject = function () {
                var result = _super.prototype.toObject.call(this);
                if (this.type) {
                    result.type = this.type.toObject();
                }
                return result;
            };
            return TypeParameterReflection;
        })(models.Reflection);
        models.TypeParameterReflection = TypeParameterReflection;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * Represents an intrinsic type like `string` or `boolean`.
         *
         * ~~~
         * var value:number;
         * ~~~
         */
        var IntrinsicType = (function (_super) {
            __extends(IntrinsicType, _super);
            /**
             * Create a new instance of IntrinsicType.
             *
             * @param name  The name of the intrinsic type like `string` or `boolean`.
             */
            function IntrinsicType(name) {
                _super.call(this);
                this.name = name;
            }
            /**
             * Clone this type.
             *
             * @return A clone of this type.
             */
            IntrinsicType.prototype.clone = function () {
                var clone = new IntrinsicType(this.name);
                clone.isArray = this.isArray;
                return clone;
            };
            /**
             * Test whether this type equals the given type.
             *
             * @param type  The type that should be checked for equality.
             * @returns TRUE if the given type equals this type, FALSE otherwise.
             */
            IntrinsicType.prototype.equals = function (type) {
                return type instanceof IntrinsicType &&
                    type.isArray == this.isArray &&
                    type.name == this.name;
            };
            /**
             * Return a raw object representation of this type.
             */
            IntrinsicType.prototype.toObject = function () {
                var result = _super.prototype.toObject.call(this);
                result.type = 'instrinct';
                result.name = this.name;
                return result;
            };
            /**
             * Return a string representation of this type.
             */
            IntrinsicType.prototype.toString = function () {
                return this.name + (this.isArray ? '[]' : '');
            };
            return IntrinsicType;
        })(models.Type);
        models.IntrinsicType = IntrinsicType;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * Represents a type that refers to another reflection like a class, interface or enum.
         *
         * ~~~
         * var value:MyClass;
         * ~~~
         */
        var ReferenceType = (function (_super) {
            __extends(ReferenceType, _super);
            /**
             * Create a new instance of ReferenceType.
             *
             * @param name        The name of the referenced type.
             * @param symbolID    The symbol id of the referenced type as returned from the TypeScript compiler.
             * @param reflection  The resolved reflection if already known.
             */
            function ReferenceType(name, symbolID, reflection) {
                _super.call(this);
                this.name = name;
                this.symbolID = symbolID;
                this.reflection = reflection;
            }
            /**
             * Clone this type.
             *
             * @return A clone of this type.
             */
            ReferenceType.prototype.clone = function () {
                var clone = new ReferenceType(this.name, this.symbolID, this.reflection);
                clone.isArray = this.isArray;
                clone.typeArguments = this.typeArguments;
                return clone;
            };
            /**
             * Test whether this type equals the given type.
             *
             * @param type  The type that should be checked for equality.
             * @returns TRUE if the given type equals this type, FALSE otherwise.
             */
            ReferenceType.prototype.equals = function (type) {
                return type instanceof ReferenceType &&
                    type.isArray == this.isArray &&
                    (type.symbolID == this.symbolID || type.reflection == this.reflection);
            };
            /**
             * Return a raw object representation of this type.
             */
            ReferenceType.prototype.toObject = function () {
                var result = _super.prototype.toObject.call(this);
                result.type = 'reference';
                result.name = this.name;
                if (this.reflection) {
                    result.id = this.reflection.id;
                }
                if (this.typeArguments) {
                    result.typeArguments = this.typeArguments.map(function (t) { return t.toObject(); });
                }
                return result;
            };
            /**
             * Return a string representation of this type.
             */
            ReferenceType.prototype.toString = function () {
                if (this.reflection) {
                    return this.reflection.name + (this.isArray ? '[]' : '');
                }
                else {
                    return this.name + (this.isArray ? '[]' : '');
                }
            };
            /**
             * Special symbol ID noting that the reference of a ReferenceType was known when creating the type.
             */
            ReferenceType.SYMBOL_ID_RESOLVED = -1;
            /**
             * Special symbol ID noting that the reference should be resolved by the type name.
             */
            ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME = -2;
            return ReferenceType;
        })(models.Type);
        models.ReferenceType = ReferenceType;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * Represents a type which has it's own reflection like literal types.
         *
         * ~~~
         * var value:{subValueA;subValueB;subValueC;};
         * ~~~
         */
        var ReflectionType = (function (_super) {
            __extends(ReflectionType, _super);
            /**
             * Create a new instance of ReflectionType.
             *
             * @param declaration  The reflection of the type.
             */
            function ReflectionType(declaration) {
                _super.call(this);
                this.declaration = declaration;
            }
            /**
             * Clone this type.
             *
             * @return A clone of this type.
             */
            ReflectionType.prototype.clone = function () {
                var clone = new ReflectionType(this.declaration);
                clone.isArray = this.isArray;
                return clone;
            };
            /**
             * Test whether this type equals the given type.
             *
             * @param type  The type that should be checked for equality.
             * @returns TRUE if the given type equals this type, FALSE otherwise.
             */
            ReflectionType.prototype.equals = function (type) {
                return type == this;
            };
            /**
             * Return a raw object representation of this type.
             */
            ReflectionType.prototype.toObject = function () {
                var result = _super.prototype.toObject.call(this);
                result.type = 'reflection';
                if (this.declaration) {
                    result.declaration = this.declaration.toObject();
                }
                return result;
            };
            /**
             * Return a string representation of this type.
             */
            ReflectionType.prototype.toString = function () {
                if (!this.declaration.children && this.declaration.signatures) {
                    return 'function';
                }
                else {
                    return 'object';
                }
            };
            return ReflectionType;
        })(models.Type);
        models.ReflectionType = ReflectionType;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * Represents a string literal type.
         *
         * ~~~
         * var value:"DIV";
         * ~~~
         */
        var StringLiteralType = (function (_super) {
            __extends(StringLiteralType, _super);
            /**
             * Create a new instance of StringLiteralType.
             *
             * @param value The string literal value.
             */
            function StringLiteralType(value) {
                _super.call(this);
                this.value = value;
            }
            /**
             * Clone this type.
             *
             * @return A clone of this type.
             */
            StringLiteralType.prototype.clone = function () {
                var clone = new StringLiteralType(this.value);
                clone.isArray = this.isArray;
                return clone;
            };
            /**
             * Test whether this type equals the given type.
             *
             * @param type  The type that should be checked for equality.
             * @returns TRUE if the given type equals this type, FALSE otherwise.
             */
            StringLiteralType.prototype.equals = function (type) {
                return type instanceof StringLiteralType &&
                    type.isArray == this.isArray &&
                    type.value == this.value;
            };
            /**
             * Return a raw object representation of this type.
             */
            StringLiteralType.prototype.toObject = function () {
                var result = _super.prototype.toObject.call(this);
                result.type = 'stringLiteral';
                result.value = this.value;
                return result;
            };
            /**
             * Return a string representation of this type.
             */
            StringLiteralType.prototype.toString = function () {
                return '"' + this.value + '"';
            };
            return StringLiteralType;
        })(models.Type);
        models.StringLiteralType = StringLiteralType;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * Represents a tuple type.
         *
         * ~~~
         * var value:[string,boolean];
         * ~~~
         */
        var TupleType = (function (_super) {
            __extends(TupleType, _super);
            /**
             * Create a new TupleType instance.
             *
             * @param elements  The ordered type elements of the tuple type.
             */
            function TupleType(elements) {
                _super.call(this);
                this.elements = elements;
            }
            /**
             * Clone this type.
             *
             * @return A clone of this type.
             */
            TupleType.prototype.clone = function () {
                var clone = new TupleType(this.elements);
                clone.isArray = this.isArray;
                return clone;
            };
            /**
             * Test whether this type equals the given type.
             *
             * @param type  The type that should be checked for equality.
             * @returns TRUE if the given type equals this type, FALSE otherwise.
             */
            TupleType.prototype.equals = function (type) {
                if (!(type instanceof TupleType))
                    return false;
                if (type.isArray != this.isArray)
                    return false;
                return models.Type.isTypeListEqual(type.elements, this.elements);
            };
            /**
             * Return a raw object representation of this type.
             */
            TupleType.prototype.toObject = function () {
                var result = _super.prototype.toObject.call(this);
                result.type = 'tuple';
                if (this.elements && this.elements.length) {
                    result.elements = this.elements.map(function (e) { return e.toObject(); });
                }
                return result;
            };
            /**
             * Return a string representation of this type.
             */
            TupleType.prototype.toString = function () {
                var names = [];
                this.elements.forEach(function (element) {
                    names.push(element.toString());
                });
                return '[' + names.join(', ') + ']';
            };
            return TupleType;
        })(models.Type);
        models.TupleType = TupleType;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * Represents a type parameter type.
         *
         * ~~~
         * var value:T;
         * ~~~
         */
        var TypeParameterType = (function (_super) {
            __extends(TypeParameterType, _super);
            function TypeParameterType() {
                _super.apply(this, arguments);
            }
            /**
             * Clone this type.
             *
             * @return A clone of this type.
             */
            TypeParameterType.prototype.clone = function () {
                var clone = new TypeParameterType();
                clone.isArray = this.isArray;
                clone.name = this.name;
                clone.constraint = this.constraint;
                return clone;
            };
            /**
             * Test whether this type equals the given type.
             *
             * @param type  The type that should be checked for equality.
             * @returns TRUE if the given type equals this type, FALSE otherwise.
             */
            TypeParameterType.prototype.equals = function (type) {
                if (!(type instanceof TypeParameterType)) {
                    return false;
                }
                var constraintEquals;
                if (this.constraint && type.constraint) {
                    constraintEquals = type.constraint.equals(this.constraint);
                }
                else if (!this.constraint && !type.constraint) {
                    constraintEquals = true;
                }
                else {
                    return false;
                }
                return constraintEquals &&
                    type.isArray == this.isArray;
            };
            /**
             * Return a raw object representation of this type.
             */
            TypeParameterType.prototype.toObject = function () {
                var result = _super.prototype.toObject.call(this);
                result.type = 'typeParameter';
                result.name = this.name;
                if (this.constraint) {
                    result.constraint = this.constraint.toObject();
                }
                return result;
            };
            /**
             * Return a string representation of this type.
             */
            TypeParameterType.prototype.toString = function () {
                return this.name;
            };
            return TypeParameterType;
        })(models.Type);
        models.TypeParameterType = TypeParameterType;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * Represents an union type.
         *
         * ~~~
         * var value:string | string[];
         * ~~~
         */
        var UnionType = (function (_super) {
            __extends(UnionType, _super);
            /**
             * Create a new TupleType instance.
             *
             * @param types  The types this union consists of.
             */
            function UnionType(types) {
                _super.call(this);
                this.types = types;
            }
            /**
             * Clone this type.
             *
             * @return A clone of this type.
             */
            UnionType.prototype.clone = function () {
                var clone = new UnionType(this.types);
                clone.isArray = this.isArray;
                return clone;
            };
            /**
             * Test whether this type equals the given type.
             *
             * @param type  The type that should be checked for equality.
             * @returns TRUE if the given type equals this type, FALSE otherwise.
             */
            UnionType.prototype.equals = function (type) {
                if (!(type instanceof UnionType))
                    return false;
                if (type.isArray != this.isArray)
                    return false;
                return models.Type.isTypeListSimiliar(type.types, this.types);
            };
            /**
             * Return a raw object representation of this type.
             */
            UnionType.prototype.toObject = function () {
                var result = _super.prototype.toObject.call(this);
                result.type = 'union';
                if (this.types && this.types.length) {
                    result.types = this.types.map(function (e) { return e.toObject(); });
                }
                return result;
            };
            /**
             * Return a string representation of this type.
             */
            UnionType.prototype.toString = function () {
                var names = [];
                this.types.forEach(function (element) {
                    names.push(element.toString());
                });
                return names.join(' | ');
            };
            return UnionType;
        })(models.Type);
        models.UnionType = UnionType;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
var td;
(function (td) {
    var models;
    (function (models) {
        /**
         * Represents all unknown types.
         */
        var UnknownType = (function (_super) {
            __extends(UnknownType, _super);
            /**
             * Create a new instance of UnknownType.
             *
             * @param name  A string representation of the type as returned from TypeScript compiler.
             */
            function UnknownType(name) {
                _super.call(this);
                this.name = name;
            }
            /**
             * Clone this type.
             *
             * @return A clone of this type.
             */
            UnknownType.prototype.clone = function () {
                var clone = new UnknownType(this.name);
                clone.isArray = this.isArray;
                return clone;
            };
            /**
             * Test whether this type equals the given type.
             *
             * @param type  The type that should be checked for equality.
             * @returns TRUE if the given type equals this type, FALSE otherwise.
             */
            UnknownType.prototype.equals = function (type) {
                return type instanceof UnknownType &&
                    type.isArray == this.isArray &&
                    type.name == this.name;
            };
            /**
             * Return a raw object representation of this type.
             */
            UnknownType.prototype.toObject = function () {
                var result = _super.prototype.toObject.call(this);
                result.type = 'unknown';
                result.name = this.name;
                return result;
            };
            /**
             * Return a string representation of this type.
             */
            UnknownType.prototype.toString = function () {
                return this.name;
            };
            return UnknownType;
        })(models.Type);
        models.UnknownType = UnknownType;
    })(models = td.models || (td.models = {}));
})(td || (td = {}));
/**
 * Holds all logic used render and output the final documentation.
 *
 * The [[Renderer]] class is the central controller within this namespace. When invoked it creates
 * an instance of [[BaseTheme]] which defines the layout of the documentation and fires a
 * series of [[OutputEvent]] events. Instances of [[BasePlugin]] can listen to these events and
 * alter the generated output.
 */
var td;
(function (td) {
    var output;
    (function (output_1) {
        /**
         * The renderer processes a [[ProjectReflection]] using a [[BaseTheme]] instance and writes
         * the emitted html documents to a output directory. You can specify which theme should be used
         * using the ```--theme <name>``` commandline argument.
         *
         * Subclasses of [[BasePlugin]] that have registered themselves in the [[Renderer.PLUGIN_CLASSES]]
         * will be automatically initialized. Most of the core functionality is provided as separate plugins.
         *
         * [[Renderer]] is a subclass of [[EventDispatcher]] and triggers a series of events while
         * a project is being processed. You can listen to these events to control the flow or manipulate
         * the output.
         *
         *  * [[Renderer.EVENT_BEGIN]]<br>
         *    Triggered before the renderer starts rendering a project. The listener receives
         *    an instance of [[OutputEvent]]. By calling [[OutputEvent.preventDefault]] the entire
         *    render process can be canceled.
         *
         *    * [[Renderer.EVENT_BEGIN_PAGE]]<br>
         *      Triggered before a document will be rendered. The listener receives an instance of
         *      [[OutputPageEvent]]. By calling [[OutputPageEvent.preventDefault]] the generation of the
         *      document can be canceled.
         *
         *    * [[Renderer.EVENT_END_PAGE]]<br>
         *      Triggered after a document has been rendered, just before it is written to disc. The
         *      listener receives an instance of [[OutputPageEvent]]. When calling
         *      [[OutputPageEvent.preventDefault]] the the document will not be saved to disc.
         *
         *  * [[Renderer.EVENT_END]]<br>
         *    Triggered after the renderer has written all documents. The listener receives
         *    an instance of [[OutputEvent]].
         */
        var Renderer = (function (_super) {
            __extends(Renderer, _super);
            /**
             * Create a new Renderer instance.
             *
             * @param application  The application this dispatcher is attached to.
             */
            function Renderer(application) {
                _super.call(this);
                /**
                 * Hash map of all loaded templates indexed by filename.
                 */
                this.templates = {};
                this.application = application;
                Renderer.loadPlugins(this);
            }
            Renderer.prototype.getParameters = function () {
                var result = _super.prototype.getParameters.call(this);
                this.prepareTheme();
                var theme = this.theme;
                if (theme.getParameters) {
                    result = result.concat(theme.getParameters());
                }
                return result;
            };
            /**
             * Return the template with the given filename.
             *
             * Tries to find the file in the ´templates´ subdirectory of the current theme.
             * If it does not exist, TypeDoc tries to find the template in the default
             * theme templates subdirectory.
             *
             * @param fileName  The filename of the template that should be loaded.
             * @returns The compiled template or NULL if the file could not be found.
             */
            Renderer.prototype.getTemplate = function (fileName) {
                if (!this.theme) {
                    this.application.logger.error('Cannot resolve templates before theme is set.');
                    return null;
                }
                if (!this.templates[fileName]) {
                    var path = td.Path.resolve(td.Path.join(this.theme.basePath, fileName));
                    if (!td.FS.existsSync(path)) {
                        path = td.Path.resolve(td.Path.join(Renderer.getDefaultTheme(), fileName));
                        if (!td.FS.existsSync(path)) {
                            this.application.logger.error('Cannot find template %s', fileName);
                            return null;
                        }
                    }
                    this.templates[fileName] = td.Handlebars.compile(Renderer.readFile(path), {
                        preventIndent: true
                    });
                }
                return this.templates[fileName];
            };
            /**
             * Render the given project reflection to the specified output directory.
             *
             * @param project  The project that should be rendered.
             * @param outputDirectory  The path of the directory the documentation should be rendered to.
             */
            Renderer.prototype.render = function (project, outputDirectory) {
                var _this = this;
                if (!this.prepareTheme() || !this.prepareOutputDirectory(outputDirectory)) {
                    return;
                }
                var output = new output_1.OutputEvent();
                output.outputDirectory = outputDirectory;
                output.project = project;
                output.settings = this.application.options;
                output.urls = this.theme.getUrls(project);
                var bar = new td.ProgressBar('Rendering [:bar] :percent', {
                    total: output.urls.length,
                    width: 40
                });
                this.dispatch(Renderer.EVENT_BEGIN, output);
                if (!output.isDefaultPrevented) {
                    output.urls.forEach(function (mapping) {
                        _this.renderDocument(output.createPageEvent(mapping));
                        bar.tick();
                    });
                    this.dispatch(Renderer.EVENT_END, output);
                }
            };
            /**
             * Render a single page.
             *
             * @param page An event describing the current page.
             * @return TRUE if the page has been saved to disc, otherwise FALSE.
             */
            Renderer.prototype.renderDocument = function (page) {
                this.dispatch(Renderer.EVENT_BEGIN_PAGE, page);
                if (page.isDefaultPrevented) {
                    return false;
                }
                page.template = page.template || this.getTemplate(td.Path.join('templates', page.templateName));
                page.contents = page.template(page);
                this.dispatch(Renderer.EVENT_END_PAGE, page);
                if (page.isDefaultPrevented) {
                    return false;
                }
                try {
                    td.writeFile(page.filename, page.contents, false);
                }
                catch (error) {
                    this.application.logger.error('Could not write %s', page.filename);
                    return false;
                }
                return true;
            };
            /**
             * Ensure that a theme has been setup.
             *
             * If a the user has set a theme we try to find and load it. If no theme has
             * been specified we load the default theme.
             *
             * @returns TRUE if a theme has been setup, otherwise FALSE.
             */
            Renderer.prototype.prepareTheme = function () {
                if (!this.theme) {
                    var themeName = this.application.options.theme;
                    var path = td.Path.resolve(themeName);
                    if (!td.FS.existsSync(path)) {
                        path = td.Path.join(Renderer.getThemeDirectory(), themeName);
                        if (!td.FS.existsSync(path)) {
                            this.application.logger.error('The theme %s could not be found.', themeName);
                            return false;
                        }
                    }
                    var filename = td.Path.join(path, 'theme.js');
                    if (!td.FS.existsSync(filename)) {
                        this.theme = new output_1.DefaultTheme(this, path);
                    }
                    else {
                        var themeClass = eval(Renderer.readFile(filename));
                        this.theme = new themeClass(this, path);
                    }
                }
                return true;
            };
            /**
             * Prepare the output directory. If the directory does not exist, it will be
             * created. If the directory exists, it will be emptied.
             *
             * @param directory  The path to the directory that should be prepared.
             * @returns TRUE if the directory could be prepared, otherwise FALSE.
             */
            Renderer.prototype.prepareOutputDirectory = function (directory) {
                if (td.FS.existsSync(directory)) {
                    if (!td.FS.statSync(directory).isDirectory()) {
                        this.application.logger.error('The output target "%s" exists but it is not a directory.', directory);
                        return false;
                    }
                    if (td.FS.readdirSync(directory).length == 0) {
                        return true;
                    }
                    if (!this.theme.isOutputDirectory(directory)) {
                        this.application.logger.error('The output directory "%s" exists but does not seem to be a documentation generated by TypeDoc.\n' +
                            'Make sure this is the right target directory, delete the folder and rerun TypeDoc.', directory);
                        return false;
                    }
                    try {
                        td.FS.removeSync(directory);
                    }
                    catch (error) {
                        this.application.logger.warn('Could not empty the output directory.');
                    }
                }
                if (!td.FS.existsSync(directory)) {
                    try {
                        td.FS.mkdirpSync(directory);
                    }
                    catch (error) {
                        this.application.logger.error('Could not create output directory %s', directory);
                        return false;
                    }
                }
                return true;
            };
            /**
             * Return the path containing the themes shipped with TypeDoc.
             *
             * @returns The path to the theme directory.
             */
            Renderer.getThemeDirectory = function () {
                return td.Path.dirname(require.resolve('typedoc-default-themes'));
            };
            /**
             * Return the path to the default theme.
             *
             * @returns The path to the default theme.
             */
            Renderer.getDefaultTheme = function () {
                return td.Path.join(Renderer.getThemeDirectory(), 'default');
            };
            /**
             * Load the given file and return its contents.
             *
             * @param file  The path of the file to read.
             * @returns The files contents.
             */
            Renderer.readFile = function (file) {
                var buffer = td.FS.readFileSync(file);
                switch (buffer[0]) {
                    case 0xFE:
                        if (buffer[1] === 0xFF) {
                            var i = 0;
                            while ((i + 1) < buffer.length) {
                                var temp = buffer[i];
                                buffer[i] = buffer[i + 1];
                                buffer[i + 1] = temp;
                                i += 2;
                            }
                            return buffer.toString("ucs2", 2);
                        }
                        break;
                    case 0xFF:
                        if (buffer[1] === 0xFE) {
                            return buffer.toString("ucs2", 2);
                        }
                        break;
                    case 0xEF:
                        if (buffer[1] === 0xBB) {
                            return buffer.toString("utf8", 3);
                        }
                }
                return buffer.toString("utf8", 0);
            };
            /**
             * Triggered before the renderer starts rendering a project.
             * @event
             */
            Renderer.EVENT_BEGIN = 'beginRender';
            /**
             * Triggered after the renderer has written all documents.
             * @event
             */
            Renderer.EVENT_END = 'endRender';
            /**
             * Triggered before a document will be rendered.
             * @event
             */
            Renderer.EVENT_BEGIN_PAGE = 'beginPage';
            /**
             * Triggered after a document has been rendered, just before it is written to disc.
             * @event
             */
            Renderer.EVENT_END_PAGE = 'endPage';
            return Renderer;
        })(td.PluginHost);
        output_1.Renderer = Renderer;
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * Base class of all plugins that can be attached to the [[Renderer]].
         */
        var RendererPlugin = (function () {
            /**
             * Create a new RendererPlugin instance.
             *
             * @param renderer  The renderer this plugin should be attached to.
             */
            function RendererPlugin(renderer) {
                this.renderer = renderer;
            }
            /**
             * Remove this plugin from the renderer.
             */
            RendererPlugin.prototype.remove = function () {
                this.renderer.off(null, null, this);
            };
            return RendererPlugin;
        })();
        output.RendererPlugin = RendererPlugin;
        /**
         * A plugin for the renderer that reads the current render context.
         */
        var ContextAwareRendererPlugin = (function (_super) {
            __extends(ContextAwareRendererPlugin, _super);
            /**
             * Create a new ContextAwareRendererPlugin instance.
             *
             * @param renderer  The renderer this plugin should be attached to.
             */
            function ContextAwareRendererPlugin(renderer) {
                _super.call(this, renderer);
                renderer.on(output.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
                renderer.on(output.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
            }
            /**
             * Transform the given absolute path into a relative path.
             *
             * @param absolute  The absolute path to transform.
             * @returns A path relative to the document currently processed.
             */
            ContextAwareRendererPlugin.prototype.getRelativeUrl = function (absolute) {
                var relative = td.Path.relative(td.Path.dirname(this.location), td.Path.dirname(absolute));
                return td.Path.join(relative, td.Path.basename(absolute)).replace(/\\/g, '/');
            };
            /**
             * Triggered before the renderer starts rendering a project.
             *
             * @param event  An event object describing the current render operation.
             */
            ContextAwareRendererPlugin.prototype.onRendererBegin = function (event) {
                this.project = event.project;
            };
            /**
             * Triggered before a document will be rendered.
             *
             * @param page  An event object describing the current render operation.
             */
            ContextAwareRendererPlugin.prototype.onRendererBeginPage = function (page) {
                this.location = page.url;
                this.reflection = page.model instanceof td.models.DeclarationReflection ? page.model : null;
            };
            return ContextAwareRendererPlugin;
        })(RendererPlugin);
        output.ContextAwareRendererPlugin = ContextAwareRendererPlugin;
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * Base class of all themes.
         *
         * A theme defines the logical and graphical output of a documentation. Themes are
         * directories containing a ```theme.js``` file defining a [[BaseTheme]] subclass and a
         * series of subdirectories containing templates and assets. You can select a theme
         * through the ```--theme <path/to/theme>``` commandline argument.
         *
         * The theme class controls which files will be created through the [[BaseTheme.getUrls]]
         * function. It returns an array of [[UrlMapping]] instances defining the target files, models
         * and templates to use. Additionally themes can subscribe to the events emitted by
         * [[Renderer]] to control and manipulate the output process.
         *
         * The default file structure of a theme looks like this:
         *
         * - ```/assets/```<br>
         *   Contains static assets like stylesheets, images or javascript files used by the theme.
         *   The [[AssetsPlugin]] will deep copy this directory to the output directory.
         *
         * - ```/layouts/```<br>
         *   Contains layout templates that the [[LayoutPlugin]] wraps around the output of the
         *   page template. Currently only one ```default.hbs``` layout is supported. Layout templates
         *   receive the current [[OutputPageEvent]] instance as their handlebars context. Place the
         *   ```{{{contents}}}``` variable to render the actual body of the document within this template.
         *
         * - ```/partials/```<br>
         *   Contains partial templates that can be used by other templates using handlebars partial
         *   syntax ```{{> partial-name}}```. The [[PartialsPlugin]] loads all files in this directory
         *   and combines them with the partials of the default theme.
         *
         * - ```/templates/```<br>
         *   Contains the main templates of the theme. The theme maps models to these templates through
         *   the [[BaseTheme.getUrls]] function. If the [[Renderer.getTemplate]] function cannot find a
         *   given template within this directory, it will try to find it in the default theme
         *   ```/templates/``` directory. Templates receive the current [[OutputPageEvent]] instance as
         *   their handlebars context. You can access the target model through the ```{{model}}``` variable.
         *
         * - ```/theme.js```<br>
         *   A javascript file that returns the definition of a [[BaseTheme]] subclass. This file will
         *   be executed within the context of TypeDoc, one may directly access all classes and functions
         *   of TypeDoc. If this file is not present, an instance of [[DefaultTheme]] will be used to render
         *   this theme.
         */
        var Theme = (function () {
            /**
             * Create a new BaseTheme instance.
             *
             * @param renderer  The renderer this theme is attached to.
             * @param basePath  The base path of this theme.
             */
            function Theme(renderer, basePath) {
                this.renderer = renderer;
                this.basePath = basePath;
            }
            /**
             * Test whether the given path contains a documentation generated by this theme.
             *
             * TypeDoc empties the output directory before rendering a project. This function
             * is used to ensure that only previously generated documentations are deleted.
             * When this function returns FALSE, the documentation will not be created and an
             * error message will be displayed.
             *
             * Every theme must have an own implementation of this function, the default
             * implementation always returns FALSE.
             *
             * @param path  The path of the directory that should be tested.
             * @returns     TRUE if the given path seems to be a previous output directory,
             *              otherwise FALSE.
             *
             * @see [[Renderer.prepareOutputDirectory]]
             */
            Theme.prototype.isOutputDirectory = function (path) {
                return false;
            };
            /**
             * Map the models of the given project to the desired output files.
             *
             * Every theme must have an own implementation of this function, the default
             * implementation always returns an empty array.
             *
             * @param project  The project whose urls should be generated.
             * @returns        A list of [[UrlMapping]] instances defining which models
             *                 should be rendered to which files.
             */
            Theme.prototype.getUrls = function (project) {
                return [];
            };
            /**
             * Create a navigation structure for the given project.
             *
             * A navigation is a tree structure consisting of [[NavigationItem]] nodes. This
             * function should return the root node of the desired navigation tree.
             *
             * The [[NavigationPlugin]] will call this hook before a project will be rendered.
             * The plugin will update the state of the navigation tree and pass it to the
             * templates.
             *
             * @param project  The project whose navigation should be generated.
             * @returns        The root navigation item.
             */
            Theme.prototype.getNavigation = function (project) {
                return null;
            };
            return Theme;
        })();
        output.Theme = Theme;
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * An event emitted by the [[MarkedPlugin]] on the [[Renderer]] after a chunk of
         * markdown has been processed. Allows other plugins to manipulate the result.
         *
         * @see [[MarkedPlugin.EVENT_PARSE_MARKDOWN]]
         */
        var MarkdownEvent = (function (_super) {
            __extends(MarkdownEvent, _super);
            function MarkdownEvent() {
                _super.apply(this, arguments);
            }
            return MarkdownEvent;
        })(td.Event);
        output.MarkdownEvent = MarkdownEvent;
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * An event emitted by the [[Renderer]] class at the very beginning and
         * ending of the entire rendering process.
         *
         * @see [[Renderer.EVENT_BEGIN]]
         * @see [[Renderer.EVENT_END]]
         */
        var OutputEvent = (function (_super) {
            __extends(OutputEvent, _super);
            function OutputEvent() {
                _super.apply(this, arguments);
            }
            /**
             * Create an [[OutputPageEvent]] event based on this event and the given url mapping.
             *
             * @internal
             * @param mapping  The mapping that defines the generated [[OutputPageEvent]] state.
             * @returns A newly created [[OutputPageEvent]] instance.
             */
            OutputEvent.prototype.createPageEvent = function (mapping) {
                var event = new output.OutputPageEvent();
                event.project = this.project;
                event.settings = this.settings;
                event.url = mapping.url;
                event.model = mapping.model;
                event.templateName = mapping.template;
                event.filename = td.Path.join(this.outputDirectory, mapping.url);
                return event;
            };
            return OutputEvent;
        })(td.Event);
        output.OutputEvent = OutputEvent;
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * An event emitted by the [[Renderer]] class before and after the
         * markup of a page is rendered.
         *
         * This object will be passed as the rendering context to handlebars templates.
         *
         * @see [[Renderer.EVENT_BEGIN_PAGE]]
         * @see [[Renderer.EVENT_END_PAGE]]
         */
        var OutputPageEvent = (function (_super) {
            __extends(OutputPageEvent, _super);
            function OutputPageEvent() {
                _super.apply(this, arguments);
            }
            return OutputPageEvent;
        })(td.Event);
        output.OutputPageEvent = OutputPageEvent;
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * A hierarchical model holding the data of single node within the navigation.
         *
         * This structure is used by the [[NavigationPlugin]] and [[TocPlugin]] to expose the current
         * navigation state to the template engine. Themes should generate the primary navigation structure
         * through the [[BaseTheme.getNavigation]] method.
         */
        var NavigationItem = (function () {
            /**
             * Create a new NavigationItem instance.
             *
             * @param title       The visible title of the navigation node.
             * @param url         The url this navigation node points to.
             * @param parent      The parent navigation node.
             * @param cssClasses  A string containing the css classes of this node.
             */
            function NavigationItem(title, url, parent, cssClasses) {
                this.title = title || '';
                this.url = url || '';
                this.parent = parent || null;
                this.cssClasses = cssClasses || '';
                if (!url) {
                    this.isLabel = true;
                }
                if (this.parent) {
                    if (!this.parent.children)
                        this.parent.children = [];
                    this.parent.children.push(this);
                }
            }
            /**
             * Create a navigation node for the given reflection.
             *
             * @param reflection     The reflection whose navigation node should be created.
             * @param parent         The parent navigation node.
             * @param useShortNames  Force this function to always use short names.
             */
            NavigationItem.create = function (reflection, parent, useShortNames) {
                var name;
                if (useShortNames || (parent && parent.parent)) {
                    name = reflection.name;
                }
                else {
                    name = reflection.getFullName();
                }
                name = name.trim();
                if (name == '') {
                    name = '<em>' + reflection.kindString + '</em>';
                }
                return new NavigationItem(name, reflection.url, parent, reflection.cssClasses);
            };
            return NavigationItem;
        })();
        output.NavigationItem = NavigationItem;
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         *
         */
        var UrlMapping = (function () {
            function UrlMapping(url, model, template) {
                this.url = url;
                this.model = model;
                this.template = template;
            }
            return UrlMapping;
        })();
        output.UrlMapping = UrlMapping;
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * A plugin that copies the subdirectory ´assets´ from the current themes
         * source folder to the output directory.
         */
        var AssetsPlugin = (function (_super) {
            __extends(AssetsPlugin, _super);
            /**
             * Create a new AssetsPlugin instance.
             *
             * @param renderer  The renderer this plugin should be attached to.
             */
            function AssetsPlugin(renderer) {
                _super.call(this, renderer);
                /**
                 * Should the default assets always be copied to the output directory?
                 */
                this.copyDefaultAssets = true;
                renderer.on(output.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
            }
            /**
             * Triggered before the renderer starts rendering a project.
             *
             * @param event  An event object describing the current render operation.
             */
            AssetsPlugin.prototype.onRendererBegin = function (event) {
                var fromDefault = td.Path.join(output.Renderer.getDefaultTheme(), 'assets');
                var to = td.Path.join(event.outputDirectory, 'assets');
                if (this.copyDefaultAssets) {
                    td.FS.copySync(fromDefault, to);
                }
                else {
                    fromDefault = null;
                }
                var from = td.Path.join(this.renderer.theme.basePath, 'assets');
                if (from != fromDefault && td.FS.existsSync(from)) {
                    td.FS.copySync(from, to);
                }
            };
            return AssetsPlugin;
        })(output.RendererPlugin);
        output.AssetsPlugin = AssetsPlugin;
        /**
         * Register this plugin.
         */
        output.Renderer.registerPlugin('assets', AssetsPlugin);
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * A plugin that exports an index of the project to a javascript file.
         *
         * The resulting javascript file can be used to build a simple search function.
         */
        var JavascriptIndexPlugin = (function (_super) {
            __extends(JavascriptIndexPlugin, _super);
            /**
             * Create a new JavascriptIndexPlugin instance.
             *
             * @param renderer  The renderer this plugin should be attached to.
             */
            function JavascriptIndexPlugin(renderer) {
                _super.call(this, renderer);
                renderer.on(output.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
            }
            /**
             * Triggered after a document has been rendered, just before it is written to disc.
             *
             * @param event  An event object describing the current render operation.
             */
            JavascriptIndexPlugin.prototype.onRendererBegin = function (event) {
                var rows = [];
                var kinds = {};
                for (var key in event.project.reflections) {
                    var reflection = event.project.reflections[key];
                    if (!(reflection instanceof td.models.DeclarationReflection))
                        continue;
                    if (!reflection.url ||
                        !reflection.name ||
                        reflection.flags.isExternal ||
                        reflection.name == '')
                        continue;
                    var parent = reflection.parent;
                    if (parent instanceof td.models.ProjectReflection) {
                        parent = null;
                    }
                    var row = {
                        id: rows.length,
                        kind: reflection.kind,
                        name: reflection.name,
                        url: reflection.url,
                        classes: reflection.cssClasses
                    };
                    if (parent) {
                        row.parent = parent.getFullName();
                    }
                    if (!kinds[reflection.kind]) {
                        kinds[reflection.kind] = td.converter.GroupPlugin.getKindSingular(reflection.kind);
                    }
                    rows.push(row);
                }
                var fileName = td.Path.join(event.outputDirectory, 'assets', 'js', 'search.js');
                var data = 'var typedoc = typedoc || {};' +
                    'typedoc.search = typedoc.search || {};' +
                    'typedoc.search.data = ' + JSON.stringify({ kinds: kinds, rows: rows }) + ';';
                td.writeFile(fileName, data, true);
            };
            return JavascriptIndexPlugin;
        })(output.RendererPlugin);
        output.JavascriptIndexPlugin = JavascriptIndexPlugin;
        /**
         * Register this plugin.
         */
        output.Renderer.registerPlugin('javascriptIndex', JavascriptIndexPlugin);
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * A plugin that wraps the generated output with a layout template.
         *
         * Currently only a default layout is supported. The layout must be stored
         * as ´layouts/default.hbs´ in the theme directory.
         */
        var LayoutPlugin = (function (_super) {
            __extends(LayoutPlugin, _super);
            /**
             * Create a new LayoutPlugin instance.
             *
             * @param renderer  The renderer this plugin should be attached to.
             */
            function LayoutPlugin(renderer) {
                _super.call(this, renderer);
                renderer.on(output.Renderer.EVENT_END_PAGE, this.onRendererEndPage, this);
            }
            /**
             * Triggered after a document has been rendered, just before it is written to disc.
             *
             * @param page  An event object describing the current render operation.
             */
            LayoutPlugin.prototype.onRendererEndPage = function (page) {
                var layout = this.renderer.getTemplate('layouts/default.hbs');
                page.contents = layout(page);
            };
            return LayoutPlugin;
        })(output.RendererPlugin);
        output.LayoutPlugin = LayoutPlugin;
        /**
         * Register this plugin.
         */
        output.Renderer.registerPlugin('layout', LayoutPlugin);
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * A plugin that builds links in markdown texts.
         */
        var MarkedLinksPlugin = (function (_super) {
            __extends(MarkedLinksPlugin, _super);
            /**
             * Create a new MarkedLinksPlugin instance.
             *
             * @param renderer  The renderer this plugin should be attached to.
             */
            function MarkedLinksPlugin(renderer) {
                _super.call(this, renderer);
                /**
                 * Regular expression for detecting bracket links.
                 */
                this.brackets = /\[\[([^\]]+)\]\]/g;
                /**
                 * Regular expression for detecting inline tags like {@link ...}.
                 */
                this.inlineTag = /(?:\[(.+?)\])?\{@(link|linkcode|linkplain)\s+((?:.|\n)+?)\}/gi;
                /**
                 * Regular expression to test if a string looks like an external url.
                 */
                this.urlPrefix = /^(http|ftp)s?:\/\//;
                renderer.on(output.MarkedPlugin.EVENT_PARSE_MARKDOWN, this.onParseMarkdown, this, 100);
            }
            /**
             * Find all references to symbols within the given text and transform them into a link.
             *
             * This function is aware of the current context and will try to find the symbol within the
             * current reflection. It will walk up the reflection chain till the symbol is found or the
             * root reflection is reached. As a last resort the function will search the entire project
             * for the given symbol.
             *
             * @param text  The text that should be parsed.
             * @returns The text with symbol references replaced by links.
             */
            MarkedLinksPlugin.prototype.replaceBrackets = function (text) {
                var _this = this;
                return text.replace(this.brackets, function (match, content) {
                    var split = MarkedLinksPlugin.splitLinkText(content);
                    return _this.buildLink(match, split.target, split.caption);
                });
            };
            /**
             * Find symbol {@link ...} strings in text and turn into html links
             *
             * @param text  The string in which to replace the inline tags.
             * @return      The updated string.
             */
            MarkedLinksPlugin.prototype.replaceInlineTags = function (text) {
                var _this = this;
                return text.replace(this.inlineTag, function (match, leading, tagName, content) {
                    var split = MarkedLinksPlugin.splitLinkText(content);
                    var target = split.target;
                    var caption = leading || split.caption;
                    var monospace;
                    if (tagName == 'linkcode')
                        monospace = true;
                    if (tagName == 'linkplain')
                        monospace = false;
                    return _this.buildLink(match, target, caption, monospace);
                });
            };
            /**
             * Format a link with the given text and target.
             *
             * @param original   The original link string, will be returned if the target cannot be resolved..
             * @param target     The link target.
             * @param caption    The caption of the link.
             * @param monospace  Whether to use monospace formatting or not.
             * @returns A html link tag.
             */
            MarkedLinksPlugin.prototype.buildLink = function (original, target, caption, monospace) {
                var attributes = '';
                if (this.urlPrefix.test(target)) {
                    attributes = ' class="external"';
                }
                else {
                    var reflection;
                    if (this.reflection) {
                        reflection = this.reflection.findReflectionByName(target);
                    }
                    else if (this.project) {
                        reflection = this.project.findReflectionByName(target);
                    }
                    if (reflection && reflection.url) {
                        target = this.getRelativeUrl(reflection.url);
                    }
                    else {
                        return original;
                    }
                }
                if (monospace) {
                    caption = '<code>' + caption + '</code>';
                }
                return td.Util.format('<a href="%s"%s>%s</a>', target, attributes, caption);
            };
            /**
             * Triggered when [[MarkedPlugin]] parses a markdown string.
             *
             * @param event
             */
            MarkedLinksPlugin.prototype.onParseMarkdown = function (event) {
                event.parsedText = this.replaceInlineTags(this.replaceBrackets(event.parsedText));
            };
            /**
             * Split the given link into text and target at first pipe or space.
             *
             * @param text  The source string that should be checked for a split character.
             * @returns An object containing the link text and target.
             */
            MarkedLinksPlugin.splitLinkText = function (text) {
                var splitIndex = text.indexOf('|');
                if (splitIndex === -1) {
                    splitIndex = text.search(/\s/);
                }
                if (splitIndex !== -1) {
                    return {
                        caption: text.substr(splitIndex + 1).replace(/\n+/, ' '),
                        target: text.substr(0, splitIndex)
                    };
                }
                else {
                    return {
                        caption: text,
                        target: text
                    };
                }
            };
            return MarkedLinksPlugin;
        })(output.ContextAwareRendererPlugin);
        output.MarkedLinksPlugin = MarkedLinksPlugin;
        /**
         * Register this plugin.
         */
        output.Renderer.registerPlugin('markedLinks', MarkedLinksPlugin);
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * A plugin that exposes the markdown, compact and relativeURL helper to handlebars.
         *
         * Templates should parse all comments with the markdown handler so authors can
         * easily format their documentation. TypeDoc uses the Marked (https://github.com/chjj/marked)
         * markdown parser and HighlightJS (https://github.com/isagalaev/highlight.js) to highlight
         * code blocks within markdown sections. Additionally this plugin allows to link to other symbols
         * using double angle brackets.
         *
         * You can use the markdown helper anywhere in the templates to convert content to html:
         *
         * ```handlebars
         * {{#markdown}}{{{comment.text}}}{{/markdown}}
         * ```
         *
         * The compact helper removes all newlines of its content:
         *
         * ```handlebars
         * {{#compact}}
         *   Compact
         *   this
         * {{/compact}}
         * ```
         *
         * The relativeURL helper simply transforms an absolute url into a relative url:
         *
         * ```handlebars
         * {{#relativeURL url}}
         * ```
         */
        var MarkedPlugin = (function (_super) {
            __extends(MarkedPlugin, _super);
            /**
             * Create a new MarkedPlugin instance.
             *
             * @param renderer  The renderer this plugin should be attached to.
             */
            function MarkedPlugin(renderer) {
                var _this = this;
                _super.call(this, renderer);
                /**
                 * The pattern used to find references in markdown.
                 */
                this.includePattern = /\[\[include:([^\]]+?)\]\]/g;
                /**
                 * The pattern used to find media links.
                 */
                this.mediaPattern = /media:\/\/([^ "\)\]\}]+)/g;
                renderer.on(MarkedPlugin.EVENT_PARSE_MARKDOWN, this.onParseMarkdown, this);
                var that = this;
                td.Handlebars.registerHelper('markdown', function (arg) { return that.parseMarkdown(arg.fn(this), this); });
                td.Handlebars.registerHelper('compact', function (arg) { return that.getCompact(arg.fn(this)); });
                td.Handlebars.registerHelper('relativeURL', function (url) { return _this.getRelativeUrl(url); });
                td.Handlebars.registerHelper('wbr', function (str) { return _this.getWordBreaks(str); });
                td.Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) { return that.getIfCond(v1, operator, v2, options, this); });
                td.Handlebars.registerHelper('ifSignature', function (obj, arg) { return obj instanceof td.models.SignatureReflection ? arg.fn(this) : arg.inverse(this); });
                td.Marked.setOptions({
                    highlight: function (text, lang) { return _this.getHighlighted(text, lang); }
                });
            }
            MarkedPlugin.prototype.getParameters = function () {
                return [{
                        name: 'includes',
                        help: 'Specifies the location to look for included documents (use [[include:FILENAME]] in comments).',
                        hint: td.ParameterHint.Directory
                    }, {
                        name: 'media',
                        help: 'Specifies the location with media files that should be copied to the output directory.',
                        hint: td.ParameterHint.Directory
                    }];
            };
            /**
             * Compress the given string by removing all newlines.
             *
             * @param text  The string that should be compressed.
             * @returns The string with all newlsines stripped.
             */
            MarkedPlugin.prototype.getCompact = function (text) {
                var lines = text.split('\n');
                for (var i = 0, c = lines.length; i < c; i++) {
                    lines[i] = lines[i].trim().replace(/&nbsp;/, ' ');
                }
                return lines.join('');
            };
            /**
             * Insert word break tags ``<wbr>`` into the given string.
             *
             * Breaks the given string at ``_``, ``-`` and captial letters.
             *
             * @param str  The string that should be split.
             * @return     The original string containing ``<wbr>`` tags where possible.
             */
            MarkedPlugin.prototype.getWordBreaks = function (str) {
                str = str.replace(/([^_\-][_\-])([^_\-])/g, function (m, a, b) { return a + '<wbr>' + b; });
                str = str.replace(/([^A-Z])([A-Z][^A-Z])/g, function (m, a, b) { return a + '<wbr>' + b; });
                return str;
            };
            /**
             * Highlight the synatx of the given text using HighlightJS.
             *
             * @param text  The text taht should be highlightes.
             * @param lang  The language that should be used to highlight the string.
             * @return A html string with syntax highlighting.
             */
            MarkedPlugin.prototype.getHighlighted = function (text, lang) {
                try {
                    if (lang) {
                        return td.HighlightJS.highlight(lang, text).value;
                    }
                    else {
                        return td.HighlightJS.highlightAuto(text).value;
                    }
                }
                catch (error) {
                    this.renderer.application.logger.warn(error.message);
                    return text;
                }
            };
            /**
             * Handlebars if helper with condition.
             *
             * @param v1        The first value to be compared.
             * @param operator  The operand to perform on the two given values.
             * @param v2        The second value to be compared
             * @param options   The current handlebars object.
             * @param context   The current handlebars context.
             * @returns {*}
             */
            MarkedPlugin.prototype.getIfCond = function (v1, operator, v2, options, context) {
                switch (operator) {
                    case '==':
                        return (v1 == v2) ? options.fn(context) : options.inverse(context);
                    case '===':
                        return (v1 === v2) ? options.fn(context) : options.inverse(context);
                    case '<':
                        return (v1 < v2) ? options.fn(context) : options.inverse(context);
                    case '<=':
                        return (v1 <= v2) ? options.fn(context) : options.inverse(context);
                    case '>':
                        return (v1 > v2) ? options.fn(context) : options.inverse(context);
                    case '>=':
                        return (v1 >= v2) ? options.fn(context) : options.inverse(context);
                    case '&&':
                        return (v1 && v2) ? options.fn(context) : options.inverse(context);
                    case '||':
                        return (v1 || v2) ? options.fn(context) : options.inverse(context);
                    default:
                        return options.inverse(context);
                }
            };
            /**
             * Parse the given markdown string and return the resulting html.
             *
             * @param text  The markdown string that should be parsed.
             * @param context  The current handlebars context.
             * @returns The resulting html string.
             */
            MarkedPlugin.prototype.parseMarkdown = function (text, context) {
                var _this = this;
                if (this.includes) {
                    text = text.replace(this.includePattern, function (match, path) {
                        path = td.Path.join(_this.includes, path.trim());
                        if (td.FS.existsSync(path) && td.FS.statSync(path).isFile()) {
                            var contents = td.FS.readFileSync(path, 'utf-8');
                            if (path.substr(-4).toLocaleLowerCase() == '.hbs') {
                                var template = td.Handlebars.compile(contents);
                                return template(context);
                            }
                            else {
                                return contents;
                            }
                        }
                        else {
                            return '';
                        }
                    });
                }
                if (this.mediaDirectory) {
                    text = text.replace(this.mediaPattern, function (match, path) {
                        if (td.FS.existsSync(td.Path.join(_this.mediaDirectory, path))) {
                            return _this.getRelativeUrl('media') + '/' + path;
                        }
                        else {
                            return match;
                        }
                    });
                }
                var event = new output.MarkdownEvent();
                event.originalText = text;
                event.parsedText = text;
                this.renderer.dispatch(MarkedPlugin.EVENT_PARSE_MARKDOWN, event);
                return event.parsedText;
            };
            /**
             * Triggered before the renderer starts rendering a project.
             *
             * @param event  An event object describing the current render operation.
             */
            MarkedPlugin.prototype.onRendererBegin = function (event) {
                _super.prototype.onRendererBegin.call(this, event);
                delete this.includes;
                if (event.settings.includes) {
                    var includes = td.Path.resolve(event.settings.includes);
                    if (td.FS.existsSync(includes) && td.FS.statSync(includes).isDirectory()) {
                        this.includes = includes;
                    }
                    else {
                        this.renderer.application.logger.warn('Could not find provided includes directory: ' + includes);
                    }
                }
                if (event.settings.media) {
                    var media = td.Path.resolve(event.settings.media);
                    if (td.FS.existsSync(media) && td.FS.statSync(media).isDirectory()) {
                        this.mediaDirectory = td.Path.join(event.outputDirectory, 'media');
                        td.FS.copySync(media, this.mediaDirectory);
                    }
                    else {
                        this.mediaDirectory = null;
                        this.renderer.application.logger.warn('Could not find provided includes directory: ' + includes);
                    }
                }
            };
            /**
             * Triggered when [[MarkedPlugin]] parses a markdown string.
             *
             * @param event
             */
            MarkedPlugin.prototype.onParseMarkdown = function (event) {
                event.parsedText = td.Marked(event.parsedText);
            };
            /**
             * Triggered on the renderer when this plugin parses a markdown string.
             * @event
             */
            MarkedPlugin.EVENT_PARSE_MARKDOWN = 'parseMarkdown';
            return MarkedPlugin;
        })(output.ContextAwareRendererPlugin);
        output.MarkedPlugin = MarkedPlugin;
        /**
         * Register this plugin.
         */
        output.Renderer.registerPlugin('marked', MarkedPlugin);
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * A plugin that exposes the navigation structure of the documentation
         * to the rendered templates.
         *
         * The navigation structure is generated using the current themes
         * [[BaseTheme.getNavigation]] function. This plugins takes care that the navigation
         * is updated and passed to the render context.
         */
        var NavigationPlugin = (function (_super) {
            __extends(NavigationPlugin, _super);
            /**
             * Create a new NavigationPlugin instance.
             *
             * @param renderer  The renderer this plugin should be attached to.
             */
            function NavigationPlugin(renderer) {
                _super.call(this, renderer);
                renderer.on(output.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
                renderer.on(output.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
            }
            /**
             * Triggered before the renderer starts rendering a project.
             *
             * @param event  An event object describing the current render operation.
             */
            NavigationPlugin.prototype.onRendererBegin = function (event) {
                this.navigation = this.renderer.theme.getNavigation(event.project);
            };
            /**
             * Triggered before a document will be rendered.
             *
             * @param page  An event object describing the current render operation.
             */
            NavigationPlugin.prototype.onRendererBeginPage = function (page) {
                var currentItems = [];
                (function updateItem(item) {
                    item.isCurrent = false;
                    item.isInPath = false;
                    item.isVisible = item.isGlobals;
                    if (item.url == page.url || (item.dedicatedUrls && item.dedicatedUrls.indexOf(page.url) != -1)) {
                        currentItems.push(item);
                    }
                    if (item.children) {
                        item.children.forEach(function (child) { return updateItem(child); });
                    }
                })(this.navigation);
                currentItems.forEach(function (item) {
                    item.isCurrent = true;
                    var depth = item.isGlobals ? -1 : 0;
                    var count = 1;
                    while (item) {
                        item.isInPath = true;
                        item.isVisible = true;
                        count += 1;
                        depth += 1;
                        if (item.children) {
                            count += item.children.length;
                            if (depth < 2 || count < 30) {
                                item.children.forEach(function (child) {
                                    child.isVisible = true;
                                });
                            }
                        }
                        item = item.parent;
                    }
                });
                page.navigation = this.navigation;
            };
            return NavigationPlugin;
        })(output.RendererPlugin);
        output.NavigationPlugin = NavigationPlugin;
        /**
         * Register this plugin.
         */
        output.Renderer.registerPlugin('navigation', NavigationPlugin);
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * A plugin that loads all partials of the current theme.
         *
         * Partials must be placed in the ´partials´ subdirectory of the theme. The plugin first
         * loads the partials of the default theme and then the partials of the current theme.
         */
        var PartialsPlugin = (function (_super) {
            __extends(PartialsPlugin, _super);
            /**
             * Create a new PartialsPlugin instance.
             *
             * @param renderer  The renderer this plugin should be attached to.
             */
            function PartialsPlugin(renderer) {
                _super.call(this, renderer);
                renderer.on(output.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
            }
            /**
             * Load all files in the given directory and registers them as partials.
             *
             * @param path  The path of the directory that should be scanned.
             */
            PartialsPlugin.prototype.loadPartials = function (path) {
                if (!td.FS.existsSync(path) || !td.FS.statSync(path).isDirectory()) {
                    return;
                }
                td.FS.readdirSync(path).forEach(function (fileName) {
                    var file = td.Path.join(path, fileName);
                    var name = td.Path.basename(fileName, td.Path.extname(fileName));
                    td.Handlebars.registerPartial(name, output.Renderer.readFile(file));
                });
            };
            /**
             * Triggered before the renderer starts rendering a project.
             *
             * @param event  An event object describing the current render operation.
             */
            PartialsPlugin.prototype.onRendererBegin = function (event) {
                var themePath = td.Path.join(this.renderer.theme.basePath, 'partials');
                var defaultPath = td.Path.join(output.Renderer.getDefaultTheme(), 'partials');
                if (themePath != defaultPath) {
                    this.loadPartials(defaultPath);
                }
                this.loadPartials(themePath);
            };
            return PartialsPlugin;
        })(output.RendererPlugin);
        output.PartialsPlugin = PartialsPlugin;
        /**
         * Register this plugin.
         */
        output.Renderer.registerPlugin('partials', PartialsPlugin);
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * List of states the parser of [[PrettyPrintPlugin]] can be in.
         */
        var PrettyPrintState;
        (function (PrettyPrintState) {
            /**
             * Default state of the parser. Empty lines will be removed and indention will be adjusted.
             */
            PrettyPrintState[PrettyPrintState["Default"] = 0] = "Default";
            /**
             * Comment state, the parser waits for a comment closing tag.
             */
            PrettyPrintState[PrettyPrintState["Comment"] = 1] = "Comment";
            /**
             * Pre state, the parser waits for the closing tag of the current pre block.
             */
            PrettyPrintState[PrettyPrintState["Pre"] = 2] = "Pre";
        })(PrettyPrintState || (PrettyPrintState = {}));
        /**
         * A plugin that pretty prints the generated html.
         *
         * This not only aids in making the generated html source code more readable, by removing
         * blank lines and unnecessary whitespaces the size of the documentation is reduced without
         * visual impact.
         *
         * At the point writing this the docs of TypeDoc took 97.8 MB  without and 66.4 MB with this
         * plugin enabled, so it reduced the size to 68% of the original output.
         */
        var PrettyPrintPlugin = (function (_super) {
            __extends(PrettyPrintPlugin, _super);
            /**
             * Create a new PrettyPrintPlugin instance.
             *
             * @param renderer  The renderer this plugin should be attached to.
             */
            function PrettyPrintPlugin(renderer) {
                _super.call(this, renderer);
                renderer.on(output.Renderer.EVENT_END_PAGE, this.onRendererEndPage, this, -1024);
            }
            /**
             * Triggered after a document has been rendered, just before it is written to disc.
             *
             * @param event
             */
            PrettyPrintPlugin.prototype.onRendererEndPage = function (event) {
                var match, line, lineState, lineDepth, tagName, preName;
                var tagExp = /<\s*(\w+)[^>]*>|<\/\s*(\w+)[^>]*>|<!--|-->/g;
                var emptyLineExp = /^[\s]*$/;
                var minLineDepth = 1;
                var state = PrettyPrintState.Default;
                var stack = [];
                var lines = event.contents.split(/\r\n?|\n/);
                var index = 0;
                var count = lines.length;
                while (index < count) {
                    line = lines[index];
                    if (emptyLineExp.test(line)) {
                        if (state == PrettyPrintState.Default) {
                            lines.splice(index, 1);
                            count -= 1;
                            continue;
                        }
                    }
                    else {
                        lineState = state;
                        lineDepth = stack.length;
                        while (match = tagExp.exec(line)) {
                            if (state == PrettyPrintState.Comment) {
                                if (match[0] == '-->') {
                                    state = PrettyPrintState.Default;
                                }
                            }
                            else if (state == PrettyPrintState.Pre) {
                                if (match[2] && match[2].toLowerCase() == preName) {
                                    state = PrettyPrintState.Default;
                                }
                            }
                            else {
                                if (match[0] == '<!--') {
                                    state = PrettyPrintState.Comment;
                                }
                                else if (match[1]) {
                                    tagName = match[1].toLowerCase();
                                    if (tagName in PrettyPrintPlugin.IGNORED_TAGS)
                                        continue;
                                    if (tagName in PrettyPrintPlugin.PRE_TAGS) {
                                        state = PrettyPrintState.Pre;
                                        preName = tagName;
                                    }
                                    else {
                                        if (tagName == 'body')
                                            minLineDepth = 2;
                                        stack.push(tagName);
                                    }
                                }
                                else if (match[2]) {
                                    tagName = match[2].toLowerCase();
                                    if (tagName in PrettyPrintPlugin.IGNORED_TAGS)
                                        continue;
                                    var n = stack.lastIndexOf(tagName);
                                    if (n != -1) {
                                        stack.length = n;
                                    }
                                }
                            }
                        }
                        if (lineState == PrettyPrintState.Default) {
                            lineDepth = Math.min(lineDepth, stack.length);
                            line = line.replace(/^\s+/, '').replace(/\s+$/, '');
                            if (lineDepth > minLineDepth) {
                                line = Array(lineDepth - minLineDepth + 1).join('\t') + line;
                            }
                            lines[index] = line;
                        }
                    }
                    index++;
                }
                event.contents = lines.join('\n');
            };
            /**
             * Map of all tags that will be ignored.
             */
            PrettyPrintPlugin.IGNORED_TAGS = {
                area: true,
                base: true,
                br: true,
                wbr: true,
                col: true,
                command: true,
                embed: true,
                hr: true,
                img: true,
                input: true,
                link: true,
                meta: true,
                param: true,
                source: true
            };
            /**
             * Map of all tags that prevent this plugin form modifying the following code.
             */
            PrettyPrintPlugin.PRE_TAGS = {
                pre: true,
                code: true,
                textarea: true,
                script: true,
                style: true
            };
            return PrettyPrintPlugin;
        })(output.RendererPlugin);
        output.PrettyPrintPlugin = PrettyPrintPlugin;
        /**
         * Register this plugin.
         */
        output.Renderer.registerPlugin('prettyPrint', PrettyPrintPlugin);
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * A plugin that generates a table of contents for the current page.
         *
         * The table of contents will start at the nearest module or dynamic module. This plugin
         * sets the [[OutputPageEvent.toc]] property.
         */
        var TocPlugin = (function (_super) {
            __extends(TocPlugin, _super);
            /**
             * Create a new TocPlugin instance.
             *
             * @param renderer  The renderer this plugin should be attached to.
             */
            function TocPlugin(renderer) {
                _super.call(this, renderer);
                renderer.on(output.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
            }
            /**
             * Triggered before a document will be rendered.
             *
             * @param page  An event object describing the current render operation.
             */
            TocPlugin.prototype.onRendererBeginPage = function (page) {
                var model = page.model;
                if (!(model instanceof td.models.Reflection)) {
                    return;
                }
                var trail = [];
                while (!(model instanceof td.models.ProjectReflection) && !model.kindOf(td.models.ReflectionKind.SomeModule)) {
                    trail.unshift(model);
                    model = model.parent;
                }
                page.toc = new output.NavigationItem();
                TocPlugin.buildToc(model, trail, page.toc);
            };
            /**
             * Create a toc navigation item structure.
             *
             * @param model   The models whose children should be written to the toc.
             * @param trail   Defines the active trail of expanded toc entries.
             * @param parent  The parent [[NavigationItem]] the toc should be appended to.
             */
            TocPlugin.buildToc = function (model, trail, parent) {
                var index = trail.indexOf(model);
                var children = model['children'] || [];
                if (index < trail.length - 1 && children.length > 40) {
                    var child = trail[index + 1];
                    var item = output.NavigationItem.create(child, parent, true);
                    item.isInPath = true;
                    item.isCurrent = false;
                    TocPlugin.buildToc(child, trail, item);
                }
                else {
                    children.forEach(function (child) {
                        if (child.kindOf(td.models.ReflectionKind.SomeModule)) {
                            return;
                        }
                        var item = output.NavigationItem.create(child, parent, true);
                        if (trail.indexOf(child) != -1) {
                            item.isInPath = true;
                            item.isCurrent = (trail[trail.length - 1] == child);
                            TocPlugin.buildToc(child, trail, item);
                        }
                    });
                }
            };
            return TocPlugin;
        })(output.RendererPlugin);
        output.TocPlugin = TocPlugin;
        /**
         * Register this plugin.
         */
        output.Renderer.registerPlugin('toc', TocPlugin);
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        /**
         * Default theme implementation of TypeDoc. If a theme does not provide a custom
         * [[BaseTheme]] implementation, this theme class will be used.
         */
        var DefaultTheme = (function (_super) {
            __extends(DefaultTheme, _super);
            /**
             * Create a new DefaultTheme instance.
             *
             * @param renderer  The renderer this theme is attached to.
             * @param basePath  The base path of this theme.
             */
            function DefaultTheme(renderer, basePath) {
                _super.call(this, renderer, basePath);
                renderer.on(output.Renderer.EVENT_BEGIN, this.onRendererBegin, this, 1024);
            }
            /**
             * Test whether the given path contains a documentation generated by this theme.
             *
             * @param path  The path of the directory that should be tested.
             * @returns     TRUE if the given path seems to be a previous output directory,
             *              otherwise FALSE.
             */
            DefaultTheme.prototype.isOutputDirectory = function (path) {
                if (!td.FS.existsSync(td.Path.join(path, 'index.html')))
                    return false;
                if (!td.FS.existsSync(td.Path.join(path, 'assets')))
                    return false;
                if (!td.FS.existsSync(td.Path.join(path, 'assets', 'js', 'main.js')))
                    return false;
                if (!td.FS.existsSync(td.Path.join(path, 'assets', 'images', 'icons.png')))
                    return false;
                return true;
            };
            DefaultTheme.prototype.getParameters = function () {
                return [{
                        name: 'gaID',
                        help: 'Set the Google Analytics tracking ID and activate tracking code.'
                    }, {
                        name: 'gaSite',
                        help: 'Set the site name for Google Analytics. Defaults to `auto`.',
                        defaultValue: 'auto'
                    }, {
                        name: 'hideGenerator',
                        help: 'Do not print the TypeDoc link at the end of the page.',
                        type: td.ParameterType.Boolean
                    }, {
                        name: 'entryPoint',
                        help: 'Specifies the fully qualified name of the root symbol. Defaults to global namespace.',
                        type: td.ParameterType.String
                    }];
            };
            /**
             * Map the models of the given project to the desired output files.
             *
             * @param project  The project whose urls should be generated.
             * @returns        A list of [[UrlMapping]] instances defining which models
             *                 should be rendered to which files.
             */
            DefaultTheme.prototype.getUrls = function (project) {
                var urls = [];
                var entryPoint = this.getEntryPoint(project);
                if (this.renderer.application.options.readme == 'none') {
                    entryPoint.url = 'index.html';
                    urls.push(new output.UrlMapping('index.html', entryPoint, 'reflection.hbs'));
                }
                else {
                    entryPoint.url = 'globals.html';
                    urls.push(new output.UrlMapping('globals.html', entryPoint, 'reflection.hbs'));
                    urls.push(new output.UrlMapping('index.html', project, 'index.hbs'));
                }
                if (entryPoint.children) {
                    entryPoint.children.forEach(function (child) {
                        DefaultTheme.buildUrls(child, urls);
                    });
                }
                return urls;
            };
            /**
             * Return the entry point of the documentation.
             *
             * @param project  The current project.
             * @returns The reflection that should be used as the entry point.
             */
            DefaultTheme.prototype.getEntryPoint = function (project) {
                var entryPoint = this.renderer.application.options.entryPoint;
                if (entryPoint) {
                    var reflection = project.getChildByName(entryPoint);
                    if (reflection) {
                        if (reflection instanceof td.models.ContainerReflection) {
                            return reflection;
                        }
                        else {
                            this.renderer.application.logger.warn('The given entry point `%s` is not a container.', entryPoint);
                        }
                    }
                    else {
                        this.renderer.application.logger.warn('The entry point `%s` could not be found.', entryPoint);
                    }
                }
                return project;
            };
            /**
             * Create a navigation structure for the given project.
             *
             * @param project  The project whose navigation should be generated.
             * @returns        The root navigation item.
             */
            DefaultTheme.prototype.getNavigation = function (project) {
                /**
                 * Test whether the given list of modules contains an external module.
                 *
                 * @param modules  The list of modules to test.
                 * @returns        TRUE if any of the modules is marked as being external.
                 */
                function containsExternals(modules) {
                    for (var index = 0, length = modules.length; index < length; index++) {
                        if (modules[index].flags.isExternal)
                            return true;
                    }
                    return false;
                }
                /**
                 * Sort the given list of modules by name, groups external modules at the bottom.
                 *
                 * @param modules  The list of modules that should be sorted.
                 */
                function sortReflections(modules) {
                    modules.sort(function (a, b) {
                        if (a.flags.isExternal && !b.flags.isExternal)
                            return 1;
                        if (!a.flags.isExternal && b.flags.isExternal)
                            return -1;
                        return a.getFullName() < b.getFullName() ? -1 : 1;
                    });
                }
                /**
                 * Find the urls of all children of the given reflection and store them as dedicated urls
                 * of the given NavigationItem.
                 *
                 * @param reflection  The reflection whose children urls should be included.
                 * @param item        The navigation node whose dedicated urls should be set.
                 */
                function includeDedicatedUrls(reflection, item) {
                    (function walk(reflection) {
                        for (var key in reflection.children) {
                            var child = reflection.children[key];
                            if (child.hasOwnDocument && !child.kindOf(td.models.ReflectionKind.SomeModule)) {
                                if (!item.dedicatedUrls)
                                    item.dedicatedUrls = [];
                                item.dedicatedUrls.push(child.url);
                                walk(child);
                            }
                        }
                    })(reflection);
                }
                /**
                 * Create navigation nodes for all container children of the given reflection.
                 *
                 * @param reflection  The reflection whose children modules should be transformed into navigation nodes.
                 * @param parent      The parent NavigationItem of the newly created nodes.
                 */
                function buildChildren(reflection, parent) {
                    var modules = reflection.getChildrenByKind(td.models.ReflectionKind.SomeModule);
                    modules.sort(function (a, b) {
                        return a.getFullName() < b.getFullName() ? -1 : 1;
                    });
                    modules.forEach(function (reflection) {
                        var item = output.NavigationItem.create(reflection, parent);
                        includeDedicatedUrls(reflection, item);
                        buildChildren(reflection, item);
                    });
                }
                /**
                 * Create navigation nodes for the given list of reflections. The resulting nodes will be grouped into
                 * an "internal" and an "external" section when applicable.
                 *
                 * @param reflections  The list of reflections which should be transformed into navigation nodes.
                 * @param parent       The parent NavigationItem of the newly created nodes.
                 * @param callback     Optional callback invoked for each generated node.
                 */
                function buildGroups(reflections, parent, callback) {
                    var state = -1;
                    var hasExternals = containsExternals(reflections);
                    sortReflections(reflections);
                    reflections.forEach(function (reflection) {
                        if (hasExternals && !reflection.flags.isExternal && state != 1) {
                            new output.NavigationItem('Internals', null, parent, "tsd-is-external");
                            state = 1;
                        }
                        else if (hasExternals && reflection.flags.isExternal && state != 2) {
                            new output.NavigationItem('Externals', null, parent, "tsd-is-external");
                            state = 2;
                        }
                        var item = output.NavigationItem.create(reflection, parent);
                        includeDedicatedUrls(reflection, item);
                        if (callback)
                            callback(reflection, item);
                    });
                }
                /**
                 * Build the navigation structure.
                 *
                 * @param hasSeparateGlobals  Has the project a separated globals.html file?
                 * @return                    The root node of the generated navigation structure.
                 */
                function build(hasSeparateGlobals) {
                    var root = new output.NavigationItem('Index', 'index.html');
                    if (entryPoint == project) {
                        var globals = new output.NavigationItem('Globals', hasSeparateGlobals ? 'globals.html' : 'index.html', root);
                        globals.isGlobals = true;
                    }
                    var modules = [];
                    project.getReflectionsByKind(td.models.ReflectionKind.SomeModule).forEach(function (someModule) {
                        var target = someModule.parent;
                        var inScope = (someModule == entryPoint);
                        while (target) {
                            if (target.kindOf(td.models.ReflectionKind.ExternalModule))
                                return;
                            if (entryPoint == target)
                                inScope = true;
                            target = target.parent;
                        }
                        if (inScope) {
                            modules.push(someModule);
                        }
                    });
                    if (modules.length < 10) {
                        buildGroups(modules, root);
                    }
                    else {
                        buildGroups(entryPoint.getChildrenByKind(td.models.ReflectionKind.SomeModule), root, buildChildren);
                    }
                    return root;
                }
                var entryPoint = this.getEntryPoint(project);
                return build(this.renderer.application.options.readme != 'none');
            };
            /**
             * Triggered before the renderer starts rendering a project.
             *
             * @param event  An event object describing the current render operation.
             */
            DefaultTheme.prototype.onRendererBegin = function (event) {
                if (event.project.groups) {
                    event.project.groups.forEach(DefaultTheme.applyGroupClasses);
                }
                for (var id in event.project.reflections) {
                    var reflection = event.project.reflections[id];
                    if (reflection instanceof td.models.DeclarationReflection) {
                        DefaultTheme.applyReflectionClasses(reflection);
                    }
                    if (reflection instanceof td.models.ContainerReflection && reflection['groups']) {
                        reflection['groups'].forEach(DefaultTheme.applyGroupClasses);
                    }
                }
            };
            /**
             * Return a url for the given reflection.
             *
             * @param reflection  The reflection the url should be generated for.
             * @param relative    The parent reflection the url generation should stop on.
             * @param separator   The separator used to generate the url.
             * @returns           The generated url.
             */
            DefaultTheme.getUrl = function (reflection, relative, separator) {
                if (separator === void 0) { separator = '.'; }
                var url = reflection.getAlias();
                if (reflection.parent && reflection.parent != relative &&
                    !(reflection.parent instanceof td.models.ProjectReflection))
                    url = DefaultTheme.getUrl(reflection.parent, relative, separator) + separator + url;
                return url;
            };
            /**
             * Return the template mapping fore the given reflection.
             *
             * @param reflection  The reflection whose mapping should be resolved.
             * @returns           The found mapping or NULL if no mapping could be found.
             */
            DefaultTheme.getMapping = function (reflection) {
                for (var i = 0, c = DefaultTheme.MAPPINGS.length; i < c; i++) {
                    var mapping = DefaultTheme.MAPPINGS[i];
                    if (reflection.kindOf(mapping.kind)) {
                        return mapping;
                    }
                }
                return null;
            };
            /**
             * Build the url for the the given reflection and all of its children.
             *
             * @param reflection  The reflection the url should be created for.
             * @param urls        The array the url should be appended to.
             * @returns           The altered urls array.
             */
            DefaultTheme.buildUrls = function (reflection, urls) {
                var mapping = DefaultTheme.getMapping(reflection);
                if (mapping) {
                    var url = td.Path.join(mapping.directory, DefaultTheme.getUrl(reflection) + '.html');
                    urls.push(new output.UrlMapping(url, reflection, mapping.template));
                    reflection.url = url;
                    reflection.hasOwnDocument = true;
                    for (var key in reflection.children) {
                        var child = reflection.children[key];
                        if (mapping.isLeaf) {
                            DefaultTheme.applyAnchorUrl(child, reflection);
                        }
                        else {
                            DefaultTheme.buildUrls(child, urls);
                        }
                    }
                }
                else {
                    DefaultTheme.applyAnchorUrl(reflection, reflection.parent);
                }
                return urls;
            };
            /**
             * Generate an anchor url for the given reflection and all of its children.
             *
             * @param reflection  The reflection an anchor url should be created for.
             * @param container   The nearest reflection having an own document.
             */
            DefaultTheme.applyAnchorUrl = function (reflection, container) {
                var anchor = DefaultTheme.getUrl(reflection, container, '.');
                if (reflection['isStatic']) {
                    anchor = 'static-' + anchor;
                }
                reflection.url = container.url + '#' + anchor;
                reflection.anchor = anchor;
                reflection.hasOwnDocument = false;
                reflection.traverse(function (child) {
                    if (child instanceof td.models.DeclarationReflection) {
                        DefaultTheme.applyAnchorUrl(child, container);
                    }
                });
            };
            /**
             * Generate the css classes for the given reflection and apply them to the
             * [[DeclarationReflection.cssClasses]] property.
             *
             * @param reflection  The reflection whose cssClasses property should be generated.
             */
            DefaultTheme.applyReflectionClasses = function (reflection) {
                var classes = [];
                if (reflection.kind == td.models.ReflectionKind.Accessor) {
                    if (!reflection.getSignature) {
                        classes.push('tsd-kind-set-signature');
                    }
                    else if (!reflection.setSignature) {
                        classes.push('tsd-kind-get-signature');
                    }
                    else {
                        classes.push('tsd-kind-accessor');
                    }
                }
                else {
                    var kind = td.models.ReflectionKind[reflection.kind];
                    classes.push(DefaultTheme.toStyleClass('tsd-kind-' + kind));
                }
                if (reflection.parent && reflection.parent instanceof td.models.DeclarationReflection) {
                    kind = td.models.ReflectionKind[reflection.parent.kind];
                    classes.push(DefaultTheme.toStyleClass('tsd-parent-kind-' + kind));
                }
                var hasTypeParameters = !!reflection.typeParameters;
                reflection.getAllSignatures().forEach(function (signature) {
                    hasTypeParameters = hasTypeParameters || !!signature.typeParameters;
                });
                if (hasTypeParameters)
                    classes.push('tsd-has-type-parameter');
                if (reflection.overwrites)
                    classes.push('tsd-is-overwrite');
                if (reflection.inheritedFrom)
                    classes.push('tsd-is-inherited');
                if (reflection.flags.isPrivate)
                    classes.push('tsd-is-private');
                if (reflection.flags.isProtected)
                    classes.push('tsd-is-protected');
                if (reflection.flags.isStatic)
                    classes.push('tsd-is-static');
                if (reflection.flags.isExternal)
                    classes.push('tsd-is-external');
                if (!reflection.flags.isExported)
                    classes.push('tsd-is-not-exported');
                reflection.cssClasses = classes.join(' ');
            };
            /**
             * Generate the css classes for the given reflection group and apply them to the
             * [[ReflectionGroup.cssClasses]] property.
             *
             * @param group  The reflection group whose cssClasses property should be generated.
             */
            DefaultTheme.applyGroupClasses = function (group) {
                var classes = [];
                if (group.allChildrenAreInherited)
                    classes.push('tsd-is-inherited');
                if (group.allChildrenArePrivate)
                    classes.push('tsd-is-private');
                if (group.allChildrenAreProtectedOrPrivate)
                    classes.push('tsd-is-private-protected');
                if (group.allChildrenAreExternal)
                    classes.push('tsd-is-external');
                if (!group.someChildrenAreExported)
                    classes.push('tsd-is-not-exported');
                group.cssClasses = classes.join(' ');
            };
            /**
             * Transform a space separated string into a string suitable to be used as a
             * css class, e.g. "constructor method" > "Constructor-method".
             */
            DefaultTheme.toStyleClass = function (str) {
                return str.replace(/(\w)([A-Z])/g, function (m, m1, m2) { return m1 + '-' + m2; }).toLowerCase();
            };
            /**
             * Mappings of reflections kinds to templates used by this theme.
             */
            DefaultTheme.MAPPINGS = [{
                    kind: [td.models.ReflectionKind.Class],
                    isLeaf: false,
                    directory: 'classes',
                    template: 'reflection.hbs'
                }, {
                    kind: [td.models.ReflectionKind.Interface],
                    isLeaf: false,
                    directory: 'interfaces',
                    template: 'reflection.hbs'
                }, {
                    kind: [td.models.ReflectionKind.Enum],
                    isLeaf: false,
                    directory: 'enums',
                    template: 'reflection.hbs'
                }, {
                    kind: [td.models.ReflectionKind.Module, td.models.ReflectionKind.ExternalModule],
                    isLeaf: false,
                    directory: 'modules',
                    template: 'reflection.hbs'
                }];
            return DefaultTheme;
        })(output.Theme);
        output.DefaultTheme = DefaultTheme;
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
var td;
(function (td) {
    var output;
    (function (output) {
        var MinimalTheme = (function (_super) {
            __extends(MinimalTheme, _super);
            /**
             * Create a new DefaultTheme instance.
             *
             * @param renderer  The renderer this theme is attached to.
             * @param basePath  The base path of this theme.
             */
            function MinimalTheme(renderer, basePath) {
                _super.call(this, renderer, basePath);
                renderer.removePlugin('assets');
                renderer.removePlugin('javascriptIndex');
                renderer.removePlugin('navigation');
                renderer.removePlugin('toc');
                renderer.on(output.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
            }
            /**
             * Test whether the given path contains a documentation generated by this theme.
             *
             * @param path  The path of the directory that should be tested.
             * @returns     TRUE if the given path seems to be a previous output directory,
             *              otherwise FALSE.
             */
            MinimalTheme.prototype.isOutputDirectory = function (path) {
                if (!td.FS.existsSync(td.Path.join(path, 'index.html')))
                    return false;
                return true;
            };
            /**
             * Map the models of the given project to the desired output files.
             *
             * @param project  The project whose urls should be generated.
             * @returns        A list of [[UrlMapping]] instances defining which models
             *                 should be rendered to which files.
             */
            MinimalTheme.prototype.getUrls = function (project) {
                var urls = [];
                urls.push(new output.UrlMapping('index.html', project, 'index.hbs'));
                project.url = 'index.html';
                project.anchor = null;
                project.hasOwnDocument = true;
                project.children.forEach(function (child) {
                    output.DefaultTheme.applyAnchorUrl(child, project);
                });
                return urls;
            };
            /**
             * Triggered before a document will be rendered.
             *
             * @param page  An event object describing the current render operation.
             */
            MinimalTheme.prototype.onRendererBeginPage = function (page) {
                var model = page.model;
                if (!(model instanceof td.models.Reflection)) {
                    return;
                }
                page.toc = new output.NavigationItem();
                MinimalTheme.buildToc(page.model, page.toc);
            };
            /**
             * Create a toc navigation item structure.
             *
             * @param model   The models whose children should be written to the toc.
             * @param parent  The parent [[Models.NavigationItem]] the toc should be appended to.
             */
            MinimalTheme.buildToc = function (model, parent) {
                var children = model.children || [];
                children.forEach(function (child) {
                    var item = output.NavigationItem.create(child, parent, true);
                    MinimalTheme.buildToc(child, item);
                });
            };
            return MinimalTheme;
        })(output.DefaultTheme);
        output.MinimalTheme = MinimalTheme;
    })(output = td.output || (td.output = {}));
})(td || (td = {}));
module.exports = td;
