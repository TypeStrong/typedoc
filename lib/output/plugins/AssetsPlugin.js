"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Path = require("path");
var FS = require("fs-extra");
var components_1 = require("../components");
var events_1 = require("../events");
var renderer_1 = require("../renderer");
var AssetsPlugin = (function (_super) {
    __extends(AssetsPlugin, _super);
    function AssetsPlugin() {
        _super.apply(this, arguments);
        this.copyDefaultAssets = true;
    }
    AssetsPlugin.prototype.initialize = function () {
        this.listenTo(this.owner, (_a = {},
            _a[events_1.RendererEvent.BEGIN] = this.onRendererBegin,
            _a
        ));
        var _a;
    };
    AssetsPlugin.prototype.onRendererBegin = function (event) {
        var fromDefault = Path.join(renderer_1.Renderer.getDefaultTheme(), 'assets');
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
        components_1.Component({ name: "assets" })
    ], AssetsPlugin);
    return AssetsPlugin;
}(components_1.RendererComponent));
exports.AssetsPlugin = AssetsPlugin;
//# sourceMappingURL=AssetsPlugin.js.map