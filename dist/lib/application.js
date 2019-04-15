"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Application_1;
const Path = require("path");
const FS = require("fs");
const typescript = require("typescript");
const index_1 = require("./converter/index");
const renderer_1 = require("./output/renderer");
const serialization_1 = require("./serialization");
const index_2 = require("./models/index");
const index_3 = require("./utils/index");
const paths_1 = require("./utils/paths");
const component_1 = require("./utils/component");
const index_4 = require("./utils/options/index");
const declaration_1 = require("./utils/options/declaration");
let Application = Application_1 = class Application extends component_1.ChildableComponent {
    constructor(options) {
        super(component_1.DUMMY_APPLICATION_OWNER);
        this.logger = new index_3.ConsoleLogger();
        this.converter = this.addComponent('converter', index_1.Converter);
        this.serializer = this.addComponent('serializer', serialization_1.Serializer);
        this.renderer = this.addComponent('renderer', renderer_1.Renderer);
        this.plugins = this.addComponent('plugins', index_3.PluginHost);
        this.options = this.addComponent('options', index_4.Options);
        this.bootstrap(options);
    }
    bootstrap(options) {
        this.options.read(options, index_4.OptionsReadMode.Prefetch);
        const logger = this.loggerType;
        if (typeof logger === 'function') {
            this.logger = new index_3.CallbackLogger(logger);
        }
        else if (logger === 'none') {
            this.logger = new index_3.Logger();
        }
        this.plugins.load();
        return this.options.read(this.options.getRawValues(), index_4.OptionsReadMode.Fetch);
    }
    get application() {
        return this;
    }
    get isCLI() {
        return false;
    }
    getTypeScriptPath() {
        return Path.dirname(require.resolve('typescript'));
    }
    getTypeScriptVersion() {
        const tsPath = this.getTypeScriptPath();
        const json = JSON.parse(FS.readFileSync(Path.join(tsPath, '..', 'package.json'), 'utf8'));
        return json.version;
    }
    convert(src) {
        this.logger.writeln('Using TypeScript %s from %s', this.getTypeScriptVersion(), this.getTypeScriptPath());
        const result = this.converter.convert(src);
        if (result.errors && result.errors.length) {
            this.logger.diagnostics(result.errors);
            if (this.ignoreCompilerErrors) {
                this.logger.resetErrors();
                return result.project;
            }
            else {
                return;
            }
        }
        else {
            return result.project;
        }
    }
    generateDocs(input, out) {
        const project = input instanceof index_2.ProjectReflection ? input : this.convert(input);
        if (!project) {
            return false;
        }
        out = Path.resolve(out);
        this.renderer.render(project, out);
        if (this.logger.hasErrors()) {
            this.logger.error('Documentation could not be generated due to the errors above.');
        }
        else {
            this.logger.success('Documentation generated at %s', out);
        }
        return true;
    }
    generateJson(input, out) {
        const project = input instanceof index_2.ProjectReflection ? input : this.convert(input);
        if (!project) {
            return false;
        }
        out = Path.resolve(out);
        const eventData = { outputDirectory: Path.dirname(out), outputFile: Path.basename(out) };
        const ser = this.serializer.projectToObject(project, { begin: eventData, end: eventData });
        index_3.writeFile(out, JSON.stringify(ser, null, '\t'), false);
        this.logger.success('JSON written to %s', out);
        return true;
    }
    expandInputFiles(inputFiles = []) {
        let files = [];
        const exclude = this.exclude
            ? paths_1.createMinimatch(this.exclude)
            : [];
        function isExcluded(fileName) {
            return exclude.some(mm => mm.match(fileName));
        }
        const supportedFileRegex = this.options.getCompilerOptions().allowJs ? /\.[tj]sx?$/ : /\.tsx?$/;
        function add(dirname) {
            FS.readdirSync(dirname).forEach((file) => {
                const realpath = Path.join(dirname, file);
                if (FS.statSync(realpath).isDirectory()) {
                    add(realpath);
                }
                else if (supportedFileRegex.test(realpath)) {
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
            }
            else if (!isExcluded(file)) {
                files.push(file);
            }
        });
        return files;
    }
    toString() {
        return [
            '',
            'TypeDoc ' + Application_1.VERSION,
            'Using TypeScript ' + this.getTypeScriptVersion() + ' from ' + this.getTypeScriptPath(),
            ''
        ].join(typescript.sys.newLine);
    }
};
Application.VERSION = '0.15.0-0';
__decorate([
    component_1.Option({
        name: 'logger',
        help: 'Specify the logger that should be used, \'none\' or \'console\'',
        defaultValue: 'console',
        type: declaration_1.ParameterType.Mixed
    })
], Application.prototype, "loggerType", void 0);
__decorate([
    component_1.Option({
        name: 'ignoreCompilerErrors',
        help: 'Should TypeDoc generate documentation pages even after the compiler has returned errors?',
        type: declaration_1.ParameterType.Boolean
    })
], Application.prototype, "ignoreCompilerErrors", void 0);
__decorate([
    component_1.Option({
        name: 'exclude',
        help: 'Define patterns for excluded files when specifying paths.',
        type: declaration_1.ParameterType.Array
    })
], Application.prototype, "exclude", void 0);
Application = Application_1 = __decorate([
    component_1.Component({ name: 'application', internal: true })
], Application);
exports.Application = Application;
//# sourceMappingURL=application.js.map