/**
 * The TypeDoc main module and namespace.
 *
 * The [[Application]] class holds the core logic of the cli application. All code related
 * to resolving reflections is stored in [[TypeDoc.Factories]], the actual data models can be found
 * in [[TypeDoc.Models]] and the final rendering is defined in [[TypeDoc.Output]].
 */

import * as Path from "path";
import * as FS from "fs";
import * as Util from "util";
import * as typescript from "typescript";
import {Minimatch, IMinimatch} from "minimatch";

import {EventDispatcher} from "./utils/events";
import {IOptions, OptionsParser} from "./Options";
import {Logger, LoggerType, ConsoleLogger, CallbackLogger} from "./Logger";
import {writeFile} from "./utils/fs";
import {ProjectReflection} from "./models/index";
import {Converter} from "./converter/index";
import {Renderer} from "./output/Renderer";
import {IComponentHost} from "./utils/component";


/**
 * An interface of the application class.
 *
 * All classes should expect this interface allowing other third parties
 * to use their own implementation.
 */
export interface IApplication
{
    /**
     * The options used by the dispatcher and the renderer.
     */
    options:IOptions;

    /**
     * The options used by the TypeScript compiler.
     */
    compilerOptions:typescript.CompilerOptions;

    /**
     * The logger that should be used to output messages.
     */
    logger:Logger;
}



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
export class Application extends EventDispatcher implements IApplication, IComponentHost
{
    /**
     * The options used by the dispatcher and the renderer.
     */
    options:IOptions;

    /**
     * The options used by the TypeScript compiler.
     */
    compilerOptions:typescript.CompilerOptions;

    /**
     * The converter used to create the declaration reflections.
     */
    converter:Converter;

    /**
     * The renderer used to generate the documentation output.
     */
    renderer:Renderer;

    /**
     * The logger that should be used to output messages.
     */
    logger:Logger;

    /**
     *
     * @event
     */
    static EVENT_COLLECT_PARAMETERS:string = 'collectParameters';

    /**
     * The version number of TypeDoc.
     */
    static VERSION:string = '{{ VERSION }}';



    /**
     * @param options An object containing the options that should be used.
     */
    constructor(options?:IOptions);

    /**
     * @param fromCommandLine  TRUE if the application should execute in command line mode.
     */
    constructor(fromCommandLine:boolean);

    /**
     * Create a new TypeDoc application instance.
     */
    constructor(arg?:any) {
        super();

        this.converter = new Converter(this);
        this.renderer  = new Renderer(this);
        this.logger    = new ConsoleLogger();
        this.options   = OptionsParser.createOptions();
        this.compilerOptions = OptionsParser.createCompilerOptions();

        if (arg == undefined || typeof arg == 'object') {
            this.bootstrapWithOptions(arg);
        } else if (arg === true) {
            this.bootstrapFromCommandline();
        }
    }


    /**
     * Generic initialization logic.
     */
    private bootstrap() {
        if (typeof this.options.logger == 'function') {
            this.logger = new CallbackLogger(<any>this.options.logger);
        } else if (this.options.logger == LoggerType.None) {
            this.logger = new Logger();
        }

        return this.loadNpmPlugins(this.options.plugins);
    }


