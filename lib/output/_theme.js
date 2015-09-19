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
var renderer_1 = require("./renderer");
var components_1 = require("./components");
var component_1 = require("../utils/component");
var Theme = (function (_super) {
    __extends(Theme, _super);
    function Theme(renderer, basePath) {
        _super.call(this, renderer);
        this.basePath = basePath;
    }
    Theme.prototype.isOutputDirectory = function (path) {
        return false;
    };
    Theme.prototype.getUrls = function (project) {
        return [];
    };
    Theme.prototype.getNavigation = function (project) {
        return null;
    };
    Theme = __decorate([
        component_1.Component({ name: "rendrer:theme", internal: true }), 
        __metadata('design:paramtypes', [renderer_1.Renderer, String])
    ], Theme);
    return Theme;
})(components_1.RendererComponent);
exports.Theme = Theme;
