"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Path = require("path");
var FS = require("fs-extra");
var ProgressBar = require('progress');
var events_1 = require("./events");
var fs_1 = require("../utils/fs");
var DefaultTheme_1 = require("./themes/DefaultTheme");
var components_1 = require("./components");
var component_1 = require("../utils/component");
var declaration_1 = require("../utils/options/declaration");
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Renderer_1 = Renderer;
    Renderer.prototype.initialize = function () {
    };
    Renderer.prototype.render = function (project, outputDirectory) {
        var _this = this;
        if (!this.prepareTheme() || !this.prepareOutputDirectory(outputDirectory)) {
            return;
        }
        var output = new events_1.RendererEvent(events_1.RendererEvent.BEGIN);
        output.outputDirectory = outputDirectory;
        output.project = project;
        output.settings = this.application.options.getRawValues();
        output.urls = this.theme.getUrls(project);
        var bar = new ProgressBar('Rendering [:bar] :percent', {
            total: output.urls.length,
            width: 40
        });
        this.trigger(output);
        if (!output.isDefaultPrevented) {
            output.urls.forEach(function (mapping) {
                _this.renderDocument(output.createPageEvent(mapping));
                bar.tick();
            });
            this.trigger(events_1.RendererEvent.END, output);
        }
    };
    Renderer.prototype.renderDocument = function (page) {
        this.trigger(events_1.PageEvent.BEGIN, page);
        if (page.isDefaultPrevented) {
            return false;
        }
        page.template = page.template || this.theme.resources.templates.getResource(page.templateName).getTemplate();
        page.contents = page.template(page);
        this.trigger(events_1.PageEvent.END, page);
        if (page.isDefaultPrevented) {
            return false;
        }
        try {
            fs_1.writeFile(page.filename, page.contents, false);
        }
        catch (error) {
            this.application.logger.error('Could not write %s', page.filename);
            return false;
        }
        return true;
    };
    Renderer.prototype.prepareTheme = function () {
        if (!this.theme) {
            var themeName = this.themeName;
            var path = Path.resolve(themeName);
            if (!FS.existsSync(path)) {
                path = Path.join(Renderer_1.getThemeDirectory(), themeName);
                if (!FS.existsSync(path)) {
                    this.application.logger.error('The theme %s could not be found.', themeName);
                    return false;
                }
            }
            var filename = Path.join(path, 'theme.js');
            if (!FS.existsSync(filename)) {
                this.theme = this.addComponent('theme', new DefaultTheme_1.DefaultTheme(this, path));
            }
            else {
                try {
                    var themeClass = typeof require(filename) === 'function' ? require(filename) : require(filename).default;
                    this.theme = this.addComponent('theme', new (themeClass)(this, path));
                }
                catch (err) {
                    throw new Error("Exception while loading \"" + filename + "\". You must export a `new Theme(renderer, basePath)` compatible class.\n" +
                        err);
                }
            }
        }
        this.theme.resources.activate();
        return true;
    };
    Renderer.prototype.prepareOutputDirectory = function (directory) {
        if (FS.existsSync(directory)) {
            if (!FS.statSync(directory).isDirectory()) {
                this.application.logger.error('The output target "%s" exists but it is not a directory.', directory);
                return false;
            }
            if (this.disableOutputCheck) {
                return true;
            }
            if (FS.readdirSync(directory).length === 0) {
                return true;
            }
            if (!this.theme.isOutputDirectory(directory)) {
                this.application.logger.error('The output directory "%s" exists but does not seem to be a documentation generated by TypeDoc.\n' +
                    'Make sure this is the right target directory, delete the folder and rerun TypeDoc.', directory);
                return false;
            }
            try {
                FS.removeSync(directory);
            }
            catch (error) {
                this.application.logger.warn('Could not empty the output directory.');
            }
        }
        if (!FS.existsSync(directory)) {
            try {
                FS.mkdirpSync(directory);
            }
            catch (error) {
                this.application.logger.error('Could not create output directory %s', directory);
                return false;
            }
        }
        return true;
    };
    Renderer.getThemeDirectory = function () {
        return Path.dirname(require.resolve('typedoc-default-themes'));
    };
    Renderer.getDefaultTheme = function () {
        return Path.join(Renderer_1.getThemeDirectory(), 'default');
    };
    __decorate([
        component_1.Option({
            name: 'theme',
            help: 'Specify the path to the theme that should be used or \'default\' or \'minimal\' to use built-in themes.',
            type: declaration_1.ParameterType.String,
            defaultValue: 'default'
        })
    ], Renderer.prototype, "themeName", void 0);
    __decorate([
        component_1.Option({
            name: 'disableOutputCheck',
            help: 'Should TypeDoc disable the testing and cleaning of the output directory?',
            type: declaration_1.ParameterType.Boolean
        })
    ], Renderer.prototype, "disableOutputCheck", void 0);
    __decorate([
        component_1.Option({
            name: 'gaID',
            help: 'Set the Google Analytics tracking ID and activate tracking code.'
        })
    ], Renderer.prototype, "gaID", void 0);
    __decorate([
        component_1.Option({
            name: 'gaSite',
            help: 'Set the site name for Google Analytics. Defaults to `auto`.',
            defaultValue: 'auto'
        })
    ], Renderer.prototype, "gaSite", void 0);
    __decorate([
        component_1.Option({
            name: 'hideGenerator',
            help: 'Do not print the TypeDoc link at the end of the page.',
            type: declaration_1.ParameterType.Boolean
        })
    ], Renderer.prototype, "hideGenerator", void 0);
    __decorate([
        component_1.Option({
            name: 'entryPoint',
            help: 'Specifies the fully qualified name of the root symbol. Defaults to global namespace.',
            type: declaration_1.ParameterType.String
        })
    ], Renderer.prototype, "entryPoint", void 0);
    __decorate([
        component_1.Option({
            name: 'toc',
            help: 'Specifies the top level table of contents.',
            type: declaration_1.ParameterType.Array
        })
    ], Renderer.prototype, "toc", void 0);
    Renderer = Renderer_1 = __decorate([
        component_1.Component({ name: 'renderer', internal: true, childClass: components_1.RendererComponent })
    ], Renderer);
    return Renderer;
    var Renderer_1;
}(component_1.ChildableComponent));
exports.Renderer = Renderer;
require("./plugins");
//# sourceMappingURL=renderer.js.map