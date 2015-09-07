/**
 * The TypeDoc main module and namespace.
 *
 * The [[Application]] class holds the core logic of the cli application. All code related
 * to resolving reflections is stored in [[TypeDoc.Factories]], the actual data models can be found
 * in [[TypeDoc.Models]] and the final rendering is defined in [[TypeDoc.Output]].
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Path = require("path");
var FS = require("fs");
var Util = require("util");
var minimatch_1 = require("minimatch");
var EventDispatcher_1 = require("./EventDispatcher");
var Options_1 = require("./Options");
var Logger_1 = require("./Logger");
var Utils_1 = require("./Utils");
var ProjectReflection_1 = require("./models/reflections/ProjectReflection");
var Converter_1 = require("./converter/Converter");
var Renderer_1 = require("./output/Renderer");
var typescript_1 = require("./converter/typescript");
var Application = (function (_super) {
    __extends(Application, _super);
    function Application(arg) {
        _super.call(this);
        this.converter = new Converter_1.Converter(this);
        this.renderer = new Renderer_1.Renderer(this);
        this.logger = new Logger_1.ConsoleLogger();
        this.options = Options_1.OptionsParser.createOptions();
        this.compilerOptions = Options_1.OptionsParser.createCompilerOptions();
        if (arg == undefined || typeof arg == 'object') {
            this.bootstrapWithOptions(arg);
        }
        else if (arg === true) {
            this.bootstrapFromCommandline();
        }
    }
    Application.prototype.bootstrap = function () {
        if (typeof this.options.logger == 'function') {
            this.logger = new Logger_1.CallbackLogger(this.options.logger);
        }
        else if (this.options.logger == Logger_1.LoggerType.None) {
            this.logger = new Logger_1.Logger();
        }
        return this.loadNpmPlugins(this.options.plugins);
    };
    Application.prototype.bootstrapFromCommandline = function () {
        var parser = new Options_1.OptionsParser(this);
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
    Application.prototype.bootstrapWithOptions = function (options) {
        var parser = new Options_1.OptionsParser(this);
        parser.loadOptionFileFromObject(options, true);
        parser.parseObject(options, true);
        this.bootstrap();
        this.collectParameters(parser);
        parser.loadOptionFileFromObject(options);
        parser.parseObject(options);
    };
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
                    instance(this);
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
    Application.prototype.discoverNpmPlugins = function () {
        var result = [];
        var logger = this.logger;
        discover();
        return result;
        function discover() {
            var path = process.cwd(), previous;
            do {
                var modules = Path.join(path, 'node_modules');
                if (FS.existsSync(modules) && FS.lstatSync(modules).isDirectory()) {
                    discoverModules(modules);
                }
                previous = path;
                path = Path.resolve(Path.join(previous, '..'));
            } while (previous != path);
        }
        function discoverModules(basePath) {
            FS.readdirSync(basePath).forEach(function (name) {
                var dir = Path.join(basePath, name);
                var infoFile = Path.join(dir, 'package.json');
                if (!FS.existsSync(infoFile)) {
                    return;
                }
                var info = loadPackageInfo(infoFile);
                if (isPlugin(info)) {
                    result.push(name);
                }
            });
        }
        function loadPackageInfo(fileName) {
            try {
                return JSON.parse(FS.readFileSync(fileName, { encoding: 'utf-8' }));
            }
            catch (error) {
                logger.error('Could not parse %s', fileName);
                return {};
            }
        }
        function isPlugin(info) {
            var keywords = info.keywords;
            if (!keywords || !Util.isArray(keywords)) {
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
    Application.prototype.collectParameters = function (parser) {
        parser.addParameter(this.converter.getParameters());
        parser.addParameter(this.renderer.getParameters());
        this.dispatch(Application.EVENT_COLLECT_PARAMETERS, parser);
    };
    Application.prototype.convert = function (src) {
        this.logger.writeln('Using TypeScript %s from %s', typescript_1.typescriptVersion, typescript_1.typescriptPath);
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
    Application.prototype.generateDocs = function (input, out) {
        var project = input instanceof ProjectReflection_1.ProjectReflection ? input : this.convert(input);
        if (!project)
            return false;
        out = Path.resolve(out);
        this.renderer.render(project, out);
        if (this.logger.hasErrors()) {
            this.logger.error('Documentation could not be generated due to the errors above.');
        }
        else {
            this.logger.success('Documentation generated at %s', out);
        }
        return true;
    };
    Application.prototype.generateJson = function (input, out) {
        var project = input instanceof ProjectReflection_1.ProjectReflection ? input : this.convert(input);
        if (!project)
            return false;
        out = Path.resolve(out);
        Utils_1.writeFile(out, JSON.stringify(project.toObject(), null, '\t'), false);
        this.logger.success('JSON written to %s', out);
        return true;
    };
    Application.prototype.expandInputFiles = function (inputFiles) {
        var exclude, files = [];
        if (this.options.exclude) {
            exclude = new minimatch_1.Minimatch(this.options.exclude);
        }
        function add(dirname) {
            FS.readdirSync(dirname).forEach(function (file) {
                var realpath = Path.join(dirname, file);
                if (FS.statSync(realpath).isDirectory()) {
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
            file = Path.resolve(file);
            if (FS.statSync(file).isDirectory()) {
                add(file);
            }
            else {
                files.push(file);
            }
        });
        return files;
    };
    Application.prototype.toString = function () {
        return [
            '',
            'TypeDoc ' + Application.VERSION,
            'Using TypeScript ' + typescript_1.typescriptVersion + ' from ' + typescript_1.typescriptPath,
            ''
        ].join(ts.sys.newLine);
    };
    Application.EVENT_COLLECT_PARAMETERS = 'collectParameters';
    Application.VERSION = '{{ VERSION }}';
    return Application;
})(EventDispatcher_1.EventDispatcher);
exports.Application = Application;
