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
var Path = require("path");
var FS = require("fs-extra");
var component_1 = require("../../utils/component");
var Renderer_1 = require("../Renderer");
var AssetsPlugin = (function (_super) {
    __extends(AssetsPlugin, _super);
    function AssetsPlugin() {
        _super.apply(this, arguments);
        this.copyDefaultAssets = true;
    }
    AssetsPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, (_a = {},
            _a[Renderer_1.Renderer.EVENT_BEGIN] = this.onRendererBegin,
            _a
        ));
        var _a;
    };
    AssetsPlugin.prototype.onRendererBegin = function (event) {
        var fromDefault = Path.join(Renderer_1.Renderer.getDefaultTheme(), 'assets');
        var to = Path.join(event.outputDirectory, 'assets');
        if (this.copyDefaultAssets) {
            FS.copySync(fromDefault, to);
        }
        else {
            fromDefault = null;
        }
        var from = Path.join(this.owner.theme.basePath, 'assets');
        if (from != fromDefault && FS.existsSync(from)) {
            FS.copySync(from, to);
        }
    };
    AssetsPlugin = __decorate([
        component_1.Component("assets"), 
        __metadata('design:paramtypes', [])
    ], AssetsPlugin);
    return AssetsPlugin;
})(component_1.RendererComponent);
exports.AssetsPlugin = AssetsPlugin;