    /**
     * Run TypeDoc from the command line.
     */
    private bootstrapFromCommandline() {
        var parser = new OptionsParser(this);
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
            typescript.sys.write(this.toString());
        } else if (this.options.help) {
            typescript.sys.write(parser.toString());
        } else if (parser.inputFiles.length === 0) {
            typescript.sys.write(parser.toString());
            process.exit(1);
        } else if (!this.options.out && !this.options.json) {
            this.logger.error("You must either specify the 'out' or 'json' option.");
            process.exit(1);
        } else {
            var src = this.expandInputFiles(parser.inputFiles);
            var project = this.convert(src);
            if (project) {
                if (this.options.out) this.generateDocs(project, this.options.out);
                if (this.options.json) this.generateJson(project, this.options.json);
                if (this.logger.hasErrors()) {
                    process.exit(3);
                }
            } else {
                process.exit(2);
            }
        }
    }


    /**
     * Initialize TypeDoc with the given options object.
     *
     * @param options  The desired options to set.
     */
    private bootstrapWithOptions(options?:IOptions) {
        var parser = new OptionsParser(this);
        parser.loadOptionFileFromObject(options, true);
        parser.parseObject(options, true);

        this.bootstrap();

        this.collectParameters(parser);
        parser.loadOptionFileFromObject(options);
        parser.parseObject(options);
    }


    /**
     * Load the given list of npm plugins.
     *
     * @param plugins  A list of npm modules that should be loaded as plugins. When not specified
     *   this function will invoke [[discoverNpmPlugins]] to find a list of all installed plugins.
     * @returns TRUE on success, otherwise FALSE.
     */
    private loadNpmPlugins(plugins?:string[]):boolean {
        plugins = plugins || this.discoverNpmPlugins();

        var i:number, c:number = plugins.length;
        for (i = 0; i < c; i++) {
            var plugin = plugins[i];
            if (typeof plugin != 'string') {
                this.logger.error('Unknown plugin %s', plugin);
                return false;
            } else if (plugin.toLowerCase() == 'none') {
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
                } else {
                    this.logger.error('The plugin %s did not return a function.', plugin);
                }
            } catch (error) {
                this.logger.error('The plugin %s could not be loaded.', plugin);
                this.logger.writeln(error.stack);
            }
        }
    }


    /**
     * Discover all installed TypeDoc plugins.
     *
     * @returns A list of all npm module names that are qualified TypeDoc plugins.
     */
    private discoverNpmPlugins():string[] {
        var result:string[] = [];
        var logger = this.logger;
        discover();
        return result;

        /**
         * Find all parent folders containing a `node_modules` subdirectory.
         */
        function discover() {
            var path = process.cwd(), previous:string;
            do {
                var modules = Path.join(path, 'node_modules');
                if (FS.existsSync(modules) && FS.lstatSync(modules).isDirectory()) {
                    discoverModules(modules);
                }

                previous = path;
                path = Path.resolve(Path.join(previous, '..'));
            } while (previous != path);
        }

        /**
         * Scan the given `node_modules` directory for TypeDoc plugins.
         */
        function discoverModules(basePath:string) {
            FS.readdirSync(basePath).forEach((name) => {
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

        /**
         * Load and parse the given `package.json`.
         */
        function loadPackageInfo(fileName:string):any {
            try {
                return JSON.parse(FS.readFileSync(fileName, {encoding: 'utf-8'}));
            } catch (error) {
                logger.error('Could not parse %s', fileName);
                return {};
            }
        }

        /**
         * Test whether the given package info describes a TypeDoc plugin.
         */
        function isPlugin(info:any):boolean {
            var keywords:string[] = info.keywords;
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
    }


    /**
     * Allow [[Converter]] and [[Renderer]] to add parameters to the given [[OptionsParser]].
     *
     * @param parser  The parser instance the found parameters should be added to.
     */
    public collectParameters(parser:OptionsParser) {
        parser.addParameter(this.converter.getParameters());
        parser.addParameter(this.renderer.getParameters());

        this.trigger(Application.EVENT_COLLECT_PARAMETERS, parser);
    }


    /**
     * Return the application / root component instance.
     */
    get application():Application {
        return this
    }


    /**
     * Return the path to the TypeScript compiler.
     */
    public getTypeScriptPath():string {
        return Path.dirname(require.resolve('typescript'));
    }


    public getTypeScriptVersion():string {
        var tsPath = this.getTypeScriptPath();
        var json = JSON.parse(FS.readFileSync(Path.join(tsPath, '..', 'package.json'), 'utf8'));
        return json.version;
    }


    /**
     * Run the converter for the given set of files and return the generated reflections.
     *
     * @param src  A list of source that should be compiled and converted.
     * @returns An instance of ProjectReflection on success, NULL otherwise.
     */
    public convert(src:string[]):ProjectReflection {
        this.logger.writeln('Using TypeScript %s from %s', this.getTypeScriptVersion(), this.getTypeScriptPath());

        var result = this.converter.convert(src);
        if (result.errors && result.errors.length) {
            this.logger.diagnostics(result.errors);
            if (this.options.ignoreCompilerErrors) {
                this.logger.resetErrors();
                return result.project;
            } else {
                return null;
            }
        } else {
            return result.project;
        }
    }


    /**
     * @param src  A list of source files whose documentation should be generated.
     */
    public generateDocs(src:string[], out:string):boolean;

    /**
     * @param project  The project the documentation should be generated for.
     */
    public generateDocs(project:ProjectReflection, out:string):boolean;

    /**
     * Run the documentation generator for the given set of files.
     *
     * @param out  The path the documentation should be written to.
     * @returns TRUE if the documentation could be generated successfully, otherwise FALSE.
     */
    public generateDocs(input:any, out:string):boolean {
        var project = input instanceof ProjectReflection ? input : this.convert(input);
        if (!project) return false;

        out = Path.resolve(out);
        this.renderer.render(project, out);
        if (this.logger.hasErrors()) {
            this.logger.error('Documentation could not be generated due to the errors above.');
        } else {
            this.logger.success('Documentation generated at %s', out);
        }

        return true;
    }


    /**
     * @param src  A list of source that should be compiled and converted.
     */
    public generateJson(src:string[], out:string):boolean;

    /**
     * @param project  The project that should be converted.
     */
    public generateJson(project:ProjectReflection, out:string):boolean;

    /**
     * Run the converter for the given set of files and write the reflections to a json file.
     *
     * @param out  The path and file name of the target file.
     * @returns TRUE if the json file could be written successfully, otherwise FALSE.
     */
    public generateJson(input:any, out:string):boolean {
        var project = input instanceof ProjectReflection ? input : this.convert(input);
        if (!project) return false;

        out = Path.resolve(out);
        writeFile(out, JSON.stringify(project.toObject(), null, '\t'), false);
        this.logger.success('JSON written to %s', out);

        return true;
    }


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
    public expandInputFiles(inputFiles?:string[]):string[] {
        var exclude:IMinimatch, files:string[] = [];
        if (this.options.exclude) {
            exclude = new Minimatch(this.options.exclude);
        }

        function add(dirname:string) {
            FS.readdirSync(dirname).forEach((file) => {
                var realpath = Path.join(dirname, file);
                if (FS.statSync(realpath).isDirectory()) {
                    add(realpath);
                } else if (/\.ts$/.test(realpath)) {
                    if (exclude && exclude.match(realpath.replace(/\\/g, '/'))) {
                        return;
                    }

                    files.push(realpath);
                }
            });
        }

        inputFiles.forEach((file) => {
            file = Path.resolve(file);
            if (FS.statSync(file).isDirectory()) {
                add(file);
            } else {
                files.push(file);
            }
        });

        return files;
    }


    /**
     * Print the version number.
     */
    public toString() {
        return [
            '',
            'TypeDoc ' + Application.VERSION,
            'Using TypeScript ' + this.getTypeScriptVersion() + ' from ' + this.getTypeScriptPath(),
            ''
        ].join(typescript.sys.newLine);
    }
}
