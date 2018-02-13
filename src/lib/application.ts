import { LinkParser } from "./utils/LinkParser";
var marked = require("marked");
var highlight = require("highlight.js");

/**
 * The TypeDoc main module and namespace.
 *
 * The [[Application]] class holds the core logic of the cli application. All code related
 * to resolving reflections is stored in [[TypeDoc.Factories]], the actual data models can be found
 * in [[TypeDoc.Models]] and the final rendering is defined in [[TypeDoc.Output]].
 */

import * as Path from 'path';
import * as FS from 'fs';
import * as typescript from 'typescript';
import { Minimatch, IMinimatch } from 'minimatch';

import { Converter } from './converter/index';
import { Renderer } from './output/renderer';
import { Serializer } from './serialization';
import { ProjectReflection } from './models/index';
import { Logger, ConsoleLogger, CallbackLogger, PluginHost, writeFile } from './utils/index';

import { AbstractComponent, ChildableComponent, Component, Option } from './utils/component';
import { Options, OptionsReadMode, OptionsReadResult } from './utils/options/index';
import { ParameterType } from './utils/options/declaration';

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
@Component({ name: 'application', internal: true })
export class Application extends ChildableComponent<Application, AbstractComponent<Application>> {
    options: Options;

    /**
     * The converter used to create the declaration reflections.
     */
    converter: Converter;

    /**
     * The renderer used to generate the documentation output.
     */
    renderer: Renderer;

    /**
     * The serializer used to generate JSON output.
     */
    serializer: Serializer;

    /**
     * The logger that should be used to output messages.
     */
    logger: Logger;

    plugins: PluginHost;

    notSupportedFeaturesConfig: {};

    @Option({
        name: 'logger',
        help: 'Specify the logger that should be used, \'none\' or \'console\'',
        defaultValue: 'console',
        type: ParameterType.Mixed
    })
    loggerType: string | Function;

    @Option({
        name: 'ignoreCompilerErrors',
        help: 'Should TypeDoc generate documentation pages even after the compiler has returned errors?',
        type: ParameterType.Boolean
    })
    ignoreCompilerErrors: boolean;

    @Option({
        name: 'exclude',
        help: 'Define patterns for excluded files when specifying paths.',
        type: ParameterType.Array
    })
    exclude: Array<string>;


    /**
     * The version number of TypeDoc.
     */
    static VERSION = '{{ VERSION }}';

    /**
     * Create a new TypeDoc application instance.
     *
     * @param options An object containing the options that should be used.
     */
    constructor(options?: Object) {
        super(null);

        this.logger = new ConsoleLogger();
        this.converter = this.addComponent<Converter>('converter', Converter);
        this.serializer = this.addComponent<Serializer>('serializer', Serializer);
        this.renderer = this.addComponent<Renderer>('renderer', Renderer);
        this.plugins = this.addComponent('plugins', PluginHost);
        this.options = this.addComponent('options', Options);

        this.bootstrap(options);

        this.notSupportedFeaturesConfig = (<any>options).notSupportedFeaturesConfig
    }

    /**
     * Initialize TypeDoc with the given options object.
     *
     * @param options  The desired options to set.
     */
    protected bootstrap(options?: Object): OptionsReadResult {
        this.options.read(options, OptionsReadMode.Prefetch);

        const logger = this.loggerType;
        if (typeof logger === 'function') {
            this.logger = new CallbackLogger(<any>logger);
        } else if (logger === 'none') {
            this.logger = new Logger();
        }

        this.plugins.load();
        return this.options.read(options, OptionsReadMode.Fetch);
    }

    /**
     * Return the application / root component instance.
     */
    get application(): Application {
        return this;
    }

    get isCLI(): boolean {
        return false;
    }

    /**
     * Return the path to the TypeScript compiler.
     */
    public getTypeScriptPath(): string {
        return Path.dirname(require.resolve('typescript'));
    }

    public getTypeScriptVersion(): string {
        const tsPath = this.getTypeScriptPath();
        const json = JSON.parse(FS.readFileSync(Path.join(tsPath, '..', 'package.json'), 'utf8'));
        return json.version;
    }

