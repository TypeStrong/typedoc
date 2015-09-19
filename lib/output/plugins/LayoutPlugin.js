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
var components_1 = require("../components");
var events_1 = require("../events");
var LayoutPlugin = (function (_super) {
    __extends(LayoutPlugin, _super);
    function LayoutPlugin() {
        _super.apply(this, arguments);
    }
    LayoutPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, events_1.PageEvent.END, this.onRendererEndPage);
    };
    LayoutPlugin.prototype.onRendererEndPage = function (page) {
        var layout = this.owner.getTemplate('layouts/default.hbs');
        page.contents = layout(page);
    };
    LayoutPlugin = __decorate([
        components_1.Component({ name: "layout" }), 
        __metadata('design:paramtypes', [])
    ], LayoutPlugin);
    return LayoutPlugin;
})(components_1.RendererComponent);
exports.LayoutPlugin = LayoutPlugin;
