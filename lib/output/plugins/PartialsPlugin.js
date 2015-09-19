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
var Handlebars = require("handlebars");
var components_1 = require("../components");
var renderer_1 = require("../renderer");
var events_1 = require("../events");
var PartialsPlugin = (function (_super) {
    __extends(PartialsPlugin, _super);
    function PartialsPlugin() {
        _super.apply(this, arguments);
    }
    PartialsPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, events_1.RendererEvent.BEGIN, this.onRendererBegin);
    };
    PartialsPlugin.prototype.loadPartials = function (path) {
        if (!FS.existsSync(path) || !FS.statSync(path).isDirectory()) {
            return;
        }
        FS.readdirSync(path).forEach(function (fileName) {
            var file = Path.join(path, fileName);
            var name = Path.basename(fileName, Path.extname(fileName));
            Handlebars.registerPartial(name, renderer_1.Renderer.readFile(file));
        });
    };
    PartialsPlugin.prototype.onRendererBegin = function (event) {
        var themePath = Path.join(this.owner.theme.basePath, 'partials');
        var defaultPath = Path.join(renderer_1.Renderer.getDefaultTheme(), 'partials');
        if (themePath != defaultPath) {
            this.loadPartials(defaultPath);
        }
        this.loadPartials(themePath);
    };
    PartialsPlugin = __decorate([
        components_1.Component({ name: "partials" }), 
        __metadata('design:paramtypes', [])
    ], PartialsPlugin);
    return PartialsPlugin;
})(components_1.RendererComponent);
exports.PartialsPlugin = PartialsPlugin;
