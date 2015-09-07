var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Path = require("path");
var FS = require("fs-extra");
var Renderer_1 = require("../Renderer");
var RendererPlugin_1 = require("../RendererPlugin");
var AssetsPlugin = (function (_super) {
    __extends(AssetsPlugin, _super);
    function AssetsPlugin(renderer) {
        _super.call(this, renderer);
        this.copyDefaultAssets = true;
        renderer.on(Renderer_1.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
    }
    AssetsPlugin.prototype.onRendererBegin = function (event) {
        var fromDefault = Path.join(Renderer_1.Renderer.getDefaultTheme(), 'assets');
        var to = Path.join(event.outputDirectory, 'assets');
        if (this.copyDefaultAssets) {
            FS.copySync(fromDefault, to);
        }
        else {
            fromDefault = null;
        }
        var from = Path.join(this.renderer.theme.basePath, 'assets');
        if (from != fromDefault && FS.existsSync(from)) {
            FS.copySync(from, to);
        }
    };
    return AssetsPlugin;
})(RendererPlugin_1.RendererPlugin);
exports.AssetsPlugin = AssetsPlugin;
Renderer_1.Renderer.registerPlugin('assets', AssetsPlugin);