    /**
     * Run the converter for the given set of files and return the generated reflections.
     *
     * @param src  A list of source that should be compiled and converted.
     * @returns An instance of ProjectReflection on success, NULL otherwise.
     */
    public convert(src: string[]): ProjectReflection {
        this.logger.writeln('Using TypeScript %s from %s', this.getTypeScriptVersion(), this.getTypeScriptPath());

        const result = this.converter.convert(src);
        if (result.errors && result.errors.length) {
            this.logger.diagnostics(result.errors);
            if (this.ignoreCompilerErrors) {
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
    public generateDocs(src: string[], out: string): boolean;

    /**
     * @param project  The project the documentation should be generated for.
     */
    public generateDocs(project: ProjectReflection, out: string): boolean;

    /**
     * Run the documentation generator for the given set of files.
     *
     * @param out  The path the documentation should be written to.
     * @returns TRUE if the documentation could be generated successfully, otherwise FALSE.
     */
    public generateDocs(input: any, out: string): boolean {
        const project = input instanceof ProjectReflection ? input : this.convert(input);
        if (!project) {
            return false;
        }

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
    public generateJson(src: string[], out: string): boolean;

    /**
     * @param project  The project that should be converted.
     */
    public generateJson(project: ProjectReflection, out: string): boolean;

    /**
     * Run the converter for the given set of files and write the reflections to a json file.
     *
     * @param out  The path and file name of the target file.
     * @returns TRUE if the json file could be written successfully, otherwise FALSE.
     */
    public generateJson(input: any, out: string): boolean {
        const project = input instanceof ProjectReflection ? input : this.convert(input);
        if (!project) {
            return false;
        }

        out = Path.resolve(out);
        const eventData = { outputDirectory: Path.dirname(out), outputFile: Path.basename(out) };
        const ser = this.serializer.projectToObject(project, { begin: eventData, end: eventData });
        const prettifiedJson = this.prettifyJson(ser, project, )
        writeFile(out, JSON.stringify(prettifiedJson, null, '\t'), false);
        this.logger.success('JSON written to %s', out);

        return true;
    }

    private prettifyJson(obj: any, project: ProjectReflection, linkPrefix?: string) {
        let getHighlighted = function (text, lang) {
            try {
                if (lang) {
                    return highlight.highlight(lang, text).value;
                } else {
                    return highlight.highlightAuto(text).value;
                }
            } catch (error) {
                this.application.logger.warn(error.message);
                return text;
            }
        };
        marked.setOptions({
            highlight: function (code, lang) {
                return getHighlighted(code, lang);
            }
        });
        let linkParser: LinkParser = new LinkParser(project, linkPrefix);
        let nodeList = [];
        let visitChildren = (json, path) => {
            if (json != null) {
                let comment = json.comment;
                if (comment && comment.shortText != null) {
                    let markedText = marked(comment.shortText + (comment.text ? '\n' + comment.text : ''));
                    let type = '';

                    let constrainedValues = this.generateConstrainedValues(json);
                    let miscAttributes = this.generateMiscAttributes(json);
                    if (json.type && json.type.name) {
                        type = json.type.name;
                    }
                    let notSupportedInValues = json.notSupportedIn ? json.notSupportedIn : '';
                    nodeList.push({ name: path + json.name, notSupportedIn: notSupportedInValues, comment: linkParser.parseMarkdown(markedText), type: type, constrainedValues: constrainedValues, miscAttributes: miscAttributes });
                }
                if (json.children != null && json.children.length > 0) {
                    json.children.forEach(child => visitChildren(child, path + json.name + '.'));
                }
            }


        };
        visitChildren(obj, '');

        return nodeList;
    }

    private generateConstrainedValues(str: any) {
        let constrainedValues = [];
        if (str && str['type'] && str['type'].type == 'union') {
            if (str.type.types[0] && str.type.types[0].typeArguments && str.type.types[0].typeArguments[0]) {
                constrainedValues = str.type.types[0].typeArguments[0].types.map(function (type) {
                    console.log(type);
                    return type.value;
                });
                if (str.type.types[0].name && str.type.types[0].name.toLowerCase() == 'array') {
                    console.log('asdasd');
                    var copy = [];
                    for (var i = 0; i < constrainedValues.length; i++) {
                        copy[i] = constrainedValues.slice(0, i + 1).join(',');
                    }
                    constrainedValues = copy;
                }
                constrainedValues = constrainedValues.slice(0, 4);
            }
        }
        return constrainedValues;
    }

    private generateMiscAttributes(str: any) {
        var otherMiscAttributes = {};
        if (str.defaultValue) {
            var required = str.defaultValue.match(/required\s*:\s([a-zA-Z]+)\s*/);
            if (required) {
                otherMiscAttributes['required'] = required[1];
            }
            var defaultOptionValue = str.defaultValue.match(/defaultValue\s*:\s([a-zA-Z0-9()'"]+)\s*/);
            if (defaultOptionValue) {
                defaultOptionValue[1] = defaultOptionValue[1].replace('l(', '');
                defaultOptionValue[1] = defaultOptionValue[1].replace(')', '');
                defaultOptionValue[1] = defaultOptionValue[1].replace(')', '');
                defaultOptionValue[1] = defaultOptionValue[1].replace(/'/g, '');
                otherMiscAttributes['defaultValue'] = defaultOptionValue[1];
            }
        }
        return otherMiscAttributes;
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
    public expandInputFiles(inputFiles?: string[]): string[] {
        let files: string[] = [];
        const exclude: Array<IMinimatch> = this.exclude ? this.exclude.map(pattern => new Minimatch(pattern)) : [];

        function isExcluded(fileName: string): boolean {
            return exclude.some(mm => mm.match(fileName));
        }

        function add(dirname: string) {
            FS.readdirSync(dirname).forEach((file) => {
                const realpath = Path.join(dirname, file);
                if (FS.statSync(realpath).isDirectory()) {
                    add(realpath);
                } else if (/\.tsx?$/.test(realpath)) {
                    if (isExcluded(realpath.replace(/\\/g, '/'))) {
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
            } else if (!isExcluded(file)) {
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
