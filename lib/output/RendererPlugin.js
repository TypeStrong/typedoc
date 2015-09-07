var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Path = require("path");
var Renderer_1 = require("./Renderer");
var DeclarationReflection_1 = require("../models/reflections/DeclarationReflection");
var RendererPlugin = (function () {
    function RendererPlugin(renderer) {
        this.renderer = renderer;
    }
    RendererPlugin.prototype.remove = function () {
        this.renderer.off(null, null, this);
    };
    return RendererPlugin;
})();
exports.RendererPlugin = RendererPlugin;
var ContextAwareRendererPlugin = (function (_super) {
    __extends(ContextAwareRendererPlugin, _super);
    function ContextAwareRendererPlugin(renderer) {
        _super.call(this, renderer);
        renderer.on(Renderer_1.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
        renderer.on(Renderer_1.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
    }
    ContextAwareRendererPlugin.prototype.getRelativeUrl = function (absolute) {
        var relative = Path.relative(Path.dirname(this.location), Path.dirname(absolute));
        return Path.join(relative, Path.basename(absolute)).replace(/\\/g, '/');
    };
    ContextAwareRendererPlugin.prototype.onRendererBegin = function (event) {
        this.project = event.project;
    };
    ContextAwareRendererPlugin.prototype.onRendererBeginPage = function (page) {
        this.location = page.url;
        this.reflection = page.model instanceof DeclarationReflection_1.DeclarationReflection ? page.model : null;
    };
    return ContextAwareRendererPlugin;
})(RendererPlugin);
exports.ContextAwareRendererPlugin = ContextAwareRendererPlugin;
