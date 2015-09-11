var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Path = require("path");
var Renderer_1 = require("./Renderer");
var index_1 = require("../models/reflections/index");
var component_1 = require("../utils/component");
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
        this.reflection = page.model instanceof index_1.DeclarationReflection ? page.model : null;
    };
    return ContextAwareRendererPlugin;
})(component_1.RendererComponent);
exports.ContextAwareRendererPlugin = ContextAwareRendererPlugin;
