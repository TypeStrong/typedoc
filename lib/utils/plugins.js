"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FS = require("fs");
var Path = require("path");
var Util = require("util");
var component_1 = require("./component");
var declaration_1 = require("./options/declaration");
var PluginHost = (function (_super) {
    __extends(PluginHost, _super);
    function PluginHost() {
        _super.apply(this, arguments);
    }
    PluginHost.prototype.load = function () {
        var logger = this.application.logger;
        var plugins = this.plugins || this.discoverNpmPlugins();
        var i, c = plugins.length;
        for (i = 0; i < c; i++) {
            var plugin = plugins[i];
            if (typeof plugin != 'string') {
                logger.error('Unknown plugin %s', plugin);
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
                    logger.write('Loaded plugin %s', plugin);
                }
                else {
                    logger.error('The plugin %s did not return a function.', plugin);
                }
            }
            catch (error) {
                logger.error('The plugin %s could not be loaded.', plugin);
                logger.writeln(error.stack);
            }
        }
    };
    PluginHost.prototype.discoverNpmPlugins = function () {
        var result = [];
        var logger = this.application.logger;
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
    __decorate([
        component_1.Option({
            name: 'plugin',
            help: 'Specify the npm plugins that should be loaded. Omit to load all installed plugins, set to \'none\' to load no plugins.',
            type: declaration_1.ParameterType.String,
            isArray: true
        })
    ], PluginHost.prototype, "plugins", void 0);
    PluginHost = __decorate([
        component_1.Component({ name: 'plugin-host', internal: true })
    ], PluginHost);
    return PluginHost;
}(component_1.AbstractComponent));
exports.PluginHost = PluginHost;
//# sourceMappingURL=plugins.js.map