var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FS = require("fs");
var Path = require("path");
var Util = require("util");
var component_1 = require("./component");
var declaration_1 = require("./options/declaration");
var Plugins = (function (_super) {
    __extends(Plugins, _super);
    function Plugins() {
        _super.apply(this, arguments);
    }
    Plugins.prototype.load = function () {
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
    Plugins.prototype.discoverNpmPlugins = function () {
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
        }), 
        __metadata('design:type', Array)
    ], Plugins.prototype, "plugins");
    Plugins = __decorate([
        component_1.Component({ name: 'plugins', internal: true }), 
        __metadata('design:paramtypes', [])
    ], Plugins);
    return Plugins;
})(component_1.AbstractComponent);
exports.Plugins = Plugins;
