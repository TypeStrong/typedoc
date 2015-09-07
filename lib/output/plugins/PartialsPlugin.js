var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var FS = require("fs");
var Path = require("path");
var Renderer_1 = require("../Renderer");
var RendererPlugin_1 = require("../RendererPlugin");
var PartialsPlugin = (function (_super) {
    __extends(PartialsPlugin, _super);
    function PartialsPlugin(renderer) {
        _super.call(this, renderer);
        renderer.on(Renderer_1.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
    }
    PartialsPlugin.prototype.loadPartials = function (path) {
        if (!FS.existsSync(path) || !FS.statSync(path).isDirectory()) {
            return;
        }
        FS.readdirSync(path).forEach(function (fileName) {
            var file = Path.join(path, fileName);
            var name = Path.basename(fileName, Path.extname(fileName));
            Handlebars.registerPartial(name, Renderer_1.Renderer.readFile(file));
        });
    };
    PartialsPlugin.prototype.onRendererBegin = function (event) {
        var themePath = Path.join(this.renderer.theme.basePath, 'partials');
        var defaultPath = Path.join(Renderer_1.Renderer.getDefaultTheme(), 'partials');
        if (themePath != defaultPath) {
            this.loadPartials(defaultPath);
        }
        this.loadPartials(themePath);
    };
    return PartialsPlugin;
})(RendererPlugin_1.RendererPlugin);
exports.PartialsPlugin = PartialsPlugin;
Renderer_1.Renderer.registerPlugin('partials', PartialsPlugin);
