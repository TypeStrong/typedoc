var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Renderer_1 = require("../Renderer");
var RendererPlugin_1 = require("../RendererPlugin");
var LayoutPlugin = (function (_super) {
    __extends(LayoutPlugin, _super);
    function LayoutPlugin(renderer) {
        _super.call(this, renderer);
        renderer.on(Renderer_1.Renderer.EVENT_END_PAGE, this.onRendererEndPage, this);
    }
    LayoutPlugin.prototype.onRendererEndPage = function (page) {
        var layout = this.renderer.getTemplate('layouts/default.hbs');
        page.contents = layout(page);
    };
    return LayoutPlugin;
})(RendererPlugin_1.RendererPlugin);
exports.LayoutPlugin = LayoutPlugin;
Renderer_1.Renderer.registerPlugin('layout', LayoutPlugin);
