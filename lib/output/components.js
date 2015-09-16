var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Path = require("path");
var component_1 = require("../utils/component");
exports.Component = component_1.Component;
var index_1 = require("../models/reflections/index");
var Renderer_1 = require("./Renderer");
var RendererComponent = (function (_super) {
    __extends(RendererComponent, _super);
    function RendererComponent() {
        _super.apply(this, arguments);
    }
    return RendererComponent;
})(component_1.AbstractComponent);
exports.RendererComponent = RendererComponent;
var ContextAwareRendererComponent = (function (_super) {
    __extends(ContextAwareRendererComponent, _super);
    function ContextAwareRendererComponent(renderer) {
        _super.call(this, renderer);
        renderer.on(Renderer_1.Renderer.EVENT_BEGIN, this.onRendererBegin, this);
        renderer.on(Renderer_1.Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
    }
    ContextAwareRendererComponent.prototype.getRelativeUrl = function (absolute) {
        var relative = Path.relative(Path.dirname(this.location), Path.dirname(absolute));
        return Path.join(relative, Path.basename(absolute)).replace(/\\/g, '/');
    };
    ContextAwareRendererComponent.prototype.onRendererBegin = function (event) {
        this.project = event.project;
    };
    ContextAwareRendererComponent.prototype.onRendererBeginPage = function (page) {
        this.location = page.url;
        this.reflection = page.model instanceof index_1.DeclarationReflection ? page.model : null;
    };
    return ContextAwareRendererComponent;
})(RendererComponent);
exports.ContextAwareRendererComponent = ContextAwareRendererComponent;
