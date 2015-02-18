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
    (function (OptionScope) {
        OptionScope[OptionScope["TypeDoc"] = 0] = "TypeDoc";
        OptionScope[OptionScope["TypeScript"] = 1] = "TypeScript";
    })(td.OptionScope || (td.OptionScope = {}));
    var OptionScope = td.OptionScope;
    td.ignoredTypeScriptOptions = [
        'out',
        'outDir',
        'version',
        'help',
        'watch',
        'declaration',
        'mapRoot',
        'sourceMap',
        'removeComments'
    ];
    (function (SourceFileMode) {
        SourceFileMode[SourceFileMode["File"] = 0] = "File";
        SourceFileMode[SourceFileMode["Modules"] = 1] = "Modules";
    })(td.SourceFileMode || (td.SourceFileMode = {}));
    var SourceFileMode = td.SourceFileMode;
    /**
     * Modify ts.optionDeclarations to match TypeDoc requirements.
     */
    td.optionDeclarations = [{
        name: "out",
        type: "string",
        scope: 0 /* TypeDoc */,
        paramType: ts.Diagnostics.DIRECTORY,
        description: {
            key: 'Specifies the location the documentation should be written to.',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "mode",
        type: {
            'file': 0 /* File */,
            'modules': 1 /* Modules */
        },
        scope: 0 /* TypeDoc */,
        description: {
            key: "Specifies the output mode the project is used to be compiled with: 'file' or 'modules'",
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "json",
        type: "string",
        scope: 0 /* TypeDoc */,
        paramType: ts.Diagnostics.FILE,
        description: {
            key: 'Specifies the location and file name a json file describing the project is written to.',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "theme",
        type: "string",
        scope: 0 /* TypeDoc */,
        description: {
            key: "Specify the path to the theme that should be used or 'default' or 'minimal' to use built-in themes.",
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "exclude",
        type: "string",
        scope: 0 /* TypeDoc */,
        description: {
            key: 'Define a pattern for excluded files when specifying paths.',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "includeDeclarations",
        type: "boolean",
        scope: 0 /* TypeDoc */,
        description: {
            key: 'Turn on parsing of .d.ts declaration files.',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "externalPattern",
        type: "string",
        scope: 0 /* TypeDoc */,
        description: {
            key: 'Define a pattern for files that should be considered being external.',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "readme",
        type: "string",
        scope: 0 /* TypeDoc */,
        description: {
            key: 'Path to the readme file that should be displayed on the index page. Pass `none` to disable the index page and start the documentation on the globals page.',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "excludeExternals",
        type: "boolean",
        scope: 0 /* TypeDoc */,
        description: {
            key: 'Prevent externally resolved TypeScript files from being documented.',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "name",
        type: "string",
        scope: 0 /* TypeDoc */,
        description: {
            key: 'Set the name of the project that will be used in the header of the template.',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "includes",
        type: "string",
        scope: 0 /* TypeDoc */,
        paramType: ts.Diagnostics.DIRECTORY,
        description: {
            key: 'Specifies the location to look for included documents (use [[include:FILENAME]] in comments).',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "media",
        type: "string",
        scope: 0 /* TypeDoc */,
        paramType: ts.Diagnostics.DIRECTORY,
        description: {
            key: 'Specifies the location with media files that should be copied to the output directory.',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "gaID",
        type: "string",
        scope: 0 /* TypeDoc */,
        description: {
            key: 'Set the Google Analytics tracking ID and activate tracking code.',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "gaSite",
        type: "string",
        scope: 0 /* TypeDoc */,
        description: {
            key: 'Set the site name for Google Analytics. Defaults to `auto`.',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "hideGenerator",
        type: "boolean",
        scope: 0 /* TypeDoc */,
        description: {
            key: 'Do not print the TypeDoc link at the end of the page.',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "verbose",
        type: "boolean",
        scope: 0 /* TypeDoc */,
        description: {
            key: 'Print more information while TypeDoc is running.',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "version",
        shortName: "v",
        type: "boolean",
        scope: 0 /* TypeDoc */,
        description: {
            key: 'Print the TypeDoc\'s version.',
            category: 2 /* Message */,
            code: 0
        }
    }, {
        name: "help",
        shortName: "h",
        type: "boolean",
        scope: 0 /* TypeDoc */,
        description: {
            key: 'Print this message.',
            category: 2 /* Message */,
            code: 0
        }
    }];
    /**
     * Holds all settings used by TypeDoc.
     */
    var Settings = (function () {
        /**
         * Create a new Settings instance.
         */
        function Settings() {
            var _this = this;
            /**
             * The list of source files that should be processed.
             */
            this.inputFiles = [];
            /**
             * Specifies the output mode the project is used to be compiled with.
             */
            this.mode = 1 /* Modules */;
            /**
             * The path of the theme that should be used.
             */
            this.theme = 'default';
            /**
             * Should declaration files be documented?
             */
            this.includeDeclarations = false;
            /**
             * Should externally resolved TypeScript files be ignored?
             */
            this.excludeExternals = false;
            /**
             * Optional site name for Google Analytics. Defaults to `auto`.
             */
            this.gaSite = 'auto';
            /**
             * Does the user want to display the help message?
             */
            this.help = false;
            /**
             * Does the user want to know the version number?
             */
            this.version = false;
            /**
             * Should we hide the TypeDoc link at the end of the page?
             */
            this.hideGenerator = false;
            /**
             * Should verbose messages be printed?
             */
            this.verbose = false;
            this.declarations = {};
            this.shortOptionNames = {};
            this.compilerOptions = {
                target: 0 /* ES3 */,
                module: 0 /* None */
            };
            td.optionDeclarations.forEach(function (option) { return _this.addOptionDeclaration(option); });
            ts.optionDeclarations.forEach(function (option) {
                if (td.ignoredTypeScriptOptions.indexOf(option.name) != -1)
                    return;
                option.scope = 1 /* TypeScript */;
                _this.addOptionDeclaration(option);
            });
        }
        /**
         *
         * @param option
         */
        Settings.prototype.addOptionDeclaration = function (option) {
            this.declarations[option.name.toLowerCase()] = option;
            if (option.shortName) {
                this.shortOptionNames[option.shortName] = option.name;
            }
        };
        /**
         *
         * @param name
         * @returns {*}
         */
        Settings.prototype.getOptionDeclaration = function (name) {
            if (ts.hasProperty(this.shortOptionNames, name)) {
                name = this.shortOptionNames[name];
            }
            if (ts.hasProperty(this.declarations, name)) {
                return this.declarations[name];
            }
            else {
                return null;
            }
        };
        /**
         * Expand the list of input files.
         *
         * Searches for directories in the input files list and replaces them with a
         * listing of all TypeScript files within them. One may use the ```--excludePattern``` option
         * to filter out files with a pattern.
         */
        Settings.prototype.expandInputFiles = function () {
            var exclude, files = [];
            if (this.excludePattern) {
                exclude = new td.Minimatch.Minimatch(this.excludePattern);
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
            this.inputFiles.forEach(function (file) {
                file = td.Path.resolve(file);
                if (td.FS.statSync(file).isDirectory()) {
                    add(file);
                }
                else {
                    files.push(file);
                }
            });
            this.inputFiles = files;
        };
        Settings.prototype.parseCommandLine = function (logger) {
            return this.parseArguments(ts.sys.args, logger);
        };
        Settings.prototype.parseArguments = function (args, logger) {
            var index = 0;
            var result = true;
            while (index < args.length) {
                var arg = args[index++];
                if (arg.charCodeAt(0) === 64 /* at */) {
                    result = this.parseResponseFile(arg.slice(1), logger) && result;
                }
                else if (arg.charCodeAt(0) === 45 /* minus */) {
                    arg = arg.slice(arg.charCodeAt(1) === 45 /* minus */ ? 2 : 1).toLowerCase();
                    var error, option = this.getOptionDeclaration(arg);
                    if (!option) {
                        error = ts.createCompilerDiagnostic(ts.Diagnostics.Unknown_compiler_option_0, arg);
                    }
                    else if (!args[index] && option.type !== "boolean") {
                        error = ts.createCompilerDiagnostic(ts.Diagnostics.Compiler_option_0_expects_an_argument, option.name);
                    }
                    if (error) {
                        logger.log(error.messageText, 3 /* Error */);
                        result = false;
                        continue;
                    }
                    var target = option.scope == 0 /* TypeDoc */ ? this : this.compilerOptions;
                    switch (option.type) {
                        case "number":
                            target[option.name] = parseInt(args[index++]);
                            break;
                        case "boolean":
                            target[option.name] = true;
                            break;
                        case "string":
                            target[option.name] = args[index++] || "";
                            break;
                        default:
                            var map = option.type;
                            var key = (args[index++] || "").toLowerCase();
                            if (ts.hasProperty(map, key)) {
                                target[option.name] = map[key];
                            }
                            else {
                                if (option.error) {
                                    error = ts.createCompilerDiagnostic(option.error);
                                    logger.log(error.messageText, 3 /* Error */);
                                }
                                else {
                                    logger.log(td.Util.format('Invalid option given for option "%s".', option.name), 3 /* Error */);
                                }
                                result = false;
                            }
                    }
                }
                else {
                    this.inputFiles.push(arg);
                }
            }
            return result;
        };
        Settings.prototype.parseResponseFile = function (filename, logger) {
            var text = ts.sys.readFile(filename);
            if (!text) {
                var error = ts.createCompilerDiagnostic(ts.Diagnostics.File_0_not_found, filename);
                logger.log(error.messageText, 3 /* Error */);
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
                        var error = ts.createCompilerDiagnostic(ts.Diagnostics.Unterminated_quoted_string_in_response_file_0, filename);
                        logger.log(error.messageText, 3 /* Error */);
                        return false;
                    }
                }
                else {
                    while (text.charCodeAt(pos) > 32 /* space */)
                        pos++;
                    args.push(text.substring(start, pos));
                }
            }
            return this.parseArguments(args, logger);
        };
        return Settings;
    })();
    td.Settings = Settings;
})(td || (td = {}));
/// <reference path="EventDispatcher.ts" />
/// <reference path="Settings.ts" />
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
     * List of known log levels. Used to specify the urgency of a log message.
     *
     * @see [[Application.log]]
     */
    (function (LogLevel) {
        LogLevel[LogLevel["Verbose"] = 0] = "Verbose";
        LogLevel[LogLevel["Info"] = 1] = "Info";
        LogLevel[LogLevel["Warn"] = 2] = "Warn";
        LogLevel[LogLevel["Error"] = 3] = "Error";
    })(td.LogLevel || (td.LogLevel = {}));
    var LogLevel = td.LogLevel;
    var existingDirectories = {};
    function normalizePath(path) {
        return ts.normalizePath(path);
    }
    td.normalizePath = normalizePath;
    function writeFile(fileName, data, writeByteOrderMark, onError) {
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
        function ensureDirectoriesExist(directoryPath) {
            if (directoryPath.length > ts.getRootLength(directoryPath) && !directoryExists(directoryPath)) {
                var parentDirectory = ts.getDirectoryPath(directoryPath);
                ensureDirectoriesExist(parentDirectory);
                ts.sys.createDirectory(directoryPath);
            }
        }
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
    var Application = (function () {
        /**
         * Create a new Application instance.
         *
         * @param settings  The settings used by the dispatcher and the renderer.
         */
        function Application(settings) {
            if (settings === void 0) { settings = new td.Settings(); }
            /**
             * Has an error been raised through the log method?
             */
            this.hasErrors = false;
            this.settings = settings;
            this.converter = new td.Converter();
            this.renderer = new td.Renderer(this);
        }
        /**
         * Run TypeDoc from the command line.
         */
        Application.prototype.runFromCommandline = function () {
            if (this.settings.parseCommandLine(this)) {
                if (this.settings.version) {
                    ts.sys.write(this.printVersion().join(ts.sys.newLine));
                }
                else if (this.settings.inputFiles.length === 0 || this.settings.help) {
                    ts.sys.write(this.printUsage().join(ts.sys.newLine));
                }
                else {
                    ts.sys.write(ts.sys.newLine);
                    this.log(td.Util.format('Using TypeScript %s from %s', this.getTypeScriptVersion(), td.tsPath), 1 /* Info */);
                    this.settings.expandInputFiles();
                    this.settings.out = td.Path.resolve(this.settings.out);
                    this.generate(this.settings.inputFiles, this.settings.out);
                }
            }
        };
        /**
         * Print a log message.
         *
         * @param message  The message itself.
         * @param level    The urgency of the log message.
         */
        Application.prototype.log = function (message, level) {
            if (level === void 0) { level = 1 /* Info */; }
            if (level == 3 /* Error */) {
                this.hasErrors = true;
            }
            if (level != 0 /* Verbose */ || this.settings.verbose) {
                var output = '';
                if (level == 3 /* Error */)
                    output += 'Error: ';
                if (level == 2 /* Warn */)
                    output += 'Warning: ';
                output += message;
                ts.sys.write(output + ts.sys.newLine);
            }
        };
        /**
         * Run the documentation generator for the given set of files.
         *
         * @param inputFiles  A list of source files whose documentation should be generated.
         * @param outputDirectory  The path of the directory the documentation should be written to.
         */
        Application.prototype.generate = function (inputFiles, outputDirectory) {
            var _this = this;
            var result = this.converter.convert(inputFiles, this.settings);
            if (result.errors && result.errors.length) {
                result.errors.forEach(function (error) {
                    var output = error.file.filename;
                    output += '(' + error.file.getLineAndCharacterFromPosition(error.start).line + ')';
                    output += ts.sys.newLine + ' ' + error.messageText;
                    switch (error.category) {
                        case 1 /* Error */:
                            _this.log(output, 3 /* Error */);
                            break;
                        case 0 /* Warning */:
                            _this.log(output, 2 /* Warn */);
                            break;
                        case 2 /* Message */:
                            _this.log(output, 1 /* Info */);
                    }
                });
                return false;
            }
            if (this.settings.json) {
                writeFile(this.settings.json, JSON.stringify(result.project.toObject(), null, '\t'), false);
                this.log(td.Util.format('JSON written to %s', this.settings.json));
            }
            else {
                this.renderer.render(result.project, outputDirectory);
                if (this.hasErrors) {
                    ts.sys.write(ts.sys.newLine);
                    this.log('Documentation could not be generated due to the errors above.');
                }
                else {
                    this.log(td.Util.format('Documentation generated at %s', this.settings.out));
                }
            }
            return true;
        };
        /**
         * Return the version number of the loaded TypeScript compiler.
         *
         * @returns The version number of the loaded TypeScript package.
         */
        Application.prototype.getTypeScriptVersion = function () {
            var json = JSON.parse(td.FS.readFileSync(td.Path.join(td.tsPath, '..', 'package.json'), 'utf8'));
            return json.version;
        };
        /**
         * Print the version number.
         *
         * @return string[]
         */
        Application.prototype.printVersion = function () {
            return [
                '',
                'TypeDoc ' + Application.VERSION,
                'Using TypeScript ' + this.getTypeScriptVersion() + ' at ' + td.tsPath,
                ''
            ];
        };
        /**
         * Print some usage information.
         *
         * Taken from TypeScript (src/compiler/tsc.ts)
         *
         * @return string[]
         */
        Application.prototype.printUsage = function () {
            var marginLength = 0;
            var typeDoc = prepareOptions(td.optionDeclarations);
            var typeScript = prepareOptions(ts.optionDeclarations, td.ignoredTypeScriptOptions);
            var output = this.printVersion();
            output.push('Usage:');
            output.push(' typedoc --mode modules --out path/to/documentation path/to/sourcefiles');
            output.push('', 'TypeDoc options:');
            pushDeclarations(typeDoc);
            output.push('', 'TypeScript options:');
            pushDeclarations(typeScript);
            output.push('');
            return output;
            function prepareOptions(optsList, exclude) {
                // Sort our options by their names, (e.g. "--noImplicitAny" comes before "--watch")
                optsList = optsList.slice();
                optsList.sort(function (a, b) { return ts.compareValues(a.name.toLowerCase(), b.name.toLowerCase()); });
                // We want our descriptions to align at the same column in our output,
                // so we keep track of the longest option usage string.
                var usageColumn = []; // Things like "-d, --declaration" go in here.
                var descriptionColumn = [];
                for (var i = 0; i < optsList.length; i++) {
                    var option = optsList[i];
                    if (exclude && exclude.indexOf(option.name) != -1)
                        continue;
                    // If an option lacks a description,
                    // it is not officially supported.
                    if (!option.description) {
                        continue;
                    }
                    var usageText = " ";
                    if (option.shortName) {
                        usageText += "-" + option.shortName;
                        usageText += getParamType(option);
                        usageText += ", ";
                    }
                    usageText += "--" + option.name;
                    usageText += getParamType(option);
                    usageColumn.push(usageText);
                    descriptionColumn.push(option.description.key);
                    // Set the new margin for the description column if necessary.
                    marginLength = Math.max(usageText.length, marginLength);
                }
                return { usage: usageColumn, description: descriptionColumn };
            }
            // Special case that can't fit in the loop.
            function addFileOption(columns) {
                var usageText = " @<file>";
                columns.usage.push(usageText);
                columns.description.push(ts.Diagnostics.Insert_command_line_options_and_files_from_a_file.key);
                marginLength = Math.max(usageText.length, marginLength);
            }
            // Print out each row, aligning all the descriptions on the same column.
            function pushDeclarations(columns) {
                for (var i = 0; i < columns.usage.length; i++) {
                    var usage = columns.usage[i];
                    var description = columns.description[i];
                    output.push(usage + makePadding(marginLength - usage.length + 2) + description);
                }
            }
            function getParamType(option) {
                if (option.paramType !== undefined) {
                    return " " + getDiagnosticText(option.paramType);
                }
                return "";
            }
            function getDiagnosticText(message) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                var diagnostic = ts.createCompilerDiagnostic.apply(undefined, arguments);
                return diagnostic.messageText;
            }
            function makePadding(paddingLength) {
                return Array(paddingLength + 1).join(" ");
            }
        };
        /**
         * The version number of TypeDoc.
         */
        Application.VERSION = '0.2.3';
        return Application;
    })();
    td.Application = Application;
})(td || (td = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var td;
(function (td) {
    var PluginHost = (function (_super) {
        __extends(PluginHost, _super);
        function PluginHost() {
            _super.apply(this, arguments);
        }
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
    td.BasePath = BasePath;
})(td || (td = {}));
/// <reference path="../PluginHost.ts" />
var td;
(function (td) {
    /**
     * Return a string that explains the given flag bit mask.
     *
     * @param value  A bit mask containing TypeScript.PullElementFlags bits.
     * @returns A string describing the given bit mask.
     */
    function flagsToString(value, flags) {
        var items = [];
        for (var flag in flags) {
            if (!flags.hasOwnProperty(flag))
                continue;
            if (flag != +flag)
                continue;
            if (value & flag)
                items.push(flags[flag]);
        }
        return items.join(', ');
    }
    td.flagsToString = flagsToString;
    var Converter = (function (_super) {
        __extends(Converter, _super);
        function Converter() {
            _super.call(this);
            Converter.loadPlugins(this);
        }
        /**
         * Compile the given source files and create a reflection tree for them.
         *
         * @param fileNames  Array of the file names that should be compiled.
         * @param settings   The settings that should be used to compile the files.
         */
        Converter.prototype.convert = function (fileNames, settings) {
            for (var i = 0, c = fileNames.length; i < c; i++) {
                fileNames[i] = ts.normalizePath(ts.normalizeSlashes(fileNames[i]));
            }
            var dispatcher = this;
            var host = this.createCompilerHost(settings.compilerOptions);
            var program = ts.createProgram(fileNames, settings.compilerOptions, host);
            var checker = program.getTypeChecker(true);
            var project = new td.ProjectReflection(settings.name);
            var event = new td.CompilerEvent(checker, project, settings);
            var isExternal = false;
            var isDeclaration = false;
            var externalPattern = settings.externalPattern ? new td.Minimatch.Minimatch(settings.externalPattern) : null;
            var symbolID = -1024;
            var isInherit = false;
            var inheritParent = null;
            var inherited = [];
            var typeParameters = {};
            return compile();
            function compile() {
                var errors = program.getDiagnostics();
                errors = errors.concat(checker.getDiagnostics());
                var converterEvent = new td.ConverterEvent(checker, project, settings);
                dispatcher.dispatch(Converter.EVENT_BEGIN, converterEvent);
                program.getSourceFiles().forEach(function (sourceFile) {
                    visitSourceFile(sourceFile, project);
                });
                dispatcher.dispatch(Converter.EVENT_RESOLVE_BEGIN, converterEvent);
                var resolveEvent = new td.ResolveEvent(checker, project, settings);
                for (var id in project.reflections) {
                    resolveEvent.reflection = project.reflections[id];
                    dispatcher.dispatch(Converter.EVENT_RESOLVE, resolveEvent);
                }
                dispatcher.dispatch(Converter.EVENT_RESOLVE_END, converterEvent);
                dispatcher.dispatch(Converter.EVENT_END, converterEvent);
                return {
                    errors: errors,
                    project: project
                };
            }
            function getSymbolID(symbol) {
                if (!symbol)
                    return null;
                if (!symbol.id)
                    symbol.id = symbolID--;
                return symbol.id;
            }
            function registerReflection(reflection, node) {
                project.reflections[reflection.id] = reflection;
                var id = getSymbolID(node.symbol);
                if (!isInherit && id && !project.symbolMapping[id]) {
                    project.symbolMapping[id] = reflection.id;
                }
            }
            function createDeclaration(container, node, kind, name) {
                if (!name) {
                    if (!node.symbol)
                        return null;
                    name = node.symbol.name;
                }
                var child;
                var isStatic = !!(node.flags & 128 /* Static */);
                if (container.kind == 128 /* Class */ && (!node.parent || node.parent.kind != 185 /* ClassDeclaration */)) {
                    isStatic = true;
                }
                var isPrivate = !!(node.flags & 32 /* Private */);
                if (isInherit && isPrivate) {
                    return null;
                }
                if (!container.children)
                    container.children = [];
                container.children.forEach(function (n) {
                    if (n.name == name && n.flags.isStatic == isStatic)
                        child = n;
                });
                if (!child) {
                    child = new td.DeclarationReflection(container, name, kind);
                    child.setFlag(8 /* Static */, isStatic);
                    child.setFlag(64 /* External */, isExternal);
                    child.setFlag(1 /* Private */, isPrivate);
                    child.setFlag(2 /* Protected */, !!(node.flags & 64 /* Protected */));
                    child.setFlag(4 /* Public */, !!(node.flags & 16 /* Public */));
                    child.setFlag(128 /* Optional */, !!(node['questionToken']));
                    child.setFlag(16 /* Exported */, container.flags.isExported || !!(node.flags & 1 /* Export */));
                    container.children.push(child);
                    registerReflection(child, node);
                    if (isInherit && node.parent == inheritParent) {
                        if (!child.inheritedFrom) {
                            child.inheritedFrom = createReferenceType(node.symbol);
                            child.getAllSignatures().forEach(function (signature) {
                                signature.inheritedFrom = createReferenceType(node.symbol);
                            });
                        }
                    }
                }
                else {
                    if (child.kind != kind) {
                        var weights = [2 /* Module */, 4 /* Enum */, 128 /* Class */];
                        var kindWeight = weights.indexOf(kind);
                        var childKindWeight = weights.indexOf(child.kind);
                        if (kindWeight > childKindWeight) {
                            child.kind = kind;
                        }
                    }
                    if (isInherit && node.parent == inheritParent && inherited.indexOf(name) != -1) {
                        if (!child.overwrites) {
                            child.overwrites = createReferenceType(node.symbol);
                            child.getAllSignatures().forEach(function (signature) {
                                signature.overwrites = createReferenceType(node.symbol);
                            });
                        }
                        return null;
                    }
                }
                event.reflection = child;
                event.node = node;
                dispatcher.dispatch(Converter.EVENT_CREATE_DECLARATION, event);
                return child;
            }
            function createReferenceType(symbol) {
                var name = checker.symbolToString(symbol);
                var id = getSymbolID(symbol);
                return new td.ReferenceType(name, id);
            }
            function createSignature(container, node, name, kind) {
                var signature = new td.SignatureReflection(container, name, kind);
                withTypeParameters(signature, node.typeParameters, null, true, function () {
                    node.parameters.forEach(function (parameter) {
                        createParameter(signature, parameter);
                    });
                    registerReflection(signature, node);
                    if (kind == 4096 /* CallSignature */) {
                        var type = checker.getTypeAtLocation(node);
                        checker.getSignaturesOfType(type, 0 /* Call */).forEach(function (tsSignature) {
                            if (tsSignature.declaration == node) {
                                signature.type = extractType(signature, node.type, checker.getReturnTypeOfSignature(tsSignature));
                            }
                        });
                    }
                    if (!signature.type) {
                        if (node.type) {
                            signature.type = extractType(signature, node.type, checker.getTypeAtLocation(node.type));
                        }
                        else {
                            signature.type = extractType(signature, node, checker.getTypeAtLocation(node));
                        }
                    }
                    if (container.inheritedFrom) {
                        signature.inheritedFrom = createReferenceType(node.symbol);
                    }
                    event.reflection = signature;
                    event.node = node;
                    dispatcher.dispatch(Converter.EVENT_CREATE_SIGNATURE, event);
                });
                return signature;
            }
            function createParameter(signature, node) {
                var parameter = new td.ParameterReflection(signature, node.symbol.name, 32768 /* Parameter */);
                parameter.type = extractType(parameter, node.type, checker.getTypeAtLocation(node));
                parameter.setFlag(128 /* Optional */, !!node.questionToken);
                parameter.setFlag(512 /* Rest */, !!node.dotDotDotToken);
                extractDefaultValue(node, parameter);
                parameter.setFlag(256 /* DefaultValue */, !!parameter.defaultValue);
                if (!signature.parameters)
                    signature.parameters = [];
                signature.parameters.push(parameter);
                registerReflection(parameter, node);
                event.reflection = parameter;
                event.node = node;
                dispatcher.dispatch(Converter.EVENT_CREATE_PARAMETER, event);
            }
            function createTypeParameter(reflection, typeParameter, node) {
                if (!reflection.typeParameters)
                    reflection.typeParameters = [];
                var typeParameterReflection = new td.TypeParameterReflection(reflection, typeParameter);
                registerReflection(typeParameterReflection, node);
                reflection.typeParameters.push(typeParameterReflection);
                event.reflection = typeParameterReflection;
                event.node = node;
                dispatcher.dispatch(Converter.EVENT_CREATE_TYPE_PARAMETER, event);
            }
            function extractType(target, node, type) {
                if (node && node['typeName'] && node['typeName'].text && type && (!type.symbol || (node['typeName'].text != type.symbol.name))) {
                    return new td.ReferenceType(node['typeName'].text, td.ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME);
                }
                else if (type.flags & 127 /* Intrinsic */) {
                    return extractIntrinsicType(type);
                }
                else if (type.flags & 128 /* Enum */) {
                    return extractEnumType(type);
                }
                else if (type.flags & 8192 /* Tuple */) {
                    return extractTupleType(target, node, type);
                }
                else if (type.flags & 16384 /* Union */) {
                    return extractUnionType(target, node, type);
                }
                else if (type.flags & 512 /* TypeParameter */) {
                    return extractTypeParameterType(node, type);
                }
                else if (type.flags & 256 /* StringLiteral */) {
                    return extractStringLiteralType(type);
                }
                else if (type.flags & 48128 /* ObjectType */) {
                    return extractObjectType(target, node, type);
                }
                else {
                    return extractUnknownType(type);
                }
            }
            function extractIntrinsicType(type) {
                return new td.IntrinsicType(type.intrinsicName);
            }
            function extractEnumType(type) {
                return createReferenceType(type.symbol);
            }
            function extractTupleType(target, node, type) {
                var elements = [];
                if (node && node.elementTypes) {
                    node.elementTypes.forEach(function (elementNode) {
                        elements.push(extractType(target, elementNode, checker.getTypeAtLocation(elementNode)));
                    });
                }
                else if (type && type.elementTypes) {
                    type.elementTypes.forEach(function (type) {
                        elements.push(extractType(target, null, type));
                    });
                }
                return new td.TupleType(elements);
            }
            function extractUnionType(target, node, type) {
                var types = [];
                if (node && node.types) {
                    node.types.forEach(function (typeNode) {
                        types.push(extractType(target, typeNode, checker.getTypeAtLocation(typeNode)));
                    });
                }
                else if (type && type.types) {
                    type.types.forEach(function (type) {
                        types.push(extractType(target, null, type));
                    });
                }
                return new td.UnionType(types);
            }
            function extractTypeParameterType(node, type) {
                if (node && node.typeName) {
                    var name = node.typeName['text'];
                    if (typeParameters[name]) {
                        return typeParameters[name];
                    }
                    else {
                        var result = new td.TypeParameterType();
                        result.name = name;
                        return result;
                    }
                }
            }
            function extractStringLiteralType(type) {
                return new td.StringLiteralType(type.text);
            }
            function extractObjectType(target, node, type) {
                if (node && node['elementType']) {
                    var result = extractType(target, node['elementType'], checker.getTypeAtLocation(node['elementType']));
                    if (result) {
                        result.isArray = true;
                        return result;
                    }
                    else {
                        return new td.IntrinsicType('object');
                    }
                }
                else if (type.symbol) {
                    if (type.flags & 32768 /* Anonymous */) {
                        if (type.symbol.flags & 2048 /* 'TypeLiteral' */) {
                            var declaration = new td.DeclarationReflection();
                            declaration.kind = 65536 /* TypeLiteral */;
                            declaration.name = '__type';
                            declaration.parent = target;
                            registerReflection(declaration, node);
                            event.reflection = declaration;
                            event.node = node;
                            dispatcher.dispatch(Converter.EVENT_CREATE_DECLARATION, event);
                            type.symbol.declarations.forEach(function (node) {
                                visit(node, declaration);
                            });
                            return new td.ReflectionType(declaration);
                        }
                        else {
                            return new td.IntrinsicType('object');
                        }
                    }
                    else {
                        var referenceType = createReferenceType(type.symbol);
                        if (node && node['typeArguments']) {
                            referenceType.typeArguments = [];
                            node['typeArguments'].forEach(function (node) {
                                referenceType.typeArguments.push(extractType(target, node, checker.getTypeAtLocation(node)));
                            });
                        }
                        else if (type && type['typeArguments']) {
                            referenceType.typeArguments = [];
                            type['typeArguments'].forEach(function (type) {
                                referenceType.typeArguments.push(extractType(target, null, type));
                            });
                        }
                        return referenceType;
                    }
                }
                else {
                    return new td.IntrinsicType('object');
                }
            }
            function extractUnknownType(type) {
                return new td.UnknownType(checker.typeToString(type));
            }
            function extractDefaultValue(node, reflection) {
                if (!node.initializer)
                    return;
                switch (node.initializer.kind) {
                    case 7 /* StringLiteral */:
                        reflection.defaultValue = '"' + node.initializer.text + '"';
                        break;
                    case 6 /* NumericLiteral */:
                        reflection.defaultValue = node.initializer.text;
                        break;
                    case 93 /* TrueKeyword */:
                        reflection.defaultValue = 'true';
                        break;
                    case 78 /* FalseKeyword */:
                        reflection.defaultValue = 'false';
                        break;
                    default:
                        var source = ts.getSourceFileOfNode(node);
                        reflection.defaultValue = source.text.substring(node.initializer.pos, node.initializer.end);
                        break;
                }
            }
            function extractTypeArguments(target, typeArguments) {
                var result = [];
                if (typeArguments) {
                    typeArguments.forEach(function (node) {
                        result.push(extractType(target, node, checker.getTypeAtLocation(node)));
                    });
                }
                return result;
            }
            function withTypeParameters(reflection, parameters, typeArguments, keepTypeParameters, callback) {
                var oldTypeParameters = typeParameters;
                typeParameters = {};
                if (keepTypeParameters) {
                    for (var key in oldTypeParameters) {
                        typeParameters[key] = oldTypeParameters[key];
                    }
                }
                if (parameters) {
                    parameters.forEach(function (declaration, index) {
                        var name = declaration.symbol.name;
                        if (typeArguments && typeArguments[index]) {
                            typeParameters[name] = typeArguments[index];
                        }
                        else {
                            var typeParameter = new td.TypeParameterType();
                            typeParameter.name = declaration.symbol.name;
                            if (declaration.constraint) {
                                typeParameter.constraint = extractType(reflection, declaration.constraint, checker.getTypeAtLocation(declaration.constraint));
                            }
                            typeParameters[name] = typeParameter;
                            createTypeParameter(reflection, typeParameter, declaration);
                        }
                    });
                }
                callback();
                typeParameters = oldTypeParameters;
            }
            /**
             * Apply all children of the given node to the given target reflection.
             *
             * @param node    The node whose children should be analyzed.
             * @param target  The reflection the children should be copied to.
             * @return The resulting reflection.
             */
            function inherit(node, target, typeArguments) {
                var wasInherit = isInherit;
                var oldInherited = inherited;
                var oldInheritParent = inheritParent;
                isInherit = true;
                inheritParent = node;
                inherited = [];
                if (target.children)
                    target.children.forEach(function (child) {
                        inherited.push(child.name);
                    });
                visit(node, target, typeArguments);
                isInherit = wasInherit;
                inherited = oldInherited;
                inheritParent = oldInheritParent;
                return target;
            }
            /**
             * Analyze the given node and create a suitable reflection.
             *
             * This function checks the kind of the node and delegates to the matching function implementation.
             *
             * @param node   The compiler node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visit(node, scope, typeArguments) {
                switch (node.kind) {
                    case 185 /* ClassDeclaration */:
                        return visitClassDeclaration(node, scope, typeArguments);
                    case 186 /* InterfaceDeclaration */:
                        return visitInterfaceDeclaration(node, scope, typeArguments);
                    case 189 /* ModuleDeclaration */:
                        return visitModuleDeclaration(node, scope);
                    case 164 /* VariableStatement */:
                        return visitVariableStatement(node, scope);
                    case 124 /* Property */:
                    case 198 /* PropertyAssignment */:
                    case 183 /* VariableDeclaration */:
                        return visitVariableDeclaration(node, scope);
                    case 188 /* EnumDeclaration */:
                        return visitEnumDeclaration(node, scope);
                    case 200 /* EnumMember */:
                        return visitEnumMember(node, scope);
                    case 126 /* Constructor */:
                    case 130 /* ConstructSignature */:
                        return visitConstructor(node, scope);
                    case 125 /* Method */:
                    case 184 /* FunctionDeclaration */:
                        return visitFunctionDeclaration(node, scope);
                    case 127 /* GetAccessor */:
                        return visitGetAccessorDeclaration(node, scope);
                    case 128 /* SetAccessor */:
                        return visitSetAccessorDeclaration(node, scope);
                    case 129 /* CallSignature */:
                    case 133 /* FunctionType */:
                        return visitCallSignatureDeclaration(node, scope);
                    case 131 /* IndexSignature */:
                        return visitIndexSignatureDeclaration(node, scope);
                    case 163 /* Block */:
                    case 190 /* ModuleBlock */:
                        return visitBlock(node, scope);
                    case 142 /* ObjectLiteralExpression */:
                        return visitObjectLiteral(node, scope);
                    case 136 /* TypeLiteral */:
                        return visitTypeLiteral(node, scope);
                    case 192 /* ExportAssignment */:
                        return visitExportAssignment(node, scope);
                    case 187 /* TypeAliasDeclaration */:
                        return visitTypeAliasDeclaration(node, scope);
                    default:
                        // console.log('Unhandeled: ' + node.kind);
                        return null;
                }
            }
            /**
             * Analyze the given block node and create a suitable reflection.
             *
             * @param node   The source file node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitBlock(node, scope) {
                if (node.statements) {
                    var prefered = [185 /* ClassDeclaration */, 186 /* InterfaceDeclaration */, 188 /* EnumDeclaration */];
                    var statements = [];
                    node.statements.forEach(function (statement) {
                        if (prefered.indexOf(statement.kind) != -1) {
                            visit(statement, scope);
                        }
                        else {
                            statements.push(statement);
                        }
                    });
                    statements.forEach(function (statement) {
                        visit(statement, scope);
                    });
                }
                return scope;
            }
            /**
             * Analyze the given source file node and create a suitable reflection.
             *
             * @param node   The source file node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitSourceFile(node, scope) {
                isExternal = fileNames.indexOf(node.filename) == -1;
                if (externalPattern) {
                    isExternal = isExternal || externalPattern.match(node.filename);
                }
                if (isExternal && settings.excludeExternals) {
                    return scope;
                }
                isDeclaration = ts.isDeclarationFile(node);
                if (isDeclaration) {
                    if (!settings.includeDeclarations || node.filename.substr(-8) == 'lib.d.ts') {
                        return scope;
                    }
                }
                event.node = node;
                event.reflection = project;
                dispatcher.dispatch(Converter.EVENT_FILE_BEGIN, event);
                if (settings.mode == 1 /* Modules */) {
                    scope = createDeclaration(scope, node, 1 /* ExternalModule */, node.filename);
                    visitBlock(node, scope);
                    scope.setFlag(16 /* Exported */);
                }
                else {
                    visitBlock(node, scope);
                }
                return scope;
            }
            /**
             * Analyze the given module node and create a suitable reflection.
             *
             * @param node   The module node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitModuleDeclaration(node, scope) {
                var reflection = createDeclaration(scope, node, 2 /* Module */);
                if (reflection) {
                    var opt = settings.compilerOptions;
                    if (scope instanceof td.ProjectReflection && !isDeclaration && (!opt.module || opt.module == 0 /* None */)) {
                        reflection.setFlag(16 /* Exported */);
                    }
                    if (node.body) {
                        visit(node.body, reflection);
                    }
                }
                return reflection;
            }
            /**
             * Analyze the given class declaration node and create a suitable reflection.
             *
             * @param node   The class declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitClassDeclaration(node, scope, typeArguments) {
                var reflection;
                if (isInherit && inheritParent == node) {
                    reflection = scope;
                }
                else {
                    reflection = createDeclaration(scope, node, 128 /* Class */);
                }
                if (reflection) {
                    withTypeParameters(reflection, node.typeParameters, typeArguments, false, function () {
                        if (node.members) {
                            node.members.forEach(function (member) {
                                visit(member, reflection);
                            });
                        }
                        if (node.heritageClauses) {
                            node.heritageClauses.forEach(function (clause) {
                                if (!clause.types)
                                    return;
                                clause.types.forEach(function (typeNode) {
                                    var type = checker.getTypeAtLocation(typeNode);
                                    switch (clause.token) {
                                        case 77 /* ExtendsKeyword */:
                                            if (!isInherit) {
                                                if (!reflection.extendedTypes)
                                                    reflection.extendedTypes = [];
                                                reflection.extendedTypes.push(extractType(reflection, typeNode, type));
                                            }
                                            if (type && type.symbol) {
                                                type.symbol.declarations.forEach(function (declaration) {
                                                    inherit(declaration, reflection, extractTypeArguments(reflection, typeNode.typeArguments));
                                                });
                                            }
                                            break;
                                        case 100 /* ImplementsKeyword */:
                                            if (!reflection.implementedTypes) {
                                                reflection.implementedTypes = [];
                                            }
                                            reflection.implementedTypes.push(extractType(reflection, typeNode, type));
                                            break;
                                    }
                                });
                            });
                        }
                    });
                }
                return reflection;
            }
            /**
             * Analyze the given interface declaration node and create a suitable reflection.
             *
             * @param node   The interface declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitInterfaceDeclaration(node, scope, typeArguments) {
                var reflection;
                if (isInherit && inheritParent == node) {
                    reflection = scope;
                }
                else {
                    reflection = createDeclaration(scope, node, 256 /* Interface */);
                }
                if (reflection) {
                    withTypeParameters(reflection, node.typeParameters, typeArguments, false, function () {
                        if (node.members) {
                            node.members.forEach(function (member, isInherit) {
                                visit(member, reflection);
                            });
                        }
                        if (node.heritageClauses) {
                            node.heritageClauses.forEach(function (clause) {
                                if (!clause.types)
                                    return;
                                clause.types.forEach(function (typeNode) {
                                    var type = checker.getTypeAtLocation(typeNode);
                                    if (!isInherit) {
                                        if (!reflection.extendedTypes)
                                            reflection.extendedTypes = [];
                                        reflection.extendedTypes.push(extractType(reflection, typeNode, type));
                                    }
                                    if (type && type.symbol) {
                                        type.symbol.declarations.forEach(function (declaration) {
                                            inherit(declaration, reflection, extractTypeArguments(reflection, typeNode.typeArguments));
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
                return reflection;
            }
            /**
             * Analyze the given variable statement node and create a suitable reflection.
             *
             * @param node   The variable statement node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitVariableStatement(node, scope) {
                if (node.declarations) {
                    node.declarations.forEach(function (variableDeclaration) {
                        visitVariableDeclaration(variableDeclaration, scope);
                    });
                }
                return scope;
            }
            function isSimpleObjectLiteral(objectLiteral) {
                if (!objectLiteral.properties)
                    return true;
                return objectLiteral.properties.length == 0;
            }
            /**
             * Analyze the given variable declaration node and create a suitable reflection.
             *
             * @param node   The variable declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitVariableDeclaration(node, scope) {
                var comment = td.CommentPlugin.getComment(node);
                if (comment && /\@resolve/.test(comment)) {
                    var resolveType = checker.getTypeAtLocation(node);
                    if (resolveType && resolveType.symbol) {
                        var resolved = visit(resolveType.symbol.declarations[0], scope);
                        if (resolved) {
                            resolved.name = node.symbol.name;
                        }
                        return resolved;
                    }
                }
                var kind = scope.kind & td.ReflectionKind.ClassOrInterface ? 1024 /* Property */ : 32 /* Variable */;
                var variable = createDeclaration(scope, node, kind);
                if (variable) {
                    if (node.initializer) {
                        switch (node.initializer.kind) {
                            case 151 /* ArrowFunction */:
                            case 150 /* FunctionExpression */:
                                variable.kind = scope.kind & td.ReflectionKind.ClassOrInterface ? 2048 /* Method */ : 64 /* Function */;
                                visitCallSignatureDeclaration(node.initializer, variable);
                                break;
                            case 142 /* ObjectLiteralExpression */:
                                if (!isSimpleObjectLiteral(node.initializer)) {
                                    variable.kind = 2097152 /* ObjectLiteral */;
                                    variable.type = new td.IntrinsicType('object');
                                    visitObjectLiteral(node.initializer, variable);
                                }
                                break;
                            default:
                                extractDefaultValue(node, variable);
                        }
                    }
                    if (variable.kind == kind) {
                        variable.type = extractType(variable, node.type, checker.getTypeAtLocation(node));
                    }
                }
                return variable;
            }
            /**
             * Analyze the given enumeration declaration node and create a suitable reflection.
             *
             * @param node   The enumeration declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitEnumDeclaration(node, scope) {
                var enumeration = createDeclaration(scope, node, 4 /* Enum */);
                if (enumeration && node.members) {
                    node.members.forEach(function (node) {
                        visitEnumMember(node, enumeration);
                    });
                }
                return enumeration;
            }
            /**
             * Analyze the given enumeration member node and create a suitable reflection.
             *
             * @param node   The enumeration member node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitEnumMember(node, scope) {
                var member = createDeclaration(scope, node, 16 /* EnumMember */);
                if (member) {
                    extractDefaultValue(node, member);
                }
                return member;
            }
            /**
             * Analyze the given constructor declaration node and create a suitable reflection.
             *
             * @param node   The constructor declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitConstructor(node, scope) {
                var hasBody = !!node.body;
                var method = createDeclaration(scope, node, 512 /* Constructor */, 'constructor');
                if (method) {
                    if (!hasBody || !method.signatures) {
                        var name = 'new ' + scope.name;
                        var signature = createSignature(method, node, name, 16384 /* ConstructorSignature */);
                        signature.type = new td.ReferenceType(scope.name, td.ReferenceType.SYMBOL_ID_RESOLVED, scope);
                        method.signatures = method.signatures || [];
                        method.signatures.push(signature);
                    }
                    else {
                        event.node = node;
                        event.reflection = method;
                        dispatcher.dispatch(Converter.EVENT_FUNCTION_IMPLEMENTATION, event);
                    }
                }
                return method;
            }
            /**
             * Analyze the given function declaration node and create a suitable reflection.
             *
             * @param node   The function declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitFunctionDeclaration(node, scope) {
                var kind = scope.kind & td.ReflectionKind.ClassOrInterface ? 2048 /* Method */ : 64 /* Function */;
                var hasBody = !!node.body;
                var method = createDeclaration(scope, node, kind);
                if (method) {
                    if (!hasBody || !method.signatures) {
                        var signature = createSignature(method, node, method.name, 4096 /* CallSignature */);
                        if (!method.signatures)
                            method.signatures = [];
                        method.signatures.push(signature);
                    }
                    else {
                        event.node = node;
                        event.reflection = method;
                        dispatcher.dispatch(Converter.EVENT_FUNCTION_IMPLEMENTATION, event);
                    }
                }
                return method;
            }
            /**
             * Analyze the given call signature declaration node and create a suitable reflection.
             *
             * @param node   The signature declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @param type   The type (call, index or constructor) of the signature.
             * @return The resulting reflection or NULL.
             */
            function visitCallSignatureDeclaration(node, scope) {
                if (scope instanceof td.DeclarationReflection) {
                    var name = scope.kindOf(td.ReflectionKind.FunctionOrMethod) ? scope.name : '__call';
                    var signature = createSignature(scope, node, name, 4096 /* CallSignature */);
                    if (!scope.signatures)
                        scope.signatures = [];
                    scope.signatures.push(signature);
                }
                return scope;
            }
            /**
             * Analyze the given index signature declaration node and create a suitable reflection.
             *
             * @param node   The signature declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @param type   The type (call, index or constructor) of the signature.
             * @return The resulting reflection or NULL.
             */
            function visitIndexSignatureDeclaration(node, scope) {
                if (scope instanceof td.DeclarationReflection) {
                    var signature = createSignature(scope, node, '__index', 8192 /* IndexSignature */);
                    scope.indexSignature = signature;
                }
                return scope;
            }
            /**
             * Analyze the given getter declaration node and create a suitable reflection.
             *
             * @param node   The signature declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitGetAccessorDeclaration(node, scope) {
                var accessor = createDeclaration(scope, node, 262144 /* Accessor */);
                if (accessor) {
                    var signature = createSignature(accessor, node, '__get', 524288 /* GetSignature */);
                    accessor.getSignature = signature;
                }
                return accessor;
            }
            /**
             * Analyze the given setter declaration node and create a suitable reflection.
             *
             * @param node   The signature declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitSetAccessorDeclaration(node, scope) {
                var accessor = createDeclaration(scope, node, 262144 /* Accessor */);
                if (accessor) {
                    var signature = createSignature(accessor, node, '__set', 1048576 /* SetSignature */);
                    accessor.setSignature = signature;
                }
                return accessor;
            }
            /**
             * Analyze the given object literal node and create a suitable reflection.
             *
             * @param node   The object literal node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitObjectLiteral(node, scope) {
                if (node.properties) {
                    node.properties.forEach(function (node) {
                        visit(node, scope);
                    });
                }
                return scope;
            }
            /**
             * Analyze the given type literal node and create a suitable reflection.
             *
             * @param node   The type literal node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitTypeLiteral(node, scope) {
                if (node.members) {
                    node.members.forEach(function (node) {
                        visit(node, scope);
                    });
                }
                return scope;
            }
            /**
             * Analyze the given type alias declaration node and create a suitable reflection.
             *
             * @param node   The type alias declaration node that should be analyzed.
             * @param scope  The reflection representing the current scope.
             * @return The resulting reflection or NULL.
             */
            function visitTypeAliasDeclaration(node, scope) {
                var alias = createDeclaration(scope, node, 4194304 /* TypeAlias */);
                alias.type = extractType(alias, node.type, checker.getTypeAtLocation(node.type));
                return alias;
            }
            function visitExportAssignment(node, scope) {
                var type = checker.getTypeAtLocation(node.exportName);
                if (type && type.symbol) {
                    type.symbol.declarations.forEach(function (declaration) {
                        if (!declaration.symbol)
                            return;
                        var id = project.symbolMapping[getSymbolID(declaration.symbol)];
                        if (!id)
                            return;
                        var reflection = project.reflections[id];
                        if (reflection instanceof td.DeclarationReflection) {
                            reflection.setFlag(32 /* ExportAssignment */, true);
                        }
                        markAsExported(reflection);
                    });
                }
                function markAsExported(reflection) {
                    if (reflection instanceof td.DeclarationReflection) {
                        reflection.setFlag(16 /* Exported */, true);
                    }
                    reflection.traverse(markAsExported);
                }
                return scope;
            }
        };
        /**
         * Create the compiler host.
         *
         * Taken from TypeScript source files.
         * @see https://github.com/Microsoft/TypeScript/blob/master/src/compiler/tsc.ts#L136
         */
        Converter.prototype.createCompilerHost = function (options) {
            var currentDirectory;
            var unsupportedFileEncodingErrorCode = -2147024809;
            function getCanonicalFileName(fileName) {
                return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
            }
            function getSourceFile(filename, languageVersion, onError) {
                try {
                    var text = ts.sys.readFile(filename, options.charset);
                }
                catch (e) {
                    if (onError) {
                        onError(e.number === unsupportedFileEncodingErrorCode ? 'Unsupported file encoding' : e.message);
                    }
                    text = "";
                }
                return text !== undefined ? ts.createSourceFile(filename, text, languageVersion, "0") : undefined;
            }
            function writeFile(fileName, data, writeByteOrderMark, onError) {
            }
            return {
                getSourceFile: getSourceFile,
                getDefaultLibFilename: function () { return td.Path.join(ts.getDirectoryPath(ts.normalizePath(td.tsPath)), 'bin', 'lib.d.ts'); },
                writeFile: writeFile,
                getCurrentDirectory: function () { return currentDirectory || (currentDirectory = ts.sys.getCurrentDirectory()); },
                useCaseSensitiveFileNames: function () { return ts.sys.useCaseSensitiveFileNames; },
                getCanonicalFileName: getCanonicalFileName,
                getNewLine: function () { return ts.sys.newLine; }
            };
        };
        Converter.EVENT_BEGIN = 'begin';
        Converter.EVENT_END = 'end';
        Converter.EVENT_FILE_BEGIN = 'fileBegin';
        Converter.EVENT_CREATE_DECLARATION = 'createDeclaration';
        Converter.EVENT_CREATE_SIGNATURE = 'createSignature';
        Converter.EVENT_CREATE_PARAMETER = 'createParameter';
        Converter.EVENT_CREATE_TYPE_PARAMETER = 'createTypeParameter';
        Converter.EVENT_FUNCTION_IMPLEMENTATION = 'functionImplementation';
        Converter.EVENT_RESOLVE_BEGIN = 'resolveBegin';
        Converter.EVENT_RESOLVE_END = 'resolveEnd';
        Converter.EVENT_RESOLVE = 'resolveReflection';
        return Converter;
    })(td.PluginHost);
    td.Converter = Converter;
})(td || (td = {}));
var td;
(function (td) {
    var ConverterEvent = (function (_super) {
        __extends(ConverterEvent, _super);
        function ConverterEvent(checker, project, settings) {
            _super.call(this);
            this._checker = checker;
            this._project = project;
            this._settings = settings;
        }
        ConverterEvent.prototype.getTypeChecker = function () {
            return this._checker;
        };
        ConverterEvent.prototype.getProject = function () {
            return this._project;
        };
        ConverterEvent.prototype.getSettings = function () {
            return this._settings;
        };
        return ConverterEvent;
    })(td.Event);
    td.ConverterEvent = ConverterEvent;
})(td || (td = {}));
var td;
(function (td) {
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
    td.ConverterPlugin = ConverterPlugin;
})(td || (td = {}));
var td;
(function (td) {
    var CompilerEvent = (function (_super) {
        __extends(CompilerEvent, _super);
        function CompilerEvent() {
            _super.apply(this, arguments);
        }
        return CompilerEvent;
    })(td.ConverterEvent);
    td.CompilerEvent = CompilerEvent;
})(td || (td = {}));
var td;
(function (td) {
    var ResolveEvent = (function (_super) {
        __extends(ResolveEvent, _super);
        function ResolveEvent() {
            _super.apply(this, arguments);
        }
        return ResolveEvent;
    })(td.ConverterEvent);
    td.ResolveEvent = ResolveEvent;
})(td || (td = {}));
var td;
(function (td) {
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
            converter.on(td.Converter.EVENT_BEGIN, this.onBegin, this);
            converter.on(td.Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this);
            converter.on(td.Converter.EVENT_CREATE_SIGNATURE, this.onDeclaration, this);
            converter.on(td.Converter.EVENT_CREATE_TYPE_PARAMETER, this.onCreateTypeParameter, this);
            converter.on(td.Converter.EVENT_FUNCTION_IMPLEMENTATION, this.onFunctionImplementation, this);
            converter.on(td.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this);
            converter.on(td.Converter.EVENT_RESOLVE, this.onResolve, this);
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
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        CommentPlugin.prototype.onBegin = function (event) {
            this.comments = {};
        };
        CommentPlugin.prototype.onCreateTypeParameter = function (event) {
            var reflection = event.reflection;
            var comment = reflection.parent.comment;
            if (comment) {
                var tag = comment.getTag('typeparam', reflection.name);
                if (!tag)
                    tag = comment.getTag('param', '<' + reflection.name + '>');
                if (!tag)
                    tag = comment.getTag('param', reflection.name);
                if (tag) {
                    reflection.comment = new td.Comment(tag.text);
                    comment.tags.splice(comment.tags.indexOf(tag), 1);
                }
            }
        };
        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * Invokes the comment parser.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        CommentPlugin.prototype.onDeclaration = function (event) {
            var rawComment = CommentPlugin.getComment(event.node);
            if (!rawComment)
                return;
            if (event.reflection.kindOf(td.ReflectionKind.FunctionOrMethod)) {
                var comment = CommentPlugin.parseComment(rawComment, event.reflection.comment);
                this.applyAccessModifiers(event.reflection, comment);
            }
            else if (event.reflection.kindOf(2 /* Module */)) {
                this.storeModuleComment(rawComment, event.reflection);
            }
            else {
                var comment = CommentPlugin.parseComment(rawComment, event.reflection.comment);
                this.applyAccessModifiers(event.reflection, comment);
                event.reflection.comment = comment;
            }
        };
        CommentPlugin.prototype.applyAccessModifiers = function (reflection, comment) {
            if (comment.hasTag('private')) {
                reflection.setFlag(1 /* Private */);
                CommentPlugin.removeTags(comment, 'private');
            }
            if (comment.hasTag('protected')) {
                reflection.setFlag(2 /* Protected */);
                CommentPlugin.removeTags(comment, 'protected');
            }
            if (comment.hasTag('public')) {
                reflection.setFlag(4 /* Public */);
                CommentPlugin.removeTags(comment, 'public');
            }
            if (comment.hasTag('hidden')) {
                if (!this.hidden)
                    this.hidden = [];
                this.hidden.push(reflection);
            }
        };
        CommentPlugin.prototype.onFunctionImplementation = function (event) {
            var comment = CommentPlugin.getComment(event.node);
            if (comment) {
                event.reflection.comment = CommentPlugin.parseComment(comment, event.reflection.comment);
            }
        };
        /**
         * Triggered when the dispatcher enters the resolving phase.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        CommentPlugin.prototype.onBeginResolve = function (event) {
            for (var id in this.comments) {
                if (!this.comments.hasOwnProperty(id)) {
                    continue;
                }
                var info = this.comments[id];
                var comment = CommentPlugin.parseComment(info.fullText);
                CommentPlugin.removeTags(comment, 'preferred');
                this.applyAccessModifiers(info.reflection, comment);
                info.reflection.comment = comment;
            }
            if (this.hidden) {
                this.hidden.forEach(function (reflection) {
                    CommentPlugin.removeReflection(event.getProject(), reflection);
                });
            }
        };
        /**
         * Triggered when the dispatcher resolves a reflection.
         *
         * Cleans up comment tags related to signatures like @param or @return
         * and moves their data to the corresponding parameter reflections.
         *
         * This hook also copies over the comment of function implementations to their
         * signatures.
         *
         * @param event  The event containing the reflection to resolve.
         */
        CommentPlugin.prototype.onResolve = function (event) {
            var reflection = event.reflection;
            if (!(reflection instanceof td.DeclarationReflection))
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
                            childComment = signature.comment = new td.Comment();
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
                                parameter.comment = new td.Comment(tag.text);
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
            if (node.kind == 189 /* ModuleDeclaration */) {
                var a, b;
                // Ignore comments for cascaded modules, e.g. module A.B { }
                if (node.nextContainer && node.nextContainer.kind == 189 /* 'ModuleDeclaration' */) {
                    a = node;
                    b = node.nextContainer;
                    if (a.name.end + 1 == b.name.pos) {
                        return null;
                    }
                }
                while (target.parent && target.parent.kind == 189 /* 'ModuleDeclaration' */) {
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
            if (node.parent && node.parent.kind == 164 /* 'VariableStatement' */) {
                target = node.parent;
            }
            var comments = ts.getJsDocComments(target, sourceFile);
            if (comments && comments.length) {
                var comment;
                if (node.kind == 201 /* 'SourceFile' */) {
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
                        case 0 /* Children */:
                            if (parent.children) {
                                var index = parent.children.indexOf(reflection);
                                if (index != -1)
                                    parent.children.splice(index, 1);
                            }
                            break;
                        case 6 /* GetSignature */:
                            delete parent.getSignature;
                            break;
                        case 5 /* IndexSignature */:
                            delete parent.indexSignature;
                            break;
                        case 1 /* Parameters */:
                            if (reflection.parent.parameters) {
                                var index = reflection.parent.parameters.indexOf(reflection);
                                if (index != -1)
                                    reflection.parent.parameters.splice(index, 1);
                            }
                            break;
                        case 7 /* SetSignature */:
                            delete parent.setSignature;
                            break;
                        case 4 /* Signatures */:
                            if (parent.signatures) {
                                var index = parent.signatures.indexOf(reflection);
                                if (index != -1)
                                    parent.signatures.splice(index, 1);
                            }
                            break;
                        case 2 /* TypeLiteral */:
                            parent.type = new td.IntrinsicType('Object');
                            break;
                        case 3 /* TypeParameter */:
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
            if (comment === void 0) { comment = new td.Comment(); }
            function consumeTypeData(line) {
                line = line.replace(/^\{[^\}]*\}/, '');
                line = line.replace(/^\[[^\]]*\]/, '');
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
                    }
                    else if (tagName == 'returns') {
                        line = consumeTypeData(line);
                    }
                    currentTag = new td.CommentTag(tagName, paramName, line);
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
    })(td.ConverterPlugin);
    td.CommentPlugin = CommentPlugin;
    /**
     * Register this handler.
     */
    td.Converter.registerPlugin('comment', CommentPlugin);
})(td || (td = {}));
var td;
(function (td) {
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
            converter.on(td.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this, 512);
        }
        /**
         * Triggered when the dispatcher starts processing a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        DeepCommentPlugin.prototype.onBeginResolve = function (event) {
            var project = event.getProject();
            var name;
            for (var key in project.reflections) {
                var reflection = project.reflections[key];
                if (!reflection.comment) {
                    findDeepComment(reflection);
                }
            }
            function push(parent) {
                var part = parent.originalName;
                if (!part || part.substr(0, 2) == '__' || parent instanceof td.SignatureReflection) {
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
                while (target && !(target instanceof td.ProjectReflection)) {
                    push(target);
                    if (target.comment) {
                        var tag;
                        if (reflection instanceof td.TypeParameterReflection) {
                            tag = target.comment.getTag('typeparam', reflection.name);
                            if (!tag)
                                tag = target.comment.getTag('param', '<' + reflection.name + '>');
                        }
                        if (!tag)
                            tag = target.comment.getTag('param', name);
                        if (tag) {
                            target.comment.tags.splice(target.comment.tags.indexOf(tag), 1);
                            reflection.comment = new td.Comment('', tag.text);
                            break;
                        }
                    }
                    target = target.parent;
                }
            }
        };
        return DeepCommentPlugin;
    })(td.ConverterPlugin);
    td.DeepCommentPlugin = DeepCommentPlugin;
    /**
     * Register this handler.
     */
    td.Converter.registerPlugin('deepComment', DeepCommentPlugin);
})(td || (td = {}));
var td;
(function (td) {
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
            this.basePath = new td.BasePath();
            converter.on(td.Converter.EVENT_BEGIN, this.onBegin, this);
            converter.on(td.Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this);
            converter.on(td.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this);
        }
        /**
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        DynamicModulePlugin.prototype.onBegin = function (event) {
            this.basePath.reset();
            this.reflections = [];
        };
        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        DynamicModulePlugin.prototype.onDeclaration = function (event) {
            if (event.reflection.kindOf(1 /* ExternalModule */)) {
                var name = event.reflection.name;
                if (name.indexOf('/') == -1) {
                    return;
                }
                name = name.replace(/"/g, '');
                this.reflections.push(event.reflection);
                this.basePath.add(name);
            }
        };
        /**
         * Triggered when the dispatcher enters the resolving phase.
         *
         * @param event  The event containing the reflection to resolve.
         */
        DynamicModulePlugin.prototype.onBeginResolve = function (event) {
            var _this = this;
            this.reflections.forEach(function (reflection) {
                var name = reflection.name.replace(/"/g, '');
                name = name.substr(0, name.length - td.Path.extname(name).length);
                reflection.name = '"' + _this.basePath.trim(name) + '"';
            });
        };
        return DynamicModulePlugin;
    })(td.ConverterPlugin);
    td.DynamicModulePlugin = DynamicModulePlugin;
    /**
     * Register this handler.
     */
    td.Converter.registerPlugin('dynamicModule', DynamicModulePlugin);
})(td || (td = {}));
var td;
(function (td) {
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
                        _this.files.push(td.BasePath.normalize(path + '/' + file));
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
            return new Repository(td.BasePath.normalize(out.output.replace("\n", '')));
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
                converter.on(td.Converter.EVENT_RESOLVE_END, this.onEndResolve, this);
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
         * Triggered when the dispatcher leaves the resolving phase.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        GitHubPlugin.prototype.onEndResolve = function (event) {
            var _this = this;
            var project = event.getProject();
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
    })(td.ConverterPlugin);
    td.GitHubPlugin = GitHubPlugin;
    /**
     * Register this handler.
     */
    td.Converter.registerPlugin('gitHub', GitHubPlugin);
})(td || (td = {}));
var td;
(function (td) {
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
            converter.on(td.Converter.EVENT_RESOLVE, this.onResolve, this);
            converter.on(td.Converter.EVENT_RESOLVE_END, this.onEndResolve, this);
        }
        GroupPlugin.prototype.onResolve = function (event) {
            var reflection = event.reflection;
            reflection.kindString = GroupPlugin.getKindSingular(reflection.kind);
            if (reflection instanceof td.ContainerReflection) {
                var container = reflection;
                if (container.children && container.children.length > 0) {
                    container.children.sort(GroupPlugin.sortCallback);
                    container.groups = GroupPlugin.getReflectionGroups(container.children);
                }
            }
        };
        /**
         * Triggered once after all documents have been read and the dispatcher
         * leaves the resolving phase.
         */
        GroupPlugin.prototype.onEndResolve = function (event) {
            function walkDirectory(directory) {
                directory.groups = GroupPlugin.getReflectionGroups(directory.getAllReflections());
                for (var key in directory.directories) {
                    if (!directory.directories.hasOwnProperty(key))
                        continue;
                    walkDirectory(directory.directories[key]);
                }
            }
            var project = event.getProject();
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
                var group = new td.ReflectionGroup(GroupPlugin.getKindPlural(child.kind), child.kind);
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
            var str = td.ReflectionKind[kind];
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
            0 /* Global */,
            1 /* ExternalModule */,
            2 /* Module */,
            4 /* Enum */,
            16 /* EnumMember */,
            128 /* Class */,
            256 /* Interface */,
            4194304 /* TypeAlias */,
            512 /* Constructor */,
            1024 /* Property */,
            32 /* Variable */,
            64 /* Function */,
            262144 /* Accessor */,
            2048 /* Method */,
            2097152 /* ObjectLiteral */,
            32768 /* Parameter */,
            131072 /* TypeParameter */,
            65536 /* TypeLiteral */,
            4096 /* CallSignature */,
            16384 /* ConstructorSignature */,
            8192 /* IndexSignature */,
            524288 /* GetSignature */,
            1048576 /* SetSignature */,
        ];
        /**
         * Define the singular name of individual reflection kinds.
         */
        GroupPlugin.SINGULARS = (function () {
            var singulars = {};
            singulars[4 /* Enum */] = 'Enumeration';
            singulars[16 /* EnumMember */] = 'Enumeration member';
            return singulars;
        })();
        /**
         * Define the plural name of individual reflection kinds.
         */
        GroupPlugin.PLURALS = (function () {
            var plurals = {};
            plurals[128 /* Class */] = 'Classes';
            plurals[1024 /* Property */] = 'Properties';
            plurals[4 /* Enum */] = 'Enumerations';
            plurals[16 /* EnumMember */] = 'Enumeration members';
            plurals[4194304 /* TypeAlias */] = 'Type aliases';
            return plurals;
        })();
        return GroupPlugin;
    })(td.ConverterPlugin);
    td.GroupPlugin = GroupPlugin;
    /**
     * Register this handler.
     */
    td.Converter.registerPlugin('group', GroupPlugin);
})(td || (td = {}));
var td;
(function (td) {
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
            converter.on(td.Converter.EVENT_BEGIN, this.onBegin, this);
            converter.on(td.Converter.EVENT_FILE_BEGIN, this.onBeginDocument, this);
            converter.on(td.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this);
        }
        /**
         * Triggered once per project before the dispatcher invokes the compiler.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        PackagePlugin.prototype.onBegin = function (event) {
            this.readmeFile = null;
            this.packageFile = null;
            this.visited = [];
            var readme = event.getSettings().readme;
            this.noReadmeFile = (readme == 'none');
            if (!this.noReadmeFile && readme) {
                readme = td.Path.resolve(readme);
                if (td.FS.existsSync(readme)) {
                    this.readmeFile = readme;
                }
            }
        };
        /**
         * Triggered when the dispatcher begins processing a typescript document.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        PackagePlugin.prototype.onBeginDocument = function (event) {
            var _this = this;
            if (this.readmeFile && this.packageFile) {
                return;
            }
            var fileName = event.node.filename;
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
         * Triggered when the dispatcher enters the resolving phase.
         *
         * @param event  The event containing the project and compiler.
         */
        PackagePlugin.prototype.onBeginResolve = function (event) {
            var project = event.getProject();
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
    })(td.ConverterPlugin);
    td.PackagePlugin = PackagePlugin;
    /**
     * Register this handler.
     */
    td.Converter.registerPlugin('package', PackagePlugin);
})(td || (td = {}));
var td;
(function (td) {
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
            this.basePath = new td.BasePath();
            /**
             * A map of all generated [[SourceFile]] instances.
             */
            this.fileMappings = {};
            converter.on(td.Converter.EVENT_BEGIN, this.onBegin, this);
            converter.on(td.Converter.EVENT_FILE_BEGIN, this.onBeginDocument, this);
            converter.on(td.Converter.EVENT_CREATE_DECLARATION, this.onDeclaration, this);
            converter.on(td.Converter.EVENT_CREATE_SIGNATURE, this.onDeclaration, this);
            converter.on(td.Converter.EVENT_RESOLVE_BEGIN, this.onBeginResolve, this);
            converter.on(td.Converter.EVENT_RESOLVE, this.onResolve, this);
            converter.on(td.Converter.EVENT_RESOLVE_END, this.onEndResolve, this);
        }
        SourcePlugin.prototype.getSourceFile = function (fileName, project) {
            if (!this.fileMappings[fileName]) {
                var file = new td.SourceFile(fileName);
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
         * Triggered when the dispatcher starts processing a TypeScript document.
         *
         * Create a new [[SourceFile]] instance for all TypeScript files.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        SourcePlugin.prototype.onBeginDocument = function (event) {
            var fileName = event.node.filename;
            this.basePath.add(fileName);
            this.getSourceFile(fileName, event.getProject());
        };
        /**
         * Triggered when the dispatcher processes a declaration.
         *
         * Attach the current source file to the [[DeclarationReflection.sources]] array.
         *
         * @param state  The state that describes the current declaration and reflection.
         */
        SourcePlugin.prototype.onDeclaration = function (event) {
            var sourceFile = ts.getSourceFileOfNode(event.node);
            var fileName = sourceFile.filename;
            var file = this.getSourceFile(fileName, event.getProject());
            var position;
            if (event.node['name'] && event.node['name'].end) {
                position = sourceFile.getLineAndCharacterFromPosition(event.node['name'].end);
            }
            else {
                position = sourceFile.getLineAndCharacterFromPosition(event.node.pos);
            }
            if (!event.reflection.sources)
                event.reflection.sources = [];
            if (event.reflection instanceof td.DeclarationReflection) {
                file.reflections.push(event.reflection);
            }
            event.reflection.sources.push({
                file: file,
                fileName: fileName,
                line: position.line,
                character: position.character
            });
        };
        /**
         * Triggered when the dispatcher enters the resolving phase.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        SourcePlugin.prototype.onBeginResolve = function (event) {
            var _this = this;
            event.getProject().files.forEach(function (file) {
                var fileName = file.fileName = _this.basePath.trim(file.fileName);
                _this.fileMappings[fileName] = file;
            });
        };
        /**
         * Triggered by the dispatcher for each reflection in the resolving phase.
         *
         * @param event  The event containing the reflection to resolve.
         */
        SourcePlugin.prototype.onResolve = function (event) {
            var _this = this;
            if (!event.reflection.sources)
                return;
            event.reflection.sources.forEach(function (source) {
                source.fileName = _this.basePath.trim(source.fileName);
            });
        };
        /**
         * Triggered when the dispatcher leaves the resolving phase.
         *
         * @param event  An event object containing the related project and compiler instance.
         */
        SourcePlugin.prototype.onEndResolve = function (event) {
            var project = event.getProject();
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
                            directory.directories[path] = new td.SourceDirectory(path, directory);
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
    })(td.ConverterPlugin);
    td.SourcePlugin = SourcePlugin;
    /**
     * Register this handler.
     */
    td.Converter.registerPlugin('source', SourcePlugin);
})(td || (td = {}));
var td;
(function (td) {
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
            converter.on(td.Converter.EVENT_RESOLVE, this.onResolve, this);
            converter.on(td.Converter.EVENT_RESOLVE_END, this.onResolveEnd, this);
        }
        /**
         * Triggered by the dispatcher for each reflection in the resolving phase.
         *
         * @param event  The event containing the reflection to resolve.
         */
        TypePlugin.prototype.onResolve = function (event) {
            var _this = this;
            var project = event.getProject();
            var reflection = event.reflection;
            resolveType(reflection, reflection.type);
            resolveType(reflection, reflection.inheritedFrom);
            resolveType(reflection, reflection.overwrites);
            resolveTypes(reflection, reflection.extendedTypes);
            resolveTypes(reflection, reflection.extendedBy);
            resolveTypes(reflection, reflection.implementedTypes);
            if (reflection.kindOf(td.ReflectionKind.ClassOrInterface)) {
                this.postpone(reflection);
                walk(reflection.implementedTypes, function (target) {
                    _this.postpone(target);
                    if (!target.implementedBy)
                        target.implementedBy = [];
                    target.implementedBy.push(new td.ReferenceType(reflection.name, td.ReferenceType.SYMBOL_ID_RESOLVED, reflection));
                });
                walk(reflection.extendedTypes, function (target) {
                    _this.postpone(target);
                    if (!target.extendedBy)
                        target.extendedBy = [];
                    target.extendedBy.push(new td.ReferenceType(reflection.name, td.ReferenceType.SYMBOL_ID_RESOLVED, reflection));
                });
            }
            function walk(types, callback) {
                if (!types)
                    return;
                types.forEach(function (type) {
                    if (!(type instanceof td.ReferenceType))
                        return;
                    if (!type.reflection || !(type.reflection instanceof td.DeclarationReflection))
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
                if (type instanceof td.ReferenceType) {
                    var referenceType = type;
                    if (referenceType.symbolID == td.ReferenceType.SYMBOL_ID_RESOLVE_BY_NAME) {
                        referenceType.reflection = reflection.findReflectionByName(referenceType.name);
                    }
                    else if (!referenceType.reflection && referenceType.symbolID != td.ReferenceType.SYMBOL_ID_RESOLVED) {
                        referenceType.reflection = project.reflections[project.symbolMapping[referenceType.symbolID]];
                    }
                    if (referenceType.typeArguments) {
                        referenceType.typeArguments.forEach(function (typeArgument) {
                            resolveType(reflection, typeArgument);
                        });
                    }
                }
                else if (type instanceof td.TupleType) {
                    var tupleType = type;
                    for (var index = 0, count = tupleType.elements.length; index < count; index++) {
                        resolveType(reflection, tupleType.elements[index]);
                    }
                }
                else if (type instanceof td.UnionType) {
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
         * Return the simplified type hierarchy for the given reflection.
         *
         * @TODO Type hierarchies for interfaces with multiple parent interfaces.
         *
         * @param reflection The reflection whose type hierarchy should be generated.
         * @returns The root of the generated type hierarchy.
         */
        TypePlugin.prototype.onResolveEnd = function (event) {
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
                push([new td.ReferenceType(reflection.name, td.ReferenceType.SYMBOL_ID_RESOLVED, reflection)]);
                hierarchy.isTarget = true;
                if (reflection.extendedBy) {
                    push(reflection.extendedBy);
                }
                reflection.typeHierarchy = root;
            });
        };
        return TypePlugin;
    })(td.ConverterPlugin);
    td.TypePlugin = TypePlugin;
    /**
     * Register this handler.
     */
    td.Converter.registerPlugin('type', TypePlugin);
})(td || (td = {}));
var td;
(function (td) {
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
    td.Comment = Comment;
})(td || (td = {}));
var td;
(function (td) {
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
    td.CommentTag = CommentTag;
})(td || (td = {}));
var td;
(function (td) {
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
    td.NavigationItem = NavigationItem;
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
    td.resetReflectionID = resetReflectionID;
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
        ReflectionKind[ReflectionKind["ClassOrInterface"] = ReflectionKind.Class | ReflectionKind.Interface] = "ClassOrInterface";
        ReflectionKind[ReflectionKind["VariableOrProperty"] = ReflectionKind.Variable | ReflectionKind.Property] = "VariableOrProperty";
        ReflectionKind[ReflectionKind["FunctionOrMethod"] = ReflectionKind.Function | ReflectionKind.Method] = "FunctionOrMethod";
        ReflectionKind[ReflectionKind["SomeSignature"] = ReflectionKind.CallSignature | ReflectionKind.IndexSignature | ReflectionKind.ConstructorSignature | ReflectionKind.GetSignature | ReflectionKind.SetSignature] = "SomeSignature";
        ReflectionKind[ReflectionKind["SomeModule"] = ReflectionKind.Module | ReflectionKind.ExternalModule] = "SomeModule";
    })(td.ReflectionKind || (td.ReflectionKind = {}));
    var ReflectionKind = td.ReflectionKind;
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
    })(td.ReflectionFlag || (td.ReflectionFlag = {}));
    var ReflectionFlag = td.ReflectionFlag;
    var relevantFlags = [
        1 /* Private */,
        2 /* Protected */,
        8 /* Static */,
        32 /* ExportAssignment */,
        128 /* Optional */,
        256 /* DefaultValue */,
        512 /* Rest */
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
    })(td.TraverseProperty || (td.TraverseProperty = {}));
    var TraverseProperty = td.TraverseProperty;
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
            if (this.parent && !(this.parent instanceof td.ProjectReflection)) {
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
                this.flags.flags &= flag;
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
                case 1 /* Private */:
                    this.flags.isPrivate = value;
                    if (value) {
                        this.setFlag(2 /* Protected */, false);
                        this.setFlag(4 /* Public */, false);
                    }
                    break;
                case 2 /* Protected */:
                    this.flags.isProtected = value;
                    if (value) {
                        this.setFlag(1 /* Private */, false);
                        this.setFlag(4 /* Public */, false);
                    }
                    break;
                case 4 /* Public */:
                    this.flags.isPublic = value;
                    if (value) {
                        this.setFlag(1 /* Private */, false);
                        this.setFlag(2 /* Protected */, false);
                    }
                    break;
                case 8 /* Static */:
                    this.flags.isStatic = value;
                    break;
                case 16 /* Exported */:
                    this.flags.isExported = value;
                    break;
                case 64 /* External */:
                    this.flags.isExternal = value;
                    break;
                case 128 /* Optional */:
                    this.flags.isOptional = value;
                    break;
                case 512 /* Rest */:
                    this.flags.isRest = value;
                    break;
                case 32 /* ExportAssignment */:
                    this.flags.hasExportAssignment = value;
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
                while (target.parent && !(target.parent instanceof td.ProjectReflection) && !target.hasOwnDocument) {
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
            this.traverse(function (child) {
                if (child.name == name) {
                    if (names.length <= 1) {
                        return child;
                    }
                    else if (child) {
                        return child.getChildByName(names.slice(1));
                    }
                }
            });
            return null;
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
        Reflection.prototype.traverse = function (callback) {
        };
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
                if (parseInt(key) == key)
                    continue;
                if (this.flags[key])
                    result.flags[key] = true;
            }
            this.traverse(function (child, property) {
                if (property == 2 /* TypeLiteral */)
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
    td.Reflection = Reflection;
})(td || (td = {}));
var td;
(function (td) {
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
    td.ReflectionGroup = ReflectionGroup;
})(td || (td = {}));
var td;
(function (td) {
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
    td.SourceDirectory = SourceDirectory;
})(td || (td = {}));
var td;
(function (td) {
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
    td.SourceFile = SourceFile;
})(td || (td = {}));
var td;
(function (td) {
    /**
     * Base class of all type definitions.
     *
     * Instances of this class are also used to represent the type `void`.
     */
    var Type = (function () {
        function Type() {
        }
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
        return Type;
    })();
    td.Type = Type;
})(td || (td = {}));
var td;
(function (td) {
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
    td.UrlMapping = UrlMapping;
})(td || (td = {}));
var td;
(function (td) {
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
                this.children.forEach(function (child) { return callback(child, 0 /* Children */); });
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
    })(td.Reflection);
    td.ContainerReflection = ContainerReflection;
})(td || (td = {}));
var td;
(function (td) {
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
                this.typeParameters.forEach(function (parameter) { return callback(parameter, 3 /* TypeParameter */); });
            }
            if (this.type instanceof td.ReflectionType) {
                callback(this.type.declaration, 2 /* TypeLiteral */);
            }
            if (this.signatures) {
                this.signatures.forEach(function (signature) { return callback(signature, 4 /* Signatures */); });
            }
            if (this.indexSignature) {
                callback(this.indexSignature, 5 /* IndexSignature */);
            }
            if (this.getSignature) {
                callback(this.getSignature, 6 /* GetSignature */);
            }
            if (this.setSignature) {
                callback(this.setSignature, 7 /* SetSignature */);
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
    })(td.ContainerReflection);
    td.DeclarationReflection = DeclarationReflection;
})(td || (td = {}));
var td;
(function (td) {
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
            if (this.type instanceof td.ReflectionType) {
                callback(this.type.declaration, 2 /* TypeLiteral */);
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
    })(td.Reflection);
    td.ParameterReflection = ParameterReflection;
})(td || (td = {}));
var td;
(function (td) {
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
            _super.call(this, null, name, 0 /* Global */);
            /**
             * A list of all reflections within the project.
             */
            this.reflections = {};
            this.symbolMapping = {};
            /**
             * The root directory of the project.
             */
            this.directory = new td.SourceDirectory();
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
    })(td.ContainerReflection);
    td.ProjectReflection = ProjectReflection;
})(td || (td = {}));
var td;
(function (td) {
    var SignatureReflection = (function (_super) {
        __extends(SignatureReflection, _super);
        function SignatureReflection() {
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
        SignatureReflection.prototype.traverse = function (callback) {
            if (this.type instanceof td.ReflectionType) {
                callback(this.type.declaration, 2 /* TypeLiteral */);
            }
            if (this.typeParameters) {
                this.typeParameters.forEach(function (parameter) { return callback(parameter, 3 /* TypeParameter */); });
            }
            if (this.parameters) {
                this.parameters.forEach(function (parameter) { return callback(parameter, 1 /* Parameters */); });
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
    })(td.Reflection);
    td.SignatureReflection = SignatureReflection;
})(td || (td = {}));
var td;
(function (td) {
    var TypeParameterReflection = (function (_super) {
        __extends(TypeParameterReflection, _super);
        /**
         * Create a new TypeParameterReflection instance.
         */
        function TypeParameterReflection(parent, type) {
            _super.call(this, parent, type.name, 131072 /* TypeParameter */);
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
    })(td.Reflection);
    td.TypeParameterReflection = TypeParameterReflection;
})(td || (td = {}));
var td;
(function (td) {
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
    })(td.Type);
    td.IntrinsicType = IntrinsicType;
})(td || (td = {}));
var td;
(function (td) {
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
    })(td.Type);
    td.ReferenceType = ReferenceType;
})(td || (td = {}));
var td;
(function (td) {
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
    })(td.Type);
    td.ReflectionType = ReflectionType;
})(td || (td = {}));
var td;
(function (td) {
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
    })(td.Type);
    td.StringLiteralType = StringLiteralType;
})(td || (td = {}));
var td;
(function (td) {
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
    })(td.Type);
    td.TupleType = TupleType;
})(td || (td = {}));
var td;
(function (td) {
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
    })(td.Type);
    td.TypeParameterType = TypeParameterType;
})(td || (td = {}));
var td;
(function (td) {
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
    })(td.Type);
    td.UnionType = UnionType;
})(td || (td = {}));
var td;
(function (td) {
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
         * Return a raw object representation of this type.
         */
        UnknownType.prototype.toObject = function () {
            var result = _super.prototype.toObject.call(this);
            result.type = 'unknown';
            result.name = name;
            return result;
        };
        /**
         * Return a string representation of this type.
         */
        UnknownType.prototype.toString = function () {
            return this.name;
        };
        return UnknownType;
    })(td.Type);
    td.UnknownType = UnknownType;
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
                this.application.log(td.Util.format('Cannot resolve templates before theme is set.'), 3 /* Error */);
                return null;
            }
            if (!this.templates[fileName]) {
                var path = td.Path.resolve(td.Path.join(this.theme.basePath, fileName));
                if (!td.FS.existsSync(path)) {
                    path = td.Path.resolve(td.Path.join(Renderer.getDefaultTheme(), fileName));
                    if (!td.FS.existsSync(path)) {
                        this.application.log(td.Util.format('Cannot find template %s', fileName), 3 /* Error */);
                        return null;
                    }
                }
                this.templates[fileName] = td.Handlebars.compile(Renderer.readFile(path));
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
            var output = new td.OutputEvent();
            output.outputDirectory = outputDirectory;
            output.project = project;
            output.settings = this.application.settings;
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
                td.writeFile(page.filename, page.contents, true);
            }
            catch (error) {
                this.application.log(td.Util.format('Error: Could not write %s', page.filename), 3 /* Error */);
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
                var themeName = this.application.settings.theme;
                var path = td.Path.resolve(themeName);
                if (!td.FS.existsSync(path)) {
                    path = td.Path.join(Renderer.getThemeDirectory(), themeName);
                    if (!td.FS.existsSync(path)) {
                        this.application.log(td.Util.format('The theme %s could not be found.', themeName), 3 /* Error */);
                        return false;
                    }
                }
                var filename = td.Path.join(path, 'theme.js');
                if (!td.FS.existsSync(filename)) {
                    this.theme = new td.DefaultTheme(this, path);
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
                if (!this.theme.isOutputDirectory(directory)) {
                    this.application.log(td.Util.format('Error: The output directory "%s" exists but does not seem to be a documentation generated by TypeDoc.\n' + 'Make sure this is the right target directory, delete the folder and rerun TypeDoc.', directory), 3 /* Error */);
                    return false;
                }
                try {
                    td.FS.rmrfSync(directory);
                }
                catch (error) {
                    this.application.log('Warning: Could not empty the output directory.', 2 /* Warn */);
                }
            }
            if (!td.FS.existsSync(directory)) {
                try {
                    td.FS.mkdirpSync(directory);
                }
                catch (error) {
                    this.application.log(td.Util.format('Error: Could not create output directory %s', directory), 3 /* Error */);
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
    td.Renderer = Renderer;
})(td || (td = {}));
var td;
(function (td) {
    /**
     * Base class of all plugins that can be attached to the [[Renderer]].
     */
    var RendererPlugin = (function () {
        /**
         * Create a new BasePlugin instance.
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
    td.RendererPlugin = RendererPlugin;
})(td || (td = {}));
var td;
(function (td) {
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
    td.Theme = Theme;
})(td || (td = {}));
var td;
(function (td) {
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
            var event = new td.OutputPageEvent();
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
    td.OutputEvent = OutputEvent;
})(td || (td = {}));
var td;
(function (td) {
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
    td.OutputPageEvent = OutputPageEvent;
})(td || (td = {}));
var td;
(function (td) {
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
            renderer.on(td.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
        }
        /**
         * Triggered before the renderer starts rendering a project.
         *
         * @param event  An event object describing the current render operation.
         */
        AssetsPlugin.prototype.onRendererBegin = function (event) {
            var fromDefault = td.Path.join(td.Renderer.getDefaultTheme(), 'assets');
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
    })(td.RendererPlugin);
    td.AssetsPlugin = AssetsPlugin;
    /**
     * Register this plugin.
     */
    td.Renderer.registerPlugin('assets', AssetsPlugin);
})(td || (td = {}));
var td;
(function (td) {
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
            renderer.on(td.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
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
                if (!(reflection instanceof td.DeclarationReflection))
                    continue;
                if (!reflection.url || !reflection.name || reflection.flags.isExternal || reflection.name == '')
                    continue;
                var parent = reflection.parent;
                if (parent instanceof td.ProjectReflection) {
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
                    kinds[reflection.kind] = td.GroupPlugin.getKindSingular(reflection.kind);
                }
                rows.push(row);
            }
            var fileName = td.Path.join(event.outputDirectory, 'assets', 'js', 'search.js');
            var data = 'var typedoc = typedoc || {};' + 'typedoc.search = typedoc.search || {};' + 'typedoc.search.data = ' + JSON.stringify({ kinds: kinds, rows: rows }) + ';';
            td.writeFile(fileName, data, true);
        };
        return JavascriptIndexPlugin;
    })(td.RendererPlugin);
    td.JavascriptIndexPlugin = JavascriptIndexPlugin;
    /**
     * Register this plugin.
     */
    td.Renderer.registerPlugin('javascriptIndex', JavascriptIndexPlugin);
})(td || (td = {}));
var td;
(function (td) {
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
            renderer.on(td.Renderer.EVENT_END_PAGE, this.onRendererEndPage, this);
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
    })(td.RendererPlugin);
    td.LayoutPlugin = LayoutPlugin;
    /**
     * Register this plugin.
     */
    td.Renderer.registerPlugin('layout', LayoutPlugin);
})(td || (td = {}));
var td;
(function (td) {
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
            renderer.on(td.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
            renderer.on(td.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
            var that = this;
            td.Handlebars.registerHelper('markdown', function (arg) {
                return that.parseMarkdown(arg.fn(this), this);
            });
            td.Handlebars.registerHelper('compact', function (arg) {
                return that.getCompact(arg.fn(this));
            });
            td.Handlebars.registerHelper('relativeURL', function (url) { return _this.getRelativeUrl(url); });
            td.Handlebars.registerHelper('wbr', function (str) { return _this.getWordBreaks(str); });
            td.Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
                return that.getIfCond(v1, operator, v2, options, this);
            });
            td.HighlightJS.registerLanguage('typescript', highlightTypeScript);
            td.Marked.setOptions({
                highlight: function (text, lang) { return _this.getHighlighted(text, lang); }
            });
        }
        /**
         * Transform the given absolute path into a relative path.
         *
         * @param absolute  The absolute path to transform.
         * @returns A path relative to the document currently processed.
         */
        MarkedPlugin.prototype.getRelativeUrl = function (absolute) {
            var relative = td.Path.relative(td.Path.dirname(this.location), td.Path.dirname(absolute));
            return td.Path.join(relative, td.Path.basename(absolute)).replace(/\\/g, '/');
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
                this.renderer.application.log(error.message, 2 /* Warn */);
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
            text = text.replace(this.mediaPattern, function (match, path) {
                return _this.getRelativeUrl('media') + '/' + path;
            });
            return this.parseReferences(td.Marked(text));
        };
        /**
         * Find all references to symbols within the given text and transform them into a link.
         *
         * The references must be surrounded with double angle brackets. When the reference could
         * not be found, the original text containing the brackets will be returned.
         *
         * This function is aware of the current context and will try to find the symbol within the
         * current reflection. It will walk up the reflection chain till the symbol is found or the
         * root reflection is reached. As a last resort the function will search the entire project
         * for the given symbol.
         *
         * @param text  The text that should be parsed.
         * @returns The text with symbol references replaced by links.
         */
        MarkedPlugin.prototype.parseReferences = function (text) {
            var _this = this;
            return text.replace(/\[\[([^\]]+)\]\]/g, function (match, name) {
                var reflection;
                if (_this.reflection) {
                    reflection = _this.reflection.findReflectionByName(name);
                }
                else if (_this.project) {
                    reflection = _this.project.findReflectionByName(name);
                }
                if (reflection && reflection.url) {
                    return td.Util.format('<a href="%s">%s</a>', _this.getRelativeUrl(reflection.url), name);
                }
                else {
                    return match;
                }
            });
        };
        /**
         * Triggered before the renderer starts rendering a project.
         *
         * @param event  An event object describing the current render operation.
         */
        MarkedPlugin.prototype.onRendererBegin = function (event) {
            this.project = event.project;
            delete this.includes;
            if (event.settings.includes) {
                var includes = td.Path.resolve(event.settings.includes);
                if (td.FS.existsSync(includes) && td.FS.statSync(includes).isDirectory()) {
                    this.includes = includes;
                }
                else {
                    this.renderer.application.log('Could not find provided includes directory: ' + includes, 2 /* Warn */);
                }
            }
            if (event.settings.media) {
                var media = td.Path.resolve(event.settings.media);
                if (td.FS.existsSync(media) && td.FS.statSync(media).isDirectory()) {
                    var to = td.Path.join(event.outputDirectory, 'media');
                    td.FS.copySync(media, to);
                }
                else {
                    this.renderer.application.log('Could not find provided includes directory: ' + includes, 2 /* Warn */);
                }
            }
        };
        /**
         * Triggered before a document will be rendered.
         *
         * @param page  An event object describing the current render operation.
         */
        MarkedPlugin.prototype.onRendererBeginPage = function (page) {
            this.location = page.url;
            this.reflection = page.model instanceof td.DeclarationReflection ? page.model : null;
        };
        return MarkedPlugin;
    })(td.RendererPlugin);
    td.MarkedPlugin = MarkedPlugin;
    /**
     * TypeScript HighlightJS definition.
     */
    function highlightTypeScript(hljs) {
        var IDENT_RE = '[a-zA-Z_$][a-zA-Z0-9_$]*';
        var IDENT_FUNC_RETURN_TYPE_RE = '([*]|[a-zA-Z_$][a-zA-Z0-9_$]*)';
        var AS3_REST_ARG_MODE = {
            className: 'rest_arg',
            begin: '[.]{3}',
            end: IDENT_RE,
            relevance: 10
        };
        return {
            aliases: ['ts'],
            keywords: {
                keyword: 'in if for while finally var new function do return void else break catch ' + 'instanceof with throw case default try this switch continue typeof delete ' + 'let yield const class interface enum static private public',
                literal: 'true false null undefined NaN Infinity any string number void',
                built_in: 'eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent ' + 'encodeURI encodeURIComponent escape unescape Object Function Boolean Error ' + 'EvalError InternalError RangeError ReferenceError StopIteration SyntaxError ' + 'TypeError URIError Number Math Date String RegExp Array Float32Array ' + 'Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array ' + 'Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require'
            },
            contains: [
                hljs.APOS_STRING_MODE,
                hljs.QUOTE_STRING_MODE,
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                hljs.C_NUMBER_MODE,
                {
                    className: 'module',
                    beginKeywords: 'module',
                    end: '{',
                    contains: [hljs.TITLE_MODE]
                },
                {
                    className: 'class',
                    beginKeywords: 'class interface',
                    end: '{',
                    contains: [
                        {
                            beginKeywords: 'extends implements'
                        },
                        hljs.TITLE_MODE
                    ]
                },
                {
                    className: 'function',
                    beginKeywords: 'function',
                    end: '[{;]',
                    illegal: '\\S',
                    contains: [
                        hljs.TITLE_MODE,
                        {
                            className: 'params',
                            begin: '\\(',
                            end: '\\)',
                            contains: [
                                hljs.APOS_STRING_MODE,
                                hljs.QUOTE_STRING_MODE,
                                hljs.C_LINE_COMMENT_MODE,
                                hljs.C_BLOCK_COMMENT_MODE,
                                AS3_REST_ARG_MODE
                            ]
                        },
                        {
                            className: 'type',
                            begin: ':',
                            end: IDENT_FUNC_RETURN_TYPE_RE,
                            relevance: 10
                        }
                    ]
                }
            ]
        };
    }
    /**
     * Register this plugin.
     */
    td.Renderer.registerPlugin('marked', MarkedPlugin);
})(td || (td = {}));
var td;
(function (td) {
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
            renderer.on(td.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
            renderer.on(td.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
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
    })(td.RendererPlugin);
    td.NavigationPlugin = NavigationPlugin;
    /**
     * Register this plugin.
     */
    td.Renderer.registerPlugin('navigation', NavigationPlugin);
})(td || (td = {}));
var td;
(function (td) {
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
            renderer.on(td.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
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
                td.Handlebars.registerPartial(name, td.Renderer.readFile(file));
            });
        };
        /**
         * Triggered before the renderer starts rendering a project.
         *
         * @param event  An event object describing the current render operation.
         */
        PartialsPlugin.prototype.onRendererBegin = function (event) {
            var themePath = td.Path.join(this.renderer.theme.basePath, 'partials');
            var defaultPath = td.Path.join(td.Renderer.getDefaultTheme(), 'partials');
            if (themePath != defaultPath) {
                this.loadPartials(defaultPath);
            }
            this.loadPartials(themePath);
        };
        return PartialsPlugin;
    })(td.RendererPlugin);
    td.PartialsPlugin = PartialsPlugin;
    /**
     * Register this plugin.
     */
    td.Renderer.registerPlugin('partials', PartialsPlugin);
})(td || (td = {}));
var td;
(function (td) {
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
            renderer.on(td.Renderer.EVENT_END_PAGE, this.onRendererEndPage, this, -1024);
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
            var state = 0 /* Default */;
            var stack = [];
            var lines = event.contents.split(/\r\n?|\n/);
            var index = 0;
            var count = lines.length;
            while (index < count) {
                line = lines[index];
                if (emptyLineExp.test(line)) {
                    if (state == 0 /* Default */) {
                        lines.splice(index, 1);
                        count -= 1;
                        continue;
                    }
                }
                else {
                    lineState = state;
                    lineDepth = stack.length;
                    while (match = tagExp.exec(line)) {
                        if (state == 1 /* Comment */) {
                            if (match[0] == '-->') {
                                state = 0 /* Default */;
                            }
                        }
                        else if (state == 2 /* Pre */) {
                            if (match[2] && match[2].toLowerCase() == preName) {
                                state = 0 /* Default */;
                            }
                        }
                        else {
                            if (match[0] == '<!--') {
                                state = 1 /* Comment */;
                            }
                            else if (match[1]) {
                                tagName = match[1].toLowerCase();
                                if (tagName in PrettyPrintPlugin.IGNORED_TAGS)
                                    continue;
                                if (tagName in PrettyPrintPlugin.PRE_TAGS) {
                                    state = 2 /* Pre */;
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
                    if (lineState == 0 /* Default */) {
                        lineDepth = Math.min(lineDepth, stack.length);
                        line = line.replace(/^\s+/, '');
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
    })(td.RendererPlugin);
    td.PrettyPrintPlugin = PrettyPrintPlugin;
    /**
     * Register this plugin.
     */
    td.Renderer.registerPlugin('prettyPrint', PrettyPrintPlugin);
})(td || (td = {}));
var td;
(function (td) {
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
            renderer.on(td.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
        }
        /**
         * Triggered before a document will be rendered.
         *
         * @param page  An event object describing the current render operation.
         */
        TocPlugin.prototype.onRendererBeginPage = function (page) {
            var model = page.model;
            if (!(model instanceof td.Reflection)) {
                return;
            }
            var trail = [];
            while (!(model instanceof td.ProjectReflection) && !model.kindOf(td.ReflectionKind.SomeModule)) {
                trail.unshift(model);
                model = model.parent;
            }
            page.toc = new td.NavigationItem();
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
                var item = td.NavigationItem.create(child, parent, true);
                item.isInPath = true;
                item.isCurrent = false;
                TocPlugin.buildToc(child, trail, item);
            }
            else {
                children.forEach(function (child) {
                    if (child.kindOf(td.ReflectionKind.SomeModule)) {
                        return;
                    }
                    var item = td.NavigationItem.create(child, parent, true);
                    if (trail.indexOf(child) != -1) {
                        item.isInPath = true;
                        item.isCurrent = (trail[trail.length - 1] == child);
                        TocPlugin.buildToc(child, trail, item);
                    }
                });
            }
        };
        return TocPlugin;
    })(td.RendererPlugin);
    td.TocPlugin = TocPlugin;
    /**
     * Register this plugin.
     */
    td.Renderer.registerPlugin('toc', TocPlugin);
})(td || (td = {}));
var td;
(function (td) {
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
            renderer.on(td.Renderer.EVENT_BEGIN, this.onRendererBegin, this, 1024);
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
        /**
         * Map the models of the given project to the desired output files.
         *
         * @param project  The project whose urls should be generated.
         * @returns        A list of [[UrlMapping]] instances defining which models
         *                 should be rendered to which files.
         */
        DefaultTheme.prototype.getUrls = function (project) {
            var urls = [];
            if (this.renderer.application.settings.readme == 'none') {
                project.url = 'index.html';
                urls.push(new td.UrlMapping('index.html', project, 'reflection.hbs'));
            }
            else {
                project.url = 'globals.html';
                urls.push(new td.UrlMapping('globals.html', project, 'reflection.hbs'));
                urls.push(new td.UrlMapping('index.html', project, 'index.hbs'));
            }
            project.children.forEach(function (child) {
                DefaultTheme.buildUrls(child, urls);
            });
            return urls;
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
                        if (child.hasOwnDocument && !child.kindOf(td.ReflectionKind.SomeModule)) {
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
                var modules = reflection.getChildrenByKind(td.ReflectionKind.SomeModule);
                modules.sort(function (a, b) {
                    return a.getFullName() < b.getFullName() ? -1 : 1;
                });
                modules.forEach(function (reflection) {
                    var item = td.NavigationItem.create(reflection, parent);
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
                        new td.NavigationItem('Internals', null, parent, "tsd-is-external");
                        state = 1;
                    }
                    else if (hasExternals && reflection.flags.isExternal && state != 2) {
                        new td.NavigationItem('Externals', null, parent, "tsd-is-external");
                        state = 2;
                    }
                    var item = td.NavigationItem.create(reflection, parent);
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
                var root = new td.NavigationItem('Index', 'index.html');
                var globals = new td.NavigationItem('Globals', hasSeparateGlobals ? 'globals.html' : 'index.html', root);
                globals.isGlobals = true;
                var modules = [];
                project.getReflectionsByKind(td.ReflectionKind.SomeModule).forEach(function (someModule) {
                    var target = someModule.parent;
                    while (target) {
                        if (target.kindOf(1 /* ExternalModule */))
                            return;
                        target = target.parent;
                    }
                    modules.push(someModule);
                });
                if (modules.length < 10) {
                    buildGroups(modules, root, buildChildren);
                }
                else {
                    buildGroups(project.getChildrenByKind(td.ReflectionKind.SomeModule), root, buildChildren);
                }
                return root;
            }
            return build(this.renderer.application.settings.readme != 'none');
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
                if (reflection instanceof td.DeclarationReflection) {
                    DefaultTheme.applyReflectionClasses(reflection);
                }
                if (reflection instanceof td.ContainerReflection && reflection['groups']) {
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
            if (reflection.parent && reflection.parent != relative && !(reflection.parent instanceof td.ProjectReflection))
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
                urls.push(new td.UrlMapping(url, reflection, mapping.template));
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
                if (child instanceof td.DeclarationReflection) {
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
            if (reflection.kind == 262144 /* Accessor */) {
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
                var kind = td.ReflectionKind[reflection.kind];
                classes.push(DefaultTheme.toStyleClass('tsd-kind-' + kind));
            }
            if (reflection.parent && reflection.parent instanceof td.DeclarationReflection) {
                kind = td.ReflectionKind[reflection.parent.kind];
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
            kind: [128 /* Class */],
            isLeaf: true,
            directory: 'classes',
            template: 'reflection.hbs'
        }, {
            kind: [256 /* Interface */],
            isLeaf: true,
            directory: 'interfaces',
            template: 'reflection.hbs'
        }, {
            kind: [4 /* Enum */],
            isLeaf: true,
            directory: 'enums',
            template: 'reflection.hbs'
        }, {
            kind: [2 /* Module */, 1 /* ExternalModule */],
            isLeaf: false,
            directory: 'modules',
            template: 'reflection.hbs'
        }];
        return DefaultTheme;
    })(td.Theme);
    td.DefaultTheme = DefaultTheme;
})(td || (td = {}));
var td;
(function (td) {
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
            renderer.on(td.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
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
            urls.push(new td.UrlMapping('index.html', project, 'index.hbs'));
            project.url = 'index.html';
            project.anchor = null;
            project.hasOwnDocument = true;
            project.children.forEach(function (child) {
                td.DefaultTheme.applyAnchorUrl(child, project);
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
            if (!(model instanceof td.Reflection)) {
                return;
            }
            page.toc = new td.NavigationItem();
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
                var item = td.NavigationItem.create(child, parent, true);
                MinimalTheme.buildToc(child, item);
            });
        };
        return MinimalTheme;
    })(td.DefaultTheme);
    td.MinimalTheme = MinimalTheme;
})(td || (td = {}));
module.exports = td;
